<script lang="ts">
  import { goto } from '$app/navigation';
  import { login as authLogin, logout } from '$lib/auth';

  let email = '';
  let password = '';
  let error = '';

  async function handleLogin() {
    error = '';

    try {
      const result = await authLogin(email, password);

      if (!result) {
        error = 'Login failed: Invalid email or password';
        return;
      }

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
          <!-- One main card -->
          <div class="box landing-card">
            <div class="has-text-centered mb-5">
              <img class="landing-logo" src="/sd-worx-logo.png" alt="SD Worx Expenses" />

            </div>

            <h1 class="title has-text-centered mb-4">Log in</h1>

            {#if error}
              <div class="notification is-danger is-light">
                {error}
              </div>
            {/if}

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

            <div class="level is-mobile">
              <div class="level-left">
                <p class="has-text-grey is-size-7">© SD Worx</p>
              </div>
              <div class="level-right">
                <a class="is-size-7" href="/home">Back to home</a>
              </div>
            </div>
          </div>
          <!-- /card -->
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .landing-hero {
  background: linear-gradient(
    135deg,
    rgba(0, 58, 143, 0.08),
    rgba(0, 177, 64, 0.08)
  );
}

.landing-card {
  border-radius: 16px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
  padding: 2.5rem;
}

.landing-logo {
  width: min(280px, 70vw);
  height: auto;
  object-fit: contain;
}

/* SD Worx button */
.sdw-button {
  background-color: #003a8f;
  color: #ffffff;
  border: none;
}

.sdw-button:hover {
  background-color: #002f73;
  color: #ffffff;
}

</style>
