<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import Menu from "$lib/components/Menu.svelte";

  // ======================================================
  // Component Purpose
  // ======================================================
  // This page provides an administrative activity report
  // It displays:
  //   - Claim entry activity
  //   - Submission activity
  //
  // Access is restricted to the "admin" role
  // ======================================================


  // ================================
  // Data State
  // ================================

  let claims: any[] = [];        // All claim records
  let submissions: any[] = [];   // All submission records
  let loading = true;            // Loading indicator for async fetch
  let error = "";                // Error message display


  // ================================
  // Claim Filter State
  // ================================
  // Filter controls for claim activity table
  // Supports:
  //   - User filtering
  //   - Status filtering
  //   - Audit date filtering (createdAt)
  //   - Statutory pay date filtering (payDate)

  let claimUser = "";
  let claimStatus = "";
  let claimEnteredFrom = "";
  let claimEnteredTo = "";
  let claimPayFrom = "";
  let claimPayTo = "";

  // Resets all claim filter inputs to default
  function resetClaimFilters() {
    claimUser = "";
    claimStatus = "";
    claimEnteredFrom = "";
    claimEnteredTo = "";
    claimPayFrom = "";
    claimPayTo = "";
  }


  // ================================
  // Submission Filter State
  // ================================
  // Filter controls for submission activity table
  // Supports:
  //   - User filtering
  //   - Acknowledgement status filtering
  //   - Audit date filtering (createdAt)
  //   - Statutory pay date filtering (payDate)

  let submissionUser = "";
  let submissionStatus = "";
  let submissionEnteredFrom = "";
  let submissionEnteredTo = "";
  let submissionPayFrom = "";
  let submissionPayTo = "";

  // Resets all submission filter inputs to default
  function resetSubmissionFilters() {
    submissionUser = "";
    submissionStatus = "";
    submissionEnteredFrom = "";
    submissionEnteredTo = "";
    submissionPayFrom = "";
    submissionPayTo = "";
  }


  // ================================
  // Derived Users
  // ================================
  // Extract unique users from claims and submissions
  // Uses Map to eliminate duplicates based on _id
  // Filters out undefined/null values

  $: claimUsers = [
    ...new Map(
      claims.map((c) => [c.processor?._id, c.processor])
    ).values(),
  ].filter(Boolean);

  $: submissionUsers = [
    ...new Map(
      submissions.map((s) => [s.submittedBy?._id, s.submittedBy])
    ).values(),
  ].filter(Boolean);


  // ================================
  // Filtered Claims
  // ================================
  // Reactive filter that recalculates whenever:
  //   - claims
  //   - any claim filter input
  // changes
  //
  // Applies multi-criteria filtering:
  //   - User match
  //   - Status match
  //   - Created date range (audit)
  //   - Pay date range (statutory)

  $: filteredClaims = claims.filter((claim) => {
    const created = new Date(claim.createdAt);
    const pay = new Date(claim.payDate);

    const matchesUser =
      !claimUser || claim.processor?._id === claimUser;

    const matchesStatus =
      !claimStatus || claim.status === claimStatus;

    const matchesEnteredFrom =
      !claimEnteredFrom || created >= new Date(claimEnteredFrom);

    const matchesEnteredTo =
      !claimEnteredTo || created <= new Date(claimEnteredTo);

    const matchesPayFrom =
      !claimPayFrom || pay >= new Date(claimPayFrom);

    const matchesPayTo =
      !claimPayTo || pay <= new Date(claimPayTo);

    return (
      matchesUser &&
      matchesStatus &&
      matchesEnteredFrom &&
      matchesEnteredTo &&
      matchesPayFrom &&
      matchesPayTo
    );
  });


  // ================================
  // Filtered Submissions
  // ================================
  // Reactive filter that recalculates whenever:
  //   - submissions
  //   - any submission filter input
  // changes
  //
  // Applies multi-criteria filtering:
  //   - User match
  //   - Acknowledgement status match
  //   - Created date range (audit)
  //   - Pay date range (statutory)

  $: filteredSubmissions = submissions.filter((sub) => {
    const created = new Date(sub.createdAt);
    const pay = new Date(sub.payDate);

    const matchesUser =
      !submissionUser || sub.submittedBy?._id === submissionUser;

    const matchesStatus =
      !submissionStatus ||
      sub.acknowledgementStatus === submissionStatus;

    const matchesEnteredFrom =
      !submissionEnteredFrom ||
      created >= new Date(submissionEnteredFrom);

    const matchesEnteredTo =
      !submissionEnteredTo ||
      created <= new Date(submissionEnteredTo);

    const matchesPayFrom =
      !submissionPayFrom || pay >= new Date(submissionPayFrom);

    const matchesPayTo =
      !submissionPayTo || pay <= new Date(submissionPayTo);

    return (
      matchesUser &&
      matchesStatus &&
      matchesEnteredFrom &&
      matchesEnteredTo &&
      matchesPayFrom &&
      matchesPayTo
    );
  });


  // ================================
  // Fetch Data
  // ================================
  // Retrieves consolidated admin activity report
  // Enforces:
  //   - Authentication (JWT required)
  //   - Role-based access (admin only)
  //
  // Backend returns:
  //   {
  //     claims: [...],
  //     submissions: [...]
  //   }

  async function fetchActivity() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // Redirect if unauthenticated
    if (!token) return goto("/login");

    // Only admins may access activity report
    if (role !== "admin") return goto("/processor");

    try {
      const res = await fetch(
        "http://localhost:5500/api/admin/reports/activity",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        claims = data.claims;
        submissions = data.submissions;
      } else {
        error = "Failed to load admin activity report.";
      }
    } catch {
      error = "Network error loading admin report.";
    } finally {
      loading = false;
    }
  }

  // Load activity data on component mount
  onMount(fetchActivity);
</script>


<Menu />

<section class="section processor-dashboard">
  <div class="container">
    <h1 class="title has-text-weight-semibold mb-4">
      Admin User Activity Report
    </h1>

    <!-- Error Display -->
    {#if error}
      <div class="notification is-danger">{error}</div>
    {/if}

    <!-- ===================================================== -->
    <!-- Claim Activity Section -->
    <!-- ===================================================== -->
    <!-- Displays audit-level claim activity with multi-field filters -->

    <div class="sdw-box mb-5">
      <h2 class="subtitle has-text-weight-semibold mb-3">
        Claim Activity Filters
      </h2>

      <div class="columns is-multiline">

        <!-- User Filter -->
        <div class="column is-one-quarter">
          <label class="label" for="claimUser">User</label>
          <div class="select is-fullwidth">
            <select id="claimUser" bind:value={claimUser}>
              <option value="">All Users</option>
              {#each claimUsers as user}
                <option value={user._id}>{user.name}</option>
              {/each}
            </select>
          </div>
        </div>

        <!-- Status Filter -->
        <div class="column is-one-quarter">
          <label class="label" for="claimStatus">Claim Status</label>
          <div class="select is-fullwidth">
            <select id="claimStatus" bind:value={claimStatus}>
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <!-- Audit Date Filters -->
        <div class="column is-one-quarter">
          <label class="label" for="claimEnteredFrom">Entered From (Audit)</label>
          <input class="input" type="date" bind:value={claimEnteredFrom} />
        </div>

        <div class="column is-one-quarter">
          <label class="label" for="claimEnteredTo">Entered To (Audit)</label>
          <input class="input" type="date" bind:value={claimEnteredTo} />
        </div>

        <!-- Statutory Pay Date Filters -->
        <div class="column is-one-quarter">
          <label class="label" for="claimPayFrom">Pay Date From (Statutory)</label>
          <input class="input" type="date" bind:value={claimPayFrom} />
        </div>

        <div class="column is-one-quarter">
          <label class="label" for="claimPayTo">Pay Date To (Statutory)</label>
          <input class="input" type="date" bind:value={claimPayTo} />
        </div>

        <!-- Reset Button -->
        <div class="column is-one-quarter is-flex is-align-items-flex-end">
          <button class="button is-light" on:click={resetClaimFilters}>
            Reset Claim Filters
          </button>
        </div>
      </div>
    </div>


    <!-- Claim Activity Table -->
    <div class="sdw-box mb-6">
      <h2 class="subtitle has-text-weight-semibold mb-3">
        Claim Activity
      </h2>

      {#if loading}
        <progress class="progress is-small is-primary" max="100"></progress>
      {:else}
        <table class="sdw-table">
          <thead>
            <tr>
              <th>Entered</th>
              <th>Pay Date</th>
              <th>User</th>
              <th>Employee</th>
              <th>Amount (€)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredClaims as claim}
              <tr>
                <td>{new Date(claim.createdAt).toLocaleDateString()}</td>
                <td>{new Date(claim.payDate).toLocaleDateString()}</td>
                <td>{claim.processor?.name}</td>
                <td>{claim.employee?.firstName} {claim.employee?.familyName}</td>
                <td>{claim.amount.toFixed(2)}</td>
                <td>{claim.status}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>


    <!-- ===================================================== -->
    <!-- Submission Activity Section -->
    <!-- ===================================================== -->
    <!-- Displays submission-level audit activity with filters -->

    <div class="sdw-box mb-5">
      <h2 class="subtitle has-text-weight-semibold mb-3">
        Submission Activity Filters
      </h2>

      <div class="columns is-multiline">

        <!-- User Filter -->
        <div class="column is-one-quarter">
          <label class="label" for="submissionUser">User</label>
          <div class="select is-fullwidth">
            <select id="submissionUser" bind:value={submissionUser}>
              <option value="">All Users</option>
              {#each submissionUsers as user}
                <option value={user._id}>{user.name}</option>
              {/each}
            </select>
          </div>
        </div>

        <!-- Acknowledgement Status Filter -->
        <div class="column is-one-quarter">
          <label class="label" for="submissionStatus">
            Submission Status
          </label>
          <div class="select is-fullwidth">
            <select id="submissionStatus" bind:value={submissionStatus}>
              <option value="">All</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        <!-- Audit Date Filters -->
        <div class="column is-one-quarter">
          <label class="label" for="submissionEnteredFrom">
            Entered From (Audit)
          </label>
          <input class="input" type="date" id="submissionEnteredFrom" bind:value={submissionEnteredFrom} />
        </div>

        <div class="column is-one-quarter">
          <label class="label" for="submissionEnteredTo">
            Entered To (Audit)
          </label>
          <input class="input" type="date" id="submissionEnteredTo" bind:value={submissionEnteredTo} />
        </div>

        <!-- Statutory Pay Date Filters -->
        <div class="column is-one-quarter">
          <label class="label" for="submissionPayFrom">
            Pay Date From (Statutory)
          </label>
          <input class="input" type="date" id="submissionPayFrom" bind:value={submissionPayFrom} />
        </div>

        <div class="column is-one-quarter">
          <label class="label" for="submissionPayTo">
            Pay Date To (Statutory)
          </label>
          <input class="input" type="date" id="submissionPayTo" bind:value={submissionPayTo} />
        </div>

        <!-- Reset Button -->
        <div class="column is-one-quarter is-flex is-align-items-flex-end">
          <button class="button is-light" on:click={resetSubmissionFilters}>
            Reset Submission Filters
          </button>
        </div>

      </div>
    </div>


    <!-- Submission Activity Table -->
    <div class="sdw-box">
      <h2 class="subtitle has-text-weight-semibold mb-3">
        Submission Activity
      </h2>

      {#if loading}
        <progress class="progress is-small is-primary" max="100"></progress>
      {:else}
        <table class="sdw-table">
          <thead>
            <tr>
              <th>Entered</th>
              <th>Pay Date</th>
              <th>User</th>
              <th>Submission ID</th>
              <th>Total (€)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredSubmissions as sub}
              <tr>
                <td>{new Date(sub.createdAt).toLocaleDateString()}</td>
                <td>{new Date(sub.payDate).toLocaleDateString()}</td>
                <td>{sub.submittedBy?.name}</td>
                <td>{sub.submissionID}</td>
                <td>{sub.totalAmount.toFixed(2)}</td>
                <td>{sub.acknowledgementStatus}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>

  </div>
</section>