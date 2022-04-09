/*
 * All routes for Events are defined here
 * Since this file is loaded in server.js into api/events,
 *   these routes are mounted onto /events
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

const attendeeRouter = db => {

  // GET request for /events/
  router.get('/', (req, res) => {

  });

  // GET request for a specific /event/:id using its unique id
  router.get("/:id", (req, res) => {

    const query = '';
    const queryParams = [];

    console.log(query);

    // query processing here
    db.query(query, queryParams)
      .then(response => {
        res.json(response.rows);
        // other data processing here
        // serach for event
        // if no matches, return back to /events/
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });



  return router;
}

module.exports = attendeeRouter;
