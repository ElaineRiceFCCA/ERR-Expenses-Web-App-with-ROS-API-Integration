<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Menu from '$lib/components/Menu.svelte';

  // Data collections
  let claims: any[] = [];
  let employees: any[] = [];
  let elements: any[] = [];

  // Form state
  let selectedEmployee = '';
  let selectedElement = '';
  let amount = '';
  let description = '';
  let payDate = '';
  let days = '';

  // UI state
  let message = '';
  let error = '';
  let loading = true;

  // Reactive: determines if selected element is remote working
  $: isRemoteWorking =
    elements.find((e) => e._id === selectedElement)?.category ===
    'REMOTE_WORKING_DAILY_ALLOWANCE';

  // Fetch pending claims (processor + admin allowed)
  async function fetchClaims() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) return goto('/login');
    if (role !== 'processor' && role !== 'admin') return goto('/admin');

    try {
      const res = await fetch('http://localhost:5500/api/processor/claims', {
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

  // Fetch employee reference data
  async function fetchEmployees() {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch('http://localhost:5500/api/employees', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Employee fetch failed:", text);
      return;
    }

    employees = await res.json();
    console.log("Employees loaded:", employees);
  } catch (err) {
    console.error("Employee fetch error:", err);
  }
}

  // Fetch element reference data
  async function fetchElements() {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5500/api/elements', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      elements = await res.json();
    }
  }

  // Submit new claim to backend
  async function submitClaim() {
    const token = localStorage.getItem('token');
    if (!token) return goto('/login');

    if (!selectedEmployee || !selectedElement) {
      error = 'Please select an employee and element.';
      return;
    }

    try {
      const res = await fetch('http://localhost:5500/api/processor/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: isRemoteWorking ? undefined : amount,
          days: isRemoteWorking ? Number(days) : undefined,
          description,
          payDate,
          employee: selectedEmployee,
          element: selectedElement,
        }),
      });

      if (res.ok) {
        message = 'Claim submitted successfully!';
        amount = '';
        description = '';
        payDate = '';
        days = '';
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

  // Initial page load
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

    <!-- New Claim Form -->
    <div class="sdw-box mb-5">
      <h2 class="subtitle has-text-weight-semibold mb-3">New Claim</h2>

      <form on:submit|preventDefault={submitClaim}>
        
        <!-- Employee selection -->
        <div class="field">
          <label class="label" for="employee">Employee</label>
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

        <!-- Element selection -->
        <div class="field">
          <label class="label" for="element">Expense Type</label>
          <div class="select is-fullwidth">
            <select bind:value={selectedElement} required>
              <option value="">Select Expense Type</option>
              {#each elements as el}
                <option value={el._id}>
                  {el.category}
                  {el.subCategory ? ` – ${el.subCategory}` : ""}
                </option>
              {/each}
            </select>
          </div>
        </div>

        <!-- Conditional days / amount input -->
        {#if isRemoteWorking}
          <div class="field">
            <label class="label" for="days">Days</label>
            <input 
            class="input" 
            type="number" 
            bind:value={days} 
            required 
            />
          </div>
        {:else}
          <div class="field">
            <label class="label" for="amount">Amount (€)</label>
            <input class="input" type="number" step="0.01" bind:value={amount} required />
          </div>
        {/if}

        <!-- Paydate -->
        <div class="field">
          <label class="label" for="payDate">Paydate</label>
          <input class="input" 
          type="date" bind:value={payDate} 
          required 
          />
        </div>

        <!-- Description -->
        <div class="field">
          <label class="label" for="description">Description / Notes</label>
          <input 
          class="input" 
          type="text" bind:value={description} 
          required 
          />
        </div>

        <button class="button sdw-button mt-4" type="submit">Add Claim</button>
      </form>
    </div>

    <!-- Pending Claims Table -->
    <div class="sdw-box">
      <h2 class="subtitle has-text-weight-semibold mb-3">Pending Claims for Submission</h2>

      {#if loading}
        <progress class="progress is-small is-primary" max="100"></progress>
        <label class="label" for="employee">Employee</label>
      {:else}
        <table class="sdw-table">
          <thead>
            <tr>
              <th>Paydate</th>
              <th>Employee</th>
              <th>Expense Type</th>
              <th>Days</th>
              <th>Amount (€)</th>
            </tr>
          </thead>
          <tbody>
            {#each claims as claim}
              <tr>
                <td>{new Date(claim.payDate).toLocaleDateString()}</td>
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
      {/if}
    </div>
  </div>
</section>