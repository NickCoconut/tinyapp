const express = require("express");
const app = express();
const PORT = 8080; 

app.set('view engine', 'ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());


function generateRandomString() {
  const shortURL = Math.random().toString(36).substr(2, 6);
  return shortURL;
}

let urlDatabase = {};

const usersDb = { 
  "userId": {
    id: "userId", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  }
}

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

const findUserEmail = (email, usersDb) => {

  for(let userId in usersDb) {
      const user = usersDb[userId]
      if(user.email === email) {
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
}

//login
app.get('/login', (req, res) => {
  const userId = req.cookies['user_id']
  const templateVars = { 
    user: usersDb[userId]
  }
  res.render('urls_login', templateVars);
});

//authenticate user
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = authenticateUser(email, password, usersDb);
  
  if(user) {
      res.cookie('user_id', user.id);
      res.redirect('/urls');
      return;
    }
    res.status(403).send('wrong credentials!')
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login')
})

//Index page showing shortURL and longURL 

app.get('/urls', (req, res) => {
  const userId = req.cookies['user_id']

  const userUrls = urlsForUser(userId, urlDatabase)
  console.log(urlDatabase)
  const templateVars = { 
      urls: userUrls,
      user: usersDb[userId]
    };
    console.log(templateVars)
    if (userId) {
  res.render('urls_index', templateVars);
    }
    res.status(401);
  });



//Create shortURL
app.get('/urls/new', (req, res) => {
  const userId = req.cookies['user_id']
  if (userId) {
  const templateVars = { 
      user: usersDb[userId]
  }
  res.render('urls_new', templateVars)
};
  res.redirect("/login")
});

app.post("/urls", (req, res) => {
  if (req.cookies['user_id']) {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userId: req.cookies['user_id']
  };
  res.redirect('/urls/');  
  return;
  }
  res.send('Please log in')
  // .redirect('/login');    
});

//Show shortURL 
app.get("/urls/:shortURL", (req, res) => {
  if(urlDatabase[req.params.shortURL]) {
  const userId = req.cookies['user_id'];
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    userUrls: urlDatabase[req.params.shortURL].userID,
    user: usersDb[userId]
  }
  res.render('urls_show', templateVars);
};
});

// //update longURL
app.post("/urls/:shortURL", (req,res) => {
  const shortURL = req.params.shortURL;
  const userId = req.cookies['user_id'];
  const userUrls = urlsForUser(userId, urlDatabase);
  if(Object.keys(userUrls).includes(shortURL)) {
    urlDatabase[shortURL].longURL = req.body.newLongURL;
    res.redirect('/urls');
    return;
  }
  res.status(401).send('Cannot create newURL')
});


app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if(urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL].longURL;
    if (longURL === undefined) {
      res.status(302);
      return;
    }
    res.redirect(longURL);
    return;
  }
 res.status(404).send('ShortURL does not exist')
});

//homePage
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Delete shortURL
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.cookies['user_id'];
  const userUrls = urlsForUser(userId, urlDatabase);
  if (Object.keys(userUrls).includes(shortURL)) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
    return;
  };
  res.send('cannot delete shortURL')
});


//Register
app.get('/register', (req, res) => {
  const templateVars = {user: null};
  res.render('urls_register', templateVars);
}); 

// //receive info from register form
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserEmail(email, usersDb);

  //if e-mail or password is empty
  if(email.length === 0 || password.length === 0) {
    res.status(400).send('Please enter email');
    return;
  };

  // ensure the user is not in the db already
    if(user) {
      res.status(400).send('Sorry, user already exists!');
      return;
    }

    const userId = Math.random().toString(36).substr(2, 8);

    const newUser ={
      id: userId,
      email,
      password
    }
  //add new user to db
    usersDb[userId] = newUser;

  //set cookie
  res.cookie('user_id', userId);
  res.redirect('urls');
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