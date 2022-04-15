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
    SELECT attendances.id AS attend_id, timeslots.id AS time_id, *
    FROM events
      LEFT OUTER JOIN timeslots ON event_id = events.id
      LEFT OUTER JOIN attendances ON timeslot_id = timeslots.id
      LEFT OUTER JOIN users ON attendee_id = users.id
    WHERE url = $1
    ; `;

    const queryParams = [uid];

    db.query(query, queryParams)
      .then(result => {
        // Error check if anything went wrong
        // console.log("GET result:\n===============================\n");
        console.log("GET result:\n===============================\n", result.rows);
        if (!result.rows.length) {
          throw 'urlError';
        }
        // Process returned data from database into template variables\
        const timeslot_list = {};
        for (row of result.rows) {
          timeslot_list[row.time_id] = {
            start_time: row.start_time,
            end_time: row.end_time
          };
          // timeslot_list.push({
          //   timeslot_id: row.time_id,
          //   start_time: row.start_time,
          //   end_time: row.end_time
          // });

        }
        const templateVars = {
          result: result.rows,
          timeslot_list: timeslot_list,
          email: req.session.user_id
        };
        console.log("Template", templateVars);
        // Go to event-specific page
        return res.render('events', templateVars);
      })
      .catch(err => {
        // If no matches, return back to /event/ with error
        console.log("Error on GET /event/:id - ", err.message);
        return res.redirect('../create/?urlErr=true'); // go back to index, with url error
      });

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

  /* POST request for a specific event id to submit response */
  router.post("/:id", (req, res) => {
    let user_id = 0;
    console.log(`POST insert request on ${req.params.id}
     with payload: ${JSON.stringify(req.body)}`);

    // Get or set cookie for attendee
    authUser(req)
      .then(resultUserId => {
        user_id = resultUserId[0];

        //Check if event in db
        const queryEvent = `
        SELECT * FROM events
        WHERE url = $1
        ; `;
        const paramEvent = [req.params.id];
        console.log("Find event in db", queryEvent, paramEvent);

        return db.query(queryEvent, paramEvent)
      })
      .then(resultEventQ => {
        console.log('Checking if event in db:', resultEventQ.rows);
        // if no rows returned, event not in db and error
        if (!resultEventQ.rows.length) {
          console.log("Error: event not found in db")
          throw 'eventError';
        }
        return resultEventQ.rows[0].id;
      })
      .then(resultEventId => {
        console.log("Event id inserting into:", resultEventId);
        // Insert all attendances in attendances array into table
        let queryInsert = `
          INSERT INTO attendances (timeslot_id, attendee_id, attend)
          VALUES `; // insert multiple rows into attendances table
        let x = 1;  // index to insert parameterized start and end dates
        let paramInsert = [];
        for (attendance of req.body.attendances) {  // loop through timeslots to generate query
        // for (attendance of testPayload) {
          queryInsert += `
            ($${x}, $${x+1}, $${x+2}),`;
          x += 3;
          paramInsert.push(attendance.timeslot_id, user_id, attendance.attend);
        }
        queryInsert = queryInsert.slice(0, -1) + ` RETURNING *; `;

        console.log("Attendance insert query:", queryInsert, paramInsert);
        return db.query(queryInsert, paramInsert);
      })
      .then(resultInsertAttend => {
        console.log("Result of attendance insert:", resultInsertAttend.rows);
        // Return to event page
        return res.redirect(`/event/${req.params.id}`);
      })
      .catch(err => {
        console.log("Error on post /event/:id INSERT - ", err.message);
        return res.redirect('../create/?urlErr=true'); // go back to index, with url error
      });
  });

  /* POST request for a specific event id to edit response */
  router.post("/edit/:id", (req, res) => {
    let user_id_from_email = 0;
    console.log(`POST update request on ${req.params.id}
      with payload: ${JSON.stringify(req.body)}`);

    // const testPayload = [
    //   {attendance_id: 1329, attend: false},
    //   {attendance_id: 1330, attend: false}
    // ];

    // Check if email in cookie is in db, and get user id of email
    db.query('SELECT id FROM users WHERE email = $1;', [req.session.user_id])
      .then(resultUserId => {
        if (!resultUserId.rows.length) {
          console.log("Error: email not found in db");
          throw 'authErr';
        }
        user_id_from_email = resultUserId.rows[0].id;  // get user id based on email

    // Check if event in db
        return db.query('SELECT id FROM events WHERE url = $1;', [req.params.id])
      })
      .then(resultEventQ => {
        console.log('Checking if event in db:', resultEventQ.rows);
        // if no rows returned, event not in db and error
        if (!resultEventQ.rows.length) {
          console.log("Error: event not found in db")
          throw 'eventError';
        }
        // return event id based on url
        return resultEventQ.rows[0].id;
      })
      .then(resultEventId => {
    // Update attendance information provided for logged in user (cookie)
        console.log("Event id updating on:", resultEventId);
        // Update all attendances in attendances array into table
        let queryUpdate = []; // update multiple rows in attendances table
        let x = 1;  // index to insert parameterized start and end dates
        let paramUpdate = [];

        for (attendance of req.body.attendances) {  // loop through timeslots to generate query
        // for (attendance of testPayload) {

          queryUpdate.push(
            db.query(`UPDATE attendances
            SET attend = $1
            WHERE id = $2 RETURNING *`,
            [attendance.attend, attendance.attendance_id])
          );

        }

        // console.log("Attendance update query:", queryUpdate, paramUpdate);
        // return db.query(queryUpdate, paramUpdate);
        console.log("Attendance update queries:", JSON.stringify(queryUpdate));
        return Promise.all(queryUpdate);

      })
      .then(resultUpdateAttend => {
        console.log("Result of attendance update:", resultUpdateAttend.rows);
        // Return to event page
        return res.redirect(`/event/${req.params.id}`);
      })
      .catch(err => {
        console.log("Error on post /event/:id UPDATE - ", err.message);
        return res.redirect('../create/?urlErr=true'); // go back to index, with url error
      });


  });

  /* Return router with defined routes */
  return router;
}

module.exports = eventRouter;
