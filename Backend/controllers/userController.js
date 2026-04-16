const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const pendingSignups = new Map();

function buildTransporter() {
  const hasCustomSmtp = process.env.SMTP_HOST && process.env.SMTP_USER;
  if (hasCustomSmtp) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || "false") === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

async function sendOtpEmail(to, otp, username) {
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("SMTP_HOST:", process.env.SMTP_HOST);

  if (!process.env.EMAIL_USER && !(process.env.SMTP_HOST && process.env.SMTP_USER)) {
    console.log("❌ Email config missing");
    return false;
  }

  const transporter = buildTransporter();

  try {
    const info = await transporter.sendMail({
      from: `Connecto <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your Connecto verification code",
      text: `Your OTP is ${otp}`,
    });

    console.log("✅ Email sent:", info.response);
    return true;
  } catch (err) {
    console.error("❌ EMAIL ERROR:", err);
    return false;
  }
}

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check karein ki user exist karta hai ya nahi
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res
        .status(400)
        .json({ message: "User does not exist!Create an account." });
    }

    const user = users[0];

    // 2. Password match karein (Hashed password ke sath)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid credentials (galat password)." });
    }

    // 3. Token generate karein
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET || "dev_jwt_secret",
      { expiresIn: "1d" }, // 1 din tak login rahega
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.signup = async (req, res) => {
  const { username, email, password, hometown } = req.body;

  // 1. Basic Validation
  if (!username || !email || !password || !hometown) {
    return res
      .status(400)
      .json({ message: "All field are required!" });
  }

  // 2. NIT KKR Email Check
  if (!email.endsWith("@nitkkr.ac.in")) {
    return res
      .status(400)
      .json({ message: "Sirf @nitkkr.ac.in email hi allowed hai!" });
  }

  try {
    // 3. Check if user already exists
    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
    );
    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ message: "Email pehle se registered hai!" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    pendingSignups.set(email.toLowerCase(), {
      username,
      email,
      password,
      hometown,
      otp,
      expiresAt: Date.now() + OTP_TTL_MS,
    });

    const mailSent = await sendOtpEmail(email, otp, username);

    res.status(200).json(
      mailSent
        ? {
            message: "Verification code sent to your email.",
            requiresVerification: true,
          }
        : {
            message: "Email not configured, using dev OTP mode.",
            requiresVerification: true,
            devOtp: otp,
          },
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifySignupOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required." });
  }

  try {
    const key = email.toLowerCase();
    const pending = pendingSignups.get(key);
    if (!pending) {
      return res.status(400).json({ message: "No pending signup found for this email." });
    }
    if (Date.now() > pending.expiresAt) {
      pendingSignups.delete(key);
      return res.status(400).json({ message: "OTP expired. Please signup again." });
    }
    if (String(pending.otp) !== String(otp).trim()) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [pending.email]);
    if (existingUser.length > 0) {
      pendingSignups.delete(key);
      return res.status(400).json({ message: "Email pehle se registered hai!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(pending.password, salt);
    const sql = "INSERT INTO users (username, email, password, hometown) VALUES (?, ?, ?, ?)";
    await db.query(sql, [pending.username, pending.email, hashedPassword, pending.hometown]);
    pendingSignups.delete(key);

    return res.status(201).json({ message: "Account verified and created successfully!" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // 🔥 Delete related data first
    await db.query(
      "DELETE FROM connections WHERE sender_id = ? OR receiver_id = ?",
      [userId, userId]
    );

    await db.query(
      "DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?",
      [userId, userId]
    );

    await db.query("DELETE FROM posts WHERE user_id = ?", [userId]);

    await db.query("DELETE FROM community_members WHERE user_id = ?", [
      userId,
    ]);

    // 🔥 Finally delete user
    await db.query("DELETE FROM users WHERE id = ?", [userId]);

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({ error: err.message });
  }
};