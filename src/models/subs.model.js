import mongoose,{Schema} from "mongoose";
  

const subSchema=new Schema(
    {
         id:{
           type: String
        },
         subscriber:{
           type: Schema.Types.ObjectId,
           ref:"User"
        },
        channel:{
           type: Schema.Types.ObjectId,
           ref:"User"
        },
        createdAt:{
           type:Number
        }
       
    },{timestamps:true}
)


export const Subscription= mongoose.model("Subscription",subSchema)