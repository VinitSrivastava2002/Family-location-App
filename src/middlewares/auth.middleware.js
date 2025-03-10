// it's only verify user is exist or not

import axios from "axios";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandlers.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      //TODO discuss about frontend
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid access token");
  }
});

export const verifyEmail = async (email) => {
  const apiKey = process.env.EMAIL_VERIFICATION_API_KEY;
  const url = `https://api.zerobounce.net/v2/validate?api_key=${apiKey}&email=${email}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error("Error verifying email address");
  }
};
