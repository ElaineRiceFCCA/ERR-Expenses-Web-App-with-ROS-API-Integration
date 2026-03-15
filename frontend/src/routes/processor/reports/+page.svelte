<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import Menu from "$lib/components/Menu.svelte";

  // ----------------------------------------------------
  // Component State
  // ----------------------------------------------------

  let submissions: any[] = [];  // List of persisted ERR submissions
  let loading = true;           // Loading state for API request
  let error = "";               // Error notification message

  // Date range filters (UI-controlled)
  let fromDate = "";
  let toDate = "";

  // ----------------------------------------------------
  // Filtered Submissions (Reactive Statement)
  // ----------------------------------------------------
  // Automatically recalculates whenever:
  // - submissions
  // - fromDate
  // - toDate
  // changes
  //
  // Filters submission history by payDate range

  $: filteredSubmissions = submissions.filter((s) => {
    // No filter applied
    if (!fromDate && !toDate) return true;

    const payDate = new Date(s.payDate);

    // Apply lower bound
    if (fromDate && payDate < new Date(fromDate)) return false;

    // Apply upper bound
    if (toDate && payDate > new Date(toDate)) return false;

    return true;
  });

  // ----------------------------------------------------
  // Dashboard Metrics (Reactive Aggregates)
  // ----------------------------------------------------
  // These values update automatically whenever
  // filteredSubmissions changes

  // Total number of submissions in current filter
  $: totalSubmissions = filteredSubmissions.length;

  // Count of acknowledged submissions
  $: totalAcknowledged = filteredSubmissions.filter(
    (s) => s.acknowledgementStatus === "ACKNOWLEDGED"
  ).length;

  // Count of rejected submissions
  $: totalRejected = filteredSubmissions.filter(
    (s) => s.acknowledgementStatus === "REJECTED"
  ).length;

  // Total monetary value of filtered submissions
  $: totalValueSubmitted = filteredSubmissions
  .filter((s) => s.acknowledgementStatus === "ACKNOWLEDGED")
  .reduce((sum, s) => sum + (s.totalAmount || 0), 0);

  // ----------------------------------------------------
  // Fetch Submission History
  // ----------------------------------------------------
  // Retrieves all stored submissions from backend
  // Enforces authentication and role-based access control
  // Data originates from the Submissions collection
  // (persistent audit trail of ERR → ROS interactions)

  async function fetchSubmissions() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // Enforce authentication
    if (!token) return goto("/login");

    // Restrict access to processor or admin roles
    if (role !== "processor" && role !== "admin") return goto("/admin");

    try {
      const res = await fetch("http://localhost:5500/api/reports/submissions", {
          headers: { Authorization: `Bearer ${token}` },
        });

      if (res.ok) {
        submissions = await res.json();
      } else {
        error = "Failed to load submissions.";
      }
    } catch {
      error = "Network error loading submissions.";
    } finally {
      loading = false;
    }
  }

  // ----------------------------------------------------
  // Reset Filters
  // ----------------------------------------------------
  // Clears date range inputs and restores full dataset.

  function resetFilters() {
    fromDate = "";
    toDate = "";
  }

  // Fetch submission history when component mounts
  onMount(fetchSubmissions);
</script>

<Menu />

<section class="section processor-dashboard">
  <div class="container">
    <h1 class="title has-text-weight-semibold mb-4">
      Submission History
    </h1>

    <!-- Error Notification -->
    {#if error}
      <div class="notification is-danger">{error}</div>
    {/if}

    <!-- ----------------------------------------------------
         Date Range Filter Panel
    ---------------------------------------------------- -->
    <div class="sdw-box mb-5">
      <h2 class="subtitle has-text-weight-semibold mb-3">
        Filter by Pay Date
      </h2>

      <div class="columns is-multiline">

        <!-- From Date -->
        <div class="column is-one-third">
          <div class="field">
            <label class="label" for="fromDate">From</label>
            <input
              class="input"
              type="date"
              id="fromDate"
              bind:value={fromDate}
            />
          </div>
        </div>

        <!-- To Date -->
        <div class="column is-one-third">
          <div class="field">
            <label class="label" for="toDate">To</label>
            <input
              class="input"
              type="date"
              id="toDate"
              bind:value={toDate}
            />
          </div>
        </div>

        <!-- Reset Button -->
        <div class="column is-one-third is-flex is-align-items-flex-end">
          <button
            class="button is-light"
            on:click={resetFilters}
          >
            Reset
          </button>
        </div>

      </div>
    </div>

    <!-- ----------------------------------------------------
         Dashboard Summary Metrics
    ---------------------------------------------------- -->
    <!-- Aggregated values derived from filtered dataset -->

    <div class="columns mb-5">

      <!-- Total Submissions -->
      <div class="column">
        <div class="sdw-box has-text-centered">
          <p class="heading">Total Submissions</p>
          <p class="title is-4">{totalSubmissions}</p>
        </div>
      </div>

      <!-- Acknowledged Count -->
      <div class="column">
        <div class="sdw-box has-text-centered">
          <p class="heading">Acknowledged</p>
          <p class="title is-4 has-text-success">
            {totalAcknowledged}
          </p>
        </div>
      </div>

      <!-- Rejected Count -->
      <div class="column">
        <div class="sdw-box has-text-centered">
          <p class="heading">Rejected</p>
          <p class="title is-4 has-text-danger">
            {totalRejected}
          </p>
        </div>
      </div>

      <!-- Total Financial Value -->
      <div class="column">
        <div class="sdw-box has-text-centered">
          <p class="heading">Total Value Submitted (€)</p>
          <p class="title is-4">
            {totalValueSubmitted.toFixed(2)}
          </p>
        </div>
      </div>

    </div>

    <!-- ----------------------------------------------------
         Submission History Table
    ---------------------------------------------------- -->
    <div class="sdw-box">
      {#if loading}
      <!-- Loading indicator while fetching submissions -->
        <progress class="progress is-small is-primary" max="100"></progress>

      {:else if filteredSubmissions.length === 0}
        <div class="notification is-light">
          No submissions found for selected date range.
        </div>

      {:else}
        <table class="sdw-table">
          <thead>
            <tr>
              <th>Submission ID</th>
              <th>Pay Date</th>
              <th>Tax Year</th>
              <th>Line Items</th>
              <th>Total (€)</th>
              <th>Status</th>
              <th>Acknowledgement ID</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredSubmissions as sub}
              <tr>
              <!-- Unique Revenue Submission Identifier -->
                <td>{sub.submissionID}</td>

                <!-- Grouped Pay Date -->
                <td>{new Date(sub.payDate).toLocaleDateString()}</td>

                <!-- Revenue Tax Year Context -->
                <td>{sub.taxYear}</td>

                <!-- Aggregated Line Item Count -->
                <td>{sub.lineItemCount ?? "-"}</td>

                <!-- Aggregated Total Monetary Value -->
                <td>{sub.totalAmount?.toFixed(2) ?? "-"}</td>

                <!-- Revenue Acknowledgement Status -->
                <td>
                  {#if sub.acknowledgementStatus === "ACKNOWLEDGED"}
                    <span class="tag is-success is-light">
                      ACKNOWLEDGED
                    </span>
                  {:else if sub.acknowledgementStatus === "REJECTED"}
                    <span class="tag is-danger is-light">
                      REJECTED
                    </span>
                  {:else}
                    <span class="tag is-warning is-light">
                      PENDING
                    </span>
                  {/if}
                </td>

                <!-- Revenue Acknowledgement Identifier -->
                <td>{sub.acknowledgementID ?? "-"}</td>

                <!-- Local Creation Timestamp -->
                <td>{new Date(sub.createdAt).toLocaleDateString()}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  </div>
</section>