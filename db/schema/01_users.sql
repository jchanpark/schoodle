
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS timeslots CASCADE;
DROP TABLE IF EXISTS attendances CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL
);

CREATE TABLE events (
  id SERIAL PRIMARY KEY NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  organizer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  url VARCHAR(255)
);

CREATE TABLE timeslots (
  id SERIAL PRIMARY KEY NOT NULL,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  start_time TIMESTAMP,
  end_time TIMESTAMP
);

CREATE TABLE attendances (
  id SERIAL PRIMARY KEY NOT NULL,
  timeslot_id INTEGER REFERENCES timeslots(id) ON DELETE CASCADE,
  attendee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  attend BOOLEAN
);
