<script lang="ts">
  import { page } from '$app/stores';
  import { derived } from 'svelte/store';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Brand from './Brand.svelte';
  import Navbar from './Navbar.svelte';

  export let className = '';

  const currentPath = derived(page, ($page) => $page.url.pathname as string);

  let userEmail: string | null = null;

  onMount(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userEmail = payload.email || 'Unknown';
      } catch {
        userEmail = 'Invalid token';
      }
    }
  });

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    goto('/login');
  }
</script>

<header class="sdw-navbar">
  <div class="sdw-navbar-content">
    <div class="sdw-brand">
      <Brand />
      <Navbar />
    </div>

    <nav class="sdw-nav-links">
      {#each [
        { id: 'home', href: '/home', label: 'Home' },
        { id: 'account', href: '/account', label: 'Accounts' }
      ] as link}
        <a
          id={link.id}
          class="sdw-nav-button { $currentPath === link.href ? 'is-active' : '' }"
          href={link.href}
        >
          {link.label}
        </a>
      {/each}

      <button class="sdw-logout" on:click={logout}>Logout</button>
    </nav>
  </div>

  {#if userEmail}
    <p class="sdw-user-label">
      Logged in: <strong>{userEmail}</strong>
    </p>
  {/if}
</header>