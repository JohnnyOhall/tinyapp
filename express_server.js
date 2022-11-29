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
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const generateRandomString = () => {
  return ((Math.random() + 1)* 0x10000).toString(36).substring(6);
}


// ------------------------------------ DATABASE -------------------------------------//
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



// ------------------------------------- ROUTES -------------------------------------//
app.get("/", (req, res) => {
  res.send("Hello!");
  console.log(`client request to view homepage.`)
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
  console.log(`client request for urlDatabase.json file`)
});

// Example to use HTML Tags inside of VS (Not Required...)
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
  console.log(`Client request to view URLs index`)
});

app.get("/urls/new", (req, res) => { // page to create new URL if not in database
  res.render("urls_new");
  console.log(`Client request to view URL creation page`)
});

// TO DO [ ] : Check for duplicate key values as edge case
// TO DO [ ] : Check for missing www. and reject as invalid (maybe)

app.post("/urls", (req, res) => {
  console.log(`Client request to add short url: ${req.body}`); // Log the POST request body to the console
  const randomName = generateRandomString()
  const newLongUrl = req.body.longURL
  if (newLongUrl.slice(0,8) === 'https://' || newLongUrl.slice(0,7) === 'http://') {
    urlDatabase[randomName] = newLongUrl  // check if contains http: already
  } else {
    urlDatabase[randomName] = `https://${newLongUrl}`  // check if contains http: already
  }
  res.redirect(`/urls/${randomName}`)
});

app.get("/urls/:id", (req, res) => { // Redirect to summary ID page
  const id = req.params.id
  const longURL = urlDatabase[id]
  const templateVars = { id, longURL};
  res.render("urls_show", templateVars);
  console.log(`Client request to view ${id}(${longURL}) summary page`)
});

app.get("/u/:id", (req, res) => {  // Redirect to actual website
  const id = req.params.id
  const longURL = urlDatabase[id]
  //console.log(urlDatabase[id])
  console.log(`Client redirect request for: ${id}(${longURL})`)
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id
  const longURL = urlDatabase[id]
  console.log(`Client delete request for: ${id}(${longURL})`)
  delete urlDatabase[id] // Delete requested item set by delete button
  res.redirect(`/urls`)
});

