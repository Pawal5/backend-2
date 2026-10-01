import { Router } from "express";
import { regUser, loginUser, logOutUser,raToken, changePassword, getUserChannel, getwatch} from "../controller/user.controller.js"
import { upload } from "../middleware/multer.js";
import  {verifyJWT}  from "../middleware/auth.js";
const router=Router()

router.route("/reg").post(
    upload.fields([
       {name:"avatar",
       maxCount:1
       },
       {
        name:"coverImage",
        maxCount:1
       }


    ]),    regUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logOutUser)
router.route("/ref-token").post(raToken)
router.route("/change-pass").post(verifyJWT,changePassword)
router.route("/username").get(verifyJWT,getUserChannel)

router.route("/watchHistory").get(verifyJWT,getwatch)
export {router}