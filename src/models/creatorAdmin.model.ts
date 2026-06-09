import bcrypt from "bcryptjs";
import { model, Schema, type Document } from "mongoose";

export interface ICreatorAdmin extends Document {
  name: string;
  username: string;
  password: string;
  isActive: boolean;
  comparePassword(candidate: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const creatorAdminSchema = new Schema<ICreatorAdmin>(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

creatorAdminSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    next();
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

creatorAdminSchema.methods.comparePassword = function comparePassword(candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const CreatorAdmin = model<ICreatorAdmin>("CreatorAdmin", creatorAdminSchema, "creator_admins");
