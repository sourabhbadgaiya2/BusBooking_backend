const router = require("express").Router();
const UserModels = require("../models/UserModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

// register
router.post("/register", async (req, res, next) => {
  try {
    const userExists = await UserModels.findOne({ email: req.body.email });
    if (userExists) {
      return res.send({
        message: "User already exists",
        success: false,
        data: null,
      });
    }
    // hash password
    const hashpassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashpassword;

    // new user
    const newUser = new UserModels(req.body);
    await newUser.save();
    res.send({
      message: "User created successfully",
      success: true,
      data: null,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
      data: null,
    });
  }
});

// Login
router.post("/login", async (req, res, next) => {
  try {
    const userExists = await UserModels.findOne({ email: req.body.email });
    if (!userExists) {
      return res.send({
        message: "User does not exists",
        success: false,
        data: null,
      });
    }
    // check match password
    const passwordmatch = await bcrypt.compare(
      req.body.password,
      userExists.password
    );

    if (!passwordmatch) {
      return res.send({
        message: "Incorrect password",
        success: false,
        data: null,
      });
    }

    //token generate
    const token = jwt.sign({ userId: userExists._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.send({
      message: "User Logged isn successfully",
      success: true,
      data: token,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
      data: null,
    });
  }
});

//get-user-by-id
router.post("/get-user-by-id", auth, async (req, res, next) => {
  try {
    const user = await UserModels.findById(req.body.userId);

    res.send({
      message: "User fetch successfully",
      success: true,
      data: user,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
      data: null,
    });
  }
});

//get-all-users

router.post("/get-all-users", auth, async (req, res) => {
  try {
    const users = await UserModels.find({});
    res.send({
      message: "Users fetched successfully",
      success: true,
      data: users,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
      data: null,
    });
  }
});

// update-user-permissions

router.post("/update-user-permissions", auth, async (req, res) => {
  try {
    await UserModels.findByIdAndUpdate(req.body._id, req.body);
    res.send({
      message: "User permissions updated successfully",
      success: true,
      data: null,
    });
  } catch {
    res.send({
      message: error.message,
      success: false,
      data: null,
    });
  }
});

// Get Current User
router.get("/get-current-user", auth, async (req, res) => {
  try {
    // Fetch current user data using req.user.id
    const user = await UserModels.findById(req.body.userId).select("-password"); // Exclude password from response
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching current user:", error.message);
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
