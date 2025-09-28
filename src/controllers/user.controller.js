import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apierror.js";
import User from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/apiresponse.js";  
import jwt from "jsonwebtoken";

const generateRefreshTokenAndAccessToken=async(userId)=>{
  try {
    const user=await User.findById(userId);
  const refreshToken = user.generateRefreshToken();
  const accessToken = user.generateAccessToken();
  user.refreshToken = refreshToken;
  await user.save({validateBeforeSave:false});
  return {refreshToken,accessToken};
  } catch (error) {
    throw new ApiError(error.message,"Something went wrong while genrating error",500);
  }
}



const registerUser = asyncHandler(async (req, res  ) => { 
  //get user details from frontend
  //validate  - not empty
  //check user already exists
  //check for image
  //upload to cloudinary
  //create user obj 
  //store in db
  //remove password and refresh from response
  //check for user creation 
  //return response 
  const {email,fullname,username,password} = req.body;
    console.log("email",email);
    if([email,fullname,username,password].some((item)=>item?.trim()==="")){
        throw  new ApiError("all fields are required",400);
    }
   const existUser= await User.findOne({$or: [{email},{username}]})
   if(existUser) throw new ApiError("user already exists",409);
   const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError("avatar is required", 400);
    }

  const avatar =  await uploadCloudinary(avatarLocalPath)
  if(!avatar) throw new ApiError("file upload failed, please try again",500);
    const coverImage =  await uploadCloudinary(coverImageLocalPath)  

  const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),

    })

   const createdUser= await User.findById(user._id).select("-password -refreshToken ");
   if(!createdUser) throw new ApiError("user creation failed, please try again",500);
   return res.status(201).json(new ApiResponse(200,true,"user created successfully",createdUser))

  })

  const loginUser = asyncHandler(async (req, res  ) => {
        //ask for email and password
       //check if user exists
        //validate
        //compare password
        //generate jwt token
        //return response  in cookies
        const {email,password,username} = req.body;
        if(!(email || username)){
            throw new ApiError("email and password are required",400);
        }
       const user= await User.findOne({$or: [{email},{username}]})
       if(!user) throw new ApiError("invalid credentials",401);

          const isPasswordValid = await user.isPasswordCorrect(password);
          if(!isPasswordValid) throw new ApiError("invalid credentials",401);

          const {refreshToken,accessToken} = await generateRefreshTokenAndAccessToken(user._id);
          console.log("accessToken:", accessToken);
          console.log("refreshToken:", refreshToken);

          const LoggedInUser= await User.findById(user._id).select("-password -refreshToken ");

          const options = {
            httpOnly: true,
            secure :true
          }
          return res.status(200)
          .cookie("refreshToken",refreshToken,options)
          .cookie("accessToken",accessToken,options)
          .json(new ApiResponse(200,"user logged in successfully",{user:LoggedInUser,accessToken}
            ))

  });
  const logoutUser = asyncHandler(async (req, res  ) => {
  await  User.findByIdAndUpdate(req.user._id,{
      $set  :{
        refreshToken : undefined
      },
    }
      ,{
        new :true,
      }
  );
    const options = {
            httpOnly: true,
            secure :true
          }
          return res
          .status(200)
          .clearCookie("refreshToken",options)
          .json(new ApiResponse(200,{},"user logged out successfully"))


  });

  const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
      req.cookies?.refreshToken ||
      req.headers?.authorization?.replace("Bearer ", "");
    if (!incomingRefreshToken) throw new ApiError("refresh token is missing", 401);

    try {
      // Synchronous verify, returns decoded token
      const decodedtoken = jwt.verify(
        incomingRefreshToken,
        process.env.Refresh_Token_Secret
      );

      const user = await User.findById(decodedtoken?._id);
      if (!user) throw new ApiError("user not found", 401);
      if (user.refreshToken !== incomingRefreshToken)
        throw new ApiError("expired refresh token", 401);

      const options = {
        httpOnly: true,
        secure: true,
      };

      // Generate new tokens
      const { refreshToken: newrefreshToken, accessToken } =
        await generateRefreshTokenAndAccessToken(user._id);

      return res
        .status(200)
        .cookie("refreshToken", newrefreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
          new ApiResponse(
            200,
            "access token refreshed successfully",
            { accessToken, newrefreshToken }
          )
        );
    } catch (error) {
      throw new ApiError(401, error?.message || "invalid refresh token");
    }
  });
  export {registerUser
    ,loginUser,logoutUser,refreshAccessToken
  };