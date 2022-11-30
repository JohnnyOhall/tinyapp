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


// -------------------------------- GLOBAL FUNCTIONS -------------------------------- //
const generateRandomString = () => { // Generates random 6 character string for new URL
  return ((Math.random() + 1) * 0x10000).toString(36).substring(6);
};



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
  console.log('client is viewing homepage.');
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
  console.log('client is viewing urlDatabase.json file');
});

// Example to use HTML Tags inside of VS (Not Required...)
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");

app.get("/urls", (req, res) => {
  const userID = req.cookies.user.id;
  const user = users[userID]
  
  const templateVars = { urls: urlDatabase, user};
  res.render("urls_index", templateVars);
  console.log('Client is viewing URLs index');
});

app.get("/urls/new", (req, res) => { // page to create new URL if not in database
  const userID = req.cookies.user.id;
  const user = users[userID]

  const templateVars = {user};
  res.render("urls_new", templateVars);
  console.log('Client is viewing URL creation page');
});

app.get("/urls/:id", (req, res) => { // Redirect to summary ID page
  const id = req.params.id;
  const longURL = urlDatabase[id];

  const userID = req.cookies.user.id;
  const user = users[userID]

  const templateVars = { id, longURL, user};

  res.render("urls_show", templateVars);
  console.log(`Client is viewing ${id} (${longURL}) summary page`);
});

app.get("/u/:id", (req, res) => {  // Redirect to actual website
  const id = req.params.id;
  const longURL = urlDatabase[id];
  //console.log(urlDatabase[id])
  console.log(`Client is being redircted: ${longURL}`);
  res.redirect(longURL);
});

app.get("/register", (req,res) => {
  const userID = req.cookies.user.id;
  const user = users[userID]
  const templateVars = {user};
  res.render("urls_register", templateVars)
  console.log(`Client is veiwing urls/register`);
})



// ----------------------------------- POST ROUTES ----------------------------------//

//------Delete short URL key------//
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  console.log(`Client delete request for: ${id} (${longURL})`);
  delete urlDatabase[id]; // Delete requested item set by delete button
  res.redirect('/urls');
  console.log('Client is being redirected to: /urls/');
});

//------Update existing URL with new LongURL------//
app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id;
  let longURL = urlDatabase[id];
  const editedUrl = req.body.editUrl;

  console.log(`Client update request for: ${id} (${longURL})`);

  if (editedUrl.slice(0,8) === 'https://' || editedUrl.slice(0,7) === 'http://') {
    urlDatabase[id] = editedUrl; // do not add https:// if already included in address
  } else {
    urlDatabase[id] = `https://${editedUrl}`;  // check if contains http: already
  }

  res.redirect(`/urls`); // redirect to URLs index
  longURL = urlDatabase[id]; // update longURL variable after edit
  console.log(`New URL: ${id}(${longURL})`);
  console.log('Client is being redirected to: /urls/');
});

//------Add new URL------//
app.post("/urls", (req, res) => {
  console.log(`Client request to add short url: ${req.body}`);

  const randomName = generateRandomString();
  const newLongUrl = req.body.longURL;

  if (newLongUrl.slice(0,8) === 'https://' || newLongUrl.slice(0,7) === 'http://') {
    urlDatabase[randomName] = newLongUrl;  // do not add https:// if already included in address
  } else {
    urlDatabase[randomName] = `https://${newLongUrl}`;  // check if contains http: already
  }

  res.redirect(`/urls/${randomName}`);
  console.log('Client is being redirected to: /urls/');
});

//------Login requests------//
app.post("/login", (req, res) => {
  const userName = req.body.username; // was req.body.username
  res.cookie('username', userName);
  console.log(`Client login request for: ${userName}`);
  res.redirect('back');
});

//------Logout requests------//
app.post("/logout", (req, res) => {
  const username = req.cookies.username;
  console.log(`logout request for ${username}`);
  res.clearCookie('username');
  res.redirect('/urls');
  console.log('Client is being redirected to: /urls/');
});

//------User Registration------//
app.post("/register", (req,res) => {
const email = req.body.email
const password = req.body.password
const randomID = generateRandomString()
console.log(`User creation request for: @: ${email} P: ${password}`)

users[randomID] = {
  id: randomID,
  email,
  password
}
res.cookie('user', users[randomID])
res.redirect('back');
console.log(`User ${email} created successfully, redirect to /urls.`)
});


// ----------------------------------- TO DO LIST -----------------------------------//
//
//   [ ] : Check for duplicate key values as edge case