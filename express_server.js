const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

function generateRandomString() {
  const shortURL = Math.random().toString(36).substr(2, 6);
  return shortURL;
}

let urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const usersDb = {
  userId: {
    id: "userId",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
};

const findUserEmail = (email, usersDb) => {
  for (let userId in usersDb) {
    const user = usersDb[userId];
    if (user.email === email) {
      return user;
    }
  }
  return false;
};

const authenticateUser = (email, password, usersDb) => {
  const user = findUserEmail(email, usersDb);
  if (user && user.password === password) {
    return user;
  }
  return false;
};

//login
app.get("/login", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: usersDb[userId],
  };
  res.render("urls_login", templateVars);
});

//authenticate user
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = authenticateUser(email, password, usersDb);

  if (user) {
    res.cookie("user_id", user.id);
    res.redirect("/urls");
    return;
  }
  res.status(403).send("wrong credentials!");
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

//Index page showing shortURL and longURL

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    urls: urlDatabase,
    user: usersDb[userId],
  };
  res.render("urls_index", templateVars);
});

//Create shortURL
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: usersDb[userId],
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;

  res.redirect("/urls/");
});

//Show shortURL
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies["user_id"];
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL],
    user: usersDb[userId],
  };
  res.render("urls_show", templateVars);
});

// //update longURL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.newLongURL;
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: usersDb[userId],
  };
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL, templateVars);
});

//homePage
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Delete shortURL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//Register
app.get("/register", (req, res) => {
  const templateVars = { user: null };
  res.render("urls_register", templateVars);
});

// //receive info from register form
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserEmail(email, usersDb);

  //if e-mail or password is empty
  if (email.length === 0 || password.length === 0) {
    res.status(400).send("Please enter email");
    return;
  }

  // ensure the user is not in the db already
  if (user) {
    res.status(400).send("Sorry, user already exists!");
    return;
  }

  const userId = Math.random().toString(36).substr(2, 8);

  const newUser = {
    id: userId,
    email,
    password,
  };
  //add new user to db
  usersDb[userId] = newUser;

  //set cookie
  res.cookie("user_id", userId);
  res.redirect("urls");
});

// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase);
// });

//Other exercise
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
//  });

//  app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
//  });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
