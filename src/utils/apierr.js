import { HttpStatusCode } from "axios"

class ApiErr extends Error{
    constructor(
      StatusCode,
        message="something wrong",
        stack="",
        error=[]
    )
    {
       super(message)
       this.StatusCode=StatusCode
       this.data=null
       this.message=message
       
       this.error=error
       this.success=false;
       if(stack){
         this.stack=stack
       }else{
         Error.captureStackTrace(this,this.constructor)
       }
    }
}

export {ApiErr}