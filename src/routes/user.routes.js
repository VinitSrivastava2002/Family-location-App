import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  submitCircleName,
  verifyOTP,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.post("/verify-otp", verifyOTP);
router.post("/submit-circle-name", submitCircleName);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);

//for secured routes
export default router;
