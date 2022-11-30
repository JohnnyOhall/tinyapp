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

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const serverMsg = console.log;

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

const invalidCheck = (req, res) => {
  if (!req.body.email || !req.body.password) {
    serverMsg(`Server response 400: Invalid username/address entered: ${req.body.email, req.body.password}`)
    res.status(400).send('Invalid Username/Address');
    return
  }
}

const registeredCheck = (req) => {
  for (const user in users) {
    if (req.body.email === users[user].email) {
      return user
    }
  }
}


// ------------------------------------ DATABASE -------------------------------------//
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  const user = users[getUserByEmail(req)];
  const templateVars = { urls: urlDatabase, user};

  res.render("urls_index", templateVars);

  serverMsg('Client is viewing URLs index');
});

// page to create new URL if not in database
app.get("/urls/new", (req, res) => {
  const user = users[getUserByEmail(req)];
  const templateVars = {user};

  res.render("urls_new", templateVars);

  serverMsg('Client is viewing URL creation page');
});

// Specific summary page unique for each id
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const user = users[getUserByEmail(req)];
  const templateVars = { id, longURL, user};

  res.render("urls_show", templateVars);

  serverMsg(`Client is viewing ${id} (${longURL}) summary page`);
});

// Redirect to actual website using TinyApp short URL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];

  serverMsg(`Client is being redircted: ${longURL}`);

  res.redirect(longURL);
});

// Register page to add user to database
app.get("/register", (req,res) => {
  const user = users[getUserByEmail(req)];
  const templateVars = {user};

  res.render("urls_register", templateVars);

  serverMsg(`Client is veiwing urls/register`);
});

// Login Page
app.get("/login", (req, res) => {
  const user = users[getUserByEmail(req)];
  const templateVars = {user};

  res.render("urls_login", templateVars);
});



// ----------------------------------- POST ROUTES ----------------------------------//

//------Delete short URL key------//
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];

  serverMsg(`Client delete request for: ${id} (${longURL})`);

  delete urlDatabase[id]; // Delete requested item set by delete button
  res.redirect('/urls');

  serverMsg('Client is being redirected to: /urls/');
});

//------Update existing URL with new LongURL------//
app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id;
  let longURL = urlDatabase[id];
  const editedUrl = req.body.editUrl;

  serverMsg(`Client update request for: ${id} (${longURL})`);

  urlDatabase[id] = httpCheck(editedUrl); // update long URL and checks for http

  res.redirect(`/urls`); // redirect to URLs index
  longURL = urlDatabase[id]; // update longURL variable after edit

  serverMsg(`New URL: ${id}(${longURL})`);
  serverMsg('Client is being redirected to: /urls/');
});

//------Add new URL------//
app.post("/urls", (req, res) => {
  serverMsg(`Client request to add short url: ${req.body}`);

  const randomName = generateRandomString();
  const newLongUrl = req.body.longURL;

  urlDatabase[randomName] = httpCheck(newLongUrl); // Adds new URL and checks for http

  res.redirect(`/urls/${randomName}`);

  serverMsg('Client is being redirected to: /urls/');
});

//------User Registration------//
app.post("/register", (req,res) => {
  invalidCheck(req, res)

  if (registeredCheck(req)) {
    res.status(401).send('email already exists, please <a href="/login">login</a>.');
    serverMsg(`Server response 400: Email ${req.body.email} already exists`);
    return;
  }

  const email = req.body.email;
  const password = req.body.password;
  const randomID = generateRandomString();

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
  invalidCheck(req, res)

  // Set userID and email
  let userID = registeredCheck(req);
  const email = req.body.email;
  const password = req.body.password;

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