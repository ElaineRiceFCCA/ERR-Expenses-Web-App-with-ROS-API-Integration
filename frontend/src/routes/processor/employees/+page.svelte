<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Menu from '$lib/components/Menu.svelte';

  // ======================================================
  // COMPONENT PURPOSE
  // ======================================================
  // This page manages Employee records within the ERR system
  //
  // Employees are core statutory entities referenced by:
  //   - Claims
  //   - ERR Submissions
  //
  // The module supports:
  //   - Create (Add Employee)
  //   - Read (List + Detail View)
  //   • Update (Inline Edit Mode)
  //
  // Access restricted to Processor and Admin roles
  // ======================================================


  // ----------------------------------------------------
  // COMPONENT STATE
  // ----------------------------------------------------

  let employees: any[] = [];          
  // Collection of all employee records retrieved from backend

  let selectedEmployee: any = null;   
  // Currently selected employee for detailed view/edit panel


  // ----------------------------------------------------
  // FORM STATE – NEW EMPLOYEE CREATION
  // ----------------------------------------------------
  // Controlled inputs bound to Add Employee form fields

  let firstName = '';
  let familyName = '';
  let employmentID = '';
  let employeePpsn = '';
  let employerReference = '';
  let dateOfBirth = '';
  let line1 = '';
  let city = '';
  let county = '';
  let country = 'IE'; 
  // Default country set to Ireland (ERR jurisdiction)


  // ----------------------------------------------------
  // UI STATE
  // ----------------------------------------------------

  let message = '';   
  // Success notification message

  let error = '';     
  // Error notification message

  let loading = true; 
  // Controls loading indicator during fetch operation


  // ----------------------------------------------------
  // FETCH EMPLOYEES
  // ----------------------------------------------------
  // Retrieves employee records from backend API
  //
  // Security Enforcement:
  //   - JWT authentication required
  //   - Role must be processor or admin
  //
  // Populates employees[] for:
  //   - Table display
  //   - Detail selection
  // ----------------------------------------------------

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
  // ADD NEW EMPLOYEE
  // ----------------------------------------------------
  // Sends employee form data to backend API
  //
  // Nested address object aligns with MongoDB schema:
  //   address: { line1, city, county, country }
  //
  // On success:
  //   - Displays confirmation
  //   - Clears form fields
  //   - Refreshes employee list
  // ----------------------------------------------------

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
        fetchEmployees(); 
      } else {
        error = 'Failed to add employee.';
      }
    } catch {
      error = 'Network error adding employee.';
    }
  }


  // ----------------------------------------------------
  // CLEAR FORM
  // ----------------------------------------------------
  // Resets input fields after successful employee creation
  // ----------------------------------------------------

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
  // SELECT EMPLOYEE
  // ----------------------------------------------------
  // Stores clicked employee for detailed display panel
  //
  // Enables:
  //   - Read-only view
  //   - Inline edit mode toggle
  // ----------------------------------------------------

  function selectEmployee(emp: any) {
    selectedEmployee = emp;
  }


  // ----------------------------------------------------
  // INITIAL LOAD
  // ----------------------------------------------------
  // Fetch employee list when component mounts
  // ----------------------------------------------------

  onMount(fetchEmployees);
</script>


<Menu />

<section class="section processor-dashboard">
  <div class="container">

    <!-- ======================================================
         PAGE TITLE
    ====================================================== -->

    <h1 class="title has-text-weight-semibold mb-4">
      Employee Management
    </h1>


    <!-- ======================================================
         NOTIFICATIONS
    ====================================================== -->

    {#if error}
      <div class="notification is-danger">{error}</div>
    {/if}

    {#if message}
      <div class="notification is-success">{message}</div>
    {/if}


    <!-- ======================================================
         ADD EMPLOYEE FORM
    ====================================================== -->
    <!-- Collects statutory employee identity information -->

    <div class="sdw-box mb-5">
      <h2 class="subtitle has-text-weight-semibold mb-3">
        Add New Employee
      </h2>

      <div class="columns is-multiline">

        <!-- First Name -->
        <div class="column is-half">
          <div class="field">
            <label class="label" for="firstName">First Name</label>
            <input class="input" type="text" id="firstName" bind:value={firstName} required />
          </div>
        </div>

        <!-- Family Name -->
        <div class="column is-half">
          <div class="field">
            <label class="label" for="familyName">Family Name</label>
            <input class="input" type="text" id="familyName" bind:value={familyName} required />
          </div>
        </div>

        <!-- Employment ID -->
        <div class="column is-half">
          <div class="field">
            <label class="label" for="employmentID">Employment ID</label>
            <input class="input" type="text" id="employmentID" bind:value={employmentID} required />
          </div>
        </div>

        <!-- PPSN (Optional) -->
        <div class="column is-half">
          <div class="field">
            <label class="label" for="employeePpsn">PPSN (Optional)</label>
            <input class="input" type="text" id="employeePpsn" bind:value={employeePpsn} />
          </div>
        </div>

        <!-- Employer Reference -->
        <div class="column is-half">
          <div class="field">
            <label class="label" for="employerReference">Employer Reference</label>
            <input class="input" type="text" id="employerReference" bind:value={employerReference} required />
          </div>
        </div>

        <!-- Date of Birth -->
        <div class="column is-half">
          <div class="field">
            <label class="label" for="dateOfBirth">Date of Birth</label>
            <input class="input" type="date" id="dateOfBirth" bind:value={dateOfBirth} required />
          </div>
        </div>

        <!-- Address -->
        <div class="column is-full">
          <div class="field">
            <label class="label" for="line1">Address Line 1</label>
            <input class="input" type="text" id="line1" bind:value={line1} required />
          </div>
        </div>

        <div class="column is-one-third">
          <div class="field">
            <label class="label" for="city">City</label>
            <input class="input" type="text" id="city" bind:value={city} required />
          </div>
        </div>

        <div class="column is-one-third">
          <div class="field">
            <label class="label" for="county">County</label>
            <input class="input" type="text" id="county" bind:value={county} required />
          </div>
        </div>

        <div class="column is-one-third">
          <div class="field">
            <label class="label" for="country">Country</label>
            <input class="input" type="text" id="country" bind:value={country} required />
          </div>
        </div>

      </div>

      <button class="button sdw-button mt-4" on:click={addEmployee}>
        Add Employee
      </button>
    </div>


    <!-- ======================================================
         EMPLOYEE LIST TABLE
    ====================================================== -->
    <!-- Displays summary of all employees -->

    <div class="sdw-box mb-5">
      <h2 class="subtitle has-text-weight-semibold mb-3">
        Employee List
      </h2>

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


    <!-- ======================================================
         SELECTED EMPLOYEE DETAIL PANEL
    ====================================================== -->
    <!-- Supports read-only view and inline edit mode -->

    {#if selectedEmployee}
      <div class="sdw-box">

        <h2 class="subtitle has-text-weight-semibold mb-3">
          Employee Record: {selectedEmployee.firstName} {selectedEmployee.familyName}
        </h2>

        {#if !selectedEmployee.editMode}

          <!-- Read-only view -->
          <p><strong>Employment ID:</strong> {selectedEmployee.employmentID}</p>
          <p><strong>PPSN:</strong> {selectedEmployee.employeePpsn ?? 'N/A'}</p>
          <p><strong>Employer Reference:</strong> {selectedEmployee.employerReference}</p>
          <p><strong>Date of Birth:</strong> {new Date(selectedEmployee.dateOfBirth).toLocaleDateString()}</p>
          <p>
            <strong>Address:</strong>
            {selectedEmployee.address.line1},
            {selectedEmployee.address.city},
            {selectedEmployee.address.county},
            {selectedEmployee.address.country}
          </p>

          <button
            class="button is-warning mt-3"
            on:click={() => selectedEmployee.editMode = true}>
            Edit Employee
          </button>

        {:else}

          <!-- Inline Edit Mode -->
          <!-- Allows update of full employee record -->

          <div class="columns is-multiline">

            <div class="column is-half">
              <label class="label" for="firstName">First Name</label>
              <input class="input" id="firstName" bind:value={selectedEmployee.firstName} />
            </div>

            <div class="column is-half">
              <label class="label" for="familyName">Family Name</label>
              <input class="input" id="familyName" bind:value={selectedEmployee.familyName} />
            </div>

            <div class="column is-half">
              <label class="label" for="employmentID">Employment ID</label>
              <input class="input" id="employmentID" bind:value={selectedEmployee.employmentID} />
            </div>

            <div class="column is-half">
              <label class="label" for="employeePpsn">PPSN</label>
              <input class="input" id="employeePpsn" bind:value={selectedEmployee.employeePpsn} />
            </div>

            <div class="column is-half">
              <label class="label" for="employerReference">Employer Reference</label>
              <input class="input" id="employerReference" bind:value={selectedEmployee.employerReference} />
            </div>

            <div class="column is-half">
              <label class="label" for="dateOfBirth">Date of Birth</label>
              <input type="date" class="input" id="dateOfBirth" bind:value={selectedEmployee.dateOfBirth} />
            </div>

            <div class="column is-full">
              <label class="label" for="addressLine1">Address Line 1</label>
              <input class="input" id="addressLine1" bind:value={selectedEmployee.address.line1} />
            </div>

            <div class="column is-one-third">
              <label class="label" for="addressCity">City</label>
              <input class="input" id="addressCity" bind:value={selectedEmployee.address.city} />
            </div>

            <div class="column is-one-third">
              <label class="label" for="addressCounty">County</label>
              <input class="input" id="addressCounty" bind:value={selectedEmployee.address.county} />
            </div>

            <div class="column is-one-third">
              <label class="label" for="addressCountry">Country</label>
              <input class="input" id="addressCountry" bind:value={selectedEmployee.address.country} />
            </div>

          </div>

          <!-- Save / Cancel Controls -->
          <div class="mt-4">
            <button
              class="button is-success mr-2"
              on:click={async () => {
                const token = localStorage.getItem('token');

                const res = await fetch(
                  `http://localhost:5500/api/employees/${selectedEmployee._id}`,
                  {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(selectedEmployee),
                  }
                );

                if (res.ok) {
                  message = 'Employee updated successfully!';
                  selectedEmployee.editMode = false;
                  fetchEmployees();
                } else {
                  error = 'Failed to update employee.';
                }
              }}>
              Save Changes
            </button>

            <button
              class="button is-light"
              on:click={() => selectedEmployee.editMode = false}>
              Cancel
            </button>
          </div>

        {/if}
      </div>
    {/if}

  </div>
</section>