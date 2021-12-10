const findUserEmail = (email, usersDb) => {

  for(let userId in usersDb) {
      const user = usersDb[userId]
      if(user.email === email) {
        return user;
      }
    }
    return false;
};

module.exports = { findUserEmail }