import { Router } from "express";
import { 
    loginUser,
    registerUser,
    logoutUser,
    refreshAccessToken ,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    UpdateAvater,
    UpdateCoverImage,
    getUserChannelProfile,
    getWatchHistory

} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";   
import {verifyJWT} from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]),
    registerUser );

    router.route("/login").post(loginUser);
    router.route("/logout").post(verifyJWT,logoutUser);
    router.route("/refresh-access-token").post(refreshAccessToken)
    router.route("/change-my-password").post(verifyJWT,changeCurrentPassword)
    router.route("/get-current-user").get(verifyJWT,getCurrentUser)
    router.route("/update-account-details").patch(verifyJWT,updateAccountDetails)
    router.route("/update-avatar").patch(verifyJWT,upload.single('avatar'),UpdateAvater)
    router.route("/update-cover-image").patch(verifyJWT,upload.single('coverImage'),UpdateCoverImage)
    router.route("/get-channel-profile/:username  ").get(verifyJWT,getUserChannelProfile)
    router.route("/get-watch-history").get(verifyJWT,getWatchHistory)

export default router;