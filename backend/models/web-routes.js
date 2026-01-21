// import { aboutController } from "./controllers/about-controller.js";
// import { accountsController } from "./controllers/accounts-controller.js";
// import { dashboardController } from "./controllers/dashboard-controller.js";
// import { locationController } from "./controllers/location-controller.js";
import { homeController } from "./controllers/home-controller.js";

export const webRoutes = [
  { method: "GET", path: "/", config: accountsController.index },
  { method: "GET", path: "/signup", config: accountsController.showSignup },
  { method: "GET", path: "/login", config: accountsController.showLogin },
  { method: "GET", path: "/logout", config: accountsController.logout },
  { method: "POST", path: "/register", config: accountsController.signup },
  {
    method: "POST",
    path: "/authenticate",
    config: accountsController.authenticate,
  },
  { method: "GET", path: "/account", config: accountsController.account },
  // { method: "GET", path: "/account/edituser", config: accountsController.account },
  {
    method: "GET",
    path: "/account/listusers",
    config: accountsController.account,
  },

  { method: "GET", path: "/home", config: homeController.index },

  // { method: "GET", path: "/dashboard", config: dashboardController.index },
  // {
  //   method: "POST",
  //   path: "/dashboard/addlocation",
  //   config: dashboardController.addLocation,
  // },
  // {
  //   method: "GET",
  //   path: "/dashboard/deletelocation/{id}",
  //   config: dashboardController.deleteLocation,
  // },

  // { method: "GET", path: "/about", config: aboutController.index },

  // { method: "GET", path: "/location/{id}", config: locationController.index },
  // {
  //   method: "POST",
  //   path: "/location/{id}/update{trailid}",
  //   config: locationController.updateLocation,
  // },
  // {
  //   method: "POST",
  //   path: "/location/{id}/addtrail",
  //   config: locationController.addTrail,
  // },
  // {
  //   method: "GET",
  //   path: "/location/{id}/deletetrail/{trailid}",
  //   config: locationController.deleteTrail,
  // },

  // { method: "POST", path: "/location/{id}/uploadimage", config: locationController.uploadImage },
  // {
  //   method: "POST",
  //   path: "/location/{id}/uploadimage",
  //   config: {
  //     auth: false,
  //     handler: async function (request, h) {
  //       let location;
  //       try {
  //         location = await db.locationStore.getLocationById(request.params.id);
  //         const file = request.payload.imagefile;
  //         if (Object.keys(file).length > 0) {
  //           const url = await imageStore.uploadImage(file);
  //           location.img = url;
  //           await db.locationStore.updateLocation(location);
  //         }
  //         // return h.redirect(`/location/${location._id}`);
  //         return h.response().code(200);
  //       } catch (err) {
  //         console.log(err);
  //         return h.redirect(`/location/${request.params.id}`);
  //       }
  //     },
  //     payload: {
  //       multipart: true,
  //       output: "data",
  //       maxBytes: 209715200,
  //       parse: true,
  //     },
  //   },
  // },

  // {
  //   method: "GET",
  //   path: "/{param*}",
  //   handler: { directory: { path: "./public" } },
  //   options: { auth: false },
  // },

  // {
  //   method: "GET",
  //   path: "/trailsRidden",
  //   config: trailsRiddenController.index,
  // },
  // {
  //   method: "POST",
  //   path: "/trailsRidden/submit",
  //   config: trailsRiddenController.submit,
  // },
  // {
  //   method: "GET",
  //   path: "/trailsRidden/report",
  //   config: trailsRiddenController.report,
  // },
];
