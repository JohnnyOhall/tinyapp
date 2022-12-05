// ------------------------------------ DATABASE -------------------------------------//

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "user3RandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user3RandomID",
  },
  b6rrxQ: {
    longURL: "https://www.nhl.com",
    userID: "userRandomID",
  },
  a3Bo69: {
    longURL: "https://www.msn.com",
    userID: "user2RandomID",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$keN6XU8IZIiJwRulJkaQReOEOUOhJ0z4a7WfhItb24hG7J/LkfedK",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$W7nV5z6oMyoA8TEhebdst.xGGGT88MRen7EMnsTZuNnfAEo262fK.",
  },
  user3RandomID: {
    id: "user3RandomID",
    email: "john.ohalloran@telus.com",
    password: "$2a$10$ebRI3yJk6dcTTSQOblyyOe0JNsqSKuEf0b129AWgfGTzKTWVpEo8W",
  },
};


module.exports = {urlDatabase, users}