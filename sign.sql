DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    signature TEXT not null,
    user_id INT not null,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS user_profiles;

CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    age INTEGER,
    city VARCHAR(100),
    url VARCHAR(100)
);

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first VARCHAR(100) not null,
    last VARCHAR(100) not null,
    email VARCHAR(250) not null,
    hashedpassword VARCHAR(250) not null,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
