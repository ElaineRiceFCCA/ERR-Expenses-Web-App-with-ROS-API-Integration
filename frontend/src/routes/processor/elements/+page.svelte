<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import Menu from "$lib/components/Menu.svelte";

  // ----------------------------------------------------
  // Component State
  // ----------------------------------------------------

  let elements: any[] = [];   // List of existing expense elements from backend

  // Form fields for new element creation
  let category = "";
  let subCategory = "";
  let description = "";
  let rate = "";

  // UI feedback state
  let message = "";
  let error = "";
  let loading = true;

  // ----------------------------------------------------
  // Revenue Travel and Subsistence Subcategories
  // ----------------------------------------------------
  // Defined explicitly to match Revenue ERR specification
  // Only applicable when category = TRAVEL_AND_SUBSISTENCE

  const travelSubCategories = [
    "EATING_ON_SITE",
    "EMERGENCY_TRAVEL",
    "SITE_BASED_EMPLOYEES",
    "SUBSISTENCE_UNVOUCHED",
    "SUBSISTENCE_VOUCHED",
    "TRAVEL_UNVOUCHED",
    "TRAVEL_VOUCHED",
  ];

  // ----------------------------------------------------
  // Fetch Elements
  // ----------------------------------------------------
  // Retrieves active expense elements from backend
  // Enforces authentication and role-based access control

  async function fetchElements() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // Enforce authentication
    if (!token) return goto("/login");

    // Restrict access to processor or admin roles
    if (role !== "processor" && role !== "admin") return goto("/admin");

    try {
      const res = await fetch("http://localhost:5500/api/elements", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        elements = await res.json();
      } else {
        error = "Failed to load elements.";
      }
    } catch {
      error = "Network error loading elements.";
    } finally {
      loading = false;
    }
  }

  // ----------------------------------------------------
  // Add New Element
  // ----------------------------------------------------
  // Sends new expense element definition to backend API
  // Handles conditional subCategory and rate conversion

  async function addElement() {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:5500/api/elements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category,
          // SubCategory only applies to Travel and Subsistence
          subCategory: category === "TRAVEL_AND_SUBSISTENCE" ? subCategory : null,
          description,
          // Convert rate string to number if provided
          rate: rate ? Number(rate) : undefined,
        }),
      });

      if (res.ok) {
        message = "Element added successfully!";

        // Reset form fields
        category = "";
        subCategory = "";
        description = "";
        rate = "";

        // Refresh element list
        fetchElements();
      } else {
        error = "Failed to add element.";
      }
    } catch {
      error = "Network error adding element.";
    }
  }

  // Load elements on component mount
  onMount(fetchElements);
</script>

<Menu />

<section class="section processor-dashboard">
  <div class="container">
    <h1 class="title has-text-weight-semibold mb-4">
      Expense Elements
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
         Add Element Form
         ---------------------------------------------------- -->
    <div class="sdw-box mb-5">
      <h2 class="subtitle has-text-weight-semibold mb-3">
        Add New Element
      </h2>

      <div class="columns is-multiline">

        <!-- Category Selector -->
        <div class="column is-half">
          <div class="field">
            <label class="label" for="category">Category</label>
            <div class="select is-fullwidth">
              <select id="category" bind:value={category} required>
                <option value="">Select Category</option>

                <!-- Revenue ERR Categories -->
                <option value="REMOTE_WORKING_DAILY_ALLOWANCE">
                  REMOTE_WORKING_DAILY_ALLOWANCE
                </option>

                <option value="SMALL_BENEFITS_EXEMPTION">
                  SMALL_BENEFITS_EXEMPTION
                </option>

                <option value="TRAVEL_AND_SUBSISTENCE">
                  TRAVEL_AND_SUBSISTENCE
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- SubCategory (Travel and Subsistence Only) -->
        {#if category === "TRAVEL_AND_SUBSISTENCE"}
          <div class="column is-half">
            <div class="field">
              <label class="label" for="subCategory">
                SubCategory
              </label>
              <div class="select is-fullwidth">
                <select
                  id="subCategory"
                  bind:value={subCategory}
                  required
                >
                  <option value="">Select SubCategory</option>

                  <!-- Dynamically render travel and subsistence subcategories -->
                  {#each travelSubCategories as sub}
                    <option value={sub}>{sub}</option>
                  {/each}
                </select>
              </div>
            </div>
          </div>
        {/if}

        <!-- Description Field -->
        <div class="column is-full">
          <div class="field">
            <label class="label" for="description">
              Description
            </label>
            <input
              class="input"
              id="description"
              type="text"
              bind:value={description}
              required
            />
          </div>
        </div>

        <!-- Rate (Only for Remote Working Allowance) -->
        {#if category === "REMOTE_WORKING_DAILY_ALLOWANCE"}
          <div class="column is-half">
            <div class="field">
              <label class="label" for="rate">
                Daily Rate (€)
              </label>
              <input
                class="input"
                id="rate"
                type="number"
                step="0.01"
                bind:value={rate}
              />
            </div>
          </div>
        {/if}

      </div>

      <!-- Submit Button -->
      <button class="button sdw-button mt-4" on:click={addElement}>
        Add Element
      </button>
    </div>

    <!-- ----------------------------------------------------
         Element List Table
         ---------------------------------------------------- -->
    <div class="sdw-box">
      <h2 class="subtitle has-text-weight-semibold mb-3">
        Active Elements
      </h2>

      {#if loading}
        <progress class="progress is-small is-primary" max="100"></progress>
      {:else}
        <table class="sdw-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>SubCategory</th>
              <th>Description</th>
              <th>Rate</th>
            </tr>
          </thead>
          <tbody>
            {#each elements as el}
              <tr>
                <td>{el.category}</td>
                <td>{el.subCategory ?? "-"}</td>
                <td>{el.description}</td>
                <td>{el.rate ?? "-"}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  </div>
</section>