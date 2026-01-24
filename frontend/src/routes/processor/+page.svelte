<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Menu from '$lib/components/Menu.svelte';

  let claims: any[] = [];
  let amount = '';
  let description = '';
  let message = '';
  let error = '';
  let loading = true;

  async function fetchClaims() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) return goto('/login');
    if (role !== 'processor' && role !== 'admin') return goto('/admin');

    try {
      const res = await fetch('http://localhost:5000/api/processor/claims', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        claims = await res.json();
      } else {
        error = 'Failed to load claims.';
      }
    } catch (err) {
      console.error(err);
      error = 'Network error fetching claims.';
    } finally {
      loading = false;
    }
  }

  async function submitClaim() {
    const token = localStorage.getItem('token');
    if (!token) return goto('/login');

    try {
      const res = await fetch('http://localhost:5000/api/processor/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, description }),
      });

      if (res.ok) {
        message = 'Claim submitted successfully!';
        amount = '';
        description = '';
        fetchClaims(); // refresh list
      } else {
        error = 'Failed to submit claim.';
      }
    } catch (err) {
      error = 'Network error submitting claim.';
    }
  }

  onMount(fetchClaims);
</script>

<Menu />

<section class="section processor-dashboard">
  <div class="container">
    <h1 class="title has-text-weight-semibold mb-4">Expense Claims</h1>

    <!-- Notifications -->
    {#if error}
      <div class="notification is-danger">{error}</div>
    {/if}
    {#if message}
      <div class="notification is-success">{message}</div>
    {/if}

    <!-- Claim Form -->
    <div class="sdw-box mb-5">
      <h2 class="subtitle has-text-weight-semibold mb-3">New Claim</h2>

      <form on:submit|preventDefault={submitClaim}>
        <div class="field">
          <label class="label">Amount (€)</label>
          <div class="control">
            <input
              class="input"
              type="number"
              step="0.01"
              bind:value={amount}
              placeholder="Enter amount"
              required
            />
          </div>
        </div>

        <div class="field">
          <label class="label">Description</label>
          <div class="control">
            <input
              class="input"
              type="text"
              bind:value={description}
              placeholder="e.g. Travel expenses, accommodation..."
              required
            />
          </div>
        </div>

        <div class="field mt-4">
          <div class="control">
            <button class="button sdw-button" type="submit">Add Claim</button>
          </div>
        </div>
      </form>
    </div>

    <!-- Claims Table -->
    <div class="sdw-box">
      <h2 class="subtitle has-text-weight-semibold mb-3">Claims for Submission</h2>

      {#if loading}
        <progress class="progress is-small is-primary" max="100">Loading...</progress>
      {:else if claims.length === 0}
        <p class="has-text-grey">No claims added yet.</p>
      {:else}
        <table class="sdw-table">
          <thead>
            <tr>
              <th>Amount (€)</th>
              <th>Description</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {#each claims as claim}
              <tr>
                <td>{claim.amount}</td>
                <td>{claim.description}</td>
                <td>
                  <span
                    class="tag is-rounded"
                    class:is-warning={claim.status === 'Pending'}
                    class:is-success={claim.status === 'Generated' || claim.status === 'Submitted'}
                    class:is-danger={claim.status === 'Rejected'}
                  >
                    {claim.status || 'Pending'}
                  </span>
                </td>
                <td>{new Date(claim.createdAt).toLocaleDateString()}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  </div>
</section>


