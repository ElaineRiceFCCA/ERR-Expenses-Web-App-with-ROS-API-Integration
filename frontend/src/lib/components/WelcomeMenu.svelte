<script lang="ts">
  import Brand from './Brand.svelte';
  import Navbar from './Navbar.svelte';
  import { page } from '$app/stores';
</script>

<nav class="navbar mb-6" aria-label="main navigation">
  <div class="navbar-brand">
    <Brand />
    <Navbar />
  </div>

  <div class="navbar-menu is-active" id="navMenu">
    <div class="navbar-end">
      <div class="navbar-item">
        <div class="buttons">
          <!-- <a href="/" class="button" class:is-primary={$page.url.pathname === '/'}>Home</a> -->
          <a href="/login" class="button" class:is-primary={$page.url.pathname === '/login'}>Log in</a>
          <!-- <a href="/signup" class="button" class:is-primary={$page.url.pathname === '/signup'}>Sign up</a> -->
        </div>
      </div>
    </div>
  </div>
</nav>