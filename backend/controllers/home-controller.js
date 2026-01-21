export const homeController = {
  index: {
    handler: async function (request, h) {
      const viewData = {
        title: "ERR Expenses App",
      };
      console.log("logged in, home page rendering");
      return h.view("home-view", viewData);
    },
  },
};
