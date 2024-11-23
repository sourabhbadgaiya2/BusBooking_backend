const router = require("express").Router();
const BusSchema = require("../models/BusModels");
const auth = require("../middleware/auth");

router.post("/add-bus", auth, async (req, res, next) => {
  try {
    const existingBus = await BusSchema.findOne({ number: req.body.number });
    if (existingBus) {
      return res.status(200).send({
        message: "Bus already exists",
        success: false,
      });
    }
    // new Bus
    const newBus = new BusSchema(req.body);
    await newBus.save();
    res.status(200).send({
      message: "Bus added successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

// get-all-buses

router.post("/get-all-buses", auth, async (req, res) => {
  try {
    const filters = req.body.filters || {};
    const query = {};

    // Apply filters dynamically
    if (filters.from) query.from = { $regex: new RegExp(filters.from, "i") }; // Case-insensitive
    if (filters.to) query.to = { $regex: new RegExp(filters.to, "i") }; // Case-insensitive

    // if (filters.journeyDate) {
    //   const date = new Date(filters.journeyDate);
    //   if (!isNaN(date.getTime())) {
    //     query.journeyDate = date;
    //   } else {
    //     return res.status(400).send({
    //       message: "Invalid journey date",
    //       success: false,
    //     });
    //   }
    // }

    console.log("Request Body Filters:", filters);
    console.log("Generated Query for MongoDB:", query);

    const buses =
      Object.keys(filters).length > 0
        ? await BusSchema.find(query)
        : await BusSchema.find().limit(10); // Limit results for large datasets

    res.status(200).send({
      message: "Bus fetched successfully",
      success: true,
      data: buses,
    });
  } catch (error) {
    console.error("Error fetching buses:", error.message);
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

//

//update bus
router.post("/update-bus", auth, async (req, res, next) => {
  try {
    await BusSchema.findByIdAndUpdate(req.body._id, req.body);
    res.status(200).send({
      message: "Bus updated successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

// delete bus
router.post("/delete-bus", auth, async (req, res, next) => {
  try {
    await BusSchema.findByIdAndDelete(req.body._id);
    res.status(200).send({
      message: "Bus Deleted successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

// get-bus-by-id

router.post("/get-bus-by-id", auth, async (req, res) => {
  try {
    const bus = await BusSchema.findById(req.body._id);
    return res.status(200).send({
      success: true,
      message: "Bus fetched successfully",
      data: bus,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

module.exports = router;
