const mongoose = require("mongoose");

const Role = mongoose.model(
  "Role",
  new mongoose.Schema({
    name: String
  })
);

module.exports = Role;

/* [NOTES]
- represents role collection in MongoDB database
- User objects will have a role array that contains ids in roles collection 
as reference
- Normalization --> one to many relationship
- After we initilizae mongoose we don't need CRUD functions because
Mongoose supports all of th em
*/