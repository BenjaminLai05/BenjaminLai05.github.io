var express = require('express');
var router = express.Router();

router.get('/get_all_organizations', function(req, res, next) {
    req.pool.getConnection(function(err, connection) {
      if (err) {
        console.log("Error, could not connect to the Database");
        res.sendStatus(500);
        return;
      }

      const query = "SELECT * FROM organizations";
      connection.query(query, function(err1, results) {
        connection.release();
        if (err1) {
            console.error("Error: Query failed");
            res.status(500).send("Database query failed.");
            return;
        }

        res.status(200).json(results);
      });
    });
});

router.get('/get_cards', function(req, res, next) {
    req.pool.getConnection(function(err, connection) {
      if (err) {
        console.log("Error, could not connect to the Database");
        res.sendStatus(500);
        return;
      }

      const query = "SELECT organization_id, name, organization_image FROM organizations";
      connection.query(query, function(err1, results) {
        connection.release();
        if (err1) {
            console.error("Error: Query failed");
            res.status(500).send("Database query failed.");
            return;
        }

        res.status(200).json(results);
      });
    });
});

//Get organization info from /organizations/{:organization_id}
router.get('/info/:organization_id', (req, res) => {
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

                res.redirect(`/organisation_page.html?${queryParams}`);
            } else {
                // No results found for the given organization ID
                res.status(404).send("Organization not found"); // Not Found
            }
        });
    });
});

router.get('/page_info', (req, res) => {
    // Access the value of the query parameter 'organization_id' from the request object
    const organization_id = req.query.organization_id;

    if (!organization_id) {
        res.status(400).send("Organization ID is required"); // Bad Request
        return;
    }

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
                res.json(organization); // Send the organization data as JSON
            } else {
                // No results found for the given organization ID
                res.status(404).send("Organization not found"); // Not Found
            }
        });
    });
});

//Join organization POST request uses BODY
router.post('/join_organization', (req, res) => {
    const userId = req.session.user_id;
    const orgId = req.body.organization_id;

    if (!userId) {
        res.status(401).send("User not logged in");
        return;
    }

    if (!orgId) {
        res.status(400).send("Organization ID is required");
        return;
    }

    // Continue with the database operation
    joinOrganization(userId, orgId, res);
});
function joinOrganization(req, userId, orgId, res) {
    req.pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error, could not connect to the database");
            res.sendStatus(500); // Internal Server Error
            return;
        }

        const query = `
            INSERT INTO \`user_organization\` (user_id, organization_id)
            SELECT * FROM (SELECT ? AS user_id, ? AS organization_id) AS tmp
            WHERE NOT EXISTS (
                SELECT user_id FROM \`user_organization\`
                WHERE user_id = ? AND organization_id = ?
            ) LIMIT 1;
        `;

        connection.query(query, [userId, orgId, userId, orgId], (err1, results) => {
            connection.release();

            if (err1) {
                console.error("Error, query failed");
                res.sendStatus(500); // Internal Server Error
                return;
            }

            if (results.affectedRows > 0) {
                res.send("Joined organization successfully");
            } else {
                res.status(409).send("Already a member of this organization");
            }
        });
    });
}

//NOT TESTED!!!!!
router.post('/leave_organization', (req, res) => {
    const userId = req.session.user_id;
    const orgId = req.body.organization_id;

    if (!userId) {
        res.status(401).send("User not logged in");
        return;
    }

    if (!orgId) {
        res.status(400).send("Organization ID is required");
        return;
    }

    // Continue with the database operation
    leaveOrganization(userId, orgId, req, res);
});
function leaveOrganization(userId, orgId, req, res) {
    req.pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error, could not connect to the database");
            res.sendStatus(500); // Internal Server Error
            return;
        }

        const query = `
            DELETE FROM \`user_organization\`
            WHERE user_id = ? AND organization_id = ?;
        `;

        connection.query(query, [userId, orgId], (err1, results) => {
            connection.release();

            if (err1) {
                console.error("Error, query failed", err1);
                res.sendStatus(500); // Internal Server Error
                return;
            }

            if (results.affectedRows > 0) {
                res.send("Left organization successfully");
            } else {
                res.status(404).send("Membership not found or already left the organization");
            }
        });
    });
}

//Get all events in an organization uses QUERY
router.get('/get_all_organization_events_and_updates_public', function(req, res, next) {
    const organizationId = req.query.organization_id;  // Retrieve organization_id from the query parameters

    if (!organizationId) {
        // If organization_id is not provided, return an error response
        res.status(400).json({error: "Organization ID is required"});
        return;
    }

    // Fetching all related public events and updates
    getAllOrganizationEventsAndUpdates(organizationId, req, res);
});

function getAllOrganizationEventsAndUpdates(organizationId, req, res) {
    req.pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error: Could not connect to the database", err);
            res.sendStatus(500); // Internal Server Error
            return;
        }

        const userId = req.session.user_id; // Check if a user is logged in
        let query;
        let params;

        console.log("User logged in");

        if (userId) {
            // If user is logged in, check if they are apart of the organization
            console.log("User logged in");
            // Check if the user is part of the organization
            isUserInOrganization(userId, organizationId, req, res, function(isInOrganization) {
                if (isInOrganization) {
                    console.log("User is apart");
                    // If the user is part of the organization, fetch events and updates
                    getAllEventsAndUpdatesNEW(userId, organizationId, req, res);
                } else {
                    // If the user is not part of the just get the public events
                    console.log("User is not apart");
                    getAllOrganizationEventsAndUpdatesPublic(organizationId, req, res);
                }
            });
            return;
        } else {
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
        }

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
function getAllOrganizationEventsAndUpdatesPublic(organizationId, req, res) {
    req.pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error: Could not connect to the database", err);
            return res.sendStatus(500); // Internal Server Error
        }

        const query = `
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

        const params = [organizationId, organizationId];

        connection.query(query, params, (err1, results) => {
            connection.release();  // Ensure that the connection is released after the query

            if (err1) {
                console.error("Error: Query failed", err1);
                return res.sendStatus(500); // Internal Server Error
            }

            if (results.length > 0) {
                console.log("Public events and updates found");
                // The combined results are already ordered by post_date, so we can send them directly
                return res.json(results);  // Send the combined results in a single JSON response
            } else {
                console.log("No public events or updates found");
                return res.status(404).json([]);
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




//Get all managers of an organization uses QUERY
router.get('/get_all_managers_of_organization', function(req, res, next) {
    const organizationId = req.query.organization_id;  // Retrieve organization_id from the query parameters

    if (!organizationId) {
        // If organization_id is not provided, return an appropriate response
        res.status(400).send("Organization ID is required");
        return;
    }

    getAllManagersOfOrganization(req, organizationId, res);
});
function getAllManagersOfOrganization(req, organizationId, res) {
    req.pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error, could not connect to the database");
            res.sendStatus(500); // Internal Server Error
            return;
        }

        const query = `
        SELECT users.display_name, users.email, users.phone_number
        FROM \`users\`
        JOIN \`manager_organization\` ON \`users\`.\`user_id\` = \`manager_organization\`.\`user_id\`
        WHERE \`manager_organization\`.\`organization_id\` = ?;
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
                res.status(404).json([]);
            }
        });
    });
}



module.exports = router;