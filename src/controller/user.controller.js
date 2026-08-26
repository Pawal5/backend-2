import { ah } from "../utils/ah.js";
import { ApiErr } from "../utils/apierr.js";
import { User } from "../models/user.model.js";
import { uploadCloud } from "../utils/cloudinary.js";
import { ApiRes } from "../utils/apires.js";

const regUser= ah(async (req,res)=>{
   const {fullname,email,password,username}=req.body
   console.log("email:",email);

if([fullname,email,password,username].some((field)=>field?.trim()==="")){
    throw new ApiErr(400,"all fields req")
}
const exist=await User.findOne({
    $or :[{username},{email}]
})
if(exist){
    throw new ApiErr(409,"already exists")
}
const avatarPath=req.files?.avatar?.[0]?.path;
console.log("reqfiles",req.files);
const coverImagePath=req.files?.coverImage[0].path;

if(!avatarPath){
    throw new ApiErr(400,"avatar is required")
}

//const avatar=await uploadCloud(avatarPath)
//const coverImage=await uploadCloud(coverImagePath)

//if(!avatar){
   // throw new ApiErr(400,"avatar is required")
//}

const avatar = await uploadCloud(avatarPath);

if (!avatar) {
    throw new ApiErr(400, "Avatar upload failed");
}

const coverImage = coverImagePath
    ? await uploadCloud(coverImagePath)
    : null;
const user=await User.create({
    fullname,
    avatar:avatar.url,
    email,
    password,
    username:username.toLowerCase(),
    coverImage:coverImage?.url||""
})
const createdUser=await User.findById(user._id).select(
    "-password -refreshToken"
)
if(!createdUser){
    throw new ApiErr(500,"something went wrong") 
}

return res.status(201).json(
     new ApiRes(200,createdUser,"user registered sucessfully")
)


})




export  {regUser}