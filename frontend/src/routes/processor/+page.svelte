<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Menu from '$lib/components/Menu.svelte';

  // ======================================================
  // COMPONENT PURPOSE
  // ======================================================
  // This page allows processors (and admins acting as processors)
  // to:
  //   - Create new expense claims
  //   - View pending claims
  //   - Edit existing pending claims
  //
  // Claims created here are later grouped by payDate
  // and submitted to Revenue as part of an ERR submission
  // ======================================================


  // ================================
  // DATA COLLECTIONS
  // ================================
  // Reference data and working datasets

  let claims: any[] = [];       // Pending claims for submission
  let employees: any[] = [];    // Employee reference data
  let elements: any[] = [];     // Expense element reference data


  // ================================
  // FORM STATE
  // ================================
  // Controlled form fields for new claim creation

  let selectedEmployee = '';
  let selectedElement = '';
  let amount = '';
  let description = '';
  let payDate = '';
  let days = '';


  // ================================
  // UI STATE
  // ================================
  // Controls user feedback and loading indicators

  let message = '';
  let error = '';
  let loading = true;


  // ======================================================
  // REACTIVE DERIVATIONS
  // ======================================================
  // Determines if selected expense element is
  // REMOTE_WORKING_DAILY_ALLOWANCE
  //
  // This controls whether:
  //   - "days" input is shown
  //   - "amount" is derived server-side
  //   - remote working logic applies
  // ======================================================

  $: isRemoteWorking =
    elements.find((e) => e._id === selectedElement)?.category ===
    'REMOTE_WORKING_DAILY_ALLOWANCE';


  // ======================================================
  // FETCH CLAIMS
  // ======================================================
  // Retrieves pending claims from backend
  // Access restricted to processor and admin roles
  // ======================================================

  async function fetchClaims() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // Enforce authentication
    if (!token) return goto('/login');

    // Enforce role-based access
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


  // ======================================================
  // FETCH EMPLOYEES
  // ======================================================
  // Retrieves employee reference data used to
  // populate dropdown selection in claim form
  // ======================================================

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


  // ======================================================
  // FETCH ELEMENTS
  // ======================================================
  // Retrieves expense element reference data
  // These represent Revenue-defined expense categories
  // ======================================================

  async function fetchElements() {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5500/api/elements', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      elements = await res.json();
    }
  }


  // ======================================================
  // SUBMIT NEW CLAIM
  // ======================================================
  // Sends claim data to backend for persistence
  //
  // Business Rules:
  //   - Employee and element must be selected
  //   - For remote working:
  //        - days required
  //        - amount derived server-side
  //   - For other categories:
  //        - amount required
  // ======================================================

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

        // Reset form fields
        amount = '';
        description = '';
        payDate = '';
        days = '';
        selectedEmployee = '';
        selectedElement = '';

        // Refresh pending claims list
        fetchClaims();
      } else {
        error = 'Failed to submit claim.';
      }
    } catch (err) {
      error = 'Network error submitting claim.';
    }
  }


  // ======================================================
  // INITIAL PAGE LOAD
  // ======================================================
  // On component mount:
  //   - Fetch pending claims
  //   - Fetch employee reference data
  //   - Fetch expense element reference data
  // ======================================================

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

    <!-- ====================================================== -->
    <!-- USER NOTIFICATIONS -->
    <!-- ====================================================== -->

    {#if error}
      <div class="notification is-danger">{error}</div>
    {/if}

    {#if message}
      <div class="notification is-success">{message}</div>
    {/if}


    <!-- ====================================================== -->
    <!-- NEW CLAIM FORM -->
    <!-- ====================================================== -->
    <!-- Allows processor to create a new pending claim -->
    <!-- ====================================================== -->

    <div class="sdw-box mb-5">
      <h2 class="subtitle has-text-weight-semibold mb-3">New Claim</h2>

      <form on:submit|preventDefault={submitClaim}>

        <!-- Employee Selection -->
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

        <!-- Expense Element Selection -->
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

        <!-- Conditional Days or Amount Input -->
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
            <input 
              class="input" 
              type="number" 
              step="0.01" 
              bind:value={amount} 
              required 
            />
          </div>
        {/if}

        <!-- Pay Date -->
        <div class="field">
          <label class="label" for="payDate">Paydate</label>
          <input 
            class="input" 
            type="date" 
            bind:value={payDate} 
            required 
          />
        </div>

        <!-- Description -->
        <div class="field">
          <label class="label" for="description">Description / Notes</label>
          <input 
            class="input" 
            type="text" 
            bind:value={description} 
            required 
          />
        </div>

        <button class="button sdw-button mt-4" type="submit">
          Add Claim
        </button>
      </form>
    </div>


    <!-- ====================================================== -->
    <!-- PENDING CLAIMS TABLE -->
    <!-- ====================================================== -->
    <!-- Displays editable list of pending claims -->
    <!-- ====================================================== -->

    <div class="sdw-box">
      <h2 class="subtitle has-text-weight-semibold mb-3">
        Pending Claims for Submission
      </h2>

      {#if loading}
        <progress class="progress is-small is-primary" max="100"></progress>
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

              <!-- Claim Row (Click to Enable Edit Mode) -->
              <tr on:click={() => claim.editMode = true} style="cursor:pointer">
                <td>{new Date(claim.payDate).toLocaleDateString()}</td>
                <td>{claim.employee.firstName} {claim.employee.familyName}</td>
                <td>
                  {claim.element.category}
                  {claim.element.subCategory ? ` / ${claim.element.subCategory}` : ''}
                </td>
                <td>{claim.days ?? '-'}</td>
                <td>{claim.amount.toFixed(2)}</td>
              </tr>

              <!-- Inline Edit Mode -->
              {#if claim.editMode}
                <tr>
                  <td colspan="5">

                    <!-- Editable Claim Fields -->
                    <div class="columns is-multiline">

                      <!-- Employee Selector -->
                      <div class="column is-half">
                        <label class="label" for="employee">Employee</label>
                        <div class="select is-fullwidth">
                          <select bind:value={claim.employee._id} id="employee">
                            {#each employees as emp}
                              <option value={emp._id}>
                                {emp.firstName} {emp.familyName}
                              </option>
                            {/each}
                          </select>
                        </div>
                      </div>

                      <!-- Expense Type Selector -->
                      <div class="column is-half">
                        <label class="label" for="expenseType">Expense Type</label>
                        <div class="select is-fullwidth">
                          <select bind:value={claim.element._id} id="expenseType">
                            {#each elements as el}
                              <option value={el._id}>
                                {el.category}
                                {el.subCategory ? ` – ${el.subCategory}` : ""}
                              </option>
                            {/each}
                          </select>
                        </div>
                      </div>

                      <!-- Pay Date -->
                      <div class="column is-half">
                        <label class="label" for="payDate">Pay Date</label>
                        <input
                          class="input"
                          type="date"
                          bind:value={claim.payDate}
                          id="payDate"
                        />
                      </div>

                      <!-- Description -->
                      <div class="column is-half">
                        <label class="label" for="description">Description</label>
                        <input
                          class="input"
                          bind:value={claim.description}
                          id="description"
                        />
                      </div>

                      <!-- Days -->
                      <div class="column is-half">
                        <label class="label" for="days">Days</label>
                        <input
                          class="input"
                          type="number"
                          bind:value={claim.days}
                          id="days"
                        />
                      </div>

                      <!-- Amount -->
                      <div class="column is-half">
                        <label class="label" for="amount">Amount (€)</label>
                        <input
                          class="input"
                          type="number"
                          step="0.01"
                          bind:value={claim.amount}
                          id="amount"
                        />
                      </div>

                    </div>

                    <!-- Save / Cancel Controls -->
                    <div class="mt-3">
                      <button
                        class="button is-success mr-2"
                        on:click={async () => {
                          const token = localStorage.getItem('token');

                          const res = await fetch(
                            `http://localhost:5500/api/processor/claim/${claim._id}`,
                            {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({
                                description: claim.description,
                                payDate: claim.payDate,
                                employee: claim.employee._id,
                                element: claim.element._id,
                                days: claim.days,
                                amount: claim.amount,
                              }),
                            }
                          );

                          if (res.ok) {
                            message = 'Claim updated successfully!';
                            claim.editMode = false;
                            fetchClaims();
                          } else {
                            error = 'Failed to update claim.';
                          }
                        }}
                      >
                        Save Changes
                      </button>

                      <button
                        class="button is-light"
                        on:click={() => claim.editMode = false}
                      >
                        Cancel
                      </button>
                    </div>

                  </td>
                </tr>
              {/if}

            {/each}
          </tbody>
        </table>
      {/if}
    </div>

  </div>
</section>