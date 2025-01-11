const { Dashboard } = require("../controller/dashboardController");

const dashboardRouter = require("express").Router();

dashboardRouter.post("/", Dashboard);

module.exports = dashboardRouter;