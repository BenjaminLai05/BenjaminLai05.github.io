

var express = require('express');
var router = express.Router();

router.use(express.json());

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'alliumnotifications@gmail.com',
        pass: 'agoe fqtg muzi ahno'
    }
});

// Function to send email notifications via nodemailer
function sendEmailNotification(organizationId, eventType, eventData, pool) {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error, could not connect to the database", err);
            return;
        }

        const orgQuery = `
            SELECT name FROM organizations WHERE organization_id = ?
        `;
        connection.query(orgQuery, [organizationId], (errOrg, orgResults) => {
            if (errOrg) {
                connection.release();
                console.error("Error: Query failed", errOrg);
                return;
            }

            if (orgResults.length > 0) {
                const organizationName = orgResults[0].name;

                const userQuery = `
                    SELECT users.email
                    FROM users
                    JOIN user_organization ON users.user_id = user_organization.user_id
                    WHERE user_organization.organization_id = ? AND user_organization.receive_emails = 1
                `;

                connection.query(userQuery, [organizationId], (err1, results) => {
                    connection.release();

                    if (err1) {
                        console.error("Error: Query failed", err1);
                        return;
                    }

                    if (results.length > 0) {
                        results.forEach(user => {
                            const mailOptions = {
                                from: 'alliumnotifications@gmail.com',
                                to: user.email,
                                subject: `New ${eventType} Created in ${organizationName}`,
                                text: `There is a new ${eventType}.\n\nTitle: ${eventData.title}\nDescription: ${eventData.description}\nDate: ${eventData.date}`
                            };

                            transporter.sendMail(mailOptions, (error, info) => {
                                if (error) {
                                    console.error("Error sending email: ", error);
                                } else {
                                    console.log('Email sent: ' + info.response);
                                }
                            });
                        });
                    }
                });
            }
        });
    });
}


//MUST BE MANAGER
router.use((req, res, next) => {
    if (req.session.user_id) {
        if (req.session.permissionLevel >= 2) {
            if (req.session.permissionLevel === 3) {
                req.pool.getConnection((err, connection) => {
                    if (err) {
                        console.error("Error: Could not connect to the database", err);
                        return res.sendStatus(500); // Internal Server Error
                    }

                    // Fetch all organizations
                    const getAllOrganizationsQuery = 'SELECT organization_id FROM organizations';
                    connection.query(getAllOrganizationsQuery, (err1, results) => {
                        if (err1) {
                            connection.release();
                            console.error("Error: Query failed", err1);
                            return res.sendStatus(500); // Internal Server Error
                        }

                        const userId = req.session.user_id;
                        const insertManagerOrganizationsQuery = 'INSERT IGNORE INTO manager_organization (user_id, organization_id) VALUES ?';
                        const managerOrganizations = results.map(org => [userId, org.organization_id]);

                        connection.query(insertManagerOrganizationsQuery, [managerOrganizations], (err2) => {
                            connection.release();
                            if (err2) {
                                console.error("Error: Could not insert into manager_organization", err2);
                                return res.sendStatus(500); // Internal Server Error
                            }
                            next(); // Proceed to the route
                        });
                    });
                });
            } else {
                next(); // Permission level is >= 2 but not exactly 3, proceed to the route
            }
        } else {
            res.status(403).send('Forbidden: Insufficient permissions'); // Permission level is less than 2, deny access
        }
    } else {
        // User is not logged in
        res.status(401).send('Unauthorized: Please log in'); // Unauthorized
    }
});
router.get('/', function (req, res, next) {
    res.send('Authorized: Manager permission found, no route supplied');
});


//Get organization info from /organizations/{:organization_id}
router.get('/manage/:organization_id', (req, res) => {
    // Access the value of the parameter 'organization_id' from the request object
    const organization_id = req.params.organization_id;

    // Now use 'organization_id' to retrieve data about the organization from the database
    req.pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error, could not connect to the Database");
            res.sendStatus(500); // Internal Server Error
            return;
        }

        const query = "SELECT * FROM organizations WHERE organization_id = ?";
        connection.query(query, [organization_id], (err1, results) => {
            connection.release(); // Always release the connection back to the pool

            if (err1) {
                console.error("Error, query failed");
                res.sendStatus(500); // Internal Server Error
                return;
            }

            if (results.length > 0) {
                // Send back the data for the organization
                const organization = results[0];
                const queryParams = new URLSearchParams({
                    id: organization.organization_id,
                }).toString();

                res.redirect(`/organisation_manage.html?${queryParams}`);
            } else {
                // No results found for the given organization ID
                res.status(404).send("Organization not found"); // Not Found
            }
        });
    });
});


// Route to check if the user is a manager of a specific organization
router.get('/check_user_manager_status', function (req, res) {
    const userId = req.session.user_id;
    const orgId = req.query.organization_id;

    if (!orgId) {
        res.status(400).json({ error: "Organization ID is required" });
        return;
    }

    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.error("Error connecting to the database", err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }

        // Join manager_organization with users to check permission level
        const query = `
            SELECT * FROM manager_organization
            INNER JOIN users ON manager_organization.user_id = users.user_id
            WHERE manager_organization.user_id = ?
            AND manager_organization.organization_id = ?
            AND users.permission >= 1
        `;

        connection.query(query, [userId, orgId], function (error, results) {
            connection.release();
            if (error) {
                console.error("Error executing query", error);
                res.status(500).json({ error: "Internal Server Error" });
                return;
            }

            if (results.length > 0) {
                res.json({ is_manager: true });
            } else {
                res.json({ is_manager: false });
            }
        });
    });
});


//Get all the organizations managed by the user uses SESSION
router.get('/get_all_managed_organizations', function (req, res, next) {
    const userId = req.session.user_id;

    if (!userId) {
        // If there's no user logged in, return an appropriate response
        res.status(401).send("User not logged in");
        return;
    }
    getAllManagedOrganizations(req, userId, res);
});
function getAllManagedOrganizations(req, userId, res) {
    req.pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error, could not connect to the database");
            res.sendStatus(500); // Internal Server Error
            return;
        }

        const query = `
        SELECT organizations.*
        FROM \`organizations\`
        JOIN \`manager_organization\` ON \`organizations\`.\`organization_id\` = \`manager_organization\`.\`organization_id\`
        WHERE \`manager_organization\`.\`user_id\` = ?;
        `;

        connection.query(query, [userId], (err1, results) => {
            connection.release();

            if (err1) {
                console.error("Error, query failed", err1);
                res.sendStatus(500); // Internal Server Error
                return;
            }

            if (results.length > 0) {
                res.json(results);
            } else {
                res.status(404).send("No organizations found");
            }
        });
    });
}

//Get all the users of current organization (checks if they are a manager of said organization) uses QUERY
router.get('/get_users_in_organization', function (req, res, next) {
    const userId = req.session.user_id;
    const organizationId = req.query.organization_id;

    if (!userId) {
        // If there's no user logged in, return an appropriate response
        res.status(401).send("User not logged in");
        return;
    }

    if (!organizationId) {
        // If organization_id is not provided, return an appropriate response
        res.status(400).send("Organization ID is required");
        return;
    }

    checkIfManager(req, userId, organizationId, res, next);
});
//checkIfManager uses getUsersInOrganization
function checkIfManager(req, userId, organizationId, res, next) {
    req.pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error, could not connect to the database");
            res.sendStatus(500); // Internal Server Error
            return;
        }

        const query = `
        SELECT 1
        FROM \`manager_organization\`
        WHERE \`user_id\` = ? AND \`organization_id\` = ?;
        `;

        connection.query(query, [userId, organizationId], (err1, results) => {
            if (err1) {
                connection.release();
                console.error("Error, query failed", err1);
                res.sendStatus(500); // Internal Server Error
                return;
            }

            if (results.length > 0) {
                // User is a manager, proceed to get users in the organization
                getUsersInOrganization(req, organizationId, res);
            } else {
                connection.release();
                // User is not a manager for the specified organization
                res.status(403).send("Forbidden: You are not a manager for this organization");
            }
        });
    });
}
function getUsersInOrganization(req, organizationId, res) {
    req.pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error, could not connect to the database");
            res.sendStatus(500); // Internal Server Error
            return;
        }

        const query = `
        SELECT users.user_id, users.display_name, users.email, users.phone_number
        FROM \`users\`
        JOIN \`user_organization\` ON \`users\`.\`user_id\` = \`user_organization\`.\`user_id\`
        WHERE \`user_organization\`.\`organization_id\` = ?;
        `;

        connection.query(query, [organizationId], (err1, results) => {
            connection.release();

            if (err1) {
                console.error("Error, query failed", err1);
                res.sendStatus(500); // Internal Server Error
                return;
            }

            if (results.length > 0) {
                res.json(results);
            } else {
                res.status(404).send("No users found for the given organization");
            }
        });
    });
}

function checkIfManagerCallback(userId, organizationId, req, res, callback) {
    req.pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error, could not connect to the database");
            res.sendStatus(500); // Internal Server Error
            return;
        }

        const query = `
            SELECT COUNT(*) AS count
            FROM manager_organization
            WHERE user_id = ? AND organization_id = ?
        `;
        connection.query(query, [userId, organizationId], (err1, results) => {
            connection.release();
            if (err1) {
                console.error("Error, query failed", err1);
                res.sendStatus(500); // Internal Server Error
                return;
            }
            callback(results[0].count > 0);
        });
    });
}
function getAllUserIdsInOrganization(organizationId, req, res, callback) {
    req.pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error, could not connect to the database");
            res.sendStatus(500); // Internal Server Error
            return;
        }

        const query = `
            SELECT user_id
            FROM user_organization
            WHERE organization_id = ?
        `;
        connection.query(query, [organizationId], (err1, results) => {
            connection.release();
            if (err1) {
                console.error("Error, query failed", err1);
                res.sendStatus(500); // Internal Server Error
                return;
            }
            callback(results.map(row => row.user_id));
        });
    });
}
function validateUserIds(userIds, req, res, callback) {
    req.pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error, could not connect to the database");
            res.sendStatus(500); // Internal Server Error
            return;
        }

        const query = `
            SELECT user_id
            FROM users
            WHERE user_id IN (?)
        `;
        connection.query(query, [userIds], (err1, results) => {
            connection.release();
            if (err1) {
                console.error("Error, query failed", err1);
                res.sendStatus(500); // Internal Server Error
                return;
            }
            callback(results.map(row => row.user_id));
        });
    });
}


//Takes in organization and gets all events and updates chronologically
router.get('/get_all_organization_events_and_updates', function (req, res, next) {
    const organizationId = req.query.organization_id;  // Retrieve organization_id from the query parameters
    const userId = req.session.user_id;

    if (!userId) {
        // If there's no user logged in, return an appropriate response
        res.status(401).send("User not logged in");
        return;
    }

    if (!organizationId) {
        // If organization_id is not provided, return an error response
        res.status(400).json({ error: "Organization ID is required" });
        return;
    }

    checkIfManagerCallback(userId, organizationId, req, res, function (isManager) {
        if (!isManager) {
            res.status(403).send("User is not a manager of this organization");
            return;
        }

        req.pool.getConnection((err, connection) => {
            if (err) {
                console.error("Error: Could not connect to the database", err);
                res.sendStatus(500); // Internal Server Error
                return;
            }

            const query = `
                SELECT * FROM (
                    SELECT 'event' AS type, e.event_id AS id, e.event_title AS title, e.description, e.date, e.location, e.post_date, ue.attendance, e.members_only
                    FROM events e
                    LEFT JOIN user_event ue ON e.event_id = ue.event_id
                    WHERE e.organization_id = ?

                    UNION ALL

                    SELECT 'update' AS type, u.update_id AS id, u.update_title AS title, u.description, u.date, NULL AS location, u.post_date, NULL AS attendance, u.members_only
                    FROM updates u
                    LEFT JOIN user_update uu ON u.update_id = uu.update_id
                    WHERE u.organization_id = ?
                ) AS combined
                ORDER BY post_date DESC;
            `;
            const params = [organizationId, organizationId];

            connection.query(query, params, (err1, results) => {
                connection.release();  // Ensure that the connection is released after the query

                if (err1) {
                    console.error("Error: Query failed", err1);
                    res.sendStatus(500); // Internal Server Error
                    return;
                }

                if (results.length > 0) {
                    res.json(results);  // Send the combined results in a single JSON response
                } else {
                    res.status(404).json([]);
                }
            });
        });
    });
});

//This route gets the attendence of user from a specific event id and organization id checks if user is a manager
router.get('/get_event_attendance', function (req, res) {
    const organizationId = req.query.organization_id;
    const eventId = req.query.event_id;
    const userId = req.session.user_id;

    if (!organizationId || !eventId) {
        res.status(400).json({ error: "Organization ID and Event ID are required" });
        return;
    }

    if (!userId) {
        res.status(401).json({ error: "User not logged in" });
        return;
    }

    // Check if the user is a manager of the organization
    checkIfManagerCallback(userId, organizationId, req, res, function (isManager) {
        if (!isManager) {
            res.status(403).send("User is not a manager of this organization");
            return;
        }

        // If the user is a manager, check if the event is associated with the organization
        req.pool.getConnection((err, connection) => {
            if (err) {
                console.error("Error: Could not connect to the database", err);
                res.sendStatus(500);
                return;
            }

            const checkEventQuery = `
                SELECT 1 FROM events WHERE event_id = ? AND organization_id = ?
            `;
            const checkEventParams = [eventId, organizationId];

            connection.query(checkEventQuery, checkEventParams, (err1, eventResults) => {
                if (err1) {
                    connection.release();
                    console.error("Error: Query failed", err1);
                    res.sendStatus(500);
                    return;
                }

                if (eventResults.length === 0) {
                    connection.release();
                    res.status(404).json({ message: "Event not associated with the organization" });
                    return;
                }

                // Event is associated with the organization, proceed to fetch attendance data
                const attendanceQuery = `
                    SELECT ue.attendance, u.display_name, u.email
                    FROM user_event ue
                    JOIN users u ON ue.user_id = u.user_id
                    WHERE ue.event_id = ?
                `;
                const attendanceParams = [eventId];

                connection.query(attendanceQuery, attendanceParams, (err2, results) => {
                    connection.release();

                    if (err2) {
                        console.error("Error: Query failed", err2);
                        res.sendStatus(500);
                        return;
                    }

                    if (results.length > 0) {
                        res.json(results); // Send the results as JSON
                    } else {
                        res.status(404).json({ message: "No attendance records found" }); // No data found
                    }
                });
            });
        });
    });
});

// Used in organisation_manage.html to remove users from the organization checks if user is a manager
router.post('/remove_user_from_organisation', function (req, res) {
    const callerId = req.session.user_id;

    const userId = req.body.user_id;
    const orgId = req.body.organization_id;

    if (!callerId) {
        res.status(401).json({ error: "User not logged in" });
        return;
    }

    if (!userId || !orgId) {
        return res.status(400).send("User ID and Organization ID are required");
    }

    checkIfManagerCallback(callerId, orgId, req, res, function (isManager) {
        if (!isManager) {
            res.status(403).send("User is not a manager of this organization");
            return;
        }

        //Removing user
        req.pool.getConnection(function (err, connection) {
            if (err) {
                console.error("Error connecting to the database", err);
                return res.status(500).send("Internal Server Error");
            }

            connection.beginTransaction(function (err) {
                if (err) {
                    connection.release();
                    console.error("Error starting transaction", err);
                    return res.status(500).send("Internal Server Error");
                }

                const deleteUserOrgQuery = `
                    DELETE FROM user_organization
                    WHERE user_id = ? AND organization_id = ?
                `;

                connection.query(deleteUserOrgQuery, [userId, orgId], function (err1, results) {
                    if (err1) {
                        return connection.rollback(function () {
                            connection.release();
                            console.error("Error executing deleteUserOrgQuery", err1);
                            return res.status(500).send("Internal Server Error");
                        });
                    }

                    if (results.affectedRows === 0) {
                        return connection.rollback(function () {
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

                    connection.query(deleteUserEventsQuery, [userId, orgId], function (err2, results2) {
                        if (err2) {
                            return connection.rollback(function () {
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

                        connection.query(deleteUserUpdatesQuery, [userId, orgId], function (err3, results3) {
                            if (err3) {
                                return connection.rollback(function () {
                                    connection.release();
                                    console.error("Error executing deleteUserUpdatesQuery", err3);
                                    return res.status(500).send("Internal Server Error");
                                });
                            }

                            connection.commit(function (err) {
                                if (err) {
                                    return connection.rollback(function () {
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
});

// Add event route
router.post('/add_organization_event', (req, res) => {
    const { title, description, date, location, organization_id, members_only } = req.body;
    const post_date = new Date().toISOString().slice(0, 19).replace('T', ' ');

    req.pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error connecting to the database", err);
            res.sendStatus(500);
            return;
        }

        const query = `
            INSERT INTO events (event_title, description, date, location, organization_id, members_only, post_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [title, description, date, location, organization_id, members_only, post_date];

        connection.query(query, params, (err1, results) => {
            if (err1) {
                connection.release();
                console.error("Error executing query", err1);
                res.sendStatus(500);
                return;
            }

            const userEventQuery = `
                INSERT INTO user_event (user_id, event_id)
                SELECT user_id, ? FROM user_organization WHERE organization_id = ?
            `;
            connection.query(userEventQuery, [results.insertId, organization_id], (err2) => {
                connection.release();
                if (err2) {
                    console.error("Error adding event to user_event", err2);
                    res.sendStatus(500);
                    return;
                }

                // Call the email notification function after successful event creation
                const newEvent = { title, description, date, location, organization_id, members_only, post_date };
                sendEmailNotification(organization_id, 'event', newEvent, req.pool);

                res.json({ success: true });
            });
        });
    });
});

// Add update route
router.post('/add_organization_update', (req, res) => {
    const { title, description, date, organization_id, members_only } = req.body;
    const post_date = new Date().toISOString().slice(0, 19).replace('T', ' ');

    req.pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error connecting to the database", err);
            res.sendStatus(500);
            return;
        }

        const query = `
            INSERT INTO updates (update_title, description, date, organization_id, members_only, post_date)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [title, description, date, organization_id, members_only, post_date];

        connection.query(query, params, (err1, results) => {
            if (err1) {
                connection.release();
                console.error("Error executing query", err1);
                res.sendStatus(500);
                return;
            }

            const userUpdateQuery = `
                INSERT INTO user_update (user_id, update_id)
                SELECT user_id, ? FROM user_organization WHERE organization_id = ?
            `;
            connection.query(userUpdateQuery, [results.insertId, organization_id], (err2) => {
                connection.release();
                if (err2) {
                    console.error("Error adding update to user_update", err2);
                    res.sendStatus(500);
                    return;
                }

                // Call the email notification function after successful update creation
                const newUpdate = { title, description, date, organization_id, members_only, post_date };
                sendEmailNotification(organization_id, 'update', newUpdate, req.pool);

                res.json({ success: true });
            });
        });
    });
});

router.post('/remove_organization_event', (req, res) => {
    const { event_id } = req.body;
    req.pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error connecting to the database", err);
            res.sendStatus(500);
            return;
        }

        // First, delete related rows in user_event
        const deleteUserEventsQuery = `DELETE FROM user_event WHERE event_id = ?`;
        connection.query(deleteUserEventsQuery, [event_id], (err1, results1) => {
            if (err1) {
                connection.release();
                console.error("Error executing query", err1);
                res.sendStatus(500);
                return;
            }

            // Then, delete the event
            const deleteEventQuery = `DELETE FROM events WHERE event_id = ?`;
            connection.query(deleteEventQuery, [event_id], (err2, results2) => {
                connection.release();
                if (err2) {
                    console.error("Error executing query", err2);
                    res.sendStatus(500);
                    return;
                }

                res.json({ success: true });
            });
        });
    });
});

router.post('/remove_organization_update', (req, res) => {
    const { update_id } = req.body;
    req.pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error connecting to the database", err);
            res.sendStatus(500);
            return;
        }

        // First, delete related rows in user_update
        const deleteUserUpdatesQuery = `DELETE FROM user_update WHERE update_id = ?`;
        connection.query(deleteUserUpdatesQuery, [update_id], (err1, results1) => {
            if (err1) {
                connection.release();
                console.error("Error executing query", err1);
                res.sendStatus(500);
                return;
            }

            // Then, delete the update
            const deleteUpdateQuery = `DELETE FROM updates WHERE update_id = ?`;
            connection.query(deleteUpdateQuery, [update_id], (err2, results2) => {
                connection.release();
                if (err2) {
                    console.error("Error executing query", err2);
                    res.sendStatus(500);
                    return;
                }

                res.json({ success: true });
            });
        });
    });
});

// Route to get all information about a specific event based on organization_id and event_id
router.get('/get_event_details', function (req, res) {
    const organizationId = req.query.organization_id;
    const eventId = req.query.event_id;
    const userId = req.session.user_id;

    if (!organizationId || !eventId) {
        res.status(400).json({ error: "Organization ID and Event ID are required" });
        return;
    }

    if (!userId) {
        res.status(401).json({ error: "User not logged in" });
        return;
    }

    // Check if the user is a manager of the organization
    checkIfManagerCallback(userId, organizationId, req, res, function (isManager) {
        if (!isManager) {
            res.status(403).send("User is not a manager of this organization");
            return;
        }

        req.pool.getConnection((err, connection) => {
            if (err) {
                console.error("Error: Could not connect to the database", err);
                res.sendStatus(500);
                return;
            }

            const query = `
                SELECT * FROM events WHERE event_id = ? AND organization_id = ?
            `;
            const params = [eventId, organizationId];

            connection.query(query, params, (err1, results) => {
                connection.release();
                if (err1) {
                    console.error("Error: Query failed", err1);
                    res.sendStatus(500);
                    return;
                }

                if (results.length > 0) {
                    res.json(results[0]);
                } else {
                    res.status(404).json({ message: "Event not found" });
                }
            });
        });
    });
});

// Route to get all information about a specific update based on organization_id and update_id
router.get('/get_update_details', function (req, res) {
    const organizationId = req.query.organization_id;
    const updateId = req.query.update_id;
    const userId = req.session.user_id;

    if (!organizationId || !updateId) {
        res.status(400).json({ error: "Organization ID and Update ID are required" });
        return;
    }

    if (!userId) {
        res.status(401).json({ error: "User not logged in" });
        return;
    }

    // Check if the user is a manager of the organization
    checkIfManagerCallback(userId, organizationId, req, res, function (isManager) {
        if (!isManager) {
            res.status(403).send("User is not a manager of this organization");
            return;
        }

        req.pool.getConnection((err, connection) => {
            if (err) {
                console.error("Error: Could not connect to the database", err);
                res.sendStatus(500);
                return;
            }

            const query = `
                SELECT * FROM updates WHERE update_id = ? AND organization_id = ?
            `;
            const params = [updateId, organizationId];

            connection.query(query, params, (err1, results) => {
                connection.release();
                if (err1) {
                    console.error("Error: Query failed", err1);
                    res.sendStatus(500);
                    return;
                }

                if (results.length > 0) {
                    res.json(results[0]);
                } else {
                    res.status(404).json({ message: "Update not found" });
                }
            });
        });
    });
});

// Route to update an event
router.post('/update_organization_event', (req, res) => {
    const { event_id, title, description, date, location } = req.body;
    const userId = req.session.user_id;

    if (!event_id || !title || !description || !date || !location) {
        return res.status(400).json({ error: "All fields are required" });
    }

    if (!userId) {
        return res.status(401).json({ error: "User not logged in" });
    }

    req.pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error, could not connect to the database");
            return res.sendStatus(500);
        }

        const query = `
            UPDATE events
            SET event_title = ?, description = ?, date = ?, location = ?
            WHERE event_id = ?
        `;

        connection.query(query, [title, description, date, location, event_id], (err, results) => {
            connection.release();

            if (err) {
                console.error("Error, query failed", err);
                return res.sendStatus(500);
            }

            if (results.affectedRows > 0) {
                res.json({ success: true });
            } else {
                res.status(404).json({ error: "Event not found or no changes made" });
            }
        });
    });
});

// Update an update
router.post('/update_organization_update', function (req, res) {
    const { update_id, title, description, date } = req.body;

    if (!update_id || !title || !description || !date) {
        res.status(400).json({ success: false, error: 'All fields are required' });
        return;
    }

    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.error("Error connecting to the database", err);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
            return;
        }

        const query = `
            UPDATE updates
            SET update_title = ?, description = ?, date = ?
            WHERE update_id = ?
        `;

        connection.query(query, [title, description, date, update_id], function (error, results) {
            connection.release();
            if (error) {
                console.error("Error executing query", error);
                res.status(500).json({ success: false, error: 'Internal Server Error' });
                return;
            }

            res.json({ success: true });
        });
    });
});


module.exports = router;