require("dotenv").config();
const express = require("express");

const app = express();

// cors
const cors = require("cors");
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

//body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//logger
const logger = require("morgan");
app.use(logger("tiny"));

//database
require("./config/Database");

// routes
app.use("/user", require("./routes/UserRoutes"));
app.use("/buses", require("./routes/BusesRoutes"));
app.use("/bookings", require("./routes/BookingRoutes"));

const path = require("path");

app.use(express.static(path.join(__dirname, "client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
