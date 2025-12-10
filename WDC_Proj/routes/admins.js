/* eslint-disable no-console */

var express = require('express');
var router = express.Router();
var multer = require('multer');

var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

//MUST BE ADMIN
router.use((req, res, next) => {
    if (req.session.user_id) {
      // Check if the permission level is stored in the session
      if (req.session.permissionLevel >= 3) {
        next(); // Permission level is 3, proceed to the route
      } else {
        res.status(403).send('Forbidden: Insufficient permissions'); // Permission level is not 3, deny access
      }
    } else {
      // User is not logged in
      res.status(401).send('Unauthorized: Please log in'); // Unauthorized
    }
});

router.get('/', function(req, res, next) {
    res.send('Authorized: Admin permission found, no route supplied');
});

//EDIT ANY PART OF USER TAKES IN JSON
router.put('/edit_user', upload.single('user_image'), function(req, res) {
  const {
    userId, // Extract user ID from the request body
    displayName,
    username,
    email,
    phoneNumber,
    permission
  } = req.body;

  const userImage = req.file ? req.file.buffer : null;

  // Check for missing user ID
  if (!userId) {
    res.status(400).send("User ID is required");
    return;
  }

  // Check if at least one field to update is provided
  if (!displayName && !username && !email && !phoneNumber && !permission && !userImage) {
    res.status(400).send("At least one field to update is required");
    return;
  }

  req.pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error: could not connect to the database", err);
      res.sendStatus(500); // Internal Server Error
      return;
    }

    // Check if the user has a Google account
    connection.query('SELECT google_account FROM users WHERE user_id = ?', [userId], (err1, results) => {
      if (err1) {
        connection.release();
        console.error("Error: query failed", err1);
        res.sendStatus(500); // Internal Server Error
        return;
      }

      if (results.length === 0) {
        connection.release();
        res.status(404).send("User not found");
        return;
      }

      const googleAccount = results[0].google_account;

      // Build the query dynamically based on the provided fields
      let query = 'UPDATE users SET ';
      let params = [];
      if (displayName) {
        query += 'display_name = ?, ';
        params.push(displayName);
      }
      if (!googleAccount && username) {
        query += 'username = ?, ';
        params.push(username);
      }
      if (!googleAccount && email) {
        query += 'email = ?, ';
        params.push(email);
      }
      if (phoneNumber) {
        query += 'phone_number = ?, ';
        params.push(phoneNumber);
      }
      if (permission) {
        query += 'permission = ?, ';
        params.push(permission);
      }
      if (userImage) {
        query += 'user_image = ?, ';
        params.push(userImage);
      }

      // Remove the trailing comma and space
      query = query.slice(0, -2);

      // Add the WHERE clause
      query += ' WHERE user_id = ?';
      params.push(userId);

      connection.query(query, params, (err2, results) => {
        connection.release();
        if (err2) {
          console.error("Error: query failed", err2);
          res.sendStatus(500); // Internal Server Error
          return;
        }

        if (results.affectedRows > 0) {
          res.send("User updated successfully");
        } else {
          res.status(404).send("User not found");
        }
      });
    });
  });
});

router.delete('/delete_event/:eventId', function(req, res, next) {
  const userId = req.session.user_id;
  const eventId = req.params.eventId;

  if (!userId) {
      res.status(401).send("User not logged in");
      return;
  }

  checkEventExists(req, eventId, (eventExists) => {
      if (!eventExists) {
          res.status(404).send("Event not found");
          return;
      }

      deleteEvent(req, res, eventId);
  });
});
function checkEventExists(req, eventId, callback) {
  req.pool.getConnection((err, connection) => {
      if (err) {
          console.error("Error, could not connect to the database");
          callback(false);
          return;
      }

      const query = `
      SELECT 1
      FROM \`events\`
      WHERE \`event_id\` = ?;
      `;

      connection.query(query, [eventId], (err1, results) => {
          connection.release();

          if (err1) {
              console.error("Error, query failed", err1);
              callback(false);
              return;
          }

          callback(results.length > 0);
      });
  });
}
function deleteEvent(req, res, eventId) {
  req.pool.getConnection((err, connection) => {
      if (err) {
          console.error("Error, could not connect to the database");
          res.sendStatus(500); // Internal Server Error
          return;
      }

      connection.beginTransaction(err => {
          if (err) {
              console.error("Error, could not start transaction");
              res.sendStatus(500); // Internal Server Error
              return;
          }

          const deleteEventQuery = `
              DELETE FROM events WHERE event_id = ?;
          `;

          connection.query(deleteEventQuery, [eventId], (err1, results) => {
              if (err1) {
                  return connection.rollback(() => {
                      console.error("Error, query failed", err1);
                      res.sendStatus(500); // Internal Server Error
                  });
              }

              const deleteUserEventQuery = `
                  DELETE FROM user_event WHERE event_id = ?;
              `;

              connection.query(deleteUserEventQuery, [eventId], (err2) => {
                  if (err2) {
                      return connection.rollback(() => {
                          console.error("Error, query failed", err2);
                          res.sendStatus(500); // Internal Server Error
                      });
                  }

                  connection.commit(err => {
                      if (err) {
                          return connection.rollback(() => {
                              console.error("Error, could not commit transaction", err);
                              res.sendStatus(500); // Internal Server Error
                          });
                      }

                      res.status(200).send("Event deleted successfully");
                  });
              });
          });
      });
  });
}

router.delete('/delete_update/:updateId', function(req, res, next) {
  const userId = req.session.user_id;
  const updateId = req.params.updateId;

  if (!userId) {
      res.status(401).send("User not logged in");
      return;
  }

  checkUpdateExists(req, updateId, (updateExists) => {
      if (!updateExists) {
          res.status(404).send("Update not found");
          return;
      }

      deleteUpdate(req, res, updateId);
  });
});
function checkUpdateExists(req, updateId, callback) {
  req.pool.getConnection((err, connection) => {
      if (err) {
          console.error("Error, could not connect to the database");
          callback(false);
          return;
      }

      const query = `
      SELECT 1
      FROM \`updates\`
      WHERE \`update_id\` = ?;
      `;

      connection.query(query, [updateId], (err1, results) => {
          connection.release();

          if (err1) {
              console.error("Error, query failed", err1);
              callback(false);
              return;
          }

          callback(results.length > 0);
      });
  });
}
function deleteUpdate(req, res, updateId) {
  req.pool.getConnection((err, connection) => {
      if (err) {
          console.error("Error, could not connect to the database");
          res.sendStatus(500); // Internal Server Error
          return;
      }

      connection.beginTransaction(err => {
          if (err) {
              console.error("Error, could not start transaction");
              res.sendStatus(500); // Internal Server Error
              return;
          }

          const deleteUpdateQuery = `
              DELETE FROM updates WHERE update_id = ?;
          `;

          connection.query(deleteUpdateQuery, [updateId], (err1, results) => {
              if (err1) {
                  return connection.rollback(() => {
                      console.error("Error, query failed", err1);
                      res.sendStatus(500); // Internal Server Error
                  });
              }

              const deleteUserUpdateQuery = `
                  DELETE FROM user_update WHERE update_id = ?;
              `;

              connection.query(deleteUserUpdateQuery, [updateId], (err2) => {
                  if (err2) {
                      return connection.rollback(() => {
                          console.error("Error, query failed", err2);
                          res.sendStatus(500); // Internal Server Error
                      });
                  }

                  connection.commit(err => {
                      if (err) {
                          return connection.rollback(() => {
                              console.error("Error, could not commit transaction", err);
                              res.sendStatus(500); // Internal Server Error
                          });
                      }

                      res.status(200).send("Update deleted successfully");
                  });
              });
          });
      });
  });
}

router.post('/leave_organization', function(req, res) {
    const userId = req.body.user_id;
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

router.get('/get_all_users', (req, res) => {
    req.pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error: Could not connect to the database", err);
        res.sendStatus(500); // Internal Server Error
        return;
      }

      const query = 'SELECT * FROM users';

      connection.query(query, (err1, results) => {
        connection.release(); // Release the connection back to the pool

        if (err1) {
          console.error("Error: Query failed", err1);
          res.sendStatus(500); // Internal Server Error
          return;
        }

        res.json(results); // Send users as JSON
      });
    });
});

router.get('/get_all_organizations', (req, res) => {
    req.pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error: Could not connect to the database", err);
        res.sendStatus(500); // Internal Server Error
        return;
      }

      const query = 'SELECT * FROM organizations';

      connection.query(query, (err1, results) => {
        connection.release(); // Release the connection back to the pool

        if (err1) {
          console.error("Error: Query failed", err1);
          res.sendStatus(500); // Internal Server Error
          return;
        }

        res.json(results); // Send users as JSON
      });
    });
});

router.delete('/delete', function(req, res) {
    const { user_id } = req.body; // Retrieve user ID from the request body

    if (!user_id) {
        return res.status(400).json({ error: "User ID is required" });
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

            connection.query(deleteUserEvents, [user_id], (err1) => {
                if (err1) {
                    return connection.rollback(() => {
                        connection.release();
                        console.error("Error: Could not delete from user_event", err1);
                        res.sendStatus(500); // Internal Server Error
                    });
                }

                connection.query(deleteUserOrganizations, [user_id], (err2) => {
                    if (err2) {
                        return connection.rollback(() => {
                            connection.release();
                            console.error("Error: Could not delete from user_organization", err2);
                            res.sendStatus(500); // Internal Server Error
                        });
                    }

                    connection.query(deleteUserUpdates, [user_id], (err3) => {
                        if (err3) {
                            return connection.rollback(() => {
                                connection.release();
                                console.error("Error: Could not delete from user_update", err3);
                                res.sendStatus(500); // Internal Server Error
                            });
                        }

                        connection.query(deleteUser, [user_id], (err4) => {
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

router.post('/create_organization', upload.single('organization_image'), (req, res) => {
    const { name, body0, email, social_link0, social_link1, body1, body2, social_link2 } = req.body;
    const organization_image = req.file ? req.file.buffer : null;

    console.log('Uploaded file:', req.file); // Log the uploaded file

    // Check for required fields
    if (!name || !email) {
      return res.status(400).send("Name and Email are required fields");
    }

    if (organization_image && organization_image.length > 16 * 1024 * 1024) {
      return res.status(400).send("Image size exceeds the 16MB limit");
    }

    req.pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error: Could not connect to the database", err);
        return res.sendStatus(500);
      }

      const query = `
        INSERT INTO organizations (name, organization_image, body0, email, social_link0, social_link1, body1, body2, social_link2)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [name, organization_image, body0, email, social_link0, social_link1, body1, body2, social_link2];

      connection.query(query, params, (err1, results) => {
        connection.release();

        if (err1) {
          console.error("Error: Query failed", err1);
          return res.sendStatus(500);
        }

        console.log('Inserted organization:', results); // Log the inserted organization

        res.sendStatus(200);
      });
    });
});

router.delete('/delete_organization', (req, res) => {
    const { organization_id } = req.body;

    if (!organization_id) {
      return res.status(400).send("Organization ID is required");
    }

    req.pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error: Could not connect to the database", err);
        return res.sendStatus(500);
      }

      connection.beginTransaction(err => {
        if (err) {
          connection.release();
          console.error("Error: Could not start transaction", err);
          return res.sendStatus(500);
        }

        const queries = [
          { query: 'DELETE FROM user_update WHERE update_id IN (SELECT update_id FROM updates WHERE organization_id = ?)', params: [organization_id] },
          { query: 'DELETE FROM updates WHERE organization_id = ?', params: [organization_id] },
          { query: 'DELETE FROM user_event WHERE event_id IN (SELECT event_id FROM events WHERE organization_id = ?)', params: [organization_id] },
          { query: 'DELETE FROM events WHERE organization_id = ?', params: [organization_id] },
          { query: 'DELETE FROM user_organization WHERE organization_id = ?', params: [organization_id] },
          { query: 'DELETE FROM manager_organization WHERE organization_id = ?', params: [organization_id] },
          { query: 'DELETE FROM organizations WHERE organization_id = ?', params: [organization_id] },
        ];

        queries.reduce((promiseChain, currentQuery) => {
          return promiseChain.then(() => {
            return new Promise((resolve, reject) => {
              connection.query(currentQuery.query, currentQuery.params, (err, results) => {
                if (err) {
                  return reject(err);
                }
                resolve(results);
              });
            });
          });
        }, Promise.resolve()).then(results => {
          connection.commit(err => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                console.error("Error: Could not commit transaction", err);
                return res.sendStatus(500);
              });
            }
            connection.release();
            res.sendStatus(200);
          });
        }).catch(err => {
          connection.rollback(() => {
            connection.release();
            console.error("Error: Transaction failed", err);
            res.sendStatus(500);
          });
        });
      });
    });
});

router.put('/edit_organization', upload.single('organization_image'), (req, res) => {
    const { organization_id, name, body0, email, social_link0, social_link1, body1, body2, social_link2 } = req.body;
    const organization_image = req.file ? req.file.buffer : null;

    req.pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error: Could not connect to the database", err);
        return res.sendStatus(500);
      }

      let query = 'UPDATE organizations SET';
      const params = [];

      if (name) {
        query += ' name = ?,';
        params.push(name);
      }
      if (body0) {
        query += ' body0 = ?,';
        params.push(body0);
      }
      if (email) {
        query += ' email = ?,';
        params.push(email);
      }
      if (social_link0) {
        query += ' social_link0 = ?,';
        params.push(social_link0);
      }
      if (social_link1) {
        query += ' social_link1 = ?,';
        params.push(social_link1);
      }
      if (body1) {
        query += ' body1 = ?,';
        params.push(body1);
      }
      if (body2) {
        query += ' body2 = ?,';
        params.push(body2);
      }
      if (social_link2) {
        query += ' social_link2 = ?,';
        params.push(social_link2);
      }
      if (organization_image) {
        query += ' organization_image = ?,';
        params.push(organization_image);
      }

      if (params.length === 0) {
        return res.status(400).send("At least one field must be provided for update");
      }

      query = query.slice(0, -1);
      query += ' WHERE organization_id = ?';
      params.push(organization_id);

      connection.query(query, params, (err, results) => {
        connection.release();

        if (err) {
          console.error("Error: Query failed", err);
          return res.sendStatus(500);
        }

        res.sendStatus(200);
      });
    });
  });

router.post('/add_manager', function(req, res) {
    const { user_id, organization_id } = req.body;

    if (!user_id || !organization_id) {
        return res.status(400).json({ error: "User ID and Organization ID are required" });
    }

    req.pool.getConnection(function(err, connection) {
        if (err) {
            console.error("Error connecting to the database", err);
            return res.status(500).send("Internal Server Error");
        }

        const checkPermissionQuery = `
            SELECT permission FROM users WHERE user_id = ?
        `;

        connection.query(checkPermissionQuery, [user_id], function(err, results) {
            if (err) {
                connection.release();
                console.error("Error executing checkPermissionQuery", err);
                return res.status(500).send("Internal Server Error");
            }

            if (results.length === 0 || results[0].permission !== 2) {
                connection.release();
                return res.status(403).json({ error: "User does not have permission level 2" });
            }

            // Check if the user is already a manager for the organization
            const checkManagerQuery = `
                SELECT * FROM manager_organization WHERE user_id = ? AND organization_id = ?
            `;

            connection.query(checkManagerQuery, [user_id, organization_id], function(err, results) {
                if (err) {
                    connection.release();
                    console.error("Error executing checkManagerQuery", err);
                    return res.status(500).send("Internal Server Error");
                }

                if (results.length > 0) {
                    connection.release();
                    return res.status(400).json({ error: "User is already a manager for this organization" });
                }

                const addManagerQuery = `
                    INSERT INTO manager_organization (user_id, organization_id)
                    VALUES (?, ?)
                `;

                connection.query(addManagerQuery, [user_id, organization_id], function(err) {
                    connection.release();
                    if (err) {
                        console.error("Error executing addManagerQuery", err);
                        return res.status(500).send("Internal Server Error");
                    }

                    return res.status(200).send("User added as manager successfully");
                });
            });
        });
    });
});

router.post('/remove_manager', function(req, res) {
  const { user_id, organization_id } = req.body;

  if (!user_id || !organization_id) {
      return res.status(400).json({ error: "User ID and Organization ID are required" });
  }

  req.pool.getConnection(function(err, connection) {
      if (err) {
          console.error("Error connecting to the database", err);
          return res.status(500).send("Internal Server Error");
      }

      // Remove user as manager from the organization
      const removeManagerQuery = `
          DELETE FROM manager_organization
          WHERE user_id = ? AND organization_id = ?
      `;

      connection.query(removeManagerQuery, [user_id, organization_id], function(err) {
          connection.release();
          if (err) {
              console.error("Error executing removeManagerQuery", err);
              return res.status(500).send("Internal Server Error");
          }

          return res.status(200).send("User removed as manager successfully");
      });
  });
});

router.get('/get_managed_organizations', (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error: Could not connect to the database", err);
      return res.sendStatus(500); // Internal Server Error
    }

    const query = `
      SELECT o.organization_id, o.name
      FROM organizations o
      JOIN manager_organization mo ON o.organization_id = mo.organization_id
      WHERE mo.user_id = ?
    `;

    connection.query(query, [user_id], (err, results) => {
      connection.release(); // Release the connection back to the pool

      if (err) {
        console.error("Error: Query failed", err);
        return res.sendStatus(500); // Internal Server Error
      }

      res.json(results); // Send the managed organizations as JSON
    });
  });
});

router.get('/get_organizations_status', (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error: Could not connect to the database", err);
      return res.sendStatus(500); // Internal Server Error
    }

    const managedQuery = `
      SELECT o.organization_id, o.name, o.organization_image, 1 as is_managed
      FROM organizations o
      JOIN manager_organization mo ON o.organization_id = mo.organization_id
      WHERE mo.user_id = ?
    `;

    const unmanagedQuery = `
      SELECT o.organization_id, o.name, o.organization_image, 0 as is_managed
      FROM organizations o
      LEFT JOIN manager_organization mo ON o.organization_id = mo.organization_id AND mo.user_id = ?
      WHERE mo.user_id IS NULL
    `;

    connection.query(`${managedQuery} UNION ${unmanagedQuery}`, [user_id, user_id], (err, results) => {
      connection.release(); // Release the connection back to the pool

      if (err) {
        console.error("Error: Query failed", err);
        return res.sendStatus(500); // Internal Server Error
      }

      res.json(results); // Send the combined organizations as JSON
    });
  });
});


module.exports = router;