const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let UserSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
});

class UserClass {
  static findByEmail(email) {
    return this.findOne({ email });
  }
}

UserSchema.loadClass(UserClass);

module.exports = mongoose.model("User", UserSchema);
