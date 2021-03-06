const { findUserEmail } = require("./helpers");
const express = require("express");
const app = express();
const PORT = 8080;

const bcrypt = require("bcryptjs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const cookieSession = require("cookie-session");
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

function generateRandomString() {
  const shortURL = Math.random().toString(36).substr(2, 6);
  return shortURL;
}

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const usersDb = {
  userId: {
    id: "userId",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
};

//compare if id is already exist
const urlsForUser = (id, urlDatabase) => {
  let userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userId === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
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
  const userId = req.session.user_id;
  const templateVars = {
    user: usersDb[userId]
  };
  res.render("urls_login", templateVars);
});

//authenticate user
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Please enter email or password");
  }

  const user = findUserEmail(email, usersDb);

  if (!user) {
    return res.status(400).send("email does not exist");
  }

  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user_id = user.id;
    res.redirect("/urls");
    return;
  }
  res.status(403).send("wrong credentials!");
});

//logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//Index page showing shortURL and longURL
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;

  const userUrls = urlsForUser(userId, urlDatabase);
  const templateVars = {
    urls: userUrls,
    user: usersDb[userId],
  };

  if (userId) {
    res.render("urls_index", templateVars);
  }
  res.status(400).send("please log in");
});

//Create shortURL
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    const templateVars = {
      user: usersDb[userId],
    };
    res.render("urls_new", templateVars);
  }
  res.redirect("/login");
});

app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userId: req.session.user_id,
    };
    res.redirect('/urls/' + shortURL);
    return;
  }
  res.send("Please log in");
  // .redirect('/login');
});

//Show shortURL
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session.user_id;
  const userUrls = urlsForUser(userId, urlDatabase);
  
  if (!urlDatabase[shortURL]) {
   res.status(404).send("ShortURL does not exist");
  } else if (!userId || !userUrls[shortURL]) {
    res.status(401).send("You don't own the URL");
  } else {
    const templateVars = {
      shortURL,
      longURL: urlDatabase[shortURL].longURL,
      userUrls: urlDatabase[shortURL].userID,
      user: usersDb[userId],
    };
    return res.render("urls_show", templateVars);
  }
  });

// //update longURL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session.user_id;
  const userUrls = urlsForUser(userId, urlDatabase);
  if (Object.keys(userUrls).includes(shortURL)) {
    urlDatabase[shortURL].longURL = req.body.newLongURL;
    res.redirect("/urls");
    return;
  }
  res.status(401).send("Cannot create newURL");
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    let longURL = urlDatabase[shortURL].longURL;
    if (longURL === undefined) {
      res.status(302);
      return;
    }
    const regex = /^http(s)?:\/\//;
    longURL = longURL.match(regex) ? longURL : `http://${longURL}`
    res.redirect(longURL);
    return;
  }
  res.status(404).send("ShortURL does not exist");
});

//homePage
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Delete shortURL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session.user_id;
  const userUrls = urlsForUser(userId, urlDatabase);
  if (Object.keys(userUrls).includes(shortURL)) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
    return;
  }
  res.send("cannot delete shortURL");
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

  if (!email || !password) {
    return res.status(400).send("Please enter email");
  }

  const user = findUserEmail(email, usersDb);

  if (user) {
    return res.status(400).send("Sorry, user already exists!");
  }

  const hanshedPassword = bcrypt.hashSync(password, 10);
  const userId = Math.random().toString(36).substr(2, 8);

  const newUser = {
    id: userId,
    email,
    password: hanshedPassword,
  };
  //add new user to db
  usersDb[userId] = newUser;

  //set cookie
  req.session.user_id = user.id;
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
