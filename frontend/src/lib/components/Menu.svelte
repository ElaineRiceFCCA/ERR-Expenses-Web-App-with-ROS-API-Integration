<script lang="ts">
  import { page } from '$app/stores';
  import { derived } from 'svelte/store';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Brand from './Brand.svelte';
  import Navbar from './Navbar.svelte';

  const currentPath = derived(page, ($page) => $page.url.pathname as string);

  let userName: string | null = null;
  let role: 'admin' | 'processor' | null = null;

  onMount(() => {
    userName = localStorage.getItem('user');
    role = localStorage.getItem('role') as 'admin' | 'processor';
  });

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    goto('/login');
  }

  // RBAC menu definitions
  const adminLinks = [
    { id: 'processing', href: '/admin/processing', label: 'Processing' },
    { id: 'config', href: '/admin/config', label: 'Config' },
    { id: 'reports', href: '/admin/reports', label: 'Reports' }
  ];

  const processorLinks = [
    { id: 'employees', href: '/processor/employees', label: 'Employees' },
    { id: 'elements', href: '/processor/elements', label: 'Elements' },
    { id: 'company', href: '/processor/company', label: 'Co. Details' },
    { id: 'submissions', href: '/processor/submissions', label: 'Submissions' },
    { id: 'reports', href: '/processor/reports', label: 'Reports' }
  ];
</script>

<header class="sdw-navbar">
  <div class="sdw-navbar-content">
    <div class="sdw-brand">
      <Brand />
      <Navbar />
    </div>

    <nav class="sdw-nav-links">
      <!-- ADMIN MENU -->
      {#if role === 'admin'}
        {#each adminLinks as link}
          <a
            id={link.id}
            href={link.href}
            class="sdw-nav-button { $currentPath.startsWith(link.href) ? 'is-active' : '' }"
          >
            {link.label}
          </a>
        {/each}
      {/if}

      <!-- PROCESSOR MENU -->
      {#if role === 'processor'}
        {#each processorLinks as link}
          <a
            id={link.id}
            href={link.href}
            class="sdw-nav-button { $currentPath.startsWith(link.href) ? 'is-active' : '' }"
          >
            {link.label}
          </a>
        {/each}
      {/if}

      <!-- LOGOUT -->
      <button class="button sdw-button" on:click={logout}>Logout</button>
    </nav>
  </div>

  {#if userName}
    <p class="sdw-user-label">
      <strong>Logged in:</strong> {userName}
    </p>
  {/if}
</header>
