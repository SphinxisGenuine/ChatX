CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE rooms(
   id SERIAL PRIMARY KEY,
   name TEXT NOT NULL
);
CREATE TABLE room_members(
   user_id INTEGER NOT NULL,
   room_id INTEGER NOT NULL,
   FOREIGN KEY(user_id) REFERENCES users(id),
   FOREIGN KEY(room_id) REFERENCES rooms(id),
   PRIMARY KEY(user_id,room_id)
);
CREATE TABLE messages(
id SERIAL PRIMARY KEY,
user_id INTEGER NOT NULL REFERENCES users(id), 
room_id INTEGER NOT NULL REFERENCES rooms(id),
content TEXT NOT NULL ,
created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_room_id
ON messages(room_id,created_at);
CREATE INDEX idx_room_members_room_id
ON room_members(room_id);
