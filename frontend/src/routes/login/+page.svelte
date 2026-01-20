<script lang="ts">
  import { goto } from '$app/navigation';
  import { login as authLogin, logout } from '$lib/auth';
  import WelcomeMenu from '$lib/components/WelcomeMenu.svelte';
  import Brand from '$lib/components/Brand.svelte';
  import Navbar from '$lib/components/Navbar.svelte';

  let email = '';
  let password = '';
  let error = '';

  // Handles login via backend (using $lib/auth.ts)
  async function handleLogin() {
    error = '';

    try {
      const result = await authLogin(email, password);

      if (!result) {
        error = 'Login failed: Invalid email or password';
        return;
      }

      // Redirect based on stored role
      const role = localStorage.getItem('role');
      if (role === 'admin') {
        goto('/admin');
      } else {
        goto('/processor');
      }
    } catch (err) {
      error = 'Login failed: Network error';
      console.error(err);
    }
  }

  // Optional: Logout function (clear stored credentials)
  export function handleLogout() {
    logout();
    goto('/login');
  }
</script>

<WelcomeMenu />

<section class="section">
  <div class="container">
    <h1 class="title">Log In</h1>

    {#if error}
      <div class="notification is-danger">{error}</div>
    {/if}

    <form on:submit|preventDefault={handleLogin}>
      <div class="field">
        <label class="label" for="email">Email</label>
        <div class="control">
          <input
            id="email"
            class="input"
            type="email"
            placeholder="you@example.com"
            bind:value={email}
            required
          />
        </div>
      </div>

      <div class="field">
        <label class="label" for="password">Password</label>
        <div class="control">
          <input
            id="password"
            class="input"
            type="password"
            placeholder="••••••••"
            bind:value={password}
            required
          />
        </div>
      </div>

      <div class="field">
        <div class="control">
          <button class="button is-primary" type="submit">Log In</button>
        </div>
      </div>
    </form>
  </div>
</section>
