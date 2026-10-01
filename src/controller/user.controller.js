import { ah } from "../utils/ah.js";
import { ApiErr } from "../utils/apierr.js";
import { User } from "../models/user.model.js";
import { uploadCloud } from "../utils/cloudinary.js";
import { ApiRes } from "../utils/apires.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const genToken=async(userId)=>{
  try {
    const user=await User.findById(userId)
    const accessToken= await user.tokenGen()
    const refreshToken= await user.RefGen()
    return {accessToken,refreshToken}
  } catch (error) {
        throw new ApiErr(500,"something went wrong in token generation");

  }
}
const regUser=ah(async  (req,res)=>{
  const {email,password,username,fullname}=req.body
  if(email==""||password==""||username==""){
    throw new ApiErr(402,"field required");
  }
  const existUser=await User.findOne({
    $or:[{email},{username}]
  })
  if(existUser){
    throw new ApiErr(409,"user already exists");
  }
  const avatarPath=req.files?.avatar[0]?.path;
  const coverPath=req.files?.coverImage[0]?.path;
  if(!avatarPath){
    throw new ApiErr(402,"avatar required");
  }
  const avatar=await uploadCloud(avatarPath);
  const Cimage=await uploadCloud(coverPath);
  
  const user=await User.create(
    {
      fullname,
      username,
      email,
      password,
      avatar:avatar.url,
      Cimage:Cimage.url
    }
  )
  const createdUser=await User.findById(user._id).select("-password -refreshToken")
  if(!createdUser){
    throw new ApiErr(500,"something wrong");

  }
  return res.status(201).json(
    new ApiRes(200,"Success Registration",createdUser)
  )

})
const loginUser=ah(async(req,res)=>{
   const {email,password,username}=req.body
   if ((!email && !username) || !password) {
    throw new ApiErr(402, "email/username and password are required");
}
   const checkUser= await User.findOne({
    $or:[{email},{username}]
   })
   if(!checkUser){
    throw new ApiErr(400,"user doesn't exists");
   }
    const passValid=await checkUser.isCorrect(password)
    if(!passValid){
          throw new ApiErr(400,"Incorrect password");
    }
  const {accessToken,refreshToken}=await genToken(checkUser._id)
  const loggedIn=await User.findById(checkUser._id).select("-password -refreshToken")
  const Options={
    httpOnly:true,
    secure:true
  }
  return res.status(200).cookie("accessToken",accessToken,Options)
  .cookie("refreshToken",refreshToken,Options)
  .json(
    new ApiRes(200,{
      user:loggedIn,accessToken,refreshToken
    },
  "user logged in successfully")
  )
  
})
const logOutUser=ah(async(req,res)=>{
  await User.findByIdAndUpdate(req.user._id,{
    $set:{
      refreshToken:undefined
    }},
    {
      new:true
    }

    
  )
const Options={
    httpOnly:true,
    secure:true
  }
  return res.status(200).clearCookie("accessToken",Options)
  .clearCookie("refreshToken",Options)
  .json(
    new ApiRes(200,{},
  "user logged out successfully")
  )
})


const raToken=ah(async(req,res)=>{
  const incomingRefresh = req.cookies.refreshToken || req.body.refreshToken
  if(!incomingRefresh){
    throw new ApiErr(401,"unauthorized request")
  }
  try {
    const decoded= jwt.verify(incomingRefresh,process.env.Refresh_Token)
   const user=await User.findById(decoded?._id)
   if(!user){
    throw new ApiErr(401,"Invalid refresh token")
   }
   if(incomingRefresh!==user.refreshToken){
    throw new ApiErr(402,"refresh tokens don't match")
   }
   const Options={
    httpOnly:true,
    secure:true
   }
   const{accessToken,refreshToken:newRefreshToken}= await genToken(user._id)
   return res.status(200)
   .cookie("accessToken",accessToken,Options)
   .cookie("refreshToken",newRefreshToken,Options)
   .json(
    new ApiRes(201,{accessToken,refreshToken:newRefreshToken},
      "access token refreshed"
    )
   )
  } catch (error) {
    throw new ApiErr(401,error?.message || "invalid token");
    
  } 
})

const changePassword=ah(async(req,res)=>{
  const {oldPass,newPass}=req.body
  const user=await User.findById(req.user?._id)
  const isCorrect=await user.isCorrect(oldPass)
  if(!isCorrect){
    throw new ApiErr(400,"invalid old password")
  }
  user.password=newPass
  await user.save({validateBeforeSave:false})
  return res
  .status(200)
  .json(new ApiRes(200,{},"password changed successfully"))
})

const currentUser=ah(async(req,res)=>{
  return res.status(200)
  .json(200,req.user,"current user fetched" )
})
const avatarUpdate=ah(async(req,res)=>{
  const avatarlocal=req.file?.path
  if(!avatarlocal){
    throw new ApiErr(401,"avatar missing")

  }
  const avatar=await uploadCloud(avatarlocal)
  if(!avatar.url){
    throw new ApiErr(400,"url missing")
  }
 const user= await User.findByIdAndUpdate(
    req.user?._id ,{
        $set:{avatar:avatar.url}
         },{new:true}
  ).select("-password")
  return res.status(200).json(new ApiRes(200,user,"avatr updated"))
})
const getUserChannel=ah(async(req,res)=>{
  const {username}=req.params
  if(!username?.trim()){
    throw new ApiErr(400,"username missing")
  }
  const channel=await User.aggregate([
    {
      $match:{
        username:username?.toLowerCase()
      }
    },
    {
      $lookup:{
        from:"subscriber",
        localField:"_id",
        foreignField:"channel",
        as:"Sub_details"
      }
    },{
      $lookup:{
        from:"subscriber",
        localField:"_id",
        foreignField:"subscriber",
        as:"Subto_details"
      }
    },{
      $addFields:{
        subcnt:{
          $size:"$Sub_details"
        },
        channelsubto:{
          $size:"$Subto_details"
        },
        isSub:{
          $cond:{
            if:{$in:[req.user?._id,"$Sub_details.subscriber"]},
            then:true,
            else:false
          } 
        }
      }
    },{
      $project:{
        fullname:1,
        username:1,
        subcnt:1,
        channelsubto:1,
         isSub:1
      }
    }
  ])
  if(!channel?.length){
    throw new ApiErr(400,"channel doesnt exist")
  }
  return res.status(200)
  .json(new ApiRes(200,channel[0],"user fetched success"))
})
const getwatch=ah(async(req,res)=>{
  const user=await User.aggregate([
    {
      $match:{
        _id:new mongoose.Types.ObjectId(req.user._id)
      }
    },{
      $lookup:
       { from:"videos",
        localField:"watchHist",
        foreignField:"_id",
        as:"watch_history",
        pipeline:[
          {
            $lookup:{
              from:"users",
              localField:"owner",
               foreignField:"_id",
              as:"owner",
              pipeline:[
                { 
                  $project:{
                    fullname:1,
                    username:1,
                    avatar:1
                  }
                }
              ]
            }
          },{
            $addFields:{
              owner:{
                $first:"$owner"
              }
            }
          }
        ]
      }
    }
  ])
  return res.status(200)
  .json(
    new ApiRes(200,user[0]?.watch_history || [],"watchhistory fetched")
  )
})


export {regUser,loginUser,logOutUser,raToken,currentUser,avatarUpdate,getUserChannel,getwatch,changePassword}