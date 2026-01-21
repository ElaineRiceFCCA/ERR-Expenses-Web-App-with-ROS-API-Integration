<script lang="ts">
  import WelcomeMenu from '$lib/components/WelcomeMenu.svelte';
</script>

<WelcomeMenu />

<section class="section">
  <div class="columns is-centered">
    <div class="column is-5 has-text-centered">
      <img src="/logo.png"
    alt="ERR Expenses Logo"
    width="444"
    height="444" />
    </div>
    <div class="column is-5 box has-text-centered">
      <h3 class="title">
        <p class="mb-5"><strong></strong> Log in to access your account</p>
      </h3>
      <div class="section">
        <p class="mb-5"><strong><a id="log in" href="/login">Log in</a>
      </div>
    </div>
  </div>
</section>
