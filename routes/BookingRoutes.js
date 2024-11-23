const router = require("express").Router();
const BookingModels = require("../models/BookingModels");
const BusModels = require("../models/BusModels");
const { v4: uuidv4 } = require("uuid");

const auth = require("../middleware/auth");

// Route to book seats on a bus
router.post("/book-seat", auth, async (req, res) => {
  try {
    // Create a new booking record using the data from the request body
    const newBooking = new BookingModels({
      ...req.body, // Spread operator to include all properties from the request body
      transactionId: "1234", // Replace this with the actual transaction ID from Stripe or your payment provider
      user: req.body.userId, // Ensure userId is correctly passed in the request body
    });

    // Save the new booking in the database
    await newBooking.save();

    // Fetch the corresponding bus from the database by its ID
    const bus = await BusModels.findById(req.body.bus);
    if (!bus) {
      // Handle case where the bus is not found
      return res.status(404).send({ success: false, message: "Bus not found" });
    }

    // Add the newly booked seats to the `seatsBooked` array of the bus
    bus.seatsBooked = [...bus.seatsBooked, ...req.body.seats];

    // Save the updated bus details in the database
    await bus.save();

    // Send a success response to the client
    return res.status(200).send({
      success: true,
      message: "Booking successfully",
      data: newBooking,
    });
  } catch (error) {
    console.error("Booking Error:", error); // Log the error for debugging
    // Send an error response to the client
    res.status(500).send({ success: false, message: "Booking failed" });
  }
});

// MAKE PAYMENT

const stripe = require("stripe")(process.env.STRIPE_KEY); // environment variable is set as 'STRIPE_KEY'

// Express router POST route for payment processing
router.post("/make-payment", auth, async (req, res) => {
  try {
    // Frontend se token aur amount receive karte hain
    const { token, amount } = req.body;

    // Stripe customer create karte hain
    const customer = await stripe.customers.create({
      email: token.email, // Customer ka email set karte hain
      source: token.id, // Payment source (Stripe token)
    });

    // Stripe charge create karte hain (ye actual payment hai)
    const payment = await stripe.charges.create(
      {
        amount: amount, // Amount in paise (100 paise = 1 INR)
        currency: "inr", // Currency set karte hain
        customer: customer.id, // Customer ID jo abhi create ki hai
        receipt_email: token.email, // Payment ka receipt email
      },
      {
        idempotencyKey: uuidv4(), // Ye key duplicate payments ko prevent karta hai
      }
    );

    // Agar payment successful ho gaya
    if (payment) {
      res.status(200).send({
        message: "Payment successful", // Success message
        data: {
          transactionId: payment.source.id, // Transaction ID return karte hain
        },
        success: true,
      });
    } else {
      // Agar payment fail ho gaya
      res.status(500).send({
        message: "Payment failed", // Failure message
        data: null,
        success: false,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Payment failed",
      data: error, // Error details return karte hain
      success: false,
    });
  }
});

// get bookings by user id
router.post("/get-bookings-by-user-id", auth, async (req, res) => {
  try {
    // Ensure ki userId request body me ho ya authenticated user se le
    const userId = req.body.userId; // auth middleware me user data set hona chahiye
    console.log(userId);

    const bookings = await BookingModels.find({ user: userId }).populate("bus"); // Populate buses collection
    //   .populate("user"); // Populate user details

    res.status(200).send({
      message: "Bookings fetched successfully",
      data: bookings,
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: "Bookings fetch failed",
      data: error,
      success: false,
    });
  }
});

module.exports = router;
