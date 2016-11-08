 
module.exports = function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-var
    
    let code = 500, error = 'Internal Server Error';

    // Mongoose Validation Error?
    if(err.name === 'ValidationError' || err.name === "CastError") {
        console.log(err.errors)
        code = 400;
        error = err.errors.name.message;
    }
    // is this one of our errors?
    else if(err.code) {
        // by convention, we're passing in an object
        // with a code property === http statusCode
        // and a error property === message to display
        code = err.code;
        error = err.error;
        console.log(err.code, err.error);
    }
    // or something unexpected?
    else {
        console.log(err);
    }

    res.status(code).send({ error });
    
};

// module.exports = function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-var
    
//     // what should we write to the server log? (not user facing)
//     // is this one of our errors? or something unexpected?
//     const knownError = !!err.code;
//     const toLog = knownError ? `${err.code}: ${err.error}` : err;
//     console.error(toLog);
    
//     // what should the status code be?
//     const code = knownError ? err.code : 500;

//     // what message do we return to the caller?
//     const error = knownError ? err.error: 'Internal Server Error';
    
// 	res.status(code).send({ error });
// };