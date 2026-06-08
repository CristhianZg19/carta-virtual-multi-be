import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { User, type IUser } from "../models/user.model";
import { AppError } from "../utils/errors";

const publicUser = (user: IUser) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
});

const signToken = (user: IUser) =>
  jwt.sign(
    { role: user.role },
    env.jwtSecret as Secret,
    {
      subject: user._id.toString(),
      expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
    },
  );

export const authService = {
  async login(email: string, password: string) {
    const user = await User.findOne({ email: email.toLowerCase(), isActive: true }).select(
      "+password",
    );

    if (!user || !(await user.comparePassword(password))) {
      throw new AppError("Credenciales invalidas", 401);
    }

    return {
      token: signToken(user),
      user: publicUser(user),
    };
  },

  async me(userId: string) {
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      throw new AppError("Usuario no encontrado", 404);
    }

    return publicUser(user);
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findById(userId).select("+password");
    if (!user || !user.isActive) {
      throw new AppError("Usuario no encontrado", 404);
    }

    if (!(await user.comparePassword(currentPassword))) {
      throw new AppError("Contrasena actual incorrecta", 400);
    }

    user.password = newPassword;
    await user.save();

    return publicUser(user);
  },
};
