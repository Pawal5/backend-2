class ApiRes {
    constructor(
      StatusCode,
        message="success",
        data
        
    ){
        this.StatusCode=StatusCode
        this.data=data
        this.message=message
        this.success=StatusCode<400
    }
}


export {ApiRes}