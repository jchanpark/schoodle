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


  /* POST request for /create/
     Creating a new event
     index posts here */
  router.post('/', (req, res) => {

    // Get or set cookie to authenticate event
    let user_id = req.session.user_id;
    if (!user_id) {
      user_id = req.body.email;
      req.session.user_id = user_id;
    }

    // Generate random string as unique id/url
    const url = generateRandomString(30);

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
        return res.redirect(`/event/${url}`);
      })
      .catch(err => {
        console.log(`Error in updating event:`, err.message);
        res.redirect('/?eventErr=true'); // go back to index, with event error
      });

  });

  /* POST request for /create/:id
     Editing an existing event */
  router.post('/:id', (req, res) => {
    const uid = req.params.id;

    // Check cookie if it's the creator
    let user_id = req.session.user_id;
    const queryCookie = `
    SELECT *
    FROM users
    JOIN events ON organizer_id = users.id
    WHERE users.email = $1 AND events.url = $2
    ; `;
    const paramCookie = [user_id, uid];
    db.query(queryCookie, paramCookie)
      .then(result => {
        console.log(result.rows);
        if (result.rows.length !== 1) {
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

  // Returns a random character string with upper, lower and numeric of user-defined length
  const generateRandomString = function(length) {
    return Buffer.from(Math.random().toString()).toString("base64").substr(10, length);
  }

  /* Return router with defined routes */
  return router;
}

module.exports = createRouter;
