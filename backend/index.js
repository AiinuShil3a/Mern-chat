const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const user = require("./client/user")
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const MONGODB = process.env.MONGODB_URL;
const PORTURL = process.env.PORT;
const SECRET = process.env.SECRET;

mongoose
  .connect(MONGODB)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });

app.use(cors({credentials:true, origin: "http://localhost:5173"}));
app.use(express.json());
app.use(cookieParser());
app.get("/", (req, res) => {
  res.send("Hello World");
});

//register
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    // ตรวจสอบว่า username ซ้ำหรือไม่
    const existingUser = await user.findOne({ username });

    if (existingUser) {
      // ถ้า username ซ้ำแล้ว
      return res.status(400).send("Username already exists");
    }

    // ถ้า username ไม่ซ้ำ
    const newUser = await user.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });

    res.send("Register Successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

//login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await user.findOne({ username });

    if (userDoc) {
      const isMatchPassword = bcrypt.compareSync(password, userDoc.password);

      if (isMatchPassword) {
        jwt.sign({ username, id: userDoc.id }, SECRET, {}, (err, token) => {
          if (err) throw err;
          res.cookie("token", token).json({
            id: userDoc.id,
            username,
          });
        });
      } else {
        res.status(400).json("Error Something!!");
      }
    } else {
      res.status(400).json("User not found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
});
//logout
app.post("/logout", async (req, res) => {
  res.cookie("token", "").json("ok");
})
 
app.listen(PORTURL, () => {
  console.log("Server is running on http://localhost:" + PORTURL);
});