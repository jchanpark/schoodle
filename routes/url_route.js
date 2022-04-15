/*
 * route for url page is defined here
 * Since this file is loaded in server.js into api/event,
 *   these routes are mounted onto /url
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

const urlRouter = db => {

  /* GET request for a specific /url/*/
     router.get("/", (req, res) => {
      url = 'http://localhost:8080/event/Q0NTc2NzkxNTM3'
      // Process returned data from database into template variables
      // const templateVars = { result: req.params.url };
      const templateVars = { result: url };
      console.log("Share Url", templateVars);
      // Go to event-specific page
      return res.render('url', templateVars);

    });


  /* Return router with defined routes */
  return router;
}

module.exports = urlRouter;
