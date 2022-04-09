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

    // set up middleware to check if an error occurred

    // send user to event page
    res.render("create");
  });

  /* POST request for /events
     Creating a new event */
  router.post('/', (req, res) => {

    // Set cookie to remember who's the organizer

    // Generate random string as unique id/url

    // Insert new event into events table
    const query = '';
    const queryParams = [];
    console.log(query);

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
    console.log(query);

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

  /* GET request for a specific /event/:id using its unique id */
  router.get("/:id", (req, res) => {

    // Query DB
    const query = '';
    const queryParams = [];
    console.log(query);

    // query processing here
    db.query(query, queryParams)
      .then(response => {
        res.json(response.rows[0]);
        // other data processing here
        // search for event
        const templateVars = {};
        // if event found, go to event page
        return res.render("event", templateVars);
        // if no matches, return back to /events/
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
    // Check if id is in database, if not error and send back to index

    // Set cookie

    // Query DB
    const query = '';
    const queryParams = [];
    console.log(query);

    // query processing here
    db.query(query, queryParams)
      .then(response => {
        res.json(response.rows);
        // other data processing here

        return res.redirect(`/events/${INSERT_UNIQUE_ID}`);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });


  /* Return router with defined routes */
  return router;
}

module.exports = attendeeRouter;
