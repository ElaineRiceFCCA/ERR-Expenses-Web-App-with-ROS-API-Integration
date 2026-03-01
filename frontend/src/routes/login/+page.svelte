<script lang="ts">
  import { goto } from '$app/navigation';
  import { login as authLogin, logout } from '$lib/auth';

  // Form state
  let email = '';
  let password = '';
  let error = '';

  // Handles authentication flow
  async function handleLogin() {
    error = '';

    try {
      const result = await authLogin(email, password);

      // Invalid credentials
      if (!result) {
        error = 'Login failed: Invalid email or password';
        return;
      }

      // Role-based redirection
      const role = localStorage.getItem('role');
      if (role === 'admin') {
        goto('/admin');
      } else {
        goto('/processor');
      }
    } catch (err) {
      error = 'Login failed: Network error';
      console.error(err);
    }
  }

  // Clears session and redirects to login
  export function handleLogout() {
    logout();
    goto('/login');
  }
</script>

<section class="hero is-fullheight-with-navbar landing-hero">
  <div class="hero-body">
    <div class="container">
      <div class="columns is-centered">
        <div class="column is-10-tablet is-6-desktop is-5-widescreen">
          
          <!-- Authentication card -->
          <div class="box landing-card">

            <!-- Branding -->
            <div class="has-text-centered mb-5">
              <img class="landing-logo" src="/sd-worx-logo.png" alt="SD Worx Expenses" />

            </div>

            <h1 class="title has-text-centered mb-4">Log in</h1>

             <!-- Error display -->
            {#if error}
              <div class="notification is-danger is-light">
                {error}
              </div>
            {/if}

            <!-- Login form -->
            <form on:submit|preventDefault={handleLogin}>
              <div class="field">
                <label class="label" for="email">Email</label>
                <div class="control">
                  <input
                    id="email"
                    class="input"
                    type="email"
                    placeholder="you@example.com"
                    bind:value={email}
                    required
                  />
                </div>
              </div>

              <div class="field">
                <label class="label" for="password">Password</label>
                <div class="control">
                  <input
                    id="password"
                    class="input"
                    type="password"
                    placeholder="••••••••"
                    bind:value={password}
                    required
                  />
                </div>
              </div>

              <div class="field mt-5">
                <div class="control has-text-centered">
                  <button class="button sdw-button is-medium is-fullwidth" type="submit">
                    Log in
                  </button>
                </div>
              </div>
            </form>

            <hr />

             <!-- Footer -->
            <div class="level is-mobile">
              <div class="level-left">
                <p class="has-text-grey is-size-7">© SD Worx</p>
              </div>
              <div class="level-right">
                <a class="is-size-7" href="/home">Back to home</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>