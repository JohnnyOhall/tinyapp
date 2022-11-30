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
const generateRandomString = () => { // Generates random 6 character string for new URL
  return ((Math.random() + 1) * 0x10000).toString(36).substring(6);
};

const getUserByEmail = (req) => {
  if (req.cookies.user){
    return req.cookies.user.id;
  } else {
    return {}
  }
};

const httpCheck = (newURL) => {
  if (newURL.slice(0,8) === 'https://' || newURL.slice(0,7) === 'http://') {
    return newURL;  // do not add https:// if already included in address
  } else {
    return `https://${newURL}`;  // check if contains http: already
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
app.get("/", (req, res) => {
  res.send("Hello!");
  
  serverMsg('client is viewing homepage.');
});

app.listen(PORT, () => {
  serverMsg(`TinyApp listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);

  serverMsg('client is viewing urlDatabase.json file');
});

// Example to use HTML Tags inside of VS (Not Required...)
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");

app.get("/urls", (req, res) => {
  const user = users[getUserByEmail(req)]
  const templateVars = { urls: urlDatabase, user};

  res.render("urls_index", templateVars);

  serverMsg('Client is viewing URLs index');
});

app.get("/urls/new", (req, res) => { // page to create new URL if not in database
  const user = users[getUserByEmail(req)]
  const templateVars = {user};

  res.render("urls_new", templateVars);

  serverMsg('Client is viewing URL creation page');
});

app.get("/urls/:id", (req, res) => { // Redirect to summary ID page
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const user = users[getUserByEmail(req)]
  const templateVars = { id, longURL, user};

  res.render("urls_show", templateVars);

  serverMsg(`Client is viewing ${id} (${longURL}) summary page`);
});

app.get("/u/:id", (req, res) => {  // Redirect to actual website
  const id = req.params.id;
  const longURL = urlDatabase[id];

  serverMsg(`Client is being redircted: ${longURL}`);

  res.redirect(longURL);
});

app.get("/register", (req,res) => {
  const user = users[getUserByEmail(req)]
  const templateVars = {user};

  res.render("urls_register", templateVars)

  serverMsg(`Client is veiwing urls/register`);
})



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

  urlDatabase[id] = httpCheck(editedUrl) // update long URL and checks for http

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

  urlDatabase[randomName] = httpCheck(newLongUrl) // Adds new URL and checks for http

  res.redirect(`/urls/${randomName}`);

  serverMsg('Client is being redirected to: /urls/');
});

//------Login requests------//
app.post("/login", (req, res) => {
  const userName = req.body.username; // was req.body.username

  res.cookie('username', userName);
  res.redirect('back');

  serverMsg(`Client login request for: ${userName}`);
});

//------Logout requests------//
app.post("/logout", (req, res) => {
  const username = req.cookies.username;

  serverMsg(`logout request for ${username}`);
  
  res.clearCookie('user');
  res.redirect('/urls');

  serverMsg('Client is being redirected to: /urls/');
});

//------User Registration------//
app.post("/register", (req,res) => {
if (!req.body.email || !req.body.password) {
  res.status(400).send('Invalid Username/Address')
  serverMsg(`Server response 400: Invalid username/address entered: ${req.body.email, req.body.password}`)
}

for (const user in users) {
  if (req.body.email === users[user].email) {
    res.status(400).send('email already exists.')
    serverMsg(`Server response 400: Email ${req.body.email} already exists`)
  }
}

const email = req.body.email
const password = req.body.password
const randomID = generateRandomString()

serverMsg(`User creation request for: @: ${email} P: ${password}`)

users[randomID] = {
  id: randomID,
  email,
  password
}
res.cookie('user', users[randomID])
res.redirect('/urls');

serverMsg(`User ${email} created successfully, redirect to /urls.`)
});


// ----------------------------------- TO DO LIST -----------------------------------//
//
//   [ ] : Check for duplicate key values as edge case