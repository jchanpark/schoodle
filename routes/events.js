/*
 * All routes for Events are defined here
 * Since this file is loaded in server.js into api/events,
 *   these routes are mounted onto /events
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

const attendeeRouter = db => {

  /* GET request for /event/ goes back to root*/
  router.get('/', (req, res) => {
    res.redirect('../');
  });

  /* GET request for a specific /event/:id using its unique id */
  router.get("/:id", (req, res) => {
    const uid = req.params.id;

    // Query DB
    const query = `
    SELECT * FROM events
    JOIN timeslots ON event_id = events.id
    JOIN attendances ON timeslot_id = attendances.id
    JOIN users ON attendee_id = users.id
    WHERE events.url = $1;
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
        // Process returned data from database into template variables
        const templateVars = response.rows[0];
        templateVars[cookie] = req.session.user_id;
        // Go to event-specific page
        return res.render(`events`, templateVars);
      })
      .catch(err => {
        // If no matches, return back to /events/ with error
        return res.redirect('../create/?urlErr=true'); // go back to index, with url error
      });

  });

  /* POST request for a specific event id to submit response */
  router.post("/:id", (req, res) => {

    // Get or set cookie for attendee
    let user_id = req.session.user_id;
    if (!user_id) {
      user_id = generateRandomString(30);
      req.session.user_id = user_id;
    }
    //Check if attendance_id is in database, if not error

    //Check if attendance_id matches an existing one, if so:
      //Check if visitor_id is the same as database's visitor_id, if not error


    // Query DB to submit or update attendance response
    const query = `

    `;
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
        return res.redirect('../create/?urlErr=true'); // go back to index, with url error
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
