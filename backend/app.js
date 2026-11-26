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
import { MongoClient } from "mongodb";
import express from "express";
import path from "path";
import crypto from "crypto";

// import jsonwebtoken from "jsonwebtoken"; // check import name -> We will use this next class.

// The mail truck that delivers our emails through Gmail
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.REGISTRATION_NOTIFY_EMAIL,
        pass: process.env.REGISTRATION_NOTIFY_PASSWORD
    }
});




// Make the client, using the address in .env
const client = new MongoClient(process.env.MONGODB_URI);

// This will hold our database after we connect
let db;

// Connect once, when the server starts
async function connectToDatabase() {
  try {
    // Try to connect to the cluster
    await client.connect();

    // Pick our database
    db = client.db("cornerKitchen");

    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("MongoDB connection failed:", error);
  }
}

// Run it
connectToDatabase();




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

    // 1. Take the values from the form
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const role = req.body.role;

    // 2. If the two passwords are not the same, stop here
    if (password !== confirmPassword) {
        res.send("Passwords do not match");
        return;
    }

    try {
        // 3. Get the "users" collection from our database
        const usersCollection = db.collection("users");

        // 4. Check if this username is already taken
        const existingUser = await usersCollection.findOne({ username: username });

        if (existingUser) {
            res.status(409);
            res.json({ message: "User name is already used" });
            return;
        }

        // 5. Make a new salt and hash the password with it
        const newSalt = generateSalt(16);
        const hashedPassword = hashPassword(password, newSalt);

        // 6. Build the new user
        const newUser = {
            username: username,
            email: email,
            hashedPassword: hashedPassword,
            salt: newSalt,
            role: role
        };

        // 7. Save the new user in MongoDB
        await usersCollection.insertOne(newUser);

        // 8. Send the confirmation email to the class inbox
        // try {
        //     await transporter.sendMail({
        //         from: process.env.REGISTRATION_NOTIFY_EMAIL,
        //         to: "this.is.a.test.email.for.our.class@gmail.com",
        //         subject: "New user registration",
        //         text: `A new account was registered.\n\nEmail: ${email}\nRole: ${role}\n`
        //     });
        //     console.log("Email sent");
        // }
        // catch (error) {
        //     console.log("Email failed:", error.message);
        // }

        // 9. Reply to the browser
        res.json({ message: "User Created" });
    }
    catch (error) {
        // If anything with the database goes wrong, show it in the terminal
        console.log("Register failed:", error);
        res.status(500);
        res.json({ message: "Something went wrong, please try again" });
    }

});






// Starting with the hashing and salting logic:
const salt = crypto.randomBytes(16).toString("hex"); // we used this to generate a simple JWT key --- ideally, it needs to be much more complex (try 64)!
// console.log(salt);

// This next function will still be used for our user passwords. We will need to hash every time we create a new user password:
// const randomlyGeneratedKey = crypto.pbkdf2(password, salt, 10, 64, 'sha512') //getHashes returns an array of possible digests

async function checkCredentials(req, res, next) {

    // 1. Take the username and password from the letter (req.body)
    const username = req.body.username;
    const password = req.body.password;

    try {
        // 2. Find the user in MongoDB
        const user = await db.collection("users").findOne({ username: username });

        // 3. Nobody with that name?
        if (!user) {
            res.status(401);                                       // set the code: not allowed
            res.json({ message: "Wrong username or password" });   // write the reply
            return;                                                // stop the function here
        }

        // 4. Hash the typed password with the saved salt and compare
        const newHashedPassword = hashPassword(password, user.salt);

        if (newHashedPassword != user.hashedPassword) {
            res.status(401);
            res.json({ message: "Wrong username or password" });
            return;
        }

        // 5. All good: hand the user to the manager
        req.user = user;
        next();
    }
    catch (error) {
        // If the database has a problem, show it in the terminal
        console.log("Login check failed:", error);
        res.status(500);
        res.json({ message: "Something went wrong, please try again" });
    }
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