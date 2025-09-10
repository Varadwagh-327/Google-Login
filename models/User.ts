import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  avatar: string;
  role: string;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar: { type: String },
  role: { type: String, default: "User" },
});

const User = models.User || model<IUser>("User", userSchema);
export default User;
