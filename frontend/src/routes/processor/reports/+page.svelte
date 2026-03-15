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

  // ----------------------------------------------------
  // Fetch Submission History
  // ----------------------------------------------------
  // Retrieves all stored submissions from backend.
  // Enforces authentication and role-based access control.
  // Data originates from the Submissions collection
  // (persistent audit trail of ERR → ROS interactions).

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

  // Load submission history on page mount
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
         Submission History Table
         ---------------------------------------------------- -->
    <div class="sdw-box">
      {#if loading}
        <!-- Loading indicator while fetching submissions -->
        <progress class="progress is-small is-primary" max="100"></progress>
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
            {#each submissions as sub}
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
                <td>{sub.acknowledgementStatus}</td>

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