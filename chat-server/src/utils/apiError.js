
// extends Error means ApiError inherits from JavaScript's built-in Error class.
class ApiError extends Error {
    constructor( statusCode, message, data = null ) {
        // ApiError extends Error, JavaScript requires super() to run before you use this inside the derived class constructor.
        super(message);
        this.statusCode = statusCode;
        this.data = data;

        // This captures the stack trace (where the error occurred)
        Error.captureStackTrace(this, this.constructor);

    }
}

export default ApiError;