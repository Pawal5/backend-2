import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt";
import  jwt  from "jsonwebtoken";
const UserSchema=new Schema(
    {  
      username:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
        index:true,
        unique:true
      },
      fullname:{
        type:String,
        required:true,
       
        trim:true,
        index:true,
        
      },
      email:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
        
        unique:true
      },
      avatar:{
        type:String,
        required:true
      },
      coverImage:{
        type:String
      },
      watchHist:{
        type:Schema.Types.ObjectId,
        ref:"Video"
      },
      password:{
        type:String,
        required:[true,"password req"]
      },
      refreshToken:{
        type:String
      }
    },{timestamps:true}
)


UserSchema.pre("save",async function (next){
  if(!this.isModified("password")){return;} //next();}
  this.password=await bcrypt.hash(this.password,10);
 //next();
})
UserSchema.methods.isCorrect=async function(password){
  return await bcrypt.compare(password,this.password)
}
UserSchema.methods.tokenGen =async function(){
  return jwt.sign(
    {
      _id:this._id,
      email:this.email,
      fullname:this.fullname,
      username:this.username
    },
    process.env.Access_token,{
      expiresIn:process.env.Access_expiry
    }
  )

  
}


UserSchema.methods.RefGen =async function(){
  return jwt.sign(
    {
      _id:this._id,
      
    },
    process.env.Refresh_Token,{
      expiresIn:process.env.Refresh_Exp
    }
  )

  
}








export const User =mongoose.model("User",UserSchema)