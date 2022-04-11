/*
 * All routes for homepage are defined here
 * Since this file is loaded in server.js into api/create,
 *   these routes are mounted onto /create
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

const createEventRouter = db => {

  /* GET request for /create/
     Homepage including create an event form */
  router.get('/', (req, res) => {
    // Error checking (if url passed in with ___Err set to true)
    const urlErr = req.query.urlErr ? 'Error: invalid URL' : '';
    const eventErr = req.query.eventErr ? 'Error: invalid event' : '';

    // Send user to home page
    const templateVars = { urlErr, eventErr };
    res.render("index", templateVars);
  });


  /* POST request for /events
     Creating a new event
     Timeslots.html posts here */
  router.post('/', (req, res) => {

    // Get or set cookie to authenticate event
    let user_id = req.session.user_id;
    if (!user_id) {
      user_id = generateRandomString(30);
      req.session.user_id = user_id;
    }

    // Generate random string as unique id/url
    const url = generateRandomString(30);
    // Check db if string is unique; if so, regenerate
    const queryCheckId = `
    SELECT * FROM events WHERE url = ${url};
    `;
    let unique = false;
    while (!unique) {
      db.query(queryCheckId)
        .then(res => {
          if (res.rows.length) { // if url already in db
            url = generateRandomString(30);
          } else
          {
            unique = true;
          }
        })
        .catch(res => {
          return res
            .redirect('/?eventErr=true'); // go back to index, with event error
        });
    }

    // Insert new event into events table
    const query = `
    INSERT INTO events (title, description, user_id, timeslots_id, url)
    VALUES (
      $1, $2, $3, $4, ${url}
    ); `;
    const queryParams = [ , , , , ]; // to populate with request props
    console.log("Query:", query, queryParams);

    db.query(query, queryParams)
      .then(response => {
        // rs.json(response.rows);
        console.log('Event Created:', response.rows);
        return res.redirect(`/event/${url}`);
      })
      .catch(err => {
        console.log(`Error in updating event`,err);
        res.redirect('/?eventErr=true'); // go back to index, with event error
      });

  });

  /* POST request for /:id
     Editing an existing event */
  router.post('/:id', (req, res) => {

    // Check cookie if it's the creator
    let user_id = req.session.user_id;
    db.query('SELECT * FROM users WHERE id = $1', user_id)
      .then(res => {
        console.log(res.rows);
        if (res.rows.length !== 1) {
          throw 'User not found';
        }
      })
      .catch(res => {
        console.log("Error in updating event:",err);
        return res.redirect('/?eventErr=true'); // go back to index, with event error
      });

    // Update event in table with new properties
    const query = `
    UPDATE
    WHERE url = $2
    `;
    const queryParams = [ , req.params.id];
    console.log("Query:", query, queryParams);

    //query processing here
    db.query(query, queryParams)
      .then(res => {
        res.json(res.rows);
        //other data processing here
      })
      .catch(res => {
        console.log("Error in updating event",err);
        return res
          .redirect('/?eventErr=true'); // go back to index, with event error
      });

  });

  // Returns a random character string with upper, lower and numeric of user-defined length
  const generateRandomString = function(length) {
    return Buffer.from(Math.random().toString()).toString("base64").substr(10, length);
  }

  /* Return router with defined routes */
  return router;
}

module.exports = createEventRouter;
