<script lang="ts">
  import Brand from './Brand.svelte';
  import Navbar from './Navbar.svelte';
  import { page } from '$app/stores';
  // Public navigation bar used on unauthenticated pages
  // Highlights active route (e.g. login)
</script>

<nav class="navbar mb-6" aria-label="main navigation">
  <div class="navbar-brand">
  <!-- Application branding -->
    <Brand />

    <!-- Responsive burger control -->
    <Navbar />
  </div>

  <!-- Static open menu (public view) -->
  <div class="navbar-menu is-active" id="navMenu">
    <div class="navbar-end">
      <div class="navbar-item">
        <div class="buttons">
        <!-- Login link (active state based on current route) -->
          <a href="/login" class="button" class:is-primary={$page.url.pathname === '/login'}>Log in</a>
        </div>
      </div>
    </div>
  </div>
</nav>