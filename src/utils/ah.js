
const ah = (reqhand)=>{
  return  (req,res,next)=>{
        Promise.resolve(reqhand(req,res,next)).catch((err)=>next(err))
    }
}

export  {ah}