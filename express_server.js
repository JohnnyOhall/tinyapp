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
const bcrypt = require("bcryptjs");
const {generateRandomString, httpCheck, getUserByEmail, urlsForUser} = require('./helpers');
const {urlDatabase, users} = require('./database')


// ----------------------------------- MIDDLEWARE ----------------------------------- //
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['charmander', 'squirtle', 'bulbasaur', 'pikachu'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


// Homepage
app.get("/", (req, res) => {
  const id = req.session.user;
  const user = users[id];

  if (!user) {
    return res.redirect('/login');
  }

  res.redirect('/urls');
});

// page to list all saved urls
app.get("/urls", (req, res) => {
  const id = req.session.user;
  const user = users[id];
  
  if (!user) {
    return res.redirect('/login');
  }
  
  const userUrls = urlsForUser(user, urlDatabase);
  const templateVars = { urls: userUrls, user};

  res.render("urls_index", templateVars);
});

// page to create new URL if not in database
app.get("/urls/new", (req, res) => {
  const id = req.session.user;
  const user = users[id];

  if (!user) {
    return res.redirect('/login');
  }

  const templateVars = {user};

  res.render("urls_new", templateVars);
});

// Specific summary page unique for each id
app.get("/urls/:id", (req, res) => {
  const id = req.session.user;
  const user = users[id];
  const paramId = req.params.id;
  const url404check = urlDatabase[paramId]

  if (!url404check) {
    return res.status(404).send('Error 404: TinyURL not found!');
  }

  if (!user) {
    return res.redirect('/login');
  }

  const userUrls = urlsForUser(user, urlDatabase);
  const longURL = userUrls[paramId];
  const templateVars = { id: paramId, longURL, user};

  res.render("urls_show", templateVars);
});

// Redirect to actual website using TinyApp short URL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id] ? urlDatabase[id].longURL : undefined;

  if (!longURL) {
    return res.status(404).send('Error 404: TinyURL not found!');
  }

  res.redirect(longURL);
});

// Register page to add user to database
app.get("/register", (req,res) => {
  const id = req.session.user;
  const user = users[id];

  if (user) {
    return res.redirect('/urls');
  }

  const templateVars = {user};

  res.render("urls_register", templateVars);
});

// Login Page
app.get("/login", (req, res) => {
  const id = req.session.user;
  const user = users[id];

  if (user) {
    return res.redirect('/urls');
  }

  const templateVars = {user};

  res.render("urls_login", templateVars);
});


// ----------------------------------- POST ROUTES ----------------------------------//

//------Delete short URL key------//
app.post("/urls/:id/delete", (req, res) => {
  const id = req.session.user;
  const user = users[id];

  if (!user) {
    return res.redirect('/login');
  }

  const paramId = req.params.id;
  const longURL = urlDatabase[paramId].longURL;
  let userUrls = urlsForUser(user, urlDatabase);


  if (!userUrls[paramId]) {
    return res.status(404).send('Error 404: TinyURL not found!');
  }

  delete urlDatabase[paramId];
  res.redirect('/urls');
});

//------Update existing URL with new LongURL------//
app.post("/urls/:id/update", (req, res) => {
  const id = req.session.user;
  const user = users[id];

  if (!user) {
    return res.redirect('/login');
  }
  
  const paramId = req.params.id;
  const editedUrl = req.body.editUrl;
  const userUrls = urlsForUser(user, urlDatabase);

  let longURL = userUrls[paramId].longURL;

  urlDatabase[paramId].longURL = httpCheck(editedUrl); // update long URL and checks for http

  res.redirect(`/urls`);

  longURL = urlDatabase[paramId].longURL; // update longURL variable after edit
});

//------Add new URL------//
app.post("/urls", (req, res) => {
  const id = req.session.user;
  const user = users[id];

  if (!user) {
    return res.redirect('/login');
  }

  const randomName = generateRandomString();
  const newLongUrl = req.body.longURL;

  urlDatabase[randomName] = {
    longURL: httpCheck(newLongUrl), // Adds new URL and checks for http
    userID: user.id 
  };

  res.redirect(`/urls/${randomName}`);
});

//------User Registration------//
app.post("/register", (req,res) => {
  const id = req.session.user;
  const user = users[id];

  if (user) {
    return res.redirect('/urls');
  }
  
  const email = req.body.email;
  const passwordText = req.body.password;

  if (!email || !passwordText) {
    res.status(400).send('Invalid Username/Address');
    return;
  }

  if (getUserByEmail(email, users)) {
    res.status(401).send('email already exists, please <a href="/login">login</a>.');
    return;
  }
  
  const newId = generateRandomString();
  const password = bcrypt.hashSync(passwordText);

  // Set new user to users object
  const newUser = {email, id: newId, password};
  users[newId] = newUser;

  req.session.user = newId; // Set user cookie in browser
  res.redirect('/urls');
});

//------Login requests------//
app.post("/login", (req, res) => {
  const id = req.session.user;
  const user = users[id];

  if (user) {
    return res.redirect('/urls');
  }
  
  // Set userID and email
  const email = req.body.email;
  const password = req.body.password;
  let registered = getUserByEmail(email, users);
 

  // Return 400 error if UserID/Email is not found in database
  if (!registered) {
    res.status(403).send('Email not found, please <a href="/register">Register</a> here.');
    return;
  }

  // Check if password matches database password
  if (!bcrypt.compareSync(password, users[registered].password)) {
    res.status(403).send('Invalid password');
    return;
  }

  // Successful Login, set cookie and redirect to /urls
  req.session.user = registered;
  res.redirect('/urls');
});

//------Logout requests------//
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});


// ---------------------------------- LISTEN ROUTES ---------------------------------//
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});