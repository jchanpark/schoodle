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
     This function returns an integer user_id. */
  const authUser = function(req) {
    return new Promise((resolve, reject) => {

      // Get or set cookie to authenticate event
      // let user_email = req.session.user_id;
      // if (!user_email) {
      //   user_email = req.body.email;
      //   req.session.user_id = user_email;
      // }
      let user_email = req.body.email;

      // Check if user in db; if not, create user
      let userExists = false;
      // let user_id = 0;
      const queryUserExists = `
      SELECT * FROM users WHERE email = $1
      ;`;

      db.query(queryUserExists, [user_email])
        .then(result => {
          // console.log("First query result:", result);
          if (result.rows.length) {
            userExists = true;
          }
          if (!userExists) {
            const queryUser = `
            INSERT INTO users (name, email)
            VALUES ($1, $2)
            RETURNING *
            ;`;
            return db.query(queryUser, [req.body.name, req.body.email])
              .then(result2 => {
                console.log("User inserted:", result2.rows);
                return resolve(result2.rows[0].id);
              });
          }
          console.log("Users found:", result.rows)
          return resolve(result.rows[0].id);
        })
        // .then(result => {
        //   // if (userExists) {
        //   //   console.log("User found in database:", result.rows);
        //   //   return result.rowsid;
        //   // }
        //   console.log("Result of query:", result.rows[0].id);
        //   return result.rows[0].id;
        // })
        .catch(err => {
          console.log("Error in validating user:", err.message);
        })

    });
  };

  /* POST request for /create/
     Creating a new event
     index posts here */
  router.post('/', (req, res) => {

    // const auth = new Promise((res, rej) => {
    //   const user_id = authUser(req);
    //   res(user_id);
    // });
    // Get or create user and get user_id
    // const user_id = authUser(req);
    // console.log("Auth user:",authUser(req));

    authUser(req)
      // .then(result => {
      //   console.log("result of auth user", result);
      // })
      .then(result => {
        const user_id = result;

        // Generate random string as unique id/url
        const url = generateRandomString(30);

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
          .then(result => {
            console.log('Event Created:', result.rows);
            return res.redirect(`/event/${url}`);
          })
      })
      .catch(err => {
        console.log(`Error in creating event:`, err);
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
