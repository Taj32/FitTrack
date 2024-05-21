const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      }
    ]
  })
);

module.exports = User;

/* [NOTES]
- represents user collection in MongoDB database
- User objects will have a role array that contains ids in roles collection 
as reference
- Normalization --> one to many relationship
- After we initilizae mongoose we don't need CRUD functions because
Mongoose supports all of th em
*/