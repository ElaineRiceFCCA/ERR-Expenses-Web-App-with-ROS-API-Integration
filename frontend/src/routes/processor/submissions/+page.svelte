<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Menu from '$lib/components/Menu.svelte';

  // ----------------------------------------------------
  // Type Definitions
  // ----------------------------------------------------

  // Represents a pending claim returned from backend
  interface Claim {
    _id: string;
    payDate: string;
    employee: {
      firstName: string;
      familyName: string;
    };
    element: {
      category: string;
      subCategory?: string;
    };
    days?: number;
    amount: number;
  }

  // Represents structured response from ERR → ROS submission
  interface RosApiResponse {
    success: boolean;
    submissionID: string;
    rosSubmitted: boolean;
    rosResponse?: {
      ok: boolean;
      status: number;
      response: any;
    };
  }

  // ----------------------------------------------------
  // Component State
  // ----------------------------------------------------

  let claims: Claim[] = [];               // All pending claims
  let availableDates: string[] = [];      // Unique pay dates derived from claims
  let selectedDate: string = "";          // User-selected pay date

  let rosResponse: RosApiResponse | null = null;  // Last ROS response
  let loading = true;                     // Initial loading state
  let submitting = false;                 // Submission in progress
  let error = '';                         // Error message
  let message = '';                       // Success message

  // ----------------------------------------------------
  // Fetch Pending Claims
  // ----------------------------------------------------
  // Loads claims and extracts unique pay dates for submission

  async function fetchClaims() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // Enforce authentication + RBAC
    if (!token) return goto('/login');
    if (role !== 'processor' && role !== 'admin') return goto('/admin');

    try {
      const res = await fetch('http://localhost:5500/api/processor/claims', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        claims = await res.json();

        // Derive unique pay dates (YYYY-MM-DD)
        const uniqueDates = new Set(
          claims.map((c) => c.payDate.split('T')[0])
        );

        availableDates = Array.from(uniqueDates).sort();
      } else {
        error = 'Failed to load pending claims.';
      }
    } catch (err) {
      error = 'Network error loading claims.';
    } finally {
      loading = false;
    }
  }

  // ----------------------------------------------------
  // Submit Selected Pay Date to ROS
  // ----------------------------------------------------
  // Triggers ERR generation + signed submission

  async function sendSubmission() {
    if (!selectedDate) return;

    submitting = true;
    error = '';
    message = '';
    rosResponse = null;

    const token = localStorage.getItem('token');

    try {
      const res = await fetch(
        'http://localhost:5500/api/processor/submissions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ payDate: selectedDate })
        }
      );

      const data: RosApiResponse = await res.json();
      rosResponse = data;

      if (data.rosSubmitted) {
        message = 'Submission successfully acknowledged by ROS.';
        await fetchClaims(); // Refresh pending claims
      } else {
        error = 'Submission failed. See details below.';
      }
    } catch (err) {
      error = 'Network error submitting to ROS.';
    } finally {
      submitting = false;
    }
  }

  // Load claims on component mount
  onMount(fetchClaims);
</script>

<Menu />

<section class="section processor-dashboard">
  <div class="container">
    <h1 class="title has-text-weight-semibold mb-4">
      Enhanced Reporting Submissions
    </h1>

    <!-- Error Notification -->
    {#if error}
      <div class="notification is-danger">{error}</div>
    {/if}

    <!-- Success Notification -->
    {#if message}
      <div class="notification is-success">{message}</div>
    {/if}

    <!-- Submission Control Panel -->
    <div class="sdw-box mb-5">
      <h2 class="subtitle has-text-weight-semibold mb-3">
        Submit Pending Claims
      </h2>

      {#if loading}
        <progress class="progress is-small is-primary" max="100"></progress>
      {:else if availableDates.length === 0}
        <div class="notification is-info">
          No pending claims available for submission.
        </div>
      {:else}
        <!-- Pay Date Selector -->
        <div class="field">
          <label class="label" for="selecte pay Date">Select Pay Date</label>
          <div class="select is-fullwidth">
            <select bind:value={selectedDate}>
              <option value="">Select Pay Date</option>
              {#each availableDates as date}
                <option value={date}>
                  {new Date(date).toLocaleDateString()}
                </option>
              {/each}
            </select>
          </div>
        </div>

        <!-- Submission Trigger -->
        <button
          class="button sdw-button mt-3"
          on:click={sendSubmission}
          disabled={!selectedDate || submitting}
        >
          {submitting ? 'Submitting...' : 'Send Submission'}
        </button>
      {/if}
    </div>

    <!-- Claims Preview for Selected Date -->
    {#if selectedDate}
      <div class="sdw-box">
        <h2 class="subtitle has-text-weight-semibold mb-3">
          Claims for {new Date(selectedDate).toLocaleDateString()}
        </h2>

        <table class="sdw-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Expense Type</th>
              <th>Days</th>
              <th>Amount (€)</th>
            </tr>
          </thead>
          <tbody>
            {#each claims.filter(c => c.payDate.startsWith(selectedDate)) as claim}
              <tr>
                <td>{claim.employee.firstName} {claim.employee.familyName}</td>
                <td>
                  {claim.element.category}
                  {claim.element.subCategory ? ` / ${claim.element.subCategory}` : ''}
                </td>
                <td>{claim.days ?? '-'}</td>
                <td>{claim.amount.toFixed(2)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}

    <!-- ROS Submission Result Panel -->
    {#if rosResponse}
      <div class="sdw-box mt-5">
        <h2 class="subtitle has-text-weight-semibold mb-3">
          ROS Response
        </h2>

        <p><strong>Submission ID:</strong> {rosResponse.submissionID}</p>
        <p>
          <strong>Status:</strong>
          {rosResponse.rosSubmitted ? 'Submitted' : 'Failed'}
        </p>

        {#if rosResponse.rosSubmitted}
          <p>
            <strong>ACK Status:</strong>
            {rosResponse.rosResponse?.response?.acknowledgementStatus}
          </p>
          <p>
            <strong>ACK ID:</strong>
            {rosResponse.rosResponse?.response?.acknowledgementID}
          </p>
        {:else}
          <!-- Raw ROS error payload -->
          <pre>
{JSON.stringify(rosResponse.rosResponse?.response, null, 2)}
          </pre>
        {/if}
      </div>
    {/if}
  </div>
</section>