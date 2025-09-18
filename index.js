import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt"; // Library for hashing passwords securely
import session from "express-session"; // Middleware for handling user sessions
import env from "dotenv";

const app = express();
const port = 3000;
env.config();
const saltRounds = 10; // Used to define the cost factor for bcrypt password hashing

//CONNECT WITH THE DATABASE
const db=new pg.Client({
    user:process.env.PG_USER,
    host:process.env.PG_HOST,
    database:process.env.PG_DATABASE,
    password:process.env.PG_PASSWORD,
    port:process.env.PG_PORT,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Middleware to parse JSON bodies from HTTP requests
app.use(express.json());

// const session = require('express-session'); // Make sure to import express-session
app.use(
  session({
    secret: process.env.SESSION_SECRET,// A secret key to help keep session data safe
    resave: false, // Don't save session again if nothing has changed
    saveUninitialized: false, // Don't create session until there's something to save (like login info)
    cookie: {
    httpOnly: true, // Only the server can see this cookie (not JavaScript) — safer
    secure: false, // Use 'true' only if your site uses HTTPS (secure connection)
    maxAge: 1000 * 60 * 60 * 24, // How long the cookie lasts — 24 hours in this case
  },
})
);



function isAuthenticated(req, res, next) {
  //That userId was set earlier (after login or signup).
  if (req.session && req.session.userId) {
    next(); // User is logged in — continue to the page they were trying to visit
  } else {
    res.redirect("/login"); // User is not logged in — send them to the login page
  }
}

/*
 * This function stops the browser from saving (caching) sensitive pages.
 * It makes sure users can't hit "back" after logging out and still see protected content.
 */
function nocache(req, res, next) {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate"); // Tells modern browsers not to store the page
  res.header("Expires", "-1"); // Makes the page look expired to older browsers
  res.header("Pragma", "no-cache"); // Another no-cache signal for older HTTP/1.0
  next(); // Move on to the next middleware or route
}

let added_item=0;
let deleted_item=0;
let progresBar=0;

// let items = [
//   { id: 1, title: "Buy milk" },
//   { id: 2, title: "Finish homework" },
// ];

app.get("/login",nocache,(req,res)=>{
  res.render("welcome_page.ejs", { username: req.session.username });
})


//THIS IS USED FOR WHEN A USER SIGN UPS
app.post("/signup", async (req, res) => {

  //GET USERNAME AND PASSWORD
  const username = req.body.username;
  const password = req.body.password;

  try {
    //CHECKS IF THE USER ALREADY EXISTS
    const checkResult = await db.query("SELECT * FROM users WHERE username=$1", [username]);
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ message: "Username already exists" }); // <-- FIXED
    }

    //HASH THE PASSWORD BEFORE YOU SAVE IT
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error while hashing password" }); // <-- FIXED
      }

      //NOW SAVE USERNAME AND PASSWORD
      try {
        const insertResult = await db.query(
          "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id",
          [username, hash]
        );

        req.session.userId = insertResult.rows[0].id;
        req.session.username = username;

        return res.status(200).json({ message: "Signup successful" }); // <-- Already correct
      } catch (insertError) {
        if (insertError.code === "23505") {
          return res.status(400).json({ message: "Username already exists (duplicate key)" }); // <-- FIXED
        }
        console.error(insertError);
        return res.status(500).json({ message: "Database error during signup" }); // <-- FIXED
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error during signup" }); // <-- FIXED
  }
});

//THIS IS USED FOR WHEN A USER LOGINS
app.post("/login",nocache , async (req, res) => {
 //GET THE VALUES FROM THE INPUT
 const username = req.body.username;
 const loginPassword = req.body.password;

 try {
  //GET ALL THE RESULTS THAT ARE CONNECTED TO THE USERNAME THE UNIQUE
    const result = await db.query("SELECT * FROM users WHERE username=$1", [username]);

    //IF THERE IS A RESULT GET THE PASSWORD TO BE CHECKED
    if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;

        // Compare provided password with stored hashed password
        const passwordMatch = await bcrypt.compare(loginPassword, storedHashedPassword);

        //IF EVERYTHING IS CORRECT
      if (passwordMatch) {
          // Successful login: store user info in session
          req.session.userId = user.id;
          req.session.username = user.username;

          return res.json({ success: true });
      } else {
          return res.status(400).json({ message: "Your username or your password was wrong, try again." });
      }
    } else {
        return res.status(400).json({ message: "You don't have an account." });
    }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error." });
    }
});


//THIS IS USED TO GO TO THE MAIN PAGE
app.get("/", nocache, isAuthenticated, async (req, res) => {

  try {
    //USE THE FILTER FOR THE CATEGORY TO SELECT THE NOTES
    const categoryFilter = req.query.name;
    let query;
    let params;

    //IF THERE WAS A FILTER THAT WAS CHOSEN BY THE USER SHOW THE RESULTS OF THAT CATEGORY
    if (categoryFilter) {
      query = "SELECT * FROM items WHERE user_id = $1 AND category = $2 ORDER BY importance DESC, id DESC";
      params = [req.session.userId, categoryFilter];
    } else {
      //ELSE SHOW EVERY NOTE THE USER HAS ADDED NO MATTER THE CATEGORY
      query = "SELECT * FROM items WHERE user_id = $1 ORDER BY importance DESC, id DESC";
      params = [req.session.userId];
    }

    //THIS PART OF THE CODE IS USED FOR THE PROGRESSBAR THAT GETS LOADED WHEN AN ITEM GETS DELETED BUT WE NEED TO SEND TO THE FRONTEND VALUE FOR EVERY CASE
    const result = await db.query(query, params);
    const items = result.rows;

    const totalItems = items.length;
    const importantItems = items.filter(item => item.importance == 1).length;
    const progresBar = totalItems > 0 ? Math.round((importantItems / totalItems) * 100) : 0;

    //SEND TO THE FRONTEND THE LIST OF ITEMS ,THE PROGRESBAR VALUE AND THE CATEGORY (IF IT WAS CHOSEN)
    res.render("index.ejs", {
      listItems: items,
      progresBar: progresBar,
      selectedCategory: categoryFilter || ""  // ✅ Fix added here
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error loading items");
  }
});


//THIS IS USED FOR WHEN THE USER WANTS TO ADD NEW NOTE
app.post("/add", nocache, isAuthenticated, async (req, res) => {

  //GET THE NOTE THAT WAS ADDED , THE IMPORTANCE OF IT (IF IT WAS ADDED) AND THE CATEGORY (IF IT WAS ADDED)
  const item = req.body.newItem;
  const importance = req.body.importance || 0;
  const category = req.body.category || "Uncategorized";// default if none is passed

  //INSERT THEM INSIDE THE TABLE ITEMS
  try {
    await db.query(
      "INSERT INTO items (title, created_at, importance, user_id, category) VALUES ($1, NOW(), $2, $3, $4)",
      [item, importance, req.session.userId, category]
    );

     //If the category exists and it's not 'Uncategorized', then do something.
    // Redirect back to the same category view if available
    if (category && category !== "Uncategorized") {
      res.redirect("/?name=" + encodeURIComponent(category));
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Failed to add item");
  }
});


//THIS IS USED WHEN THE PERSON WANTS TO MAKE A CHANGE TO THE ALREADY MADE ITEM
app.post("/edit", isAuthenticated, async (req, res) => {

  //GET THE ID AND THE TITLE OF THE NOTE THAT NEEDS TO UPDATE
  const { updatedItemId, updatedItemTitle } = req.body;

  try {
    // Step 1: Get the item's category from DB
    const result = await db.query("SELECT category FROM items WHERE id = $1 AND user_id = $2",[updatedItemId, req.session.userId]);

    if (result.rows.length === 0) {
      return res.status(404).send("Item not found or access denied");
    }

    const itemCategory = result.rows[0].category;

    // Step 2: Update the item
    await db.query("UPDATE items SET title = $1 WHERE id = $2 AND user_id = $3",[updatedItemTitle, updatedItemId, req.session.userId]);

    // Step 3: Redirect back to the category view
    if (itemCategory) {

      // Why encodeURIComponent() .Some category names might have special characters (like spaces or slashes). 
      res.redirect(`/categories?name=${encodeURIComponent(itemCategory)}`);
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.error("Edit error:", error);
    res.status(500).send("Server error");
  }
});


//THIS IS USED TO DELETE THE ITEM 
app.post("/delete", nocache, isAuthenticated, async (req, res) => {
  // deleted_item++;

  //GET THE ID OF THE ITEM THAT WANTS TO BE DELETED
  const id = req.body.deleteItemId;

  try {
    // First get the deleted item's category before deleting
    const itemResult = await db.query("SELECT category FROM items WHERE id = $1 AND user_id = $2", [id, req.session.userId]);
    const selectedCategory = itemResult.rows[0]?.category || null;

    // Delete the item
    await db.query("DELETE FROM items WHERE id = $1 AND user_id = $2", [id, req.session.userId]);

    // Fetch items after deletion, filtered by category if it exists
    const itemsQuery = selectedCategory ? await db.query("SELECT * FROM items WHERE user_id = $1 AND category = $2", [req.session.userId, selectedCategory]) : await db.query("SELECT * FROM items WHERE user_id = $1", [req.session.userId]);

    //THIS PART OF THE CODE IS USED FOR THE PROGRESBAR THAT GETS INCREASED WHEN THE USER DELETES SOMETHING
    const items = itemsQuery.rows;
    const totalItems = items.length;

    const deletedItemCount = await db.query("SELECT * FROM deleted_items");
    const totalDeleted = deletedItemCount.rowCount;

    const progresBar = (totalItems + totalDeleted) === 0? 100: Math.max((totalDeleted / (totalDeleted + totalItems)) * 100, 1);

    //SEND BACK THE ITEMS THAT REMAIN ,THE VALUE OF PROGRESSBAR AND THE CATEGORY OF THE ITEM THAT WAS DELTED
    res.render("index.ejs", {
      listItems: items,
      progresBar,
      selectedCategory // Pass this back to the view
    });

  } catch (err) {
    console.error("Error in DELETE:", err);
    res.status(500).send("Server Error");
  }
});


//THIS IS USE DFOR THE FILTER OF CATEGORIES
app.get("/categories", nocache, isAuthenticated, async (req, res) => {

  try {

    //GET THE NAME OF THE CATEGORY THAT WAS CHOSEN BY THE USER
    const categoryFilter = req.query.name;

    //GET ALL THE ITEMS THAT BELONG TO THE CHOSEN CATEGORY
    const result = await db.query("SELECT * FROM items WHERE user_id = $1 AND category = $2 ORDER BY importance DESC, id DESC",[req.session.userId, categoryFilter]);

    //THIS IS USED FOR THE PROGRESBAR VALUE
    const items = result.rows;
    const totalItems = items.length;
    const importantItems = items.filter(item => item.importance == 1).length;
    const progresBar = totalItems > 0 ? Math.round((importantItems / totalItems) * 100) : 0;

    //RETURN THE CHOSEN ITEMS ,THE VALUE OF THE PROGRESBAR AND THE CATEGORY THAT WAS CHOSEN
    res.render("index.ejs", {
      listItems: items,
      progresBar,
      selectedCategory: categoryFilter || ""
    });
  } catch (error) {
    console.error("Error in /categories route:", error);
    res.status(500).send("Internal Server Error");
  }
});


// Handle logout and destroy the session
app.post("/logout", (req, res) => {
  console.log("Destroying session...");
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Logout failed");
    }

    // Clear the session cookie
    res.clearCookie("connect.sid");

    // Explicitly disable caching after logout to prevent back button showing protected pages
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.redirect("/");
  });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
