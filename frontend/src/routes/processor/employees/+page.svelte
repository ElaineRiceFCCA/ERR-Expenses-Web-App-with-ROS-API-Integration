<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Menu from '$lib/components/Menu.svelte';

  // ----------------------------------------------------
  // Component State
  // ----------------------------------------------------

  let employees: any[] = [];          // List of all employees retrieved from backend
  let selectedEmployee: any = null;   // Currently selected employee for detailed view

  // ----------------------------------------------------
  // Form Fields – New Employee Creation
  // ----------------------------------------------------

  let firstName = '';
  let familyName = '';
  let employmentID = '';
  let employeePpsn = '';
  let employerReference = '';
  let dateOfBirth = '';
  let line1 = '';
  let city = '';
  let county = '';
  let country = 'IE'; // Default country (Ireland)

  // UI State
  let message = '';   // Success notification
  let error = '';     // Error notification
  let loading = true; // Loading state for employee list

  // ----------------------------------------------------
  // Fetch Employees
  // ----------------------------------------------------
  // Retrieves all employee records from backend API.
  // Enforces authentication and role-based access control.

  async function fetchEmployees() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // Enforce authentication
    if (!token) return goto('/login');

    // Restrict access to processor or admin roles
    if (role !== 'processor' && role !== 'admin') return goto('/admin');

    try {
      const res = await fetch('http://localhost:5500/api/employees', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        employees = await res.json();
      } else {
        error = 'Failed to load employees.';
      }
    } catch (err) {
      error = 'Network error loading employees.';
    } finally {
      loading = false;
    }
  }

  // ----------------------------------------------------
  // Add New Employee
  // ----------------------------------------------------
  // Sends employee form data to backend API.
  // On success, clears form and refreshes list.

  async function addEmployee() {
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:5500/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          familyName,
          employmentID,
          employeePpsn,
          employerReference,
          dateOfBirth,
          address: { line1, city, county, country },
        }),
      });

      if (res.ok) {
        message = 'Employee added successfully!';
        clearForm();
        fetchEmployees(); // Refresh list after insert
      } else {
        error = 'Failed to add employee.';
      }
    } catch {
      error = 'Network error adding employee.';
    }
  }

  // ----------------------------------------------------
  // Clear Form
  // ----------------------------------------------------
  // Resets input fields after successful submission.

  function clearForm() {
    firstName = '';
    familyName = '';
    employmentID = '';
    employeePpsn = '';
    employerReference = '';
    dateOfBirth = '';
    line1 = '';
    city = '';
    county = '';
    country = 'IE';
  }

  // ----------------------------------------------------
  // Select Employee
  // ----------------------------------------------------
  // Stores clicked employee for detailed display panel.

  function selectEmployee(emp: any) {
    selectedEmployee = emp;
  }

  // Load employee list on page mount
  onMount(fetchEmployees);
</script>

<Menu />

<section class="section processor-dashboard">
  <div class="container">
    <h1 class="title has-text-weight-semibold mb-4">Employee Management</h1>

    <!-- Error Notification -->
    {#if error}
      <div class="notification is-danger">{error}</div>
    {/if}

    <!-- Success Notification -->
    {#if message}
      <div class="notification is-success">{message}</div>
    {/if}

    <!-- ----------------------------------------------------
     Add Employee Form
---------------------------------------------------- -->
<div class="sdw-box mb-5">
  <h2 class="subtitle has-text-weight-semibold mb-3">
    Add New Employee
  </h2>

  <div class="columns is-multiline">

    <!-- First Name -->
    <div class="column is-half">
      <div class="field">
        <label class="label" for="firstName">First Name</label>
        <input
          class="input"
          id="firstName"
          type="text"
          bind:value={firstName}
          required
        />
      </div>
    </div>

    <!-- Family Name -->
    <div class="column is-half">
      <div class="field">
        <label class="label" for="familyName">Family Name</label>
        <input
          class="input"
          id="familyName"
          type="text"
          bind:value={familyName}
          required
        />
      </div>
    </div>

    <!-- Employment ID -->
    <div class="column is-half">
      <div class="field">
        <label class="label" for="employmentID">Employment ID</label>
        <input
          class="input"
          id="employmentID"
          type="text"
          bind:value={employmentID}
          required
        />
      </div>
    </div>

    <!-- PPSN -->
    <div class="column is-half">
      <div class="field">
        <label class="label" for="employeePpsn">PPSN (Optional)</label>
        <input
          class="input"
          id="employeePpsn"
          type="text"
          bind:value={employeePpsn}
        />
      </div>
    </div>

    <!-- Employer Reference -->
    <div class="column is-half">
      <div class="field">
        <label class="label" for="employerReference">Employer Reference</label>
        <input
          class="input"
          id="employerReference"
          type="text"
          bind:value={employerReference}
          required
        />
      </div>
    </div>

    <!-- Date of Birth -->
    <div class="column is-half">
      <div class="field">
        <label class="label" for="dateOfBirth">Date of Birth</label>
        <input
          class="input"
          id="dateOfBirth"
          type="date"
          bind:value={dateOfBirth}
          required
        />
      </div>
    </div>

    <!-- Address Line 1 -->
    <div class="column is-full">
      <div class="field">
        <label class="label" for="line1">Address Line 1</label>
        <input
          class="input"
          id="line1"
          type="text"
          bind:value={line1}
          required
        />
      </div>
    </div>

    <!-- City -->
    <div class="column is-one-third">
      <div class="field">
        <label class="label" for="city">City</label>
        <input
          class="input"
          id="city"
          type="text"
          bind:value={city}
          required
        />
      </div>
    </div>

    <!-- County -->
    <div class="column is-one-third">
      <div class="field">
        <label class="label" for="county">County</label>
        <input
          class="input"
          id="county"
          type="text"
          bind:value={county}
          required
        />
      </div>
    </div>

    <!-- Country -->
    <div class="column is-one-third">
      <div class="field">
        <label class="label" for="country">Country</label>
        <input
          class="input"
          id="country"
          type="text"
          bind:value={country}
          required
        />
      </div>
    </div>

  </div>

  <button class="button sdw-button mt-4" on:click={addEmployee}>
    Add Employee
  </button>
</div>

    <!-- ----------------------------------------------------
         Employee List Table
         ---------------------------------------------------- -->
    <div class="sdw-box mb-5">
      <h2 class="subtitle has-text-weight-semibold mb-3">Employee List</h2>

      {#if loading}
        <progress class="progress is-small is-primary" max="100"></progress>
      {:else}
        <table class="sdw-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Employment ID</th>
              <th>Employer Ref</th>
            </tr>
          </thead>
          <tbody>
            {#each employees as emp}
              <!-- Clicking row loads detailed employee record -->
              <tr on:click={() => selectEmployee(emp)} style="cursor:pointer">
                <td>{emp.firstName} {emp.familyName}</td>
                <td>{emp.employmentID}</td>
                <td>{emp.employerReference}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>

    <!-- ----------------------------------------------------
         Selected Employee Detail Panel
         ---------------------------------------------------- -->
    {#if selectedEmployee}
      <div class="sdw-box">
        <h2 class="subtitle has-text-weight-semibold mb-3">
          Employee Record: {selectedEmployee.firstName} {selectedEmployee.familyName}
        </h2>

        <p><strong>Employment ID:</strong> {selectedEmployee.employmentID}</p>
        <p><strong>PPSN:</strong> {selectedEmployee.employeePpsn ?? 'N/A'}</p>
        <p><strong>Employer Reference:</strong> {selectedEmployee.employerReference}</p>
        <p><strong>Date of Birth:</strong> {new Date(selectedEmployee.dateOfBirth).toLocaleDateString()}</p>
        <p><strong>Address:</strong> 
          {selectedEmployee.address.line1}, 
          {selectedEmployee.address.city}, 
          {selectedEmployee.address.county}, 
          {selectedEmployee.address.country}
        </p>
      </div>
    {/if}
  </div>
</section>