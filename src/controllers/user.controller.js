import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "./../models/user.model.js";
import { sendOTPEmail } from "../utils/mailer.js";
import { verifyEmail } from "../middlewares/auth.middleware.js";

// generate otp
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

//generate AccessAndRefreshTokens
const generateAccesAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch {
    throw new ApiError(
      500,
      "something went wrong while generating refresh and access tokens"
    );
  }
};

// register user
const registerUser = asyncHandler(async (req, res) => {
  //get user detail from the user
  // validation - not empty
  // check if user already exist
  // send and verify otp
  // create user objects - create entry in db
  // circle name

  const { firstName, lastName, email, password } = req.body;

  //chk validation
  if (
    [firstName, lastName, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All field are required");
  }

  // const emailVerificationResult = await verifyEmail(email);
  // if (emailVerificationResult.status !== "valid") {
  //   throw new ApiError(400, "Email address is invalid");
  // }

  // chk if user is already exist or not
  const existedUser = await User.findOne({ email });

  if (existedUser) {
    throw new ApiError(409, "User with this email already exist");
  }

  const otp = generateOTP(); // generate otp
  console.log(otp);
  req.session.userEmail = email; // store email in session
  req.session.otp = otp; //// store otp in session
  req.session.userDetails = { firstName, lastName, password };

  try {
    await sendOTPEmail(email, otp);
  } catch {
    throw new ApiError(500, "Failed to send OTP");
  }

  return res.status(201).json(new ApiResponse(200, "OTP sent successfully"));
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  const userEmail = req.session.userEmail;
  const storedOTP = req.session.otp;

  if (!userEmail || !storedOTP) {
    throw new ApiError(400, "No session data found. Please register first.");
  }

  if (otp != storedOTP) {
    throw new ApiError(400, "Invalid OTP");
  }

  const { firstName, lastName, password } = req.session.userDetails;

  const user = await User.create({
    firstName,
    lastName,
    email: userEmail,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // for checking either a user is created or not
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registing a user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, "User registered successfully", createdUser));
});

const submitCircleName = asyncHandler(async (req, res) => {
  const { circleName } = req.body;
  const userEmail = req.session.userEmail;
  console.log(userEmail);
  console.log(circleName);

  // Update user in the database
  const updatedUser = await User.findOneAndUpdate(
    { email: userEmail },
    { circleName: circleName.trim() },
    { new: true } // Return the updated document
  );

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  // Clear the session data after successful verification
  req.session = null;

  return res
    .status(200)
    .json(new ApiResponse(200, "Circle name done", updatedUser));
});

//login user
const loginUser = asyncHandler(async (req, res) => {
  //req email and password
  //chk email is correct or not
  //chk password is correct
  //generate access and referesh tokens
  // send cookie

  const { email, password } = req.body;
  if (!email) {
    throw new ApiError(400, "username or password is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "user does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password is incorrect");
  }

  const { accessToken, refreshToken } = await generateAccesAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in Successfully"
      )
    );
});

//logout user
const logoutUser = asyncHandler(async (req, res) => {
  //// remove cookies
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiError(200, {}, "user logged out"));
});

export { registerUser, verifyOTP, submitCircleName, loginUser, logoutUser };
