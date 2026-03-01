<script lang="ts">
  import Menu from '$lib/components/Menu.svelte';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  // UI state
  let loading = false;
  let result: string | null = null;
  let error: string | null = null;
  let statusCode: number | null = null;

  // Signing service runs on another port
  const SIGNING_BASE = 'http://localhost:5086'; // .NET signing microservice
  const NODE_BASE = 'http://localhost:5500'; // Node backend API

  // Enforce admin-only access on mount
  onMount(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) goto('/login');
    if (role !== 'admin') goto('/processor');
  });

  // Resets UI state before executing request
  function resetState() {
    loading = true;
    result = null;
    error = null;
    statusCode = null;
  }

  // Standardised response handler for all requests
  async function handleResponse(res: Response) {
    statusCode = res.status;

    let data;
    try {
      data = await res.json();
    } catch {
      data = await res.text();
    }

    if (!res.ok) {
      error = data?.error || data || 'Request failed';
    } else {
      result =
        typeof data === 'string'
          ? data
          : JSON.stringify(data, null, 2);
    }

    loading = false;
  }

  // ----------------------------------------------------
  // Revenue handshake (via Node backend)
  // ----------------------------------------------------
  async function runHandshake() {
    resetState();

    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${NODE_BASE}/api/revenue/handshake`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      await handleResponse(res);
    } catch {
      error = 'Network error contacting backend';
      loading = false;
    }
  }

  // ----------------------------------------------------
  // Signing service health endpoint
  // ----------------------------------------------------
  async function checkHealth() {
    resetState();

    try {
      const res = await fetch(`${SIGNING_BASE}/health`);
      await handleResponse(res);
    } catch {
      error = 'Cannot reach signing service';
      loading = false;
    }
  }

  // ----------------------------------------------------
  // Retrieve certificate metadata from signing service
  // ----------------------------------------------------
  async function getCertInfo() {
    resetState();

    try {
      const res = await fetch(`${SIGNING_BASE}/cert-info`);
      await handleResponse(res);
    } catch {
      error = 'Cannot retrieve certificate info';
      loading = false;
    }
  }

  // ----------------------------------------------------
  // Test raw signing functionality
  // ----------------------------------------------------
  async function signTestData() {
    resetState();

    try {
      const res = await fetch(`${SIGNING_BASE}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: 'TEST-DATA-FOR-SIGNING'
      });

      await handleResponse(res);
    } catch {
      error = 'Signing request failed';
      loading = false;
    }
  }
</script>

<!-- Global navigation -->
<Menu />

<section class="section admin-dashboard">
  <div class="container">
    <h1 class="title has-text-weight-semibold mb-4">
      Revenue Integration
    </h1>

    <div class="sdw-box">

      <p class="mb-4">
        Test Revenue signing service and backend integration.
      </p>

      <!-- Action buttons -->
      <div class="buttons mb-4">

        <button
          class="button is-link sdw-button"
          disabled={loading}
          on:click={runHandshake}
        >
          Handshake
        </button>

        <button
          class="button is-info sdw-button"
          disabled={loading}
          on:click={checkHealth}
        >
          Health Check
        </button>

        <button
          class="button is-warning sdw-button"
          disabled={loading}
          on:click={getCertInfo}
        >
          Certificate Info
        </button>

        <button
          class="button is-primary sdw-button"
          disabled={loading}
          on:click={signTestData}
        >
          Sign Test Data
        </button>

      </div>

      <!-- Status display -->
      {#if loading}
        <p class="has-text-grey">Processing request...</p>
      {/if}

      {#if statusCode !== null}
        <p class="mt-2 has-text-grey">
          HTTP Status: <strong>{statusCode}</strong>
        </p>
      {/if}

      <!-- Success output -->
      {#if result}
        <div class="notification is-success mt-4">
          <strong>Response</strong>
          <pre class="mt-2">{result}</pre>
        </div>
      {/if}

      <!-- Error output -->
      {#if error}
        <div class="notification is-danger mt-4">
          <strong>Error</strong>
          <p>{error}</p>
        </div>
      {/if}

    </div>
  </div>
</section>