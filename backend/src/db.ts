import mongoose, { Schema, Document, Types } from "mongoose";
import env from "dotenv";

env.config();
const ObjectId = mongoose.Types.ObjectId;
mongoose.connect(process.env.MONGODB_STRING!);

export interface IType {
  _id: Types.ObjectId;
  type: string;
}

export interface ITag {
  _id: Types.ObjectId;
  tags: string;
}
interface IContent extends Document {
  title: string;
  link: string;
  imageUrl?: string;
  type: Types.ObjectId | IType;
  tags: (Types.ObjectId | ITag)[];
  userId: Types.ObjectId;
}
export interface ILinkPopulated extends Document {
  hash: string;
  userId: {
    _id: Types.ObjectId;
    username: string;
  };
}
const userSchema = new Schema({
  email: { type: String, unique: true },
  hashpassword: String,
  username: { type: String, unique: true },
});

const contentSchema = new Schema({
  title: { type: String, required: true },
  link: { type: String, required: true },
  imageUrl: String,
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
const contentModel = mongoose.model<IContent>("Content", contentSchema);
const tagModel = mongoose.model("Tag", tagSchema);
const typeModel = mongoose.model("Type", typeSchema);
const linkModel = mongoose.model("Link", linkSchema);

export { userModel, contentModel, tagModel, typeModel, linkModel };
