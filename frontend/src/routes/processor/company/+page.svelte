<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import Menu from "$lib/components/Menu.svelte";

  // ----------------------------------------------------
  // Component State
  // ----------------------------------------------------

  let company: any = null;   // Existing company configuration (if present)
  let message = "";          // Success notification
  let error = "";            // Error notification
  let loading = true;        // Loading state for initial fetch

  // ----------------------------------------------------
  // Company Configuration Form Fields
  // ----------------------------------------------------
  // These values define the core employer and ROS
  // integration configuration used during ERR submission

  let employerRegistrationNumber = "";
  let payrollReference = "";
  let taxYear = "";
  let softwareUsed = "ERRExpenseManagementSystem"; // Default system identifier
  let softwareVersion = "0.01.0.0001";              // Default software version
  let rosCertPath = "";
  let rosCertPassword = "";
  let agentTain = "";

  // ----------------------------------------------------
  // Fetch Existing Company Configuration
  // ----------------------------------------------------
  // Retrieves stored configuration from backend and
  // populates the form fields accordingly

  async function fetchCompany() {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:5500/api/company", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        company = await res.json();

        // Populate form fields from retrieved configuration
        employerRegistrationNumber = company.employerRegistrationNumber;
        payrollReference = company.payrollReference;
        taxYear = company.taxYear;
        softwareUsed = company.softwareUsed;
        softwareVersion = company.softwareVersion;
        rosCertPath = company.rosCertPath;
        rosCertPassword = company.rosCertPassword;
        agentTain = company.agentTain || "";
      }
    } catch {
      error = "Failed to load company configuration.";
    } finally {
      loading = false;
    }
  }

  // ----------------------------------------------------
  // Save Company Configuration
  // ----------------------------------------------------
  // Creates or updates employer configuration in backend
  // If a company record exists, perform PUT (update)
  // Otherwise, perform POST (create)

  async function saveCompany() {
    const token = localStorage.getItem("token");

    // Prepare payload object for API submission
    const payload = {
      employerRegistrationNumber,
      payrollReference,
      taxYear: Number(taxYear),  // Ensure numeric conversion
      softwareUsed,
      softwareVersion,
      rosCertPath,
      rosCertPassword,
      agentTain,
      active: true,
    };

    try {
      const res = await fetch(
        company
          ? `http://localhost:5500/api/company/${company._id}` // Update
          : "http://localhost:5500/api/company",               // Create
        {
          method: company ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        message = "Company configuration saved successfully.";

        // Refresh configuration from backend to ensure consistency
        fetchCompany();
      } else {
        error = "Failed to save company configuration.";
      }
    } catch {
      error = "Network error saving company.";
    }
  }

  // Load company configuration when page mounts
  onMount(fetchCompany);
</script>

<Menu />

<section class="section processor-dashboard">
  <div class="container">
    <h1 class="title has-text-weight-semibold mb-4">
      Company Configuration
    </h1>

    <!-- Error Notification -->
    {#if error}
      <div class="notification is-danger">{error}</div>
    {/if}

    <!-- Success Notification -->
    {#if message}
      <div class="notification is-success">{message}</div>
    {/if}

    <!-- ----------------------------------------------------
         Company Configuration Form
         ---------------------------------------------------- -->
    <div class="sdw-box">
      <div class="columns is-multiline">

        <!-- Employer Registration Number -->
        <div class="column is-half">
          <div class="field">
            <label class="label" for="employerRegistrationNumber">
              Employer Registration Number
            </label>
            <input
              class="input"
              id="employerRegistrationNumber"
              bind:value={employerRegistrationNumber}
              required
            />
          </div>
        </div>

        <!-- Payroll Reference -->
        <div class="column is-half">
          <div class="field">
            <label class="label" for="payrollReference">
              Payroll Reference
            </label>
            <input
              class="input"
              id="payrollReference"
              bind:value={payrollReference}
              required
            />
          </div>
        </div>

        <!-- Tax Year -->
        <div class="column is-half">
          <div class="field">
            <label class="label" for="taxYear">Tax Year</label>
            <input
              class="input"
              type="number"
              id="taxYear"
              bind:value={taxYear}
              required
            />
          </div>
        </div>

        <!-- Agent TAIN (optional) -->
        <div class="column is-half">
          <div class="field">
            <label class="label" for="agentTain">Agent TAIN</label>
            <input
              class="input"
              id="agentTain"
              bind:value={agentTain}
            />
          </div>
        </div>

        <!-- ROS Certificate Path -->
        <div class="column is-full">
          <div class="field">
            <label class="label" for="rosCertPath">
              ROS Certificate Path
            </label>
            <input
              class="input"
              id="rosCertPath"
              bind:value={rosCertPath}
              required
            />
          </div>
        </div>

        <!-- ROS Certificate Password -->
        <div class="column is-full">
          <div class="field">
            <label class="label" for="rosCertPassword">
              ROS Certificate Password
            </label>
            <input
              class="input"
              type="password"
              id="rosCertPassword"
              bind:value={rosCertPassword}
              required
            />
          </div>
        </div>

      </div>

      <!-- Submit Button -->
      <button class="button sdw-button mt-4" on:click={saveCompany}>
        {company ? "Update Company" : "Create Company"}
      </button>
    </div>
  </div>
</section>