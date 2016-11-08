const router = require( 'express' ).Router();
const User = require( '../models/user' );

router
	.post( '/:userId/roles/:role', ( req, res, next ) => {
		User.findById( req.params.userId )
			.then( user => {
				if ( !user ){
					throw new Error( 'no user by that id' );
				}
				
				const role = req.params.role;
				if ( user.roles.indexOf( role ) !== -1 ) {
					return user;
				}
				else {
					user.roles.push( role );
					return user.save();
				}
			})
			.then( user => {
				res.json({
					id: user.id,
					roles: user.roles
				});
			})
			.catch( next );
	})
	.delete( '/:userId/roles/:role', ( req, res, next ) => {
		User.findById( req.params.userId )
			.then( user => {
				if ( !user ){
					throw new Error( 'no user by that id' );
				}
				
				const role = req.params.role;
				const index = user.roles.indexOf( role );

				if ( index === -1 ) {
					return user;
				}
				else {
					user.roles.splice( index, 1 );
					return user.save();
				}
			})
			.then( user => {
				res.json({
					id: user.id,
					roles: user.roles
				});
			})
			.catch( next );
	});
	
	
module.exports = router;