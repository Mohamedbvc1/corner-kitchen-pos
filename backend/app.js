/* * * * * * * * * * * * * * * * * * * * * * 
 * Today, we studied hashing and salting.  *
 * * * * * * * * * * * * * * * * * * * * * */

// If using import, remember to set up ES Modules (Add "type": "module" to package.json)

// Load the secret values from the .env file

import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import "dotenv/config";

// Bring in nodemailer, which sends emails
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import express from "express";
import path from "path";
import crypto from "crypto";
import fs from "fs";
// import jsonwebtoken from "jsonwebtoken"; // check import name -> We will use this next class.

// The mail truck that delivers our emails through Gmail
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.REGISTRATION_NOTIFY_EMAIL,
        pass: process.env.REGISTRATION_NOTIFY_PASSWORD
    }
});



// Connect to MongoDB using the address in .env
mongoose.connect(process.env.MONGODB_URI)
  .then(function () {
    console.log("Connected to MongoDB");
  })
  .catch(function (error) {
    console.log("MongoDB connection failed:", error);
  });


const app = express();
const PORT = 3000; // you can leave it like this for this exercise

app.use(express.json());



app.use(express.urlencoded({ extended: true }));



// this is the relative URL:
// app.use(express.static('../frontend/public'));

// The following would be using the path module and it generates an absolute path. __dirname doesn't work with ES Module
// You could override/overwrite __dirname with import.meta.dirname, but let's use it directly:
const publicFolderPath = path.join(import.meta.dirname, "../frontend/public");
app.use(express.static(publicFolderPath));

// I need to launch the server (Make it listen for HTTP requests on the port I specified)
app.listen(PORT, () => {
    console.log(`Server is running on localhost:${PORT}`);
})

// Since this is a simple study exercise, I'll define my routes here. Ideally, we want a "routes" folder where we will define the routes for each service and export them as a router.
app.get("/", (req, res) => {
    // the response should return my index.html;
    res.sendFile(path.join(publicFolderPath, "../index.html"));
})


/*
the form sends the letter to /login. 
The guard, checkCredentials, opens it, 
finds the user, and checks 
the password hash. If it’s wrong, he writes back 401 himself and stops. 
If it’s right, he calls next(), and the manager writes back “Welcome Will”.
*/

//app.post("/login", checkCredentials, (req, res) => {
//    res.json({ message: "Welcome " + req.user.username });
//})


app.post("/login", checkCredentials, (req, res) => {
    // The guard already put the checked user on the letter
    
    const username = req.user.username;
    const role = req.user.role;

    

    console.log("Role is:", role);

    // Admins go to the admin door
    if (role == "admin") {
        res.redirect("/admin");
        return;
    }

    // Everyone else goes to the user door
    res.redirect("/user");
});


app.get("/protected", checkCredentials, (req, res) => {
    // The guard already put the checked user on the letter
    

  let tmprole = window.localStorage.getItem("userRole");
    let tmpusername = window.localStorage.getItem("username");


    // Admins go to the admin door
    if (role == "admin") {
        res.redirect("/protected");
        return;
    }

    // Everyone else goes to the user door
    res.redirect("/user");
});



// The user page
app.get("/user", (req, res) => {
    res.send("<h1>Welcome to the user page</h1>");
});

// The admin page
app.get("/admin", (req, res) => {
    res.send("<h1>Welcome to the admin page</h1>");
});





app.post("/register", async (req, res) => {

    //Take the username, password and role from the form create a new user form
    const username = req.body.username;
    const password = req.body.password;
    const role = req.body.role;
    const email = req.body.email;

    
    // read the second password
    let confirmPassword = req.body.confirmPassword;

    // if they are not the same, stop here
    if (password !== confirmPassword) {
        res.send("Passwords do not match");
        return;
    }



    //Read users.json into the list
    const users = JSON.parse(fs.readFileSync("users.json", "utf-8"));
    

    //Check if this username is already taken

    const user = users.find(x => x.username == username);
    
    //3  Username already taken
    if (user) {
        res.status(409);               // set the code: Conflict 
        res.json({ message: "User name is already used" });   // write the reply
        return;                                                // stop the function here
    }



    
    //4 Make the new salt and hash the password with it

    const newSalt = generateSalt(16);
    const hashedPassword = hashPassword(password, newSalt)


    // Add the new usre to the list
    const newUser = {
        username: username,
        email: email,
        hashedPassword: hashedPassword,
        salt: newSalt,
        role: role
    }


    users.push(newUser);

  
// 6. Save the list back to users and reply

const usersText = JSON.stringify(users, null, 4);

fs.writeFileSync("users.json", usersText);


// 7. Send the confirmation email to the class inbox
try {
    await transporter.sendMail({
        from: process.env.REGISTRATION_NOTIFY_EMAIL,
        to: "this.is.a.test.email.for.our.class@gmail.com",
        subject: "New user registration",
        text: `A new account was registered.\n\nEmail: ${email}\nRole: ${role}\n`
    });

    // Show a message in the terminal so we know it worked
    console.log("Email sent");
}
catch (error) {
    // If the email fails, show why in the terminal
    console.log("Email failed:", error.message);
}


res.json({message : "User Created"});

  });



// Starting with the hashing and salting logic:
const salt = crypto.randomBytes(16).toString("hex"); // we used this to generate a simple JWT key --- ideally, it needs to be much more complex (try 64)!
// console.log(salt);

// This next function will still be used for our user passwords. We will need to hash every time we create a new user password:
// const randomlyGeneratedKey = crypto.pbkdf2(password, salt, 10, 64, 'sha512') //getHashes returns an array of possible digests


function checkCredentials(req, res, next) {
    // 1. Take the username and password from the letter (req.body)
    const { username, password } = req.body;
    //const username = req.body.username;
    //const password = req.body.password;

    // 2. Read users.json and find the user
    const users = JSON.parse(fs.readFileSync("users.json", "utf-8"));
    const user = users.find(x => x.username == username);

    // 3. Nobody with that name? Send the letter back.
    //if (!user) return res.status(401).json({ message: "Wrong username or password" });


    // 3. Nobody with that name?
    if (!user) {
        res.status(401);                                       // set the code: not allowed
        res.json({ message: "Wrong username or password" });   // write the reply
        return;                                                // stop the function here
    }


    // 4. Hash the typed password with the saved salt and compare
    const newHashedPassword = hashPassword(password, user.salt);
    if (newHashedPassword != user.hashedPassword) {
        return res.status(401).json({ message: "Wrong username or password" });
    }

    // 5. All good: hand the user to the manager
    req.user = user;
    next();
}

/* * * * * * * * * * * * * * * * * * 
 * Our helper functions (services) *
 * * * * * * * * * * * * * * * * * */

function hashPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 10, 64, "sha512").toString("hex");
}

function generateSalt(length) {
    return crypto.randomBytes(length).toString('hex');
}

// console.log(hashPassword("ILoveCats123", "317d6c3798aa9d1d02e012b6b6e2405e")); // We used this to obtain the first hashedPassword - we can get rid of this.

//console.log(checkCredentials("Will", "IloveCats123"));

// Todo: Study for Thursday's GLA:
// create a registration page that saves new users to users.json
// add a role to the users when creating an account (client/admin)
// create two endpoints: /user and /admin and redirect each user after login to their appropriate page.