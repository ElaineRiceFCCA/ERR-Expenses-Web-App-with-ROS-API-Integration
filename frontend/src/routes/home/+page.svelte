<script lang="ts">
</script>

<section class="hero is-fullheight-with-navbar landing-hero">
  <div class="hero-body">
    <div class="container">
      <div class="columns is-centered">
        <div class="column is-10-tablet is-7-desktop is-6-widescreen">
          <!-- ONE main card -->
          <div class="box landing-card">
            <div class="has-text-centered mb-">
              <img class="landing-logo" src="/sd-worx-logo.png" alt="SD Worx Expenses" />
            </div>

            <!-- Login button INSIDE the card -->
            <div class="has-text-centered mb-5">
              <a class="button sdw-button is-medium" href="/login">Log in</a>
            </div>

            <div class="columns is-multiline is-mobile">
              <div class="column is-6">
                <div class="feature">
                  <p class="feature-title">Fast entry</p>
                  <p class="feature-text">Add expenses in seconds with clean forms.</p>
                </div>
              </div>

              <div class="column is-6">
                <div class="feature">
                  <p class="feature-title">Totals & summaries</p>
                  <p class="feature-text">See category totals and recent activity.</p>
                </div>
              </div>

              <div class="column is-6">
                <div class="feature">
                  <p class="feature-title">Secure access</p>
                  <p class="feature-text">Authentication required for all data views.</p>
                </div>
              </div>

              <div class="column is-6">
                <div class="feature">
                  <p class="feature-title">ROS API integration</p>
                  <p class="feature-text">Built to connect with your backend services.</p>
                </div>
              </div>
            </div>

            <hr />

            <div class="level is-mobile">
              <div class="level-left">
                <p class="has-text-grey is-size-7">© SD Worx</p>

              </div>
              <div class="level-right">
                <a class="is-size-7" href="/about">About</a>
              </div>
            </div>
          </div>
          <!-- /main card -->
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
  padding: 2rem;
}

.landing-logo {
  width: min(420px, 80vw);
  height: auto;
  object-fit: contain;
}

.feature {
  padding: 0.75rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.75);
  height: 100%;
}

.feature-title {
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: #003a8f;
}

.feature-text {
  color: #4a4a4a;
  font-size: 0.95rem;
  margin-bottom: 0;
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
