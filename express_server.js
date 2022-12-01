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
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080
const serverMsg = console.log;


// ----------------------------------- MIDDLEWARE ----------------------------------- //
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// -------------------------------- GLOBAL FUNCTIONS -------------------------------- //

// Generates random 6 character string for new URL
const generateRandomString = () => {
  return ((Math.random() + 1) * 0x10000).toString(36).substring(6);
};

// Check if email stored in cookie is also in users database
const getUserByEmail = (req) => {
  if (req.cookies.user) {
    return req.cookies.user.id;
  } else {
    return {};
  }
};

// Function to check if user submitted URL has http:// or https://
const httpCheck = (newURL) => {
  if (newURL.slice(0,8) === 'https://' || newURL.slice(0,7) === 'http://') {
    return newURL;  // do not add https:// if already included in address
  } else {
    return `https://${newURL}`;  // check if contains http: already
  }
};

// Function to check if invalid form submission was sent in POST
const invalidCheck = (req, res) => {
  const email = req.body.email
  const password = req.body.password

  if (!email || !password) {
    serverMsg(`Server response 400: Invalid username/address entered: ${email, password}`);
    res.status(400).send('Invalid Username/Address');
    return;
  }
};

//Check if user email exists in database and returns userID if it does
const registeredCheck = (input) => {
  for (const user in users) {
    if (input === users[user].email) {
      return user;
    }
  }
};

// Check if user is logged in using cookie and checking credentials
const loggedIn = (req) => {
  if (!req.cookies.user) {
    return false;
  }

  const emailCookie = req.cookies.user.email;
  const passwordCookie = req.cookies.user.password;

  if (!registeredCheck(emailCookie)) {
    return false;
  }

  const userID = registeredCheck(emailCookie);

  if (users[userID].password !== passwordCookie) {
    return false;
  }

  return true;
};

// Function to check URLs linked to userID and return them.
const userDB = (user) => {
  let obj = {}
  for (const keys in urlDatabase){
    if (urlDatabase[keys].userID === user.id){
      obj[keys] = urlDatabase[keys]
    }    
  }
  return obj
}


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
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  user3RandomID: {
    id: "user3RandomID",
    email: "john.ohalloran@telus.com",
    password: "1234",
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

// urls JSON output page
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);

  serverMsg('client is viewing urlDatabase.json file');
});

// page to list all saved urls
app.get("/urls", (req, res) => {
  if (!loggedIn(req)) {
    serverMsg(`Client is not logged-in, redirect to /login`);
    return res.redirect('/login');
  }

  const user = users[getUserByEmail(req)];
  const userUrls = userDB(user)
  const templateVars = { urls: userUrls, user};

  res.render("urls_index", templateVars);

  serverMsg('Client is viewing URLs index');
});

// page to create new URL if not in database
app.get("/urls/new", (req, res) => {
  if (!loggedIn(req)) {
    serverMsg(`Client is not logged-in, redirect to /login`);
    return res.redirect('/login');
  }

  const user = users[getUserByEmail(req)];
  const templateVars = {user};

  res.render("urls_new", templateVars);

  serverMsg('Client is viewing URL creation page');
});

// Specific summary page unique for each id
app.get("/urls/:id", (req, res) => {
  if (!loggedIn(req)) {
    serverMsg(`Client is not logged-in, redirect to /login`);
    return res.redirect('/login');
  }

  const id = req.params.id;
  const user = users[getUserByEmail(req)];
  const userUrls = userDB(user)
  const longURL = userUrls[id];
  const templateVars = { id, longURL, user};

  if (!longURL) {
    serverMsg(`client requested shortURL: ${id}. Does not exist, Error 404 sent`)
    return res.status(404).send('Error 404: TinyURL not found!');
  }

  res.render("urls_show", templateVars);

  serverMsg(`Client is viewing ${id} (${longURL.longURL}) summary page`);
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
  if (loggedIn(req)) {
    serverMsg(`Client is already logged in to: ${user.email}, redirect to /urls`);
    return res.redirect('/urls');
  }

  const user = users[getUserByEmail(req)];
  const templateVars = {user};

  res.render("urls_register", templateVars);

  serverMsg(`Client is veiwing urls/register`);
});

// Login Page
app.get("/login", (req, res) => {
  if (loggedIn(req)) {
    serverMsg(`Client is already logged in to: ${user.email}, redirect to /urls`);
    return res.redirect('/urls');
  }
  
  const user = users[getUserByEmail(req)];
  const templateVars = {user};

  res.render("urls_login", templateVars);

  serverMsg('Client is viewing login page');
});



// ----------------------------------- POST ROUTES ----------------------------------//

//------Delete short URL key------//
app.post("/urls/:id/delete", (req, res) => {
  
  if (!loggedIn(req)) {
    serverMsg(`Client is not logged-in, redirect to /login`);
    return res.redirect('/login');
  }
  
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  const user = users[getUserByEmail(req)];
  let userUrls = {}

  for (const keys in urlDatabase){
    if (urlDatabase[keys].userID === user.id){
      userUrls[keys] = urlDatabase[keys]
    }    
  }

  if (!userUrls[id]){
    return res.status(404).send('Error 404: TinyURL not found!');
  } 


  serverMsg(`Client delete request for: ${id} (${longURL})`);

  delete urlDatabase[id]; // Delete requested item set by delete button
  res.redirect('/urls');

  serverMsg('Client is being redirected to: /urls/');
});

//------Update existing URL with new LongURL------//
app.post("/urls/:id/update", (req, res) => {
  
  if (!loggedIn(req)) {
    serverMsg(`Client is not logged-in, redirect to /login`);
    return res.redirect('/login');
  }
  
  const id = req.params.id;
  const user = users[getUserByEmail(req)];
  const editedUrl = req.body.editUrl;
  const userUrls = userDB(user)

  let longURL = userUrls[id].longURL;

  serverMsg(`Client update request for: ${id} (${longURL})`);

  urlDatabase[id].longURL = httpCheck(editedUrl); // update long URL and checks for http

  res.redirect(`/urls`); // redirect to URLs index

  longURL = urlDatabase[id].longURL; // update longURL variable after edit

  serverMsg(`New URL: ${id}(${longURL})`);
  serverMsg('Client is being redirected to: /urls/');
});

//------Add new URL------//
app.post("/urls", (req, res) => {

  if (!loggedIn(req)) {
    serverMsg(`Client is not logged-in, redirect to /login`);
    return res.redirect('/login');
  }

  serverMsg(`Client request to add short url: ${req.body}`);


  const randomName = generateRandomString();
  const newLongUrl = req.body.longURL
  const user = users[getUserByEmail(req)]

  
  urlDatabase[randomName] = {
    longURL: httpCheck(newLongUrl), // Adds new URL and checks for http
    userID: user.id // Assigns to logged in user
  }

  res.redirect(`/urls/${randomName}`);

  serverMsg('Client is being redirected to: /urls/');
});

//------User Registration------//
app.post("/register", (req,res) => {
  invalidCheck(req, res);
  
  const email = req.body.email;
  const password = req.body.password;
  const randomID = generateRandomString();

  if (registeredCheck(email)) {
    res.status(401).send('email already exists, please <a href="/login">login</a>.');
    serverMsg(`Server response 400: Email ${req.body.email} already exists`);
    return;
  }

  serverMsg(`User creation request for: @: ${email} P: ${password}`);

  // Set new user to users object
  users[randomID] = {
    id: randomID,
    email,
    password // <-- Not sure if needed
  };

  res.cookie('user', users[randomID]); // Set user cookie in browser
  res.redirect('/urls');

  serverMsg(`User ${email} created successfully, redirect to /urls.`);
});

//------Login requests------//
app.post("/login", (req, res) => {

  // check if post input is valid
  invalidCheck(req, res);

  // Set userID and email
  const email = req.body.email;
  const password = req.body.password;
  let userID = registeredCheck(email);

  // Return 400 error if UserID/Email is not found in database
  if (!userID) {
    res.status(403).send('Email not found, please <a href="/register">Register</a> here.');
    serverMsg(`client login attempt with email: ${email}, server error: 400, email does not exist`);
    return;
  }

  // Check if password matches database password
  if (users[userID].password !== password) {
    res.status(403).send('Invalid password');
    serverMsg('client entered invalid password, server error: 400');
    return;
  }

  // Set object to pass to cookie
  const cookieID = {
    id: userID,
    email,
    password //<--- not sure if needed
  };

  // Successful Login, set cookie and redirect to /urls
  res.cookie('user', cookieID);
  res.redirect('/urls');

  serverMsg(`Login to user: ${userID} (${email}) [SUCCESS]. Redirecting to /urls`);
});

//------Logout requests------//
app.post("/logout", (req, res) => {
  const username = req.cookies.username;

  serverMsg(`logout request for ${username}`);
  
  res.clearCookie('user');
  res.redirect('/login');

  serverMsg('Client is being redirected to: /login');
});