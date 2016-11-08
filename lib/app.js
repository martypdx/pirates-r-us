const express = require('express');
const app = express();
const errorHandler = require('./error-handler')
const morgan = require('morgan');
const path = require('path');

// create the middleware for ensureAuth, doesn't currently take params
const ensureAuth = require('./auth/ensure-auth')();
// the ensureRole middleware factory function takes one or more
// roles required to pass that middleware
const ensureRole = require('./auth/ensure-role');
// // we could pre-make middle if shared roles:
// const ensureAdmin = ensureRole('admin');

const auth = require('./routes/auth');
const pirates = require('./routes/pirates');
const crews = require('./routes/crews');
const me = require( './routes/me' );
const users = require( './routes/users' );

// http logging:
app.use(morgan('dev'));

// serve up the public static dir
const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir));

app.use('/api/auth', auth);
app.use('/api/pirates', ensureAuth, pirates);
app.use('/api/crews', ensureAuth, crews);
app.use( '/api/users', ensureAuth, me);
app.use( '/api/users', ensureAuth, ensureRole('admin'), users);

app.use(errorHandler);


module.exports = app;