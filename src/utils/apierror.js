class ApiError extends Error{
    constructor(
        statusCode,
        message="something went wrong",
        errro=[],
        stack=""

    ){
        super(message);
        this.statusCode = statusCode;
        this.data=null,
        this.success=false,
        this.message = message;
        this.errro = errro;
        if(stack){
            this.stack = stack;
        }else{  
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
export {ApiError};