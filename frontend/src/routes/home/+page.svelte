<script lang="ts">
  import { redirect } from '@sveltejs/kit';

export const load = () => {
	throw redirect(
		302,
		'https://www.sdworx.ie/en-ie/solutions/payroll-reward/payroll-services/outsourced-payroll-services'
	);
};

</script>

<section class="hero is-fullheight-with-navbar landing-hero">
  <div class="hero-body">
    <div class="container">
      <div class="columns is-centered">
        <div class="column is-10-tablet is-7-desktop is-6-widescreen">
          <!-- ONE main card -->
          <div class="box landing-card">
            <div class="has-text-centered mb-5">
              <img class="landing-logo" src="/sd-worx-logo.png" alt="SD Worx Expenses" />
            </div>

            <div class="has-text-centered mb-4">
              <h1 class="title is-3">Expense Management System</h1>
              <p>Manage and submit ERR Expenses efficiently with our secure web application.</p>
              <br />
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
                  <p class="feature-text">Built to establish a secure communication with ROS.</p>
                </div>
              </div>
            </div>

            <hr />

            <div class="level is-mobile">
              <div class="level-left">
                <p class="has-text-grey is-size-7">© SD Worx</p>

              </div>
              <div class="level-right">
                <a class="is-size-7" href="https://www.sdworx.ie/en-ie/solutions/payroll-reward/payroll-services/outsourced-payroll-services"target="_blank"
  rel="noopener noreferrer">About</a>
              </div>
            </div>
          </div>
          <!-- /main card -->
        </div>
      </div>
    </div>
  </div>
</section>