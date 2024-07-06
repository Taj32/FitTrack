// models/associations.js
export default function defineAssociations(sequelize) {
    const { Workout, Exercise, User } = sequelize.models;
  
    Workout.hasMany(Exercise);
    Exercise.belongsTo(Workout);
  
    User.hasMany(Workout);
    Workout.belongsTo(User);
  
    User.hasMany(Exercise);
    Exercise.belongsTo(User);
  }