const tokenSvc = require('./token');

module.exports = function getEnsureAuth() {

	return function ensureAuth(req, res, next) {
		let token = '';
		
		// look for token in the authorization header 
		// (express lowercases all the headers)
		const authHeader = req.headers.authorization;
		
		// didn't provide a token, error
		if(authHeader) {
			// Authorization header is in form "Bearer <token>"
			const [bearer, jwt] = authHeader.split(' ');
			// check we got right intro word, if so assign to token
			if(bearer === 'Bearer') token = jwt;
		}

		// it could also be in the query string:
		token = token || req.query.token;

		// no token? no auth...
		if(!token) {
			return next({
				code: 400,
				error: 'unauthorized, no token provided'
			});
		}
		
		// verify the _actual_ token
		tokenSvc.verify(token)
			.then(payload => {
				req.user = payload;
        		next();
			})
			.catch(err => {
				return next({
					code: 403,
					error: 'unauthorized, invalid token'
				});
			});
	};

};