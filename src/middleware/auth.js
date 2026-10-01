import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"
import { ah } from "../utils/ah.js"
import { ApiErr } from "../utils/apierr.js"

export const verifyJWT =ah(async(req,res,next)=>{
 try {
   const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace(/^Bearer\s+/i, "");
    if(!token){
        throw new ApiErr(500,"authorization failed")
    }
    const decodedToken=jwt.verify(token,process.env.Access_token)
    const user=await User.findById(decodedToken?._id).select("-password -refreshToken ")
    if(!user){
                throw new ApiErr(401,"authorization access token")

    }
    req.user=user;
    next()
 } catch (error) {
            throw new ApiErr(401,error?.message||"authorization failed")

 }
})
//export {verifyJWT}