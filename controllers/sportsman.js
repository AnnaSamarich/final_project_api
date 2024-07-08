const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const { Sportsman, sportsmanJoiSchema } = require("../models");
const { handler, authenticatedToken } = require("../helpers");
const transporter = require("../nodemailerConfig");
const fs = require("fs").promises;
const handlebars = require("handlebars");

const hashedPassword = async (password) => await bcrypt.hash(password, 10);
const checkedPassword = async (password1, password2) =>
  await bcrypt.compare(password1, password2);

router.post("/register", async (req, res) => {
  const { error } = sportsmanJoiSchema.validate(req.body);
  if (error)
    return await handler(res, 400, { error: error.details[0].message });

  const { preferences, sportsmanname, password, email } = req.body;
  try {
    const sportsman = new Sportsman({
      preferences,
      sportsmanname,
      password: await hashedPassword(password),
      email,
      trainings: [],
    });
    await sportsman.save();

    const html = await fs.readFile(__dirname + "/../emailTemplate.hbs", "utf-8");
    const template = handlebars.compile(html);
    const replacements = {
      title: "Registration Successfully",
      message: `Hello ${sportsmanname}, you have successfully registered!`,
    };
    const htmlToSend = template(replacements);

    const mailOptions = {
      from: process.env.USER,
      to: email,
      subject: "Registration Successful",
      html: htmlToSend,
    };

    await transporter.sendMail(mailOptions);
    await handler(res, 201, sportsman);
  } catch (error) {
    await handler(res, 500, { error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { sportsmanname, password } = req.body
  try {
    const sportsman = await Sportsman.findOne({ sportsmanname });
    if (!sportsman || !(await checkedPassword(password, sportsman.password)))
      return await handler(res, 401, { message: "Invalid data" });

    const token = jwt.sign({ id: sportsman._id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });
    await handler(res, 200, { token });
  } catch (error) {
    await handler(res, 500, { error: error.message });
  }
});

router.get("/profile", authenticatedToken, async (req, res) => {
  try {
    const sportsman = await Sportsman.findById(req.sportsman.id)
      .select("-password")
      .populate("trainings", "-sportmans");
    if (!sportsman) return await handler(res, 404, { message: "Sportsman not found" });
    await handler(res, 200, sportsman);
  } catch (error) {
    await handler(res, 500, { error: error.message });
  }
});

router.put("/profile/update", authenticatedToken, async (req, res) => {

  try {
    const updateData = await Sportsman.findByIdAndUpdate(req.sportsman.id, { ...req.body }, { new: true });

    let profile;

    if (updateData) profile = await Sportsman.findById(req.sportsman.id).select("-password").populate("trainings");

    await handler(res, 200, profile);
  } catch (error) {
    await handler(res, 500, { error: error.message });
  }
});

router.delete("/profile/delete", authenticatedToken, async (req, res) => {
  try {
    const sportman = await Sportsman.findById(req.sportsman.id);
    if (!sportman) return await handler(res, 404, { message: "Sportsman not found" });

    await Sportsman.deleteOne({ _id: req.sportsman.id });

    await handler(res, 200, { message: "Acount deleted" });
  } catch (error) {
    await handler(res, 500, { error: error.message });
  }
});

module.exports = router;
