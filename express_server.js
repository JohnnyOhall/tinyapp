const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const generateRandomString = () => {
  return ((Math.random() + 1)* 0x10000).toString(36).substring(6);
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => { // page to create new URL if not in database
  res.render("urls_new");
});

// check for duplicate key values as edge case

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const randomName = generateRandomString()
  const newLongUrl = req.body.longURL
  if (newLongUrl.slice(0,8) === 'https://' || newLongUrl.slice(0,7) === 'http://') {
    urlDatabase[randomName] = newLongUrl  // check if contains http: already
  } else {
    urlDatabase[randomName] = `https://${newLongUrl}`  // check if contains http: already
  }
  res.redirect(`/urls/${randomName}`)
  console.log(urlDatabase)
});

app.get("/urls/:id", (req, res) => { // Redirect to summary ID page
  const id = req.params.id
  const longURL = urlDatabase[id]
  const templateVars = { id, longURL};
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {  // Redirect to actual website
  const id = req.params.id
  const longURL = urlDatabase[id]
  //console.log(urlDatabase[id])
  console.log(id)
  res.redirect(longURL);
});


