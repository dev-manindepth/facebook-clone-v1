const bcrypt = require("bcrypt");
const { sendVerification } = require("../helpers/mailer");
const { generateToken } = require("../helpers/token");
const jwt = require("jsonwebtoken");
const {
  validateEmail,
  validateLength,
  validateUsername,
} = require("../helpers/validation");
const User = require("../models/User");

exports.register = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      username,
      bYear,
      bMonth,
      bDay,
      gender,
    } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }
    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) {
      return res.status(400).json({
        message: "Email already exists Try with different email address",
      });
    }
    if (!validateLength(first_name, 3, 30)) {
      return res.status(400).json({
        message:
          "first_name must be greater than 3 and less than 30 characters",
      });
    }
    if (!validateLength(last_name, 3, 30)) {
      return res.status(400).json({
        message: "last_name must be greater than 3 and less than 30 characters",
      });
    }
    if (!validateLength(password, 6, 40)) {
      return res.status(400).json({
        message: "password must be greater than 6 ",
      });
    }
    const cryptedPassword = await bcrypt.hash(password, 12);
    let tempUsername = first_name + last_name;
    let newUsername = await validateUsername(tempUsername);

    const user = await new User({
      first_name,
      last_name,
      email,
      password: cryptedPassword,
      username: newUsername,
      bYear,
      bMonth,
      bDay,
      gender,
    }).save();

    const emailVerificationToken = generateToken(
      { id: user._id.toString() },
      "30m"
    );
    console.log(emailVerificationToken);

    const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`;
    sendVerification(user.email, user.first_name, url);

    const token = generateToken({ id: user._id.toString() }, "7d");

    res.status(200).json({
      id: user._id,
      username: user.username,
      picture: user.picture,
      first_name: user.first_name,
      last_name: user.last_name,
      token: token,
      verified: user.verified,
      message: "Register success! Please activate your email to start",
    });
  } catch (err) {
    res.status(500).json({ message: err.message, error: true });
  }
};

exports.activateAccount = async (req, res) => {
  try {
    const { token } = req.body;
    const user = jwt.verify(token, process.env.TOKEN_SECRET);
    // Check if user is already activated
    const check = await User.findById(user.id);
    if (check.verified == true) {
      return res
        .status(400)
        .json({ message: "This email is already activated" });
    } else {
      await User.findByIdAndUpdate(user.id, { verified: true });
      return res
        .status(200)
        .json({ message: "Account has been successfully activated" });
    }
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try{

  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if(!user){
    return res.status(400).json({ message: "the email address you entered is not connected to an account." });
  }
  const check=await bcrypt.compare(password,user.password)
  if(!check){
    return res.status(400).json({message:"Invalid Credentials! Please Try again"})
  }

  const token = generateToken({ id: user._id.toString() }, "7d");

  res.status(200).json({
    id: user._id,
    username: user.username,
    picture: user.picture,
    first_name: user.first_name,
    last_name: user.last_name,
    token: token,
    verified: user.verified,
    message: "Login Successful",
  });

  }catch(err){
    return res.status(400).json({message:err.message})
  }
};
