<script lang="ts">
  import { onMount } from 'svelte';

  // Enables responsive burger toggle (Bulma navbar pattern)
  // Adds click listener after component mounts (client-side only)
  onMount(() => {
    const burger = document.querySelector('.navbar-burger') as HTMLElement;
    const menu = document.getElementById(burger?.dataset.target || '') as HTMLElement;

    if (burger && menu) {
      burger.addEventListener('click', () => {
        // Toggle Bulma active classes
        burger.classList.toggle('is-active');
        menu.classList.toggle('is-active');
      });
    }
  });
</script>

<!-- Bulma burger control for mobile navigation -->
<span
  class="navbar-burger has-background-info"
  data-target="navMenu"
  aria-expanded="false"
  aria-label="Toggle menu"
>
<!-- Decorative lines for burger icon -->
  <span aria-hidden="true"></span>
  <span aria-hidden="true"></span>
  <span aria-hidden="true"></span>
  <span aria-hidden="true"></span>
  <span aria-hidden="true"></span>
  <span aria-hidden="true"></span>
</span>
