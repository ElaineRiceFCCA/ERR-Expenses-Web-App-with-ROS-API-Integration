<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Menu from '$lib/components/Menu.svelte';

  // Component state
  let users: any[] = [];
  let loading = true;
  let error = '';

  // Fetch all users (admin-only endpoint)
  async function fetchUsers() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // Enforce authentication + RBAC
    if (!token) return goto('/login');
    if (role !== 'admin') return goto('/processor');

    try {
      const res = await fetch('http://localhost:5500/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        users = await res.json();
      } else {
        error = 'Failed to load user list.';
      }
    } catch (err) {
      error = 'Network error fetching users.';
      console.error(err);
    } finally {
      loading = false;
    }
  }

  // Trigger data load on page mount
  onMount(fetchUsers);
</script>

<!-- Global navigation -->
<Menu />

<section class="section admin-dashboard">
  <div class="container">
    <h1 class="title has-text-weight-semibold mb-2">User Management</h1>

    {#if loading}
    <!-- Loading indicator -->
      <progress class="progress is-small is-primary" max="100">Loading...</progress>
    {:else if error}
    <!-- Error display -->
      <div class="notification is-danger">{error}</div>
    {:else}
    <!-- User management table -->
      <div class="sdw-box">
        <div class="level mb-4">
          <div class="level-left">
            <p class="has-text-weight-semibold is-size-5">User Accounts</p>
          </div>
          <div class="level-right">
          <!-- Placeholder for future create-user feature -->
            <button class="button sdw-button" on:click={() => alert('Add user feature coming soon')}>
              + Add User
            </button>
          </div>
        </div>

        <table class="sdw-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each users as user}
              <tr>
                <td>{user.name}</td>
                <td>{user.email}</td>

                <!-- Role badge -->
                <td>
                  <span
                    class="tag is-rounded"
                    class:is-success={user.role === 'admin'}
                    class:is-info={user.role === 'processor'}
                  >
                    {user.role}
                  </span>
                </td>

                <!-- Active/Inactive indicator -->
                <td>
                  <span
                    class="tag is-rounded"
                    class:is-success={user.active !== false}
                    class:is-danger={user.active === false}
                  >
                    {user.active === false ? 'Inactive' : 'Active'}
                  </span>
                </td>

                <!-- Placeholder action buttons -->
                <td>
                  <div class="buttons are-small">
                    <button
                      class="button is-info is-light"
                      on:click={() => alert('Reset password')}
                    >
                      Reset
                    </button>
                    <button
                      class="button is-warning is-light"
                      on:click={() => alert('Deactivate/Activate user')}
                    >
                      {user.active === false ? 'Activate' : 'Deactivate'}
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</section>
