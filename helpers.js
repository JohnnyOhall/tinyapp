// Generates random 6 character string for new URL
const generateRandomString = () => {
  return ((Math.random() + 1) * 0x10000).toString(36).substring(6);
};

// Function to check if user submitted URL has http:// or https://
const httpCheck = (newURL) => {
  if (newURL.slice(0,8) === 'https://' || newURL.slice(0,7) === 'http://') {
    return newURL;  // do not add https:// if already included in address
  } else {
    return `https://${newURL}`;  // check if contains http: already
  }
};

//Check if user email exists in database and returns userID if it does
const getUserByEmail = (email,database) => {
  for (const user in database) {
    if (email === database[user].email) {
      return user;
    }
  }
};

// Checks what longURLs belong to the logged in user and sends back new object for display
const urlsForUser = (user, database) => {
  let obj = {};
  
  for (const keys in database) {
    if (database[keys].userID === user.id) {
      obj[keys] = database[keys];
    }
  }
  return obj;
};

// Function to check URLs linked to userID and return them.


module.exports = {generateRandomString, httpCheck, getUserByEmail, urlsForUser}