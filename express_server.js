const express = require("express");
const app = express();
const PORT = 8080; 

app.set('view engine', 'ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
  const shortURL = Math.random().toString(36).substr(2, 6);
  return shortURL;
}

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Index page showing shortURL and longURL 
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase}
  res.render('urls_index', templateVars);
});

//Create shortURL
app.get('/urls/new', (req, res) => {
  res.render('urls_new')
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;

  res.redirect('/urls/');         
});

//Show shortURL 
app.get("/urls/:shortURL", (req, res) => {
  // console.log(req.params)
  const shortURL = req.params.shortURL
  const templateVars = { shortURL, longURL: urlDatabase[shortURL] };
  res.render('urls_show', templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

//update longURL

app.post("/urls/:shortURL", (req,res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.newLongURL;
  res.redirect('/urls');
});

//homePage
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Delete shortURL
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase);
// });

//Other exercise
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});