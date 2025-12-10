/* eslint-disable no-console */

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var validator = require('validator');
var multer = require('multer');
var slowDown = require('express-slow-down');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var managersRouter = require('./routes/managers');
var adminsRouter = require('./routes/admins');
var organizationsRouter = require('./routes/organizations');

var mysql = require('mysql');

var dbConnectionPool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'webapp_database',
});

var app = express();

// Logger
app.use(logger('dev'));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Cookie parser middleware
app.use(cookieParser());

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // use secure cookies in production (HTTPS)
        maxAge: null, // lasts until browser is closed
        httpOnly: true, // cookie should be accessible only through HTTP protocol ( helps against XSS attacks )
        path: '/', // cookie is available throughout the site
    }
}));

const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000,
    delayAfter: 100,
    delayMs: () => 200
});

app.use(speedLimiter);

/* USER ALREADY LOGGED IN */
// Middleware to check if user is logged in
function redirectIfLoggedIn(req, res, next) {
    if (req.session.user_id) {
      return res.redirect('/landing_page.html');
    }
    next();
}

function checkUserSession(req, res, next) {
    if (req.session.user_id && req.session.user_id >= 1) {
        next();
    } else {
        res.redirect('/signin.html');
    }
}

function checkAdminSession(req, res, next) {
    if (req.session.user_id && req.session.user_id >= 3) {
        next();
    } else {
        res.redirect('/signin.html');
    }
}

function checkManagerSession(req, res, next) {
    if (req.session.user_id && req.session.user_id >= 2) {
        next();
    } else {
        res.redirect('/landing_page.html');
    }
}


// Apply middleware to the sign-in and sign-up routes
app.get('/signin.html', redirectIfLoggedIn, function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'signin.html'));
});

app.get('/signup.html', redirectIfLoggedIn, function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.use('/edit_profile.html', checkUserSession, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'edit_profile.html'));
});

app.use('/admin_dashboard.html', checkAdminSession, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin_dashboard.html'));
});

app.use('/organisation_manage.html', checkManagerSession, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'organisation_manage.html'));
});

// Database connection middleware
app.use(function(req, res, next) {
    req.pool = dbConnectionPool;
    next();
});

// Debugging middleware to log the current user session
app.use(function(req, res, next) {
    console.log("The current user is: " + req.session.user_id);
    next();
});

// Static files middleware
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res, next) {
    res.sendFile(path.join(__dirname, 'public', 'landing_page.html'));
});

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/managers', managersRouter);
app.use('/admins', adminsRouter);
app.use('/organizations', organizationsRouter);

// Root route to always render landing_page.html

module.exports = app;
