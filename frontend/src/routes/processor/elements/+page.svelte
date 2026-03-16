<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import Menu from "$lib/components/Menu.svelte";

  // ======================================================
  // COMPONENT PURPOSE
  // ======================================================
  // This page allows authorised users (processor/admin)
  // to manage Expense Elements
  //
  // Elements represent Revenue-defined ERR categories
  // such as:
  //   - REMOTE_WORKING_DAILY_ALLOWANCE
  //   - SMALL_BENEFITS_EXEMPTION
  //   - TRAVEL_AND_SUBSISTENCE
  //
  // These definitions are later referenced by Claims
  // ======================================================


  // ----------------------------------------------------
  // COMPONENT STATE
  // ----------------------------------------------------

  let elements: any[] = [];   
  // Active expense element records retrieved from backend


  // ----------------------------------------------------
  // FORM STATE (New Element Creation)
  // ----------------------------------------------------

  let category = "";
  let subCategory = "";
  let description = "";
  let rate = "";
  // Controlled inputs for element creation form


  // ----------------------------------------------------
  // UI STATE
  // ----------------------------------------------------

  let message = "";
  let error = "";
  let loading = true;
  // Controls user feedback and loading indicator


  // ----------------------------------------------------
  // REVENUE TRAVEL & SUBSISTENCE SUBCATEGORIES
  // ----------------------------------------------------
  // Explicit list matching Revenue ERR specification
  // Only applicable when:
  //   category === "TRAVEL_AND_SUBSISTENCE"
  //
  // Keeps frontend aligned with statutory definitions

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
  // FETCH ELEMENTS
  // ----------------------------------------------------
  // Retrieves active expense elements from backend
  // Enforces:
  //   - Authentication (JWT required)
  //   - Role-based access control
  //
  // Populates the elements array used for:
  //   - Display table
  //   - Claim reference selection
  // ----------------------------------------------------

  async function fetchElements() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // Redirect if unauthenticated
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
  // ADD NEW ELEMENT
  // ----------------------------------------------------
  // Sends new expense element definition to backend
  //
  // Business Rules:
  //   - subCategory only valid for Travel & Subsistence
  //   - rate only relevant for Remote Working Allowance
  //   - rate converted from string to numeric value
  //
  // After successful creation:
  //   - Form fields reset
  //   - Elements list refreshed
  // ----------------------------------------------------

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
          subCategory: category === "TRAVEL_AND_SUBSISTENCE" ? subCategory : null,
          description,
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

        // Refresh list
        fetchElements();
      } else {
        error = "Failed to add element.";
      }
    } catch {
      error = "Network error adding element.";
    }
  }


  // ----------------------------------------------------
  // INITIAL PAGE LOAD
  // ----------------------------------------------------
  // Fetch element definitions when component mounts
  // ----------------------------------------------------

  onMount(fetchElements);
</script>


<Menu />

<section class="section processor-dashboard">
  <div class="container">
    <h1 class="title has-text-weight-semibold mb-4">
      Expense Elements
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
         ADD ELEMENT FORM
    ====================================================== -->

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

                <!-- Revenue ERR Primary Categories -->
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

        <!-- Travel & Subsistence SubCategory -->
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

        <!-- Remote Working Rate -->
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


    <!-- ======================================================
         ELEMENT LIST TABLE
    ====================================================== -->
    <!-- Displays editable list of existing element definitions -->

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

              <!-- Click row to enable inline edit mode -->
              <tr
                on:click={() => el.editMode = true}
                style="cursor:pointer"
              >
                <td>{el.category}</td>
                <td>{el.subCategory ?? "-"}</td>
                <td>{el.description}</td>
                <td>{el.rate ?? "-"}</td>
              </tr>

              <!-- Inline Edit Row -->
              {#if el.editMode}
                <tr>
                  <td colspan="4">

                    <div class="columns is-multiline">

                      <!-- Category Edit -->
                      <div class="column is-half">
                        <label class="label" for="category">Category</label>
                        <div class="select is-fullwidth">
                          <select id="category" bind:value={el.category}>
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

                      <!-- Conditional SubCategory Edit -->
                      {#if el.category === "TRAVEL_AND_SUBSISTENCE"}
                        <div class="column is-half">
                          <label class="label" for="subCategory">SubCategory</label>
                          <div class="select is-fullwidth">
                            <select id="subCategory" bind:value={el.subCategory}>
                              {#each travelSubCategories as sub}
                                <option value={sub}>{sub}</option>
                              {/each}
                            </select>
                          </div>
                        </div>
                      {/if}

                      <!-- Description Edit -->
                      <div class="column is-full">
                        <label class="label" for="description">Description</label>
                        <input class="input" id="description" bind:value={el.description} />
                      </div>

                      <!-- Conditional Rate Edit -->
                      {#if el.category === "REMOTE_WORKING_DAILY_ALLOWANCE"}
                        <div class="column is-half">
                          <label class="label" for="rate">Rate</label>
                          <input
                            class="input"
                            id="rate"
                            type="number"
                            step="0.01"
                            bind:value={el.rate}
                          />
                        </div>
                      {/if}

                    </div>

                    <!-- Save / Cancel Buttons -->
                    <div class="mt-3">
                      <button
                        class="button is-success mr-2"
                        on:click={async () => {
                          const token = localStorage.getItem("token");

                          const res = await fetch(
                            `http://localhost:5500/api/elements/${el._id}`,
                            {
                              method: "PUT",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify(el),
                            }
                          );

                          if (res.ok) {
                            message = "Element updated successfully!";
                            el.editMode = false;
                            fetchElements();
                          } else {
                            error = "Failed to update element.";
                          }
                        }}
                      >
                        Save Changes
                      </button>

                      <button
                        class="button is-light"
                        on:click={() => el.editMode = false}
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