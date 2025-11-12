USE fight_league;

CREATE TABLE divisions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gender ENUM('Male', 'Female') NOT NULL,
    name VARCHAR(255) NOT NULL,
    weight_max DECIMAL(5, 2) NOT NULL
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wallet_address VARCHAR(42) NOT NULL UNIQUE,
    nonce VARCHAR(255),
    nationality VARCHAR(100),
    is_military BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fighters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    division_id INT,
    nationality VARCHAR(100),
    status ENUM('pending', 'verified', 'inactive') DEFAULT 'pending',
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (division_id) REFERENCES divisions(id)
);

INSERT INTO divisions (gender, name, weight_max) VALUES
('Male', 'Light', 165.00),
('Male', 'Welter', 190.00),
('Male', 'Light Heavy', 215.00),
('Male', 'Heavy', 285.00),
('Female', 'Flyweight', 125.00),
('Female', 'Bantamweight', 145.00),
('Female', 'Open/Heavy', 185.00);

CREATE TABLE sponsors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    website VARCHAR(255) NULL,
    logo_url VARCHAR(255) NULL,
    contact_email VARCHAR(255) NOT NULL,
    description TEXT NULL,
    tier ENUM('Platinum', 'Gold', 'Silver', 'Bronze', 'Partner') NOT NULL DEFAULT 'Partner',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);