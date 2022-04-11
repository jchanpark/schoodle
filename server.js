// load .env data into process.env
require("dotenv").config();

// Web server config
const PORT = process.env.PORT || 8080;
const sassMiddleware = require("./lib/sass-middleware");
const express = require("express");
const app = express();
const morgan = require("morgan");

// PG database client/connection setup
const { Pool } = require("pg");
const dbParams = require("./lib/db.js");
const db = new Pool(dbParams);
db.connect();

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan("dev"));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(
  "/styles",
  sassMiddleware({
    source: __dirname + "/styles",
    destination: __dirname + "/public/styles",
    isSass: false, // false => scss, true => sass
  })
);

app.use(express.static("public"));

// Encrypted Cookies to identify Users
// Encrypted cookie parser
const cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  secret: "correct horse battery staple",
  // Cookie Options
  maxAge: 72 * 60 * 60 * 1000 // 72 hours
}))

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
// const usersRoutes = require("./routes/users");
// const widgetsRoutes = require("./routes/widgets");
const eventRoutes = require('./routes/events.js');
const createRoutes = require('./routes/create.js');

// Mount all resource routes
app.use('/api/create', createRoutes(db));
app.use('/api/events', eventRoutes(db));

// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).

/* Redirect root to /create/ home page*/
app.get("/", (req, res) => {
  res.redirect('/create');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

// Default router
