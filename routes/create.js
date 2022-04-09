/*
 * All routes for Create are defined here
 * Since this file is loaded in server.js into api/create,
 *   these routes are mounted onto /create
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */


const express = require('express');
const router  = express.Router();

const createRouter = db => {

  router.get("/", (req, res) => {

    const query = '';
    const queryParams = [];

    console.log(query);

    // query processing here
    db.query(query, queryParams)
      .then(data => {
        const widgets = data.rows;
        res.json({ widgets });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });



  return router;
};

module.exports = createRouter;
