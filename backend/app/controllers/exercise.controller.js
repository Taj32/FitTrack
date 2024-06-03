const Exercise = require("../models/exercise.model");

//Create a new exercise
exports.createExercise = async (req, res) => {
    try {
      const { name } = req.body;
      console.log("-----" + req.body + "------");
      console.log("-----" + req.user + "------");
      const exercise = new Exercise({
        
        user: req.user._id,  //"664d62711f8141dbdd9abe2b", //req.user._id,
        name, 
        logs: []
      });
      await exercise.save();
      res.status(201).json(exercise);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

// Log exercise statistics
exports.logExercise = async (req, res) => {
    try {
      const exercise = await Exercise.findById(req.params.id);
      if (!exercise) {
        return res.status(404).json({ error: 'Exercise not found' });
      }
  
      const { date, weight, reps, sets, duration } = req.body;
      exercise.logs.push({ date, weight, reps, sets, duration });
      await exercise.save();
      res.status(200).json(exercise);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  // Retrieve exercise logs
  exports.getExerciseLogs = async (req, res) => {
    try {
      const exercise = await Exercise.findById(req.params.id);
      if (!exercise) {
        return res.status(404).json({ error: 'Exercise not found' });
      }
  
      res.status(200).json(exercise.logs);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };