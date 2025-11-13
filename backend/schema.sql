USE valor;

DROP TABLE IF EXISTS divisions;
CREATE TABLE divisions
(
    id         SERIAL PRIMARY KEY,
    gender     VARCHAR(6)    NOT NULL CHECK (gender IN ('Male', 'Female')),
    name       VARCHAR(255)  NOT NULL,
    weight_max NUMERIC(5, 2) NOT NULL
);

INSERT INTO divisions (id, gender, name, weight_max)
VALUES (1, 'Male', 'Light', 165.00),
       (2, 'Male', 'Welter', 190.00),
       (3, 'Male', 'Light Heavy', 215.00),
       (4, 'Male', 'Heavy', 285.00),
       (5, 'Female', 'Flyweight', 125.00),
       (6, 'Female', 'Bantamweight', 145.00),
       (7, 'Female', 'Open/Heavy', 185.00);

-- Events table
DROP TABLE IF EXISTS events;
CREATE TABLE events
(
    id         SERIAL PRIMARY KEY,
    title      VARCHAR(255) NOT NULL,
    event_date DATE,
    location   VARCHAR(255),
    division   VARCHAR(255),
    status     VARCHAR(10) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'live'))
);

INSERT INTO events (id, title, event_date, location, division, status)
VALUES (1, 'Global Championship Finals', '2025-03-15', 'Las Vegas, USA', 'All Divisions', 'upcoming'),
       (2, 'Regional Qualifier - Europe', '2025-02-28', 'London, UK', 'Welterweight', 'upcoming'),
       (3, 'Women''s Championship', '2025-02-20', 'Tokyo, Japan', 'Women''s Divisions', 'upcoming'),
       (4, 'National Championship - Brazil', '2025-01-10', 'Rio de Janeiro, Brazil', 'All Divisions', 'completed');

-- Users table
DROP TABLE IF EXISTS users;
CREATE TABLE users
(
    id             SERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE,
    nonce          VARCHAR(255),
    nationality    VARCHAR(100),
    is_military    BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    email          VARCHAR(255) UNIQUE,
    password       VARCHAR(255),
    name           VARCHAR(255),
    user_type      VARCHAR(10) NOT NULL CHECK (user_type IN ('FIGHTER', 'SPONSOR', 'DONOR', 'FAN', 'ADMIN'))
);

-- Fighters table
DROP TABLE IF EXISTS fighters;
CREATE TABLE fighters
(
    id           SERIAL PRIMARY KEY,
    user_id      INT          REFERENCES users (id) ON DELETE SET NULL,
    name         VARCHAR(255) NOT NULL,
    country      VARCHAR(100),
    division     VARCHAR(100),
    weight       NUMERIC(5, 2),
    gender       VARCHAR(6) CHECK (gender IN ('male', 'female')),
    wins         INT         DEFAULT 0,
    losses       INT         DEFAULT 0,
    draws        INT         DEFAULT 0,
    image        VARCHAR(1024),
    ranking      INT,
    bio          TEXT,
    achievements JSON,
    sponsors     JSON,
    status       VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'inactive'))
);

-- Sponsors table
DROP TABLE IF EXISTS sponsors;
CREATE TABLE sponsors
(
    id            SERIAL PRIMARY KEY,
    user_id       INT UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    company_name  VARCHAR(255) NOT NULL,
    website       VARCHAR(255),
    logo_url      VARCHAR(255),
    contact_email VARCHAR(255) NOT NULL,
    description   TEXT,
    tier          VARCHAR(10) DEFAULT 'Partner' CHECK (tier IN ('Platinum', 'Gold', 'Silver', 'Bronze', 'Partner'))
);

-- Fights table
DROP TABLE IF EXISTS fights;
CREATE TABLE fights
(
    id          SERIAL PRIMARY KEY,
    event_id    INT REFERENCES events (id),
    fighter1_id INT REFERENCES fighters (id),
    fighter2_id INT REFERENCES fighters (id),
    winner_id   INT REFERENCES fighters (id),
    method      VARCHAR(10) NOT NULL CHECK (method IN ('KO/TKO', 'Submission', 'Decision', 'Draw')),
    round       INT,
    fight_date  DATE
);