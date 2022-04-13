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

  /* GET request for a specific /event/:id using its unique id
     returning an array of objects of SQL rows */
  router.get("/:id", (req, res) => {
    const uid = req.params.id;

    // Query DB for all information on the specified event
    const query = `
    SELECT *
    FROM attendances
      JOIN timeslots ON timeslot_id = timeslots.id
      JOIN users ON attendee_id = users.id
      JOIN events ON event_id = events.id
    WHERE url = $1
    ; `;

    const queryParams = [uid];
    // console.log("Query:", query, queryParams);

    db.query(query, queryParams)
      .then(result => {
        console.log("GET result:\n===============================\n",result.rows);
        // Error check if anything went wrong
        if (!result.rows.length) {
          throw 'urlError';
        }
        // Process returned data from database into template variables
        const templateVars = result.rows[0];
        // Go to event-specific page
        return res.render('events', templateVars);
      })
      .catch(err => {
        // If no matches, return back to /event/ with error
        console.log("Error on GET /event/:id - ", err.message);
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
    const queryEvent = `
    SELECT *
    FROM attendances
      JOIN timeslots ON timeslot_id = timeslots.id
      JOIN users ON attendee_id = users.id
      JOIN events ON event_id = events.id
    WHERE url = $1
    ; `;
    const paramEvent = [uid];

    db.query(queryEvent, paramEvent)
      .then(result => {
        console.log('Checking if event in db:', result.rows);
        // if no rows returned, event not in db and error
        if (!result.rows || !result.rows.length) {
          console.log("Error: event not found in db")
          throw 'eventError';
        }
        return result;
      })
      .then(result => {
        // Query DB to submit new attendance response
        const queryAttendences = `
        INSERT INTO attendances (timeslot_id, attendee_id, attend)
        VALUES ($1, $2, $3)
        RETURNING *
        ;`;
        // TODO??? may need to loop to insert multiple rows
        // const query
        console.log("req.body\n===============================\n", req.body);
        const queryParams = [
          req.body.timeslot_id,
          req.body.attendee_id,
          req.body.attend
        ];
        console.log("Query:", queryAttendences, queryParams);
        return db.query(queryAttendences, queryParams);
      })
      .then(result => {
        console.log("Result of insert", result.rows);
        // Return to event page
        return res.redirect(`/event/${uid}`);
      })
      .catch(err => {
        console.log("Error on post /event/:id INSERT - ", err.message);
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
    const queryEventUser = `
    SELECT *
    FROM attendances
      JOIN timeslots ON timeslot_id = timeslots.id
      JOIN users ON attendee_id = users.id
      JOIN events ON event_id = events.id
    WHERE users.email = $1
      AND attendances.id IN $2
      AND events.url = $3; `;
    const paramEventUser = [user_id, INSERT_ATTENDANCE_ARRAY, uid];
    console.log("Auth query:", queryEventUser, paramEventUser);

    db.query(queryEventUser, paramEventUser)
      .then(result => {
        console.log(result.rows);

        // Query DB to update attendance response
        const query = `
        UPDATE attend = $1
        FROM attendances
        WHERE id = $2
        RETURNING *
        ;`; // may need to update WHERE query
        const queryParams = [req.body.attend, req.body.attendances.id];

        return db.query("Query:", query, queryParams);
      })
      .then(result => {
        console.log("Update response:", result.rows);

        // Return to event page
        return result.redirect(`/event/${uid}`);
      })
      .catch(err => {
        console.log("Error on POST /event/:id UPDATE - ", err.message)
        return res.redirect('../create/?urlErr=true'); // go back to index, with url error
      });

  });

  // // Returns a random character string with upper, lower and numeric of user-defined length
  // const generateRandomString = function(length) {
  //   return Buffer.from(Math.random().toString()).toString("base64").substr(10, length);
  // }


  /* Return router with defined routes */
  return router;
}

module.exports = eventRouter;
