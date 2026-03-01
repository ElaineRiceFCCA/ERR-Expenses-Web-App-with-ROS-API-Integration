export const homeController = {
  index: {
    // Renders the default home view
    // Uses server-side templating
    handler: async function (request, h) {
      const viewData = {
        title: "ERR Expenses App", // Passed to template
      };

      // Basic request trace logging
      console.log("logged in, home page rendering");

      // Render Handlebars view
      return h.view("home-view", viewData);
    },
  },
};
