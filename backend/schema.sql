USE valor;

DROP TABLE IF EXISTS divisions;
CREATE TABLE divisions
(
    id          SERIAL PRIMARY KEY,
    gender      VARCHAR(6)    NOT NULL CHECK (gender IN ('male', 'female')),
    name        VARCHAR(255)  NOT NULL,
    min_weight  NUMERIC(5, 2) NOT NULL,
    max_weight  NUMERIC(5, 2) NOT NULL
);

INSERT INTO divisions (id, name) VALUES
(1, 'Lightweight'),
(2, 'Welterweight'),
(3, 'Light Heavyweight'),
(4, 'Heavyweight'),
(5, 'Flyweight'),
(6, 'Bantamweight'),
(7, 'Open/Heavyweight');

-- Insert values including both min and max weight
INSERT INTO divisions (gender, name, min_weight, max_weight)
VALUES
    ('male', 'Lightweight', 0.00, 165.00),
    ('male', 'Welterweight', 165.00, 190.00),
    ('male', 'Light Heavyweight', 190.00, 215.00),
    ('male', 'Heavyweight', 215.00, 285.00),
    ('female', 'Flyweight', 0.00, 125.00),
    ('female', 'Bantamweight', 125.00, 145.00),
    ('female', 'Open/Heavyweight', 145.00, 185.00);

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
    country    VARCHAR(100),
    is_military    BOOLEAN DEFAULT FALSE,
    created_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    email          VARCHAR(255) UNIQUE,
    password       VARCHAR(255),
    name           VARCHAR(255),
    user_type      VARCHAR(10) NOT NULL CHECK (user_type IN ('FIGHTER', 'SPONSOR', 'DONOR', 'FAN', 'ADMIN', 'GUEST'))
);

-- Fighters table
DROP TABLE IF EXISTS fighters;

CREATE TABLE fighters
(
    email          VARCHAR(255) UNIQUE,
    password       VARCHAR(255),
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    division VARCHAR(255),
    weight NUMERIC(6,2),
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    draws INT DEFAULT 0,
    image VARCHAR(500),
    ranking INT,
    bio TEXT,
    achievements JSONB DEFAULT '[]'::jsonb,
    sponsors JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'inactive')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    wallet_address VARCHAR(42) UNIQUE
);


-- Sponsors table
DROP TABLE IF EXISTS sponsors;
CREATE TABLE sponsors
(
    email          VARCHAR(255) UNIQUE,
    password       VARCHAR(255),
    id            SERIAL PRIMARY KEY,
    user_id       INT UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    company_name  VARCHAR(255) NOT NULL,
    logo_url      VARCHAR(255),
    description   TEXT,
    tier          VARCHAR(10) DEFAULT 'Partner' CHECK (tier IN ('Platinum', 'Gold', 'Silver', 'Bronze', 'Partner')),
    wallet_address VARCHAR(42) UNIQUE
);

-- Donors table
DROP TABLE IF EXISTS donors;
CREATE TABLE donors
(
    email          VARCHAR(255) UNIQUE,
    password       VARCHAR(255),
    id            SERIAL PRIMARY KEY,
    user_id       INT UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    logo_url      VARCHAR(255)
    wallet_address VARCHAR(42) UNIQUE
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

ALTER TABLE fighters DROP CONSTRAINT fighters_user_id_fkey;

ALTER TABLE fighters
ADD CONSTRAINT fighters_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);

SELECT setval(pg_get_serial_sequence('fighters', 'id'), coalesce(max(id), 0) + 1, false) FROM fighters;

ALTER TABLE fighters ADD COLUMN division_id INT;

ALTER TABLE sponsors
    DROP COLUMN IF EXISTS website,
DROP COLUMN IF EXISTS contact_email;

-- Add new columns
ALTER TABLE fighters
    ADD COLUMN email VARCHAR(255) UNIQUE,
    ADD COLUMN password VARCHAR(255),
    ADD COLUMN wallet_address VARCHAR(42) UNIQUE;


-- Add new columns
ALTER TABLE sponsors
    ADD COLUMN email VARCHAR(255) UNIQUE,
    ADD COLUMN password VARCHAR(255),
    ADD COLUMN wallet_address VARCHAR(42) UNIQUE;

-- Add new columns
ALTER TABLE donors
    ADD COLUMN wallet_address VARCHAR(42) UNIQUE;