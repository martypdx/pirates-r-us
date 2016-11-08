const router = require( 'express' ).Router();
const User = require( '../models/user' );

router
	.get( '/me', ( req, res, next ) => {
		User.findById( req.user.id )
			.select( '_id username roles')
            .lean()
			.then( user => res.send( user ) )
			.catch( next )
	});
	
	
module.exports = router;