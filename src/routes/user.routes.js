import { Router } from "express";
import {
  registerUser,
  submitCircleName,
  verifyOTP,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);
router.post("/verify-otp", verifyOTP);
router.post("/submit-circle-name", submitCircleName);

//for secured routes
export default router;
