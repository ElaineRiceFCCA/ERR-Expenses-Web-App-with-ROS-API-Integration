<script lang="ts">
  import { page } from '$app/stores';
  import { derived } from 'svelte/store';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Brand from './Brand.svelte';
  import Navbar from './Navbar.svelte';

  // Reactive store: current route path
  const currentPath = derived(page, ($page) => $page.url.pathname);

  // Local session state (loaded from localStorage)
  let userName: string | null = null;
  let role: 'admin' | 'processor' | null = null;

  // Load user context on client mount
  onMount(() => {
    userName = localStorage.getItem('user');
    role = localStorage.getItem('role') as 'admin' | 'processor';
  });

  // Clears session and redirects to login
  function logout() {
    localStorage.clear();
    goto('/login');
  }

  // Navigation configuration: Admin role
  const adminLinks = [
    { id: 'processing', href: '/processor', label: 'Processing' },
    { id: 'revenue', href: '/admin/revenue', label: 'Revenue' },
    { id: 'reports', href: '/admin/reports', label: 'Reports' }
  ];

  // Navigation configuration: Processor role
  const processorLinks = [
    { id: 'employees', href: '/processor/employees', label: 'Employees' },
    { id: 'elements', href: '/processor/elements', label: 'Elements' },
    { id: 'company', href: '/processor/company', label: 'Co. Details' },
    { id: 'submissions', href: '/processor/submissions', label: 'Submissions' },
    { id: 'reports', href: '/processor/reports', label: 'Reports' }
  ];

  $: isProcessorRoute = $currentPath.startsWith('/processor');
</script>

<header class="sdw-navbar">
  <div class="sdw-navbar-content">
    <div class="sdw-brand">
      <Brand />
      <Navbar />
    </div>

    <nav class="sdw-nav-links">

      <!-- Admin navigation (only when not inside processor route) -->
      {#if role === 'admin' && !isProcessorRoute}
        {#each adminLinks as link}
          <a
            href={link.href}
            class="sdw-nav-button { $currentPath.startsWith(link.href) ? 'is-active' : '' }"
          >
            {link.label}
          </a>
        {/each}
      {/if}

      <!-- Processor navigation (processor OR admin acting as processor) -->
      {#if isProcessorRoute && (role === 'processor' || role === 'admin')}
        {#each processorLinks as link}
          <a
            href={link.href}
            class="sdw-nav-button { $currentPath.startsWith(link.href) ? 'is-active' : '' }"
          >
            {link.label}
          </a>
        {/each}

        <!-- Admin shortcut when inside processor area -->
        {#if role === 'admin'}
          <a href="/admin" class="sdw-nav-button is-admin">
            Admin
          </a>
        {/if}
      {/if}

      <!-- Logout control -->
      <button class="button sdw-button" on:click={logout}>Logout</button>
    </nav>
  </div>

  <!-- Display current logged-in user -->
  {#if userName}
    <p class="sdw-user-label">
      <strong>Logged in:</strong> {userName}
    </p>
  {/if}
</header>
