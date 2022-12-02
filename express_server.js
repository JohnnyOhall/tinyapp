////////////////////////////////////////////////////////////////////////////////////////
//                                                                                    //
//                 _______ _                      _____  _____                        //
//                 |__   __(_)               /\   |  __ \|  __ \                      //
//                    | |   _ _ __  _   _   /  \  | |__) | |__) |                     //
//                    | |  | | '_ \| | | | / /\ \ |  ___/|  ___/                      //
//                    | |  | | | | | |_| |/ ____ \| |    | |                          //
//                    |_|  |_|_| |_|\__, /_/    \_\_|    |_|                          //
//                                   __/ |                                            //
//                                  |___/                                             //
//                                                             By: John O'Halloran    //
////////////////////////////////////////////////////////////////////////////////////////



// -------------------------- GLOBAL VARIABLES && REQUIRES -------------------------- //
const express = require("express");
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080; // default port 8080
const serverMsg = console.log;
const bcrypt = require("bcryptjs");
const {generateRandomString, httpCheck, getUserByEmail} = require('./helpers');


// ----------------------------------- MIDDLEWARE ----------------------------------- //
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['charmander', 'squirtle', 'bulbasaur', 'pikachu'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))


// -------------------------------- GLOBAL FUNCTIONS -------------------------------- //
const urlsForUser = (user) => {
  let obj = {};
  
  for (const keys in urlDatabase) {
    if (urlDatabase[keys].userID === user.id) {
      obj[keys] = urlDatabase[keys];
    }
  }
  return obj;
};


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

// ----------------------------------- GET ROUTES -----------------------------------//

// Homepage
app.get("/", (req, res) => {
  res.send("Hello!");
  
  serverMsg('client is viewing homepage.');
});

app.listen(PORT, () => {
  serverMsg(`TinyApp listening on port ${PORT}!`);
});

// page to list all saved urls
app.get("/urls", (req, res) => {
  const id = req.session.user;
  const user = users[id];
  
  if (!user) {
    serverMsg(`Client is not logged-in, redirect to /login`);
    return res.redirect('/login');
  }
  
  const userUrls = urlsForUser(user);
  const templateVars = { urls: userUrls, user};

  res.render("urls_index", templateVars);

  serverMsg('Client is viewing URLs index');
});

// page to create new URL if not in database
app.get("/urls/new", (req, res) => {
  const id = req.session.user;
  const user = users[id];

  if (!user) {
    serverMsg(`Client is not logged-in, redirect to /login`);
    return res.redirect('/login');
  }

  const templateVars = {user};

  res.render("urls_new", templateVars);

  serverMsg('Client is viewing URL creation page');
});

// Specific summary page unique for each id
app.get("/urls/:id", (req, res) => {
  const id = req.session.user;
  const user = users[id];

  if (!user) {
    serverMsg(`Client is not logged-in, redirect to /login`);
    return res.redirect('/login');
  }

  const paramId = req.params.id;
  const userUrls = urlsForUser(user);
  const longURL = userUrls[paramId];
  const templateVars = { id: paramId, longURL, user};

  if (!longURL) {
    serverMsg(`client requested shortURL: ${paramId}. Does not exist, Error 404 sent`);
    return res.status(404).send('Error 404: TinyURL not found!');
  }

  res.render("urls_show", templateVars);

  serverMsg(`Client is viewing ${paramId} (${longURL.longURL}) summary page`);
});

// Redirect to actual website using TinyApp short URL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];

  if (!longURL) {
    return res.status(404).send('Error 404: TinyURL not found!');
  }

  serverMsg(`Client is being redircted: ${longURL}`);

  res.redirect(longURL);
});

// Register page to add user to database
app.get("/register", (req,res) => {
  const id = req.session.user;
  const user = users[id];

  if (user) {
    serverMsg(`Client is already logged in to: ${user.email}, redirect to /urls`);
    return res.redirect('/urls');
  }

  const templateVars = {user};

  res.render("urls_register", templateVars);

  serverMsg(`Client is veiwing urls/register`);
});

// Login Page
app.get("/login", (req, res) => {
  const id = req.session.user;
  const user = users[id];

  if (user) {
    serverMsg(`Client is already logged in, redirect to /urls`);
    return res.redirect('/urls');
  }

  const templateVars = {user};

  res.render("urls_login", templateVars);

  serverMsg('Client is viewing login page');
});



// ----------------------------------- POST ROUTES ----------------------------------//

//------Delete short URL key------//
app.post("/urls/:id/delete", (req, res) => {
  const id = req.session.user;
  const user = users[id];

  if (!user) {
    serverMsg(`Client is not logged-in, redirect to /login`);
    return res.redirect('/login');
  }

  const paramId = req.params.id;
  const longURL = urlDatabase[paramId].longURL;
  let userUrls = urlsForUser(user);


  if (!userUrls[paramId]) {
    return res.status(404).send('Error 404: TinyURL not found!');
  }

  serverMsg(`Client delete request for: ${paramId} (${longURL})`);

  delete urlDatabase[paramId]; // Delete requested item set by delete button
  res.redirect('/urls');

  serverMsg('Client is being redirected to: /urls/');
});

//------Update existing URL with new LongURL------//
app.post("/urls/:id/update", (req, res) => {
  const id = req.session.user;
  const user = users[id];

  if (!user) {
    serverMsg(`Client is not logged-in, redirect to /login`);
    return res.redirect('/login');
  }
  
  const paramId = req.params.id;
  const editedUrl = req.body.editUrl;
  const userUrls = urlsForUser(user);

  let longURL = userUrls[paramId].longURL;

  serverMsg(`Client update request for: ${paramId} (${longURL})`);

  urlDatabase[paramId].longURL = httpCheck(editedUrl); // update long URL and checks for http

  res.redirect(`/urls`); // redirect to URLs index

  longURL = urlDatabase[paramId].longURL; // update longURL variable after edit

  serverMsg(`New URL: ${paramId}(${longURL})`);
  serverMsg('Client is being redirected to: /urls/');
});

//------Add new URL------//
app.post("/urls", (req, res) => {
  const id = req.session.user;
  const user = users[id];

  if (!user) {
    serverMsg(`Client is not logged-in, redirect to /login`);
    return res.redirect('/login');
  }

  serverMsg(`Client request to add short url: ${req.body}`);

  const randomName = generateRandomString();
  const newLongUrl = req.body.longURL;

  urlDatabase[randomName] = {
    longURL: httpCheck(newLongUrl), // Adds new URL and checks for http
    userID: user.id // Assigns to logged in user
  };

  res.redirect(`/urls/${randomName}`);

  serverMsg('Client is being redirected to: /urls/');
});

//------User Registration------//
app.post("/register", (req,res) => {
  const id = req.session.user;
  const user = users[id];

  if (user) {
    serverMsg(`user is already logged in, redirect to '/urls'`);
    return res.redirect('/urls');
  }
  
  const email = req.body.email;
  const passwordText = req.body.password;

  if (!email || !passwordText) {
    serverMsg(`Server response 400: Invalid username/address entered: ${email, passwordText}`);
    res.status(400).send('Invalid Username/Address');
    return;
  }

  if (getUserByEmail(email, users)) {
    res.status(401).send('email already exists, please <a href="/login">login</a>.');
    serverMsg(`Server response 400: Email ${req.body.email} already exists`);
    return;
  }
  
  const newId = generateRandomString();
  const password = bcrypt.hashSync(passwordText);

  serverMsg(`User creation request for: @: ${email}`);

  // Set new user to users object
  const newUser = {email, id: newId, password};
  users[newId] = newUser;

  req.session.user = newId; // Set user cookie in browser
  res.redirect('/urls');

  serverMsg(`User ${email} created successfully, redirect to /urls.`);
});

//------Login requests------//
app.post("/login", (req, res) => {
  const id = req.session.user;
  const user = users[id];

  if (user) {
    serverMsg(`user is already logged in, redirect to '/urls'`);
    return res.redirect('/urls');
  }
  
  // Set userID and email
  const email = req.body.email;
  const password = req.body.password;
  let registered = getUserByEmail(email, users);
 

  // Return 400 error if UserID/Email is not found in database
  if (!registered) {
    res.status(403).send('Email not found, please <a href="/register">Register</a> here.');
    serverMsg(`client login attempt with email: ${email}, server error: 400, email does not exist`);
    return;
  }

  // Check if password matches database password
  if (!bcrypt.compareSync(password, users[registered].password)) {  //CHANGEHERE
    res.status(403).send('Invalid password');
    serverMsg('client entered invalid password, server error: 400');
    return;
  }

  // Successful Login, set cookie and redirect to /urls
  req.session.user = registered;
  res.redirect('/urls');

  serverMsg(`Login to user: ${registered} (${email}) [SUCCESS]. Redirecting to /urls`);
});

//------Logout requests------//
app.post("/logout", (req, res) => {
  serverMsg(`logout request`);
  
  req.session = null
  res.redirect('/login');

  serverMsg('Client is being redirected to: /login');
});

module.exports = {urlDatabase, users}