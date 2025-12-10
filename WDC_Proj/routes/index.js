/* eslint-disable no-console */

var express = require('express');
var router = express.Router();

// Google Login Content
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = '787073395930-1oo149bfjjbljv2r1e6b38eq7evk578h.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

/* ROUTE TO ADD NEW USER */
router.post('/addUser', (req, res) => {
  const { email, username, password, display_name, phoneNumber } = req.body;
  console.log(req.body); // eslint-
  if (!email || !username || !password || !display_name || !phoneNumber) {
      res.status(400).send("All fields are required");
      return;
  }

  const query = 'INSERT INTO users (username, password, email, display_name, phone_number, permission) VALUES (?, ?, ?, ?, ?, 1)';

  req.pool.getConnection((err, connection) => {
      if (err) {
          console.error("Error connecting to the database", err);
          res.status(500).send("Error connecting to the database");
          return;
      }
      connection.query(query, [username, password, email, display_name, phoneNumber], (err, results) => {
          connection.release();
          if (err) {
              console.error('Error adding user:', err.message);
              res.status(500).send('Error adding user');
              return;
          }
          res.status(200).send('User added successfully');
      });
  });
});

router.get('/user-list', (req, res) => {
  const query = `SELECT user_id, username, email, display_name, password, phone_number, DATE_FORMAT(creation_date, '%Y-%m-%d') as created FROM users`;
  req.pool.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching users:', err.message);
          res.status(500).send('Error fetching users');
          return;
      }
      res.json(results);
  });
});

/* SIGN UP */
router.post('/sign_up', async function(req, res, next) {
  console.log("Sign up request received.");

  const { email, username, firstname, lastname, password, phoneNumber, credential } = req.body;

    // Google Sign Up
    if (credential) {
      try {
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const username = payload['sub'];
        const email = payload['email'];
        const display_name = payload['name'];

        req.pool.getConnection(function(err, connection) {
          if (err) {
            console.error("Error, could not connect to the Database");
            return res.sendStatus(500);
          }

          const query = `SELECT * FROM users WHERE email = ?`;
          connection.query(query, [email], function(err, results) {
            connection.release();
            if (err) {
              console.error("Error, query failed");
              return res.sendStatus(500);
            }

            if (results.length > 0) {
              // Set session with user information and permission level
              const user_id = results[0].user_id;
              req.session.user_id = user_id;
              return res.status(200).send('Google login successfully'); // sending response
            } else {
              console.log("User does not exist, adding user to database");
              const insertQuery = `INSERT INTO users (display_name, username, password, email, permission, creation_date, google_account) VALUES (?, ?, 'google_user', ?, 1, NOW(), 1)`;
              connection.query(insertQuery, [display_name, username, email], function(err, results) {
                if (err) {
                  console.error('Error adding user: ', err.message);
                  return res.status(500).send('Error adding user');
                }
                req.session.user_id = results.insertId;
                req.session.permissionLevel = 1;
                return res.status(200).send('Google sign up successfully');
              });
            }
          });
        });
      } catch (err) {
        console.log("Google sign up error: ", err);
        return res.sendStatus(500);
      }
      return;
    }

  // Regular Sign Up
  req.pool.getConnection(function(err, connection) {
    if (err) {
      console.log("Error, could not connect to the Database");
      return res.sendStatus(500);
    }

    if (!email || !username || !firstname || !lastname || !password) {
      console.log("Error, missing required fields");
      return res.sendStatus(400);
    }

    const query = `SELECT * FROM users WHERE email = ?`;
    connection.query(query, [email], function(err1, results) {
      if (err1) {
        connection.release();
        console.log("Error, query Failed");
        res.sendStatus(500);
        return;
      }

      if (results.length > 0) {
        connection.release();
        // User found
        return res.status(409).send("User with this email already exists");
      } else {
        // User not found, send error response
        const insertQuery = `INSERT INTO users (username, display_name, password, email, phone_number, permission, creation_date, google_account) VALUES (?, ?, ?, ?, ?, 1, NOW(), 0)`
        connection.query(insertQuery, [username, `${firstname} ${lastname}`, password, email, phoneNumber], function(err2, results) {
          connection.release();
          if (err2) {
            console.error('Error adding user:', err2.message);
            return res.status(500).send('Error adding user');
          }
          req.session.user_id = results.insertId;
          req.session.permissionLevel = 1;
          return res.status(200).send('Sign up successful');
        });
      }
    });
  });
});

// LOG IN
router.post('/log_in', async function(req, res, next) {
  console.log("Log in request received.");

  const { username, password, credential } = req.body;

  // Google Login
  if (credential) {
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const username = payload['sub'];
      const email = payload['email'];
      const display_name = payload['name'];

      req.pool.getConnection(function(err, connection) {
        if (err) {
          console.error("Error, could not connect to the Database");
          return res.sendStatus(500);
        }

        const query = "SELECT * FROM users WHERE email = ?";
        connection.query(query, [email], function(err, results) {
          connection.release();
          if (err) {
            console.error("Error, query failed");
            return res.sendStatus(500);
          }

          if (results.length > 0) {
            // Set session with user information and permission level
            const user_id = results[0].user_id;
            req.session.user_id = user_id;
            return res.status(200).send('Google login successfully'); // sending response
          } else {
            console.log("User does not exist, adding user to database");
            const insertQuery = `INSERT INTO users (display_name, username, password, email, permission, creation_date, google_account) VALUES (?, ?, 'google_user', ?, 1, NOW(), 1)`;
            connection.query(insertQuery, [display_name, username, email], function(err, results) {
              if (err) {
                console.error('Error adding user: ', err.message);
                return res.status(500).send('Error adding user');
              }
              req.session.user_id = results.insertId;
              req.session.permissionLevel = 1;
              return res.status(200).send('Google login successfully');
            });
          }
        });
      });
    } catch (err) {
      console.log("Google login error: ", err);
      return res.sendStatus(500);
    }
    return;
  }

  // Regular Login
  req.pool.getConnection(function(err, connection) {
    if (err) {
      console.log("Error, could not connect to the Database");
      return res.sendStatus(500);
    }

    if (!username || !password) {
      console.log("Error, missing required fields");
      return res.sendStatus(400);
    }

      const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
      connection.query(query, [username, password], function(err1, results) {
        connection.release();
        if (err1) {
          console.log("Error, query Failed");
          return res.sendStatus(500);
        }

        if (results.length > 0) {
          // if results corresponds to a Google User Account
          if (results[0].google_account == 1) {
            return res.status(403).send('Please log in with Google');
          }
        }

      if (results.length > 0) {
        // User found, set session
        const user_id = results[0].user_id;
        const permission = results[0].permission;
        req.session.user_id = user_id;
        req.session.permissionLevel = permission;
        return res.status(200).send('Login Successful');
      } else {
        // User not found, send error response
        console.log("User not found");
        return res.status(401).send("Invalid username or password");
      }
    });
  });
});

//LOG OUT
router.post('/log-out', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }

    // Redirect to the landing page
    res.redirect('/landing_page.html');
  });
});

router.get('/getOrganizationNames', function(req, res, next) {
  req.pool.getConnection(function(err, connection) {
    if (err) {
      console.log("Error, could not connect to the Database");
      res.sendStatus(500);
      return;
    }

    const query = "SELECT name FROM organizations";
    connection.query(query, function(err1, results) {
      connection.release();
      if (err1) {
        console.log("Error, query Failed");
        res.sendStatus(500);
        return;
      }

      if (results.length > 0) {
        // Organization names found, send success response
        const organizationNames = results.map(result => result.name);
        res.status(200).json({ organizationNames });
      } else {
        // No organization names found, send error response
        console.log("No organization names found");
        res.status(404).send("No organization names found");
      }
    });
  });
});

// Get users permission
function checkPermissions(req, res, next) {
  // Check if the user_id session exists
  if (!req.session.user_id) {
      // No user_id in session, user is a guest (no permissions)
      req.permissionLevel = 0;
      next();
      return;
  }

  // **Changes Start**
  // User is logged in, fetch permission level from the session
  if (req.session.permissionLevel !== undefined) {
      req.permissionLevel = req.session.permissionLevel;
      next();
      return;
  }
  // **Changes End**

  // If the permission level is not in the session, fetch it from the database
  req.pool.getConnection(function(err, connection) {
      if (err) {
          console.error("Error, could not connect to the Database");
          res.sendStatus(500);
          return;
      }

      const user_id = req.session.user_id;
      const query = "SELECT permission FROM users WHERE user_id = ?";

      connection.query(query, [user_id], function(err, results) {
          connection.release();
          if (err) {
              console.error("Error, query failed");
              res.status(401).send("Email attached to Google Account");
              return;
          }

          if (results.length > 0) {
              // Permission level found, set it in the request object and session
              req.permissionLevel = results[0].permission;
              req.session.permissionLevel = results[0].permission;
          } else {
              // User not found, set permission level to 0 (guest)
              req.permissionLevel = 0;
          }
          next();
      });
  });
}

// Route to get the user's permission level
router.get('/get_user_permission_level', checkPermissions, (req, res) => {
  // The user ID is checked and used in the middleware
  res.json({ permissionLevel: req.permissionLevel });
});

router.get('/user-details/:userId', (req, res) => {
  const userId = req.params.userId;
  const query = 'SELECT username, display_name, email, password FROM users WHERE user_id = ?';
  req.pool.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err.message);
      res.status(500).send('Error fetching user details');
      return;
    }
    if (results.length > 0) {
      console.log('Fetched user details:', results[0]); // Log the fetched data
      res.json(results[0]);
    } else {
      res.status(404).send('User not found');
    }
  });
});

router.get('/user-organizations/:userId', (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  if (isNaN(userId)) {
    res.status(400).send('Invalid user ID');
    return;
  }

  const query = `
    SELECT o.name
    FROM user_organization uo
    JOIN organizations o ON uo.organization_id = o.organization_id
    WHERE uo.user_id = ?`;

  req.pool.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching organizations:', err.message);
      res.status(500).send('Error fetching organizations');
      return;
    }
    res.json(results);
  });
});


module.exports = router;