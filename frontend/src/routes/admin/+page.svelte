<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Menu from '$lib/components/Menu.svelte';

  let users: any[] = [];
  let loading = true;
  let error = '';

  async function fetchUsers() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) return goto('/login');
    if (role !== 'admin') return goto('/processor');

    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
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

  onMount(fetchUsers);
</script>

<Menu />

<section class="section admin-dashboard">
  <div class="container">
    <h1 class="title has-text-weight-semibold mb-2">User Management</h1>

    {#if loading}
      <progress class="progress is-small is-primary" max="100">Loading...</progress>
    {:else if error}
      <div class="notification is-danger">{error}</div>
    {:else}
      <div class="sdw-box">
        <div class="level mb-4">
          <div class="level-left">
            <p class="has-text-weight-semibold is-size-5">User Accounts</p>
          </div>
          <div class="level-right">
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
                <td>
                  <span
                    class="tag is-rounded"
                    class:is-success={user.role === 'admin'}
                    class:is-info={user.role === 'processor'}
                  >
                    {user.role}
                  </span>
                </td>
                <td>
                  <span
                    class="tag is-rounded"
                    class:is-success={user.active !== false}
                    class:is-danger={user.active === false}
                  >
                    {user.active === false ? 'Inactive' : 'Active'}
                  </span>
                </td>
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
