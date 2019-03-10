import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: String,
  confirmed: { type: Boolean, default: false }
});

userSchema.statics.findByLogin = async function(login) {
  let user = await this.findOne({ username: login });
  if (!user) user = await this.findOne({ email: login });
  return user;
};

export default mongoose.model("User", userSchema);
