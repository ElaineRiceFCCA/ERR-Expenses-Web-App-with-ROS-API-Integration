<script lang="ts">
  import { onMount } from 'svelte';

  onMount(() => {
    const burger = document.querySelector('.navbar-burger') as HTMLElement;
    const menu = document.getElementById(burger?.dataset.target || '') as HTMLElement;

    if (burger && menu) {
      burger.addEventListener('click', () => {
        burger.classList.toggle('is-active');
        menu.classList.toggle('is-active');
      });
    }
  });
</script>

<span
  class="navbar-burger has-background-info"
  data-target="navMenu"
  aria-expanded="false"
  aria-label="Toggle menu"
>
  <span aria-hidden="true"></span>
  <span aria-hidden="true"></span>
  <span aria-hidden="true"></span>
  <span aria-hidden="true"></span>
  <span aria-hidden="true"></span>
  <span aria-hidden="true"></span>
</span>
