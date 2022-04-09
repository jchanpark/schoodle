/*
 * All routes for Events are defined here
 * Since this file is loaded in server.js into api/events,
 *   these routes are mounted onto /events
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

const attendeeRouter = db => {

  /* GET request for /events */
  router.get('/', (req, res) => {
    // Error checking (if url passed in with status='value')
    const status = req.query.status;
    const err = status === 'url' ? 'Error: invalid URL' : '';

    // Send user to home page
    const templateVars = {};
    res.render("index", templateVars);
  });


  /* POST request for /events
     Creating a new event */
  router.post('/', (req, res) => {

    // Set cookie to remember who's the organizer

    // Generate random string as unique id/url
    const uid = generateRandomString(30);
    // check database if it's unique, regenerate if so

    // Insert new event into events table
    const query = `
    INSERT INTO events (title, description, organizer_name, organizer_email, timeslots_id, url)
    VALUES (
      $1, $2, $3, $5, $5, ${uid}
    ); `;
    const queryParams = [ , , , , ]; // to populate with request props
    console.log("Query:", query, queryParams);

    // query processing here
    db.query(query, queryParams)
      .then(response => {
        res.json(response.rows);
        // other data processing here
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });

  });

  /* POST request for /events/edit
     Editing an existing event */
  router.post('/edit', (req, res) => {

    // Check cookie if it's the creator

    // Update event in table with new properties
    const query = '';
    const queryParams = [];
    console.log("Query:", query, queryParams);

    //query processing here
    db.query(query, queryParams)
      .then(response => {
        res.json(response.rows);
        //other data processing here
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });

  });

  /* GET request for a specific /event/:id using its unique id */
  router.get("/:id", (req, res) => {
    const uid = req.params.id;

    // Query DB
    const query = `
    SELECT * FROM events WHERE url = $1;
    `;
    const queryParams = [uid];
    console.log("Query:", query, queryParams);

    //query processing here
    db.query(query, queryParams)
      .then(response => {
        // Error check if anything went wrong
        if (!response.rows || response.rows.length !== 1) {
          throw 'error';
        }
        // Process returned data from database
        res.json(response.rows[0]);
        //other data processing here
        const templateVars = {};
        //if event found, go to event page
        return res.render(`events/${INSERT_UNIQUE_ID}`, templateVars);
        //if no matches, return back to /events/
        return res.render("events", templateVars);
      })
      .catch(err => {
        return res
          .status(500)
          .json({ error: err.message });
      });

  });

  /* POST request for a specific event id to submit response */
  router.post("/:id", (req, res) => {
    //Check if attendance_id is in database, if not error

    //Check if attendance_id matches an existing one, if so:
      //Check if visitor_id is the same as database's visitor_id, if not error

    //Set cookie if not set, otherwise existing cookie
    const visitor_id = req.session.visitor_id;
    if (!visitor_id) {
      visitor_id = generateRandomString(30);
      req.session.visitor_id = visitor_id;
    }


    // Query DB to submit or update attendance response
    const query = '';
    const queryParams = [];
    console.log("Query:", query, queryParams);

    //query processing here
    db.query(query, queryParams)
      .then(response => {
        res.json(response.rows);
        //other data processing here

        // Return to event page
        return res.redirect(`/events/${INSERT_UNIQUE_ID}`);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  // Returns a random character string with upper, lower and numeric of user-defined length
  const generateRandomString = function(length) {
    return Buffer.from(Math.random().toString()).toString("base64").substr(10, length);
  }


  /* Return router with defined routes */
  return router;
}

module.exports = attendeeRouter;
