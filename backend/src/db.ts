import mongoose, { Schema } from "mongoose";
import env from "dotenv";

env.config();
const ObjectId = mongoose.Types.ObjectId;
mongoose.connect(process.env.MONGODB_STRING!);

const userSchema = new Schema({
  email: { type: String, unique: true },
  hashpassword: String,
  username: { type: String, unique: true },
});

const contentSchema = new Schema({
  title: { type: String, required: true },
  link: { type: String, required: true },
  imageUrl: { type: String, required: true },
  type: { type: ObjectId, required: true, ref: "Type" },
  tags: [{ type: ObjectId, ref: "Tag" }],
  userId: { type: ObjectId, ref: "User", required: true },
});

const tagSchema = new Schema({
  tags: { type: String, unique: true, required: true },
});

const typeSchema = new Schema({
  type: { type: String, unique: true, required: true },
});

const linkSchema = new Schema({
  hash: { type: String, unique: true },
  userId: { type: ObjectId, ref: "User", required: true },
});

const userModel = mongoose.model("User", userSchema);
const contentModel = mongoose.model("Content", contentSchema);
const tagModel = mongoose.model("Tag", tagSchema);
const typeModel = mongoose.model("Type", typeSchema);
const linkModel = mongoose.model("Link", linkSchema);

export { userModel, contentModel, tagModel, typeModel, linkModel };
