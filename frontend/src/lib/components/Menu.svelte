<script lang="ts">
  export let className = '';

  import { page } from '$app/stores';
  import { derived } from 'svelte/store';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Brand from './Brand.svelte';
  import Navbar from './Navbar.svelte';

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
    goto('/');
  }
</script>

  {#if userEmail}
     <p class="mt-5 is-size-9 has-text-grey has-text-right" style="width: 98%;"><strong>Logged in user:</strong> {userEmail} </p>
  {/if}
<nav class={`navbar ${className}`} aria-label="main navigation">
  <div class="navbar-brand">
    <Brand />
    <Navbar />
  </div>
  <div class="navbar-menu" id="navMenu">
    <div class="navbar-end">
      <div class="navbar-item">
        <div class="buttons">
          {#each [
            { id: 'home', href: '/home', label: 'Home' },
            { id: 'dashboard', href: '/dashboard', label: 'Dashboard' },
            { id: 'trailsRidden', href: '/trailsRidden', label: 'Trails Ridden' },
            { id: 'charts', href: '/charts', label: 'Charts' },
            { id: 'map', href: '/map', label: 'Map' },
            { id: 'about', href: '/about', label: 'About' },
            { id: 'account', href: '/account', label: 'Accounts' },
            { id: 'API', href: 'https://mtbtrails-v2-backend.onrender.com/documentation', label: 'API Documentation', external: true }
          ] as link}
            <a
              id={link.id}
              class="button { $currentPath === link.href ? 'is-primary' : '' }"
              href={link.href}
              target={link.external ? "_blank" : null}
              rel={link.external ? "noopener noreferrer" : null}
            >
              {link.label}
            </a>
          {/each}

          <!-- Logout button -->
          <button class="button" on:click={logout}>Logout</button>
        </div>
      </div>
    </div>
  </div>
</nav>
