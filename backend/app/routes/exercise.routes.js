// exercise.routes.js
const express = require('express');
//const router = express.Router();
const exerciseController = require("../controllers/exercise.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, Content-Type, Accept"
      );
      next();
    });

    // Create a new exercise
    app.post('/api/test/user/createExercise', exerciseController.createExercise);

    // Log exercise statistics
    app.post('/api/test/user/:id/logExercise', exerciseController.logExercise);

    // Retrieve exercise logs
    app.get('/api/test/user/:id/logs', exerciseController.getExerciseLogs);
};



//module.exports = router;