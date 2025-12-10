/* eslint-disable no-console */

var express = require('express');
const session = require('express-session');
var validator = require('validator');
var multer = require('multer');
var router = express.Router();

//For multer
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 16 * 1024 * 1024 }, // 16 MB limit for file uploads
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

//MUST BE USER
router.use((req, res, next) => {
  if (req.session.user_id) {
    // Check if the permission level is stored in the session
    if (req.session.permissionLevel >= 1) {
      next(); // Permission level is 1, proceed to the route
    } else {
      res.status(403).send('Forbidden: Insufficient permissions'); // Permission level is not 1, deny access
    }
  } else {
    // User is not logged in
    res.status(401).send('Unauthorized: Please log in'); // Unauthorized
  }
});
router.get('/', function(req, res, next) {
  res.send('Authorized: User permission found, no route supplied');
});

// Endpoint to get all events and updates for a logged-in user, optionally filtered by organization uses QUERY
router.get('/get_all_events_and_updates', function(req, res) {
  const userId = req.session.user_id; // Extract user ID from session
  const organizationId = req.query.organization_id; // Extract organization ID from query parameters, if provided

  if (!userId) {
      // Return an error response if no user is logged in
      res.status(401).json({ error: "User not logged in" });
      return;
  }

  if (organizationId) {
      // Check if the user is part of the organization
      isUserInOrganization(userId, organizationId, req, res, function(isInOrganization) {
          if (isInOrganization) {
              // If the user is part of the organization, fetch events and updates
              getAllEventsAndUpdatesNEW(userId, organizationId, req, res);
          } else {
              // If the user is not part of the just get the public events
              getAllOrganizationEventsAndUpdates(organizationId, req, res);
          }
      });
  } else {
      // If no organization ID is provided, fetch events and updates without organization filter
      getAllEventsAndUpdatesNEW(userId, organizationId, req, res);
  }
});
function isUserInOrganization(userId, organizationId, req, res, callback) {
  req.pool.getConnection((err, connection) => {
      if (err) {
          console.error("Error: Could not connect to the database", err);
          res.sendStatus(500); // Internal Server Error
          return;
      }

      const query = `
          SELECT COUNT(*) AS count
          FROM user_organization
          WHERE user_id = ? AND organization_id = ?
      `;
      const params = [userId, organizationId];

      connection.query(query, params, (err1, results) => {
          connection.release(); // Release the connection back to the pool

          if (err1) {
              console.error("Error: Query failed", err1);
              res.sendStatus(500); // Internal Server Error
              return;
          }

          // Check if the user is in the organization
          const isInOrganization = results[0].count > 0;
          callback(isInOrganization);
      });
  });
}
function getAllOrganizationEventsAndUpdates(organizationId, req, res) {
    req.pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error: Could not connect to the database", err);
            res.sendStatus(500); // Internal Server Error
            return;
        }
        let query;
        let params;

            // If user is not logged in, fetch only public events and updates
            query = `
                SELECT * FROM (
                    SELECT 'event' AS type, e.event_id AS id, e.event_title AS title, e.description, e.date, e.location, e.post_date, NULL AS attendance
                    FROM events e
                    WHERE e.organization_id = ? AND e.members_only = 0

                    UNION ALL

                    SELECT 'update' AS type, u.update_id AS id, u.update_title AS title, u.description, u.date, NULL AS location, u.post_date, NULL AS attendance
                    FROM updates u
                    WHERE u.organization_id = ? AND u.members_only = 0
                ) AS combined
                ORDER BY post_date DESC;
            `;
            params = [organizationId, organizationId];

        connection.query(query, params, (err1, results) => {
            connection.release();  // Ensure that the connection is released after the query

            if (err1) {
                console.error("Error: Query failed", err1);
                res.sendStatus(500); // Internal Server Error
                return;
            }

            if (results.length > 0) {
                // The combined results are already ordered by post_date, so we can send them directly
                res.json(results);  // Send the combined results in a single JSON response
            } else {
                res.status(404).json([]);
            }
        });
    });
}
function getAllEventsAndUpdatesNEW(userId, organizationId, req, res) {
    req.pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error: Could not connect to the database", err);
            res.sendStatus(500); // Send Internal Server Error
            return;
        }

        let query;
        let params;

        if (organizationId) {
            query = `
                SELECT * FROM (
                    SELECT 'event' AS type, e.event_id AS id, e.event_title AS title, e.description, e.date, e.location, e.post_date, ue.attendance,
                           e.organization_id, o.name AS organization_name, o.organization_image
                    FROM events e
                    JOIN user_event ue ON e.event_id = ue.event_id
                    JOIN organizations o ON e.organization_id = o.organization_id
                    WHERE ue.user_id = ? AND e.organization_id = ?

                    UNION ALL

                    SELECT 'update' AS type, u.update_id AS id, u.update_title AS title, u.description, u.date, NULL AS location, u.post_date, NULL AS attendance,
                           u.organization_id, o.name AS organization_name, o.organization_image
                    FROM updates u
                    JOIN user_update uu ON u.update_id = uu.update_id
                    JOIN organizations o ON u.organization_id = o.organization_id
                    WHERE uu.user_id = ? AND u.organization_id = ?
                ) AS combined
                ORDER BY post_date DESC
            `;
            params = [userId, organizationId, userId, organizationId]; // Add organizationId to the params array
        } else {
            query = `
                SELECT * FROM (
                    SELECT 'event' AS type, e.event_id AS id, e.event_title AS title, e.description, e.date, e.location, e.post_date, ue.attendance,
                           e.organization_id, o.name AS organization_name, o.organization_image
                    FROM events e
                    JOIN user_event ue ON e.event_id = ue.event_id
                    JOIN organizations o ON e.organization_id = o.organization_id
                    WHERE ue.user_id = ?

                    UNION ALL

                    SELECT 'update' AS type, u.update_id AS id, u.update_title AS title, u.description, u.date, NULL AS location, u.post_date, NULL AS attendance,
                           u.organization_id, o.name AS organization_name, o.organization_image
                    FROM updates u
                    JOIN user_update uu ON u.update_id = uu.update_id
                    JOIN organizations o ON u.organization_id = o.organization_id
                    WHERE uu.user_id = ?
                ) AS combined
                ORDER BY post_date DESC
            `;
            params = [userId, userId]; // Only use userId in the params array
        }

        connection.query(query, params, (err1, results) => {
            connection.release(); // Release the connection back to the pool

            if (err1) {
                console.error("Error: Query failed", err1);
                res.sendStatus(500); // Internal Server Error
                return;
            }

            if (results.length > 0) {
                res.json(results); // Send events and updates as JSON
            } else {
                res.status(404).json([]); // No data found
            }
        });
    });
}

router.get('/check_auth', (req, res) => {
    if (req.session && req.session.user_id) {
        res.json({ authenticated: true });
    } else {
        res.json({ authenticated: false });
    }
});

router.get('/check_if_joined_organization', (req, res) => {
    const organizationId = req.query.organization_id;

    if (!organizationId) {
        return res.status(400).json({ error: 'Organization ID is required' });
    }

    if (req.session && req.session.user_id) {
        const userId = req.session.user_id;

        const query = `
            SELECT 1
            FROM user_organization
            WHERE user_id = ? AND organization_id = ?
            LIMIT 1
        `;

        req.pool.getConnection((err, connection) => {
            if (err) {
                console.error("Error connecting to the database", err);
                return res.status(500).send("Internal Server Error");
            }

            connection.query(query, [userId, organizationId], (err, results) => {
                connection.release();

                if (err) {
                    console.error("Error executing query", err);
                    return res.status(500).send("Internal Server Error");
                }

                if (results.length > 0) {
                    res.json({ authenticated: true, joined: true });
                } else {
                    res.json({ authenticated: true, joined: false });
                }
            });
        });
    } else {
        res.json({ authenticated: false, joined: false });
    }
});

router.get('/get_user_organizations', function(req, res) {
  const userId = req.session.user_id; // Extract user ID from session

  if (!userId) {
      // Return an error response if no user is logged in
      res.status(401).json({ error: "User not logged in" });
      return;
  }

  // Call function to fetch organizations
  getUserOrganizations(userId, req, res);
});
function getUserOrganizations(userId, req, res) {
  req.pool.getConnection((err, connection) => {
      if (err) {
          console.error("Error: Could not connect to the database", err);
          res.sendStatus(500); // Send Internal Server Error
          return;
      }

      const query = `
          SELECT o.organization_id, o.name, o.organization_image, o.body0, o.email, o.social_link0, o.social_link1, o.body1, o.body2, o.social_link2, uo.receive_emails
          FROM organizations o
          JOIN user_organization uo ON o.organization_id = uo.organization_id
          WHERE uo.user_id = ?
      `;

      const params = [userId];

      connection.query(query, params, (err1, results) => {
          connection.release(); // Release the connection back to the pool

          if (err1) {
              console.error("Error: Query failed", err1);
              res.sendStatus(500); // Internal Server Error
              return;
          }

          if (results.length > 0) {
              res.json(results); // Send organizations as JSON
          } else {
            res.status(404).json([]); // No data found
          }
      });
  });
}

router.post('/join_organization', function(req, res) {
    const userId = req.session.user_id;
    const orgId = req.body.organization_id;

    if (!userId || !orgId) {
        return res.status(400).send("User ID and Organization ID are required");
    }

    req.pool.getConnection(function(err, connection) {
        if (err) {
            console.error("Error connecting to the database", err);
            return res.status(500).send("Internal Server Error");
        }

        connection.beginTransaction(function(err) {
            if (err) {
                connection.release();
                console.error("Error starting transaction", err);
                return res.status(500).send("Internal Server Error");
            }

            const insertUserOrgQuery = `
                INSERT INTO user_organization (user_id, organization_id)
                VALUES (?, ?)
            `;

            connection.query(insertUserOrgQuery, [userId, orgId], function(err1, results) {
                if (err1) {
                    return connection.rollback(function() {
                        connection.release();
                        console.error("Error executing insertUserOrgQuery", err1);
                        return res.status(500).send("Internal Server Error");
                    });
                }

                const selectPublicEventsQuery = `
                    SELECT event_id
                    FROM events
                    WHERE organization_id = ?
                `;

                connection.query(selectPublicEventsQuery, [orgId], function(err2, eventResults) {
                    if (err2) {
                        return connection.rollback(function() {
                            connection.release();
                            console.error("Error executing selectPublicEventsQuery", err2);
                            return res.status(500).send("Internal Server Error");
                        });
                    }

                    const selectPublicUpdatesQuery = `
                        SELECT update_id
                        FROM updates
                        WHERE organization_id = ?
                    `;

                    connection.query(selectPublicUpdatesQuery, [orgId], function(err3, updateResults) {
                        if (err3) {
                            return connection.rollback(function() {
                                connection.release();
                                console.error("Error executing selectPublicUpdatesQuery", err3);
                                return res.status(500).send("Internal Server Error");
                            });
                        }

                        const insertUserEvents = () => {
                            if (eventResults.length === 0) {
                                return Promise.resolve();
                            }

                            const insertUserEventsQuery = `
                                INSERT INTO user_event (event_id, user_id)
                                VALUES ?
                            `;

                            const userEventsData = eventResults.map(event => [event.event_id, userId]);

                            return new Promise((resolve, reject) => {
                                connection.query(insertUserEventsQuery, [userEventsData], function(err4, eventInsertResults) {
                                    if (err4) {
                                        return connection.rollback(function() {
                                            connection.release();
                                            console.error("Error executing insertUserEventsQuery", err4);
                                            reject(err4);
                                        });
                                    }
                                    resolve();
                                });
                            });
                        };

                        const insertUserUpdates = () => {
                            if (updateResults.length === 0) {
                                return Promise.resolve();
                            }

                            const insertUserUpdatesQuery = `
                                INSERT INTO user_update (update_id, user_id)
                                VALUES ?
                            `;

                            const userUpdatesData = updateResults.map(update => [update.update_id, userId]);

                            return new Promise((resolve, reject) => {
                                connection.query(insertUserUpdatesQuery, [userUpdatesData], function(err5, updateInsertResults) {
                                    if (err5) {
                                        return connection.rollback(function() {
                                            connection.release();
                                            console.error("Error executing insertUserUpdatesQuery", err5);
                                            reject(err5);
                                        });
                                    }
                                    resolve();
                                });
                            });
                        };

                        Promise.all([insertUserEvents(), insertUserUpdates()])
                            .then(() => {
                                connection.commit(function(err) {
                                    if (err) {
                                        return connection.rollback(function() {
                                            connection.release();
                                            console.error("Error committing transaction", err);
                                            return res.status(500).send("Internal Server Error");
                                        });
                                    }

                                    connection.release();
                                    return res.send("User joined organization and associated events and updates added successfully");
                                });
                            })
                            .catch(err => {
                                console.error("Error during transaction", err);
                                return res.status(500).send("Internal Server Error");
                            });
                    });
                });
            });
        });
    });
});

// Used in organisation_manage.html to remove users from the organization
router.post('/leave_organization', function(req, res) {
    const userId = req.session.user_id;
    const orgId = req.body.organization_id;

    if (!userId || !orgId) {
        return res.status(400).send("User ID and Organization ID are required");
    }

    req.pool.getConnection(function(err, connection) {
        if (err) {
            console.error("Error connecting to the database", err);
            return res.status(500).send("Internal Server Error");
        }

        connection.beginTransaction(function(err) {
            if (err) {
                connection.release();
                console.error("Error starting transaction", err);
                return res.status(500).send("Internal Server Error");
            }

            const deleteUserOrgQuery = `
                DELETE FROM user_organization
                WHERE user_id = ? AND organization_id = ?
            `;

            connection.query(deleteUserOrgQuery, [userId, orgId], function(err1, results) {
                if (err1) {
                    return connection.rollback(function() {
                        connection.release();
                        console.error("Error executing deleteUserOrgQuery", err1);
                        return res.status(500).send("Internal Server Error");
                    });
                }

                if (results.affectedRows === 0) {
                    return connection.rollback(function() {
                        connection.release();
                        return res.status(404).send("User not found in this organization");
                    });
                }

                const deleteUserEventsQuery = `
                    DELETE ue
                    FROM user_event ue
                    JOIN events e ON ue.event_id = e.event_id
                    WHERE ue.user_id = ? AND e.organization_id = ?
                `;

                connection.query(deleteUserEventsQuery, [userId, orgId], function(err2, results2) {
                    if (err2) {
                        return connection.rollback(function() {
                            connection.release();
                            console.error("Error executing deleteUserEventsQuery", err2);
                            return res.status(500).send("Internal Server Error");
                        });
                    }

                    const deleteUserUpdatesQuery = `
                        DELETE uu
                        FROM user_update uu
                        JOIN updates u ON uu.update_id = u.update_id
                        WHERE uu.user_id = ? AND u.organization_id = ?
                    `;

                    connection.query(deleteUserUpdatesQuery, [userId, orgId], function(err3, results3) {
                        if (err3) {
                            return connection.rollback(function() {
                                connection.release();
                                console.error("Error executing deleteUserUpdatesQuery", err3);
                                return res.status(500).send("Internal Server Error");
                            });
                        }

                        connection.commit(function(err) {
                            if (err) {
                                return connection.rollback(function() {
                                    connection.release();
                                    console.error("Error committing transaction", err);
                                    return res.status(500).send("Internal Server Error");
                                });
                            }

                            connection.release();
                            return res.send("User removed successfully and associated events and updates deleted");
                        });
                    });
                });
            });
        });
    });
});

router.get('/get_name', function(req, res) {
    const userId = req.session.user_id; // Extract user ID from session

    if (!userId) {
        // Return an error response if no user is logged in
        res.status(401).json({ error: "User not logged in" });
        return;
    }

    // Call function to fetch user's display name
    req.pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error: Could not connect to the database", err);
            res.sendStatus(500); // Send Internal Server Error
            return;
        }

        const query = `
            SELECT display_name, user_image FROM users WHERE user_id = ?
        `;

        const params = [userId];

        connection.query(query, params, (err1, results) => {
            connection.release(); // Release the connection back to the pool

            if (err1) {
                console.error("Error: Query failed", err1);
                res.sendStatus(500); // Internal Server Error
                return;
            }

            if (results.length > 0) {
                const user = results[0];
                res.json({
                    display_name: user.display_name,
                    user_image: user.user_image
                }); // Send display name as JSON
            } else {
                res.status(404).json({ message: "No display name found" }); // No data found
            }
        });
    });
});

router.get('/get_user_info', function(req, res) {
    const userId = req.session.user_id; // Extract user ID from session

    if (!userId) {
        // Return an error response if no user is logged in
        res.status(401).json({ error: "User not logged in" });
        return;
    }

    // Call function to fetch user's display name
    req.pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error: Could not connect to the database", err);
            res.sendStatus(500); // Send Internal Server Error
            return;
        }

        const query = `
            SELECT * FROM users WHERE user_id = ?
        `;

        const params = [userId];

        connection.query(query, params, (err1, results) => {
            connection.release(); // Release the connection back to the pool

            if (err1) {
                console.error("Error: Query failed", err1);
                res.sendStatus(500); // Internal Server Error
                return;
            }

            if (results.length > 0) {
                res.json(results[0]); // Send display name as JSON
            } else {
                res.status(404).json({ message: "No display name found" }); // No data found
            }
        });
    });
});

router.get('/get_attendence', function(req, res) {
    const userId = req.session.user_id;
    const eventId = req.query.event_id;

    if (!userId || !eventId) {
        // Return an error response if no user is logged in
        res.status(401).json({ error: "User or Attendence not found" });
        return;
    }

    // Call function to fetch user's display name
    req.pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error: Could not connect to the database", err);
            res.sendStatus(500); // Send Internal Server Error
            return;
        }

        // SQL query to fetch attendance
        const query = `
            SELECT attendance FROM user_event WHERE user_id = ? AND event_id = ?
        `;

        // Parameters for the SQL query
        const params = [userId, eventId];

        // Execute the query
        connection.query(query, params, (err1, results) => {
            connection.release(); // Release the connection back to the pool

            if (err1) {
                console.error("Error: Query failed", err1);
                res.sendStatus(500); // Internal Server Error
                return;
            }

            if (results.length > 0) {
                res.json({ attendance: results[0].attendance }); // Send attendance data as JSON
            } else {
                res.status(404).json({ message: "Attendance data not found" }); // No data found
            }
        });
    });
});

router.post('/toggle_attendance', (req, res) => {
    const userId = req.session.user_id;
    const { eventId, isAttending } = req.body;

    if (!userId || !eventId) {
        return res.status(400).json({ error: "User ID and Event ID are required" });
    }

    req.pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error: Could not connect to the database", err);
            return res.sendStatus(500); // Internal Server Error
        }

        // Query to check if the user is part of the organization of the event
        const checkMembershipQuery = `
            SELECT 1
            FROM user_organization uo
            JOIN events e ON uo.organization_id = e.organization_id
            WHERE uo.user_id = ? AND e.event_id = ?
            LIMIT 1
        `;

        connection.query(checkMembershipQuery, [userId, eventId], (err1, results1) => {
            if (err1) {
                connection.release();
                console.error("Error: Query failed", err1);
                return res.sendStatus(500); // Internal Server Error
            }

            if (results1.length === 0) {
                connection.release();
                return res.status(403).json({ error: "User is not part of the organization for this event" });
            }

            // Query to update the attendance
            const updateAttendanceQuery = `
                UPDATE user_event
                SET attendance = ?
                WHERE user_id = ? AND event_id = ?
            `;

            const params = [isAttending ? 1 : 0, userId, eventId];

            connection.query(updateAttendanceQuery, params, (err2, results2) => {
                connection.release(); // Release the connection back to the pool

                if (err2) {
                    console.error("Error: Query failed", err2);
                    return res.sendStatus(500); // Internal Server Error
                }

                res.json({ message: "Attendance updated successfully" });
            });
        });
    });
});

router.delete('/delete', function(req, res) {
    const userId = req.session.user_id; // Retrieve user ID from the session
    const { password } = req.body; // Retrieve password from the request body

    if (!userId) {
        return res.status(400).json({ error: "User ID not found in session" });
    }

    if (!password) {
        return res.status(400).json({ error: "Password is required" });
    }

    req.pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error: Could not connect to the database", err);
            return res.sendStatus(500); // Internal Server Error
        }

        // Verify user password
        const getUserQuery = 'SELECT password FROM users WHERE user_id = ?';
        connection.query(getUserQuery, [userId], (err1, results) => {
            if (err1) {
                connection.release();
                console.error("Error: Query failed", err1);
                return res.sendStatus(500); // Internal Server Error
            }

            if (results.length === 0) {
                connection.release();
                return res.status(404).json({ error: "User not found" });
            }

            const storedPassword = results[0].password;

            if (password !== storedPassword) {
                connection.release();
                return res.status(401).json({ error: "Incorrect password" });
            }

            // Proceed with deletion
            connection.beginTransaction(err => {
                if (err) {
                    connection.release();
                    console.error("Error: Could not start transaction", err);
                    return res.sendStatus(500); // Internal Server Error
                }

                const deleteUserEvents = 'DELETE FROM user_event WHERE user_id = ?';
                const deleteUserOrganizations = 'DELETE FROM user_organization WHERE user_id = ?';
                const deleteUserUpdates = 'DELETE FROM user_update WHERE user_id = ?';
                const deleteUser = 'DELETE FROM users WHERE user_id = ?';

                connection.query(deleteUserEvents, [userId], (err1) => {
                    if (err1) {
                        return connection.rollback(() => {
                            connection.release();
                            console.error("Error: Could not delete from user_event", err1);
                            res.sendStatus(500); // Internal Server Error
                        });
                    }

                    connection.query(deleteUserOrganizations, [userId], (err2) => {
                        if (err2) {
                            return connection.rollback(() => {
                                connection.release();
                                console.error("Error: Could not delete from user_organization", err2);
                                res.sendStatus(500); // Internal Server Error
                            });
                        }

                        connection.query(deleteUserUpdates, [userId], (err3) => {
                            if (err3) {
                                return connection.rollback(() => {
                                    connection.release();
                                    console.error("Error: Could not delete from user_update", err3);
                                    res.sendStatus(500); // Internal Server Error
                                });
                            }

                            connection.query(deleteUser, [userId], (err4) => {
                                if (err4) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        console.error("Error: Could not delete from users", err4);
                                        res.sendStatus(500); // Internal Server Error
                                    });
                                }

                                connection.commit(err => {
                                    if (err) {
                                        return connection.rollback(() => {
                                            connection.release();
                                            console.error("Error: Could not commit transaction", err);
                                            res.sendStatus(500); // Internal Server Error
                                        });
                                    }

                                    req.session.destroy(err => {
                                        if (err) {
                                            console.error("Error: Could not destroy session", err);
                                            return res.sendStatus(500); // Internal Server Error
                                        }

                                        connection.release();
                                        res.sendStatus(200); // OK
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

router.delete('/delete_google', function(req, res) {
    const userId = req.session.user_id; // Retrieve user ID from the session

    if (!userId) {
        return res.status(400).json({ error: "User ID not found in session" });
    }

    req.pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error: Could not connect to the database", err);
            return res.sendStatus(500); // Internal Server Error
        }

        // Proceed with deletion
        connection.beginTransaction(err => {
            if (err) {
                connection.release();
                console.error("Error: Could not start transaction", err);
                return res.sendStatus(500); // Internal Server Error
            }

            const deleteUserEvents = 'DELETE FROM user_event WHERE user_id = ?';
            const deleteUserOrganizations = 'DELETE FROM user_organization WHERE user_id = ?';
            const deleteUserUpdates = 'DELETE FROM user_update WHERE user_id = ?';
            const deleteUser = 'DELETE FROM users WHERE user_id = ?';

            connection.query(deleteUserEvents, [userId], (err1) => {
                if (err1) {
                    return connection.rollback(() => {
                        connection.release();
                        console.error("Error: Could not delete from user_event", err1);
                        res.sendStatus(500); // Internal Server Error
                    });
                }

                connection.query(deleteUserOrganizations, [userId], (err2) => {
                    if (err2) {
                        return connection.rollback(() => {
                            connection.release();
                            console.error("Error: Could not delete from user_organization", err2);
                            res.sendStatus(500); // Internal Server Error
                        });
                    }

                    connection.query(deleteUserUpdates, [userId], (err3) => {
                        if (err3) {
                            return connection.rollback(() => {
                                connection.release();
                                console.error("Error: Could not delete from user_update", err3);
                                res.sendStatus(500); // Internal Server Error
                            });
                        }

                        connection.query(deleteUser, [userId], (err4) => {
                            if (err4) {
                                return connection.rollback(() => {
                                    connection.release();
                                    console.error("Error: Could not delete from users", err4);
                                    res.sendStatus(500); // Internal Server Error
                                });
                            }

                            connection.commit(err => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        console.error("Error: Could not commit transaction", err);
                                        res.sendStatus(500); // Internal Server Error
                                    });
                                }

                                req.session.destroy(err => {
                                    if (err) {
                                        console.error("Error: Could not destroy session", err);
                                        return res.sendStatus(500); // Internal Server Error
                                    }

                                    connection.release();
                                    res.sendStatus(200); // OK
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});


router.get('/check_login_status', (req, res) => {
    if (req.session.user_id) {
        res.json({ authenticated: true });
    } else {
        res.json({ authenticated: false });
    }
});

router.put('/edit_user', upload.single('user_image'), function(req, res) {
    const userId = req.session.user_id; // Retrieve user ID from the session
    const {
        display_name,
        username,
        password,
        email,
        phone_number,
        new_password,
        confirm_password
    } = req.body; // Retrieve fields from the request body

    const user_image = req.file ? req.file.buffer : null; // Retrieve the image file buffer

    if (!userId) {
        return res.status(400).json({ error: "User ID not found in session" });
    }

    // Validate email format
    if (email && !validator.isEmail(email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate password if changing password
    if (new_password || confirm_password) {
        if (new_password !== confirm_password) {
            return res.status(400).json({ error: "Passwords do not match" });
        }

        if (new_password.length < 8 || !validator.isStrongPassword(new_password, { minSymbols: 0 })) {
            return res.status(400).json({ error: "Password must be at least 8 characters long and contain a mix of letters and numbers" });
        }
    }

    // Validate display name
    if (display_name && !validator.isAlphanumeric(display_name.replace(/\s/g, ''))) {
        return res.status(400).json({ error: "Display name contains invalid characters" });
    }

    // Additional validation for other fields can be added here

    req.pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error: Could not connect to the database", err);
            return res.sendStatus(500); // Internal Server Error
        }

        // If sensitive fields are being changed, verify the current password
        if (username || new_password || email) {
            if (!password) {
                connection.release();
                return res.status(400).json({ error: "Current password is required to change username, password, or email" });
            }

            const getUserQuery = 'SELECT password FROM users WHERE user_id = ?';
            connection.query(getUserQuery, [userId], (err1, results) => {
                if (err1) {
                    connection.release();
                    console.error("Error: Query failed", err1);
                    return res.sendStatus(500); // Internal Server Error
                }

                if (results.length === 0) {
                    connection.release();
                    return res.status(404).json({ error: "User not found" });
                }

                const storedPassword = results[0].password;

                if (password !== storedPassword) {
                    connection.release();
                    return res.status(401).json({ error: "Confirmation password incorrect" });
                }

                // Proceed with updating fields
                updateUserFields(connection, userId, { display_name, username, new_password, email, phone_number, user_image }, res);
            });
        } else {
            // Proceed with updating fields if no sensitive fields are being changed
            updateUserFields(connection, userId, { display_name, username, new_password, email, phone_number, user_image }, res);
        }
    });
});
function updateUserFields(connection, userId, fields, res) {
    const { display_name, username, new_password, email, phone_number, user_image } = fields;
    const updates = [];
    const params = [];

    if (display_name) {
        updates.push('display_name = ?');
        params.push(display_name);
    }
    if (username) {
        updates.push('username = ?');
        params.push(username);
    }
    if (new_password) {
        updates.push('password = ?');
        params.push(new_password);
    }
    if (email) {
        updates.push('email = ?');
        params.push(email);
    }
    if (phone_number) {
        updates.push('phone_number = ?');
        params.push(phone_number);
    }
    if (user_image) {
        updates.push('user_image = ?');
        params.push(user_image);
    }

    if (updates.length === 0) {
        connection.release();
        return res.status(400).json({ error: "No valid fields to update" });
    }

    const query = `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`;
    params.push(userId);

    connection.query(query, params, (err, results) => {
        connection.release();

        if (err) {
            console.error("Error: Could not update user fields", err);
            return res.sendStatus(500); // Internal Server Error
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "User updated successfully" });
    });
}

router.post('/toggle_receive_emails', function(req, res) {
    const userId = req.session.user_id;
    const { organization_id, receive_emails } = req.body;

    if (!userId || !organization_id) {
        res.status(400).json({ error: "User ID and Organization ID are required" });
        return;
    }

    console.log("User ID:", userId);
    console.log("Organization ID:", organization_id);
    console.log("Receive Emails:", receive_emails);

    req.pool.getConnection(function(err, connection) {
        if (err) {
            console.error("Error connecting to the database", err);
            res.status(500).send("Internal Server Error");
            return;
        }

        const query = `
            UPDATE user_organization
            SET receive_emails = ?
            WHERE user_id = ? AND organization_id = ?
        `;

        connection.query(query, [receive_emails, userId, organization_id], function(err) {
            connection.release();
            if (err) {
                console.error("Error updating receive_emails", err);
                res.status(500).send("Internal Server Error");
                return;
            }

            res.status(200).send("Receive emails setting updated successfully");
        });
    });
});

router.get('/get_email_notification_status', (req, res) => {
    const userId = req.session.user_id;
    const orgId = req.query.organization_id;

    if (!userId) {
        return res.status(401).json({ error: 'User not logged in' });
    }

    if (!orgId) {
        return res.status(400).json({ error: 'Organization ID is required' });
    }

    req.pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to the database', err);
            return res.sendStatus(500);
        }

        const query = `
            SELECT receive_emails FROM user_organization
            WHERE user_id = ? AND organization_id = ?
        `;
        connection.query(query, [userId, orgId], (err1, results) => {
            connection.release();

            if (err1) {
                console.error('Error querying the database', err1);
                return res.sendStatus(500);
            }

            if (results.length > 0) {
                res.json(results[0]);
            } else {
                res.status(404).json({ error: 'Record not found' });
            }
        });
    });
});

router.post('/update_email_notification_status', (req, res) => {
    const userId = req.session.user_id;
    const { organization_id, receive_emails } = req.body;

    if (!userId) {
        return res.status(401).json({ error: 'User not logged in' });
    }

    if (!organization_id || typeof receive_emails !== 'number') {
        return res.status(400).json({ error: 'Invalid request' });
    }

    req.pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to the database', err);
            return res.sendStatus(500);
        }

        const query = `
            UPDATE user_organization
            SET receive_emails = ?
            WHERE user_id = ? AND organization_id = ?
        `;
        connection.query(query, [receive_emails, userId, organization_id], (err1, results) => {
            connection.release();

            if (err1) {
                console.error('Error updating the database', err1);
                return res.sendStatus(500);
            }

            res.json({ success: true });
        });
    });
});


module.exports = router;
