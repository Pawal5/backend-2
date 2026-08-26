import { Router } from "express";
import { regUser } from "../controller/user.controller.js"
import { upload } from "../middleware/multer.js";
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


    ]),
    
    
    
    
    
    
    regUser)




export {router}