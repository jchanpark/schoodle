/*
 * All routes for homepage are defined here
 * Since this file is loaded in server.js into api/create,
 *   these routes are mounted onto /create
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

const createRouter = db => {

  /* GET request for /create/
     Homepage including create an event form */
  router.get('/', (req, res) => {
    // Error checking (if url passed in with ___Err set to true)
    const urlErr = req.query.urlErr ? 'Error: invalid URL' : '';
    const eventErr = req.query.eventErr ? 'Error: invalid event' : '';

    console.log("Getting /create/ ...");
    // Send user to home page
    const templateVars = { urlErr, eventErr };
    return res.render("index", templateVars);
  });

  /* Function to authenticate user, getting and/or setting cookie
     to save user email, and adding user to database if not already in db.
     This function returns an array [a user_id integer and a inDatabase boolean]. */
  const authUser = function(req) {
    return new Promise((resolve, reject) => {

      // Get or set cookie to authenticate event
      // Note: resets cookie to match provided email in form
      const user_email = req.body.email;
      req.session.user_id = user_email;

      // Check if user in db; if not, create user and return false
      let userExists = false;

      // Query DB to check if user exists
      const queryUserExists = `
      SELECT * FROM users WHERE email = $1
      ;`;
      db.query(queryUserExists, [user_email])
        .then(result => {
          if (result.rows.length) {
            userExists = true;
          }
          console.log("SELECT query result.rows:", result.rows, "User exists", userExists);
          console.log("Request body", req.body);
        // If user does not exist in db, insert new user and return new user id
          if (!userExists) {
            const queryUser = `
            INSERT INTO users (name, email)
            VALUES ($1, $2)
            RETURNING *
            ;`;
            return db.query(queryUser, [req.body.name, req.body.email])
              .then(resultInsert => {
                console.log("INSERT users result.rows:", resultInsert.rows);
                return resolve([resultInsert.rows[0].id, false]);
              });
          }
        // If user exists in db, return found user id
          console.log("Users found:", result.rows)
          return resolve([result.rows[0].id, true]);
        })
        .catch(err => {
          console.log("Error in validating user:", err.message);
        })

    });
  };

  /* POST request for /create
     Creating a new event
     index.ejs posts here       */
  router.post('/', (req, res) => {

    // Generate random string as unique id/url
    const url = generateRandomString(30);

<<<<<<< HEAD
    // Get or create user, and then return result from authUser
    authUser(req)
      .then(resultUserId => {
        const user_id = resultUserId[0];

        // Insert new event into events table
        const query = `
          INSERT INTO events (title, description, organizer_id, url)
          VALUES (
            $1, $2, $3, $4
          ) RETURNING *; `;
        const queryParams = [
          req.body.title,
          req.body.description,
          user_id,
          url
        ];
        console.log("Query:", query, queryParams);

        return db.query(query, queryParams)
      })
      .then(resultInsertEvent => {
        console.log('Event Created:', resultInsertEvent.rows);
        const eventID = resultInsertEvent.rows[0].id;
        // Insert all timeslots in timeslots array into table
        let queryTimeslots = `
          INSERT INTO timeslots (event_id, start_time, end_time)
          VALUES `; // insert multiple rows into timeslots table
        let x = 2;  // index to insert parameterized start and end dates
        let paramTimeslots = [eventID]; // init parameters with event id
        for (timeslot of req.body.timeslots) {  // loop through timeslots to generate query
          queryTimeslots += `
            ($1, $${x}, $${x+1}),`;
          x += 2;
          paramTimeslots.push(timeslot.startDate, timeslot.endDate);
        }
        queryTimeslots = queryTimeslots.slice(0, -1) + ` RETURNING *; `;

        console.log("Timeslot insert query:", queryTimeslots, paramTimeslots);
        return db.query(queryTimeslots, paramTimeslots);
      })
      .then(resultInsertTime => {
        console.log("Result of timeslot insert:", resultInsertTime.rows);

=======
    // Insert new event into events table
    const query = `
    INSERT INTO events (title, description, user_id, timeslots, url)
    VALUES (
      $1, $2, $3, $4, ${url}
    ) RETURNING *; `;
    const queryParams = [
      req.body.title,
      req.body.description,
      req.session.user_id,
      req.body.timeslots
    ];
    // TODO: to populate with request props
    console.log("Query:", query, queryParams);

    db.query(query, queryParams)
      .then(result => {
        console.log('Event Created:', result.rows);
>>>>>>> consol-ui
        return res.redirect(`/event/${url}`);
      })
      .catch(err => {
        console.log(`Error in creating event:`, err.message);
        res.redirect('/?eventErr=true'); // go back to index, with event error
      });

  });

  /* POST request for /create/:id
     Editing an existing event
     /event/:id posts here        */
  /*
  router.post('/:id', (req, res) => {
    const uid = req.params.id;

    // Get or create user, and then return result from authUser
    authUser(req)
      .then(resultAuth => {
        // check if user cookie same as db
        if (!resultAuth[1]) {
          throw 'userError';
        }
        return resultAuth[0];
      })
      .then(resultUserId => {
        console.log(resultUserId.rows);
        if (resultUserId.rows.length !== 1) {
          throw 'User not found';
        }
      })
      .catch(err => {
        console.log("Error in updating event:", err);
        return res.redirect('/?eventErr=true'); // go back to index, with event error
      })
    // Update event in table with new properties
      .then(result => {
        const queryEventUpdate = `
        UPDATE title = $2, description = $3
        FROM events
        WHERE url = $1; `;
        const queryTimeslotUpdate = `
        UPDATE start_time = $4, end_time = $5
        FROM timeslots JOIN events ON event_id = events.id
        WHERE events.url = $1; `;
        // Populate with info from HTML form
        const queryParams = [uid,
          req.body.title,
          req.body.description,
          req.body.start_time,
          req.body.end_time
        ];
        console.log("Query:", queryEventUpdate + queryTimeslotUpdate, queryParams);
        return db.query(queryEventUpdate + queryTimeslotUpdate, queryParams);
      })
      .then(result => {
        console.log(result.rows);
        return res.redirect(`/event/${uid}`); // redirect to specific event URL if successful
      })
      .catch(err => {
        console.log("Error in updating event:", err);
        return res.redirect('/?eventErr=true'); // go back to index, with event error
      });
  });
  */

  // Returns a random character string with upper, lower and numeric of user-defined length
  const generateRandomString = function(length) {
    return Buffer.from(Math.random().toString()).toString("base64").substr(10, length);
  }

  /* Return router with defined routes */
  return router;
}

module.exports = createRouter;
