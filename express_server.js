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

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// const findUserEmail = (email, db) {

//   for(let userId in usersDb) {
      
//       if(user.email === email) {
//         res.status(403).send('Sorry, user already exists!');
//         return;
//       }
//     }
// }



//login
// app.get('/login', (req, res) => {
// const templateVars = {user: null};
// res.reder('login', templateVars);
// });

// app.post('/login', (req, res) => {
//   //authenticate user
//   f
// })

//login
app.post('/urls/login', (req, res) => {
//   const email = req.body.email;
//   const password = req.body.password;
//   const user = findUserByEmail(email, userDb)
// if(user&& user.password === password) {
const user = req.body.username;
  res.cookie('username', user)
  //'user_id', user.id);
  res.redirect('/urls');
  // return;
}
// res.status(401).send('wrong credentials')
);

//logout
app.post("/urls/logout", (req, res) => {
  const user = req.body.username;
  const userId = req.cookies
  res.clearCookie('username', user);
  res.redirect('/urls')
})

//Index page showing shortURL and longURL 

app.get('/urls', (req, res) => {
  const user = req.cookies['username']
  const userId = req.cookies['user_id']
  const templateVars = { 
      urls: urlDatabase,
      username: user
      // user_id: userId
      //user: usersDb[userId]
    }
  res.render('urls_index', templateVars);
});

//Create shortURL
app.get('/urls/new', (req, res) => {
  const user = req.cookies['username'];
  const templateVars = { 
      username: user
  }
  res.render('urls_new', templateVars)
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;

  res.redirect('/urls/');         
});

//Show shortURL 
app.get("/urls/:shortURL", (req, res) => {
  const user = req.cookies['username'];
  const shortURL = req.params.shortURL
  const templateVars = { 
    shortURL, longURL: urlDatabase[shortURL],
    username: user
  }
  res.render('urls_show', templateVars);
});

// //update longURL
app.post("/urls/:shortURL", (req,res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.newLongURL;
  res.redirect('/urls');
});


app.get("/u/:shortURL", (req, res) => {
  const templateVars = { 
    username: user
  }
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL, templateVars);
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


//authentification
// app.get('/register', (req, res) => {
//   const templateVars = {user: }
//   res.render('register file???', templateVars);
// }); //add to register form <form method="POST" action="/register">
//                           //<input type='email' name='email'

// //receive info from register form
// app.post('/register', (req, res) => {
//   const name = req.body.name;
//   const email = req.body.email;
//   const password = req.body.password;

  //ensure the user is not in the db already
  // for(let userId in usersDb) {
  //   const user = usersDb[userId];
  //   if(user.email === email) {
  //     res.status(403).send('Sorry, user already exists!');
  //     return;
  //   }
  // }

  //create new user id
  // const userId = Math.random().toString(36).substr(2, 8);

  //add name, email, password to user id
  // const newUser ={
  //   id: userId,
  //   name,
  //   email,
  //   password
  // }
  //add new user to db
  // usersDb[userId] = newUser;

  //set cookie
  //ask browser to keep the info 
//   res.cookie('user_id', 'userId');
//   res.redirect('other page')
// })


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