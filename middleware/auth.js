const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    // Authorization header se token ko extract karte hain
    // const token =
    //   req.headers.authorization && req.headers.authorization.split(" ")[1];
    const token =
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
        ? req.headers.authorization.split(" ")[1]
        : null;
    // console.log("Extracted Token:", token);

    if (!token) {
      return res.status(401).send({
        message: "Auth faild",
        success: false,
      });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userId = decode.userId;
    next();
  } catch (error) {
    res.status(401).send({
      message: "Auth faild",
      success: false,
    });
  }
};
