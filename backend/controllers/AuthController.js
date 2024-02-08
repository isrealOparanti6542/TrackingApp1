const bcrypt = require('bcrypt');
const UserModel = require('../models/UserModel.js');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const searchLocation = require('../middleware/googleMap.js');
const ActiveRouteModel = require("../models/MapRoute.js")
 /** Middleware for verifying user */
 
exports.verifyUser = async function (req, res, next) {
  try {
    const { username } = req.method === 'GET' ? req.query : req.body;

    // Check if the user exists
    const exist = await UserModel.findOne({ username });

    if (!exist) {
      return res.status(404).json({ error: "Can't find User!" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authentication Error' });
  }
};

// Registering a new user
exports.register = async function (req, res) {
  try {
    const { firstname, lastname, email, username, password, role } = req.body;

    // Check for existing username
    const existingUsername = await UserModel.findOne({ username });
    if (existingUsername) {
      throw new Error("Please use a unique username");
    }

    // Check for existing email
    const existingEmail = await UserModel.findOne({ email });
    if (existingEmail) {
      throw new Error("Please use a unique email");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
     
    // Create a new user instance
    const user = new UserModel({
      firstname,
      lastname,
      email,
      username,
      password: hashedPassword,
      role,
    });
    // Save the user to the database
    const result = await user.save();
    res.status(201).send({ msg: "User Registered Successfully", result });

  
  } catch (error) {
    // Handle errors
    res.status(500).send({ error: error.message || "Internal Server Error" });
  }
};

// Login Users
exports.login = async function (req, res) {
  const { usernameOrEmail, password } = req.body;

  try {
    // Use a single query to find a user by either username or email
    const user = await UserModel.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User does not exist' });
    }
    
    const passwordIsValid = await bcrypt.compare(password, user.password);
    
 
    if (!passwordIsValid) {
      return res.status(400).json({ error: 'Wrong password' });
    }
     const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({ message: "Login Successful", token, userId: user._id });
  } catch (error) {
    return res.status(500).json({ error: 'Login failed', message: error.message });
  }
};


exports.getUser = async function (req, res) {
  const { username } = req.params;
  console.log(username);

  try {
    if (!username) {
      return res.status(400).json({ error: "Invalid Username" });
    }

    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove sensitive information like password from user
    const { password, ...rest } = user.toJSON();

    return res.status(200).json(rest);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
  
// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "isrealopa@gmail.com",
    pass: "qyqnnflaszxvmjtl"
  },
});

// Route for handling password reset requests
exports.passwordRecoveryEmail = async function (req, res) {
  try {
    const { email } = req.body;

    // Check if the user exists
    const user = await UserModel.findOne({ email });
   
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a unique OTP for password reset
    const resetOtp = otpGenerator.generate(6, { upperCase: false, specialChars: false });

    // Set OTP expiration (e.g., 5 minutes from now)
    const resetOtpExpiration = Date.now() + 300000;
   
    // Store the reset OTP and expiration in the database
    user.resetPasswordOtp = resetOtp;
    user.resetPasswordExpiration = resetOtpExpiration;
    await user.save();
  console.log(resetOtp)
    // Compose the password reset email with the OTP
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      text: `Your OTP for password reset is: ${resetOtp}`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset instructions sent to your email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.verifyOTP = async function (req, res) {
  try {
    const { OTPtoken, newPassword } = req.body;
const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Find the user with the provided reset token
   const user = await UserModel.findOneAndUpdate(
  {
    resetPasswordOtp: OTPtoken,
    resetPasswordExpiration: { $gt: Date.now() },
  },
  {
    $set: {
      password: hashedPassword,
      resetPasswordOtp: undefined,
      resetPasswordExpiration: undefined,
    },
  },
  { new: true }
   )
 
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Update the user's password
    // const hashedPassword = await bcrypt.hash(newPassword, 10);
    // user.password = hashedPassword;
    // user.resetPasswordOtp = undefined; // Update field name here
    // user.resetPasswordExpiration = undefined
    // await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

 




exports.searchLocation = async function (req, res) {
  try {
    const { locationQuery } = req.query;

    // Perform any necessary validation on the input
    // Call the searchLocation function
    const searchResults = await searchLocation(locationQuery);

    // Send the results back to the frontend
    res.json({ results: searchResults });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

 
// Create, retrieve, and update the status of an active route
exports.createActiveRoute = async function (req, res) {
  try {
    const { from, to } = req.body;

    // Create a new route
    const newRoute = new ActiveRouteModel({ from, to, status: 'in-progress' });
    const savedRoute = await newRoute.save();

    res.status(201).json({ message: 'Route created successfully', route: savedRoute });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get a list of active routes or update the status of a route
exports.activeStatus = async function (req, res) {
  try {
    const { routeId, newStatus } = req.query;

    if (routeId && newStatus) {
      // Update the status of a route
      const updatedRoute = await ActiveRouteModel.findByIdAndUpdate(routeId, { status: newStatus }, { new: true });
      res.json({ message: 'Route status updated successfully', route: updatedRoute });
    } else {
      // Get a list of active routes
      const activeRoutes = await ActiveRouteModel.find({ status: 'in-progress' });
      res.json({ activeRoutes });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.getRouteHistory = async function (req, res) {
  try {
    const routeHistory = await ActiveRouteModel.find();
    res.json({ routeHistory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
