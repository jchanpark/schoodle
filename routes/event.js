/*
 * All routes for Events are defined here
 * Since this file is loaded in server.js into api/event,
 *   these routes are mounted onto /event
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

const eventRouter = db => {

  /* GET request for /event/ goes back to root*/
  router.get('/', (req, res) => {
    res.redirect('../');
  });

  /* GET request for a specific /event/:id using its unique id */
  router.get("/:id", (req, res) => {
    const uid = req.params.id;

    // Query DB for all information on the specified event
    const query = `
    SELECT * FROM events
    JOIN timeslots ON event_id = events.id
    JOIN attendances ON timeslot_id = attendances.id
    JOIN users ON attendee_id = users.id
    WHERE events.url = $1;
    `;
    const queryParams = [uid];
    console.log("Query:", query, queryParams);

    db.query(query, queryParams)
      .then(response => {
        // Error check if anything went wrong
        if (!response.rows || response.rows.length !== 1) {
          throw 'urlError';
        }
        // Process returned data from database into template variables
        const templateVars = response.rows[0];
        // Go to event-specific page
        return res.render('event', templateVars);
      })
      .catch(err => {
        // If no matches, return back to /event/ with error
        console.log("Error on GET /event/:id");
        return res.redirect('../create/?urlErr=true'); // go back to index, with url error
      });

  });

  /* POST request for a specific event id to submit response */
  router.post("/:id", (req, res) => {
    const uid = req.params.id;

    // Get or set cookie for attendee
    let user_id = req.session.user_id;
    if (!user_id) {
      user_id = req.body.email;
      req.session.user_id = user_id;
    }

    //Check if event in db
    const queryEvent = `SELECT *
    FROM attendances
      JOIN users ON attendee_id = users.id
      JOIN timeslots ON timeslot_id = timeslots.id
      JOIN events ON event_id = events.id
    WHERE events.url = $1; `;
    const paramEvent = [uid];

    db.query(queryEvent, paramEvent)
      .then(res => {
        console.log('Checking if event in db', res.rows);
        // if no rows returned, event not in db and error
        if (!res.rows || !res.rows.length) {
          throw 'eventError';
        }
        return res;
      })
      .then(res => {
        // Query DB to submit new attendance response
        const query = `
        INSERT INTO attendances (timeslot_id, attendee_id, attend)
        VALUES ($1, $2, $3)
        ;`;
        // TODO??? may need to loop to insert multiple rows

        const queryParams = [res.body.timeslot_id, res.body.attendee_id, res.body.attend];

        console.log("Query:", query, queryParams);
        return db.query(query, queryParams);
      })
      .then(res => {
        console.log(res.rows);
        // Return to event page
        return res.redirect(`/event/${uid}`);
      })
      .catch(err => {
        console.log("Error on post /event/:id INSERT");
        return res.redirect('../create/?urlErr=true'); // go back to index, with url error
      });
  });

  /* POST request for a specific event id to edit response */
  router.post("/:id", (req, res) => {
    const uid = req.params.id;

    // Get or set cookie for attendee
    let user_id = req.session.user_id;
    if (!user_id) {
      user_id = req.body.email;
      req.session.user_id = user_id;
    }

    //Check if attendance_id is in database and user_id matches, if not error
    const queryEventUser = `SELECT *
    FROM attendances
      JOIN users ON attendee_id = users.id
      JOIN timeslots ON timeslot_id = timeslots.id
      JOIN events ON event_id = events.id
    WHERE users.email = $1
      AND attendances.id IN $2
      AND events.url = $3; `;
    const paramEventUser = [user_id, INSERT_ATTENDANCE_ARRAY, uid];
    console.log("Auth query:", queryEventUser, paramEventUser);

    db.query(queryEventUser, paramEventUser)
      .then(res => {
        console.log(res.rows);

        // Query DB to update attendance response
        const query = `
        UPDATE attend = $1
        FROM attendances
        WHERE id = $2
        ;`; // may need to update WHERE query
        const queryParams = [req.body.attend, req.body.attendances.id];

        return db.query("Query:", query, queryParams);
      })
      .then(res => {
        console.log("Update response:", res.rows);

        // Return to event page
        return res.redirect(`/event/${uid}`);
      })
      .catch(err => {
        console.log("Error on POST /event/:id UPDATE")
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

module.exports = eventRouter;
