import { homeController } from "./controllers/home-controller.js";

// Defines server-rendered web routes (Hapi)
// Used for legacy MVC views alongside the REST API
export const webRoutes = [
  {
    method: "GET",
    path: "/home",
    config: homeController.index, // Maps route to controller handler
  },
];
