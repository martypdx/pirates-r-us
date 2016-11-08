const jwt = require( 'jsonwebtoken' );
// This is our app secret that enables our tokens to be "untampered with"
const sekrit = process.env.APP_SECRET;

module.exports = {
	sign(user) {
		return new Promise( ( resolve, reject ) => {

			// this is (jwt optional) data we want stored in token
			// is "transparent", ie can be seen
			// but cannot be modified without ruining token
			const payload = { 
				id: user._id,
				roles: user.roles  
			};

			// make a token with payload and use secret
			jwt.sign(payload, sekrit, null, ( err, token ) => {
				// something went wrong...
				if ( err ) return reject( err );
				// return the newly create token
				resolve(token);
			});
		
		});
	},
	verify(token){

		return new Promise( ( resolve, reject ) => {
			
			jwt.verify(token, sekrit, ( err, payload ) => {
				// if token was bad or otherwise invalid or expired (if set), reject
				if ( err ) return reject( err );
				// hand back payload info
				resolve( payload );
			});
			
		});

	}
};