<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Menu from '$lib/components/Menu.svelte';

  let claims: any[] = [];
  let employees: any[] = [];
  let elements: any[] = [];

  let selectedEmployee = '';
  let selectedElement = '';

  let amount = '';
  let description = '';
  let payDate = '';
  let message = '';
  let error = '';
  let loading = true;
  let employee = '';
  let element = '';

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

  async function fetchEmployees() {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/employees', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      employees = await res.json();
    }
  }

  async function fetchElements() {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/elements', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      elements = await res.json();
    }
  }

  async function submitClaim() {
    const token = localStorage.getItem('token');
    if (!token) return goto('/login');

    if (!selectedEmployee || !selectedElement) {
      error = 'Please select an employee and element.';
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/processor/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          description,
          payDate,
          employee: selectedEmployee,
          element: selectedElement
        }),
      });

      if (res.ok) {
        message = 'Claim submitted successfully!';
        amount = '';
        description = '';
        payDate = '';
        selectedEmployee = '';
        selectedElement = '';
        fetchClaims();
      } else {
        error = 'Failed to submit claim.';
      }
    } catch (err) {
      error = 'Network error submitting claim.';
    }
  }

  onMount(async () => {
    await fetchClaims();
    await fetchEmployees();
    await fetchElements();
  });
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

        <!-- Employee Dropdown -->
        <div class="field">
          <label class="label">Employee</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select bind:value={selectedEmployee} required>
                <option value="">Select Employee</option>
                {#each employees as emp}
                  <option value={emp._id}>
                    {emp.firstName} {emp.familyName}
                  </option>
                {/each}
              </select>
            </div>
          </div>
        </div>

        <!-- Element Dropdown -->
        <div class="field">
          <label class="label">Expense Type</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select bind:value={selectedElement} required>
                <option value="">Select Expense Type</option>
                {#each elements as el}
                  <option value={el._id}>
                    {el.category}
                  </option>
                {/each}
              </select>
            </div>
          </div>
        </div>

        <!-- Paydate -->
        <div class="field">
          <label class="label">Paydate</label>
          <div class="control">
            <input
              class="input"
              type="date"
              bind:value={payDate}
              required
            />
          </div>
        </div>

        <!-- Description -->
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
              <th>Pay date</th>
              <th>Expense Description</th>
              <th>Days</th>
              <th>Amount (€)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {#each claims as claim}
              <tr>
                <td>{new Date(claim.payDate).toLocaleDateString()}</td>
                <!-- <td>{new Date(claim.createdAt).toLocaleDateString()}</td> -->
                <td>{claim.description}</td>
                <td>"Days TODO"</td>
                <td>{claim.amount}</td>
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
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  </div>
</section>


