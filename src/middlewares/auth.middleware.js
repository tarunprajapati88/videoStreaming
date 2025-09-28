import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apierror.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "not authorized, token missing");
    }
    const decodeToken = jwt.verify(token, process.env.Access_Token_Secret);
    const user = await User.findById(decodeToken?._id).select("-password -refreshToken");
    if (!user) throw new ApiError(401, "not authorized, user not found");
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "not authorized, invalid token", error?.message);
  }
});