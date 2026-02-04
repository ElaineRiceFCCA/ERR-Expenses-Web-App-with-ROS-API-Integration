<script lang="ts">
  import Menu from '$lib/components/Menu.svelte';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let loading = false;
  let result: string | null = null;
  let error: string | null = null;
  let statusCode: number | null = null;

  onMount(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) goto('/login');
    if (role !== 'admin') goto('/processor');
  });

  async function runHandshake() {
    loading = true;
    result = null;
    error = null;
    statusCode = null;

    try {
      const token = localStorage.getItem('token');

      const res = await fetch('http://localhost:5000/api/revenue/handshake', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      statusCode = res.status;

      const data = await res.json();

      if (!res.ok) {
        error = data.error || 'Handshake failed';
      } else {
        result = data.response || 'Handshake successful';
      }
    } catch (err) {
      error = 'Network error contacting Revenue API';
    } finally {
      loading = false;
    }
  }
</script>

<Menu />

<section class="section admin-dashboard">
  <div class="container">
    <h1 class="title has-text-weight-semibold mb-4">
      Revenue Integration
    </h1>

    <div class="sdw-box">
      <p class="mb-4">
        This action tests the connection to Revenue ROS using the configured
        X.509 certificate and HTTP signature mechanism.
      </p>

      <button
        class="button sdw-button"
        disabled={loading}
        on:click={runHandshake}
      >
        {#if loading}
          Connecting to Revenue…
        {:else}
          Test Revenue Connection
        {/if}
      </button>

      {#if statusCode !== null}
        <p class="mt-4 has-text-grey">
          HTTP Status: <strong>{statusCode}</strong>
        </p>
      {/if}

      {#if result}
        <div class="notification is-success mt-4">
          <strong>Success</strong>
          <pre class="mt-2">{result}</pre>
        </div>
      {/if}

      {#if error}
        <div class="notification is-danger mt-4">
          <strong>Error</strong>
          <p>{error}</p>
        </div>
      {/if}
    </div>
  </div>
</section>
