
CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  importance VARCHAR(20) DEFAULT 'Medium',
  user_id INTEGER,
  category VARCHAR(100)
);


CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255)
);


CREATE TABLE deleted_items (
  id SERIAL PRIMARY KEY,
  deleteditems INTEGER
);