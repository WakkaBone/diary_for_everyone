const express = require("express");
const ejsLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const apiRouter = require("./routes/apiRouter");
const viewsRouter = require("./routes/viewsRouter");
require("dotenv").config();

const app = express();
app.set("view engine", "ejs");
app.use("/styles", express.static("styles"));
app.use(express.static("img"));
app.use(express.static("scripts"));

app.use(ejsLayouts);
app.set("layout", "./layout/default");

const start = () => {
  try {
    mongoose
      .connect(process.env.MONGO)
      .then((response) => console.log("You are connected to the database"));
    app.listen(process.env.PORT, () => console.log("Server has been launched"));
  } catch (e) {
    if (e) console.log(e);
  }
};

start();

app.use("/", viewsRouter);
app.use("/api", apiRouter);
