/*const router = require("express").Router();
const { Training } = require("../models/Training");
const { Sportsman } = require("../models/Sportsman");

const { handler, authenticatedToken } = require("../helpers");

router.post("/", authenticatedToken, async (req, res) => {
  const { direction, level, date, duration, coach, sportsmans } = req.body;
  try {
    const training = new Training({
      direction, 
      level,
      date, 
      duration, 
      coach,
      sportsmans: sportsmans || [],
    });
    await training.save();
    sportsmans.forEach(async (id) => {
      const sportsman = await Sportsman.findById(id);
      if (sportsman) {
        sportsman.trainings.push(training._id);
        await sportsman.save();
      }
    });
    await handler(res, 201, training);
  } catch (error) {
    await handler(res, 400, { error: error.message });
  }
});

router.get("/", authenticatedToken, async (req, res) => {
  try {
    const trainings = await Training.find().populate("sportsmans", "-password -trainings");
    await handler(res, 201, trainings);
  } catch (error) {
    await handler(res, 500, { error: error.message });
  }
});

router.put("/:id", authenticatedToken, async (req, res) => {
  const { id } = req.params;
  try {
    const training = await Training.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true },
    ).populate("sportsmans", "-password", "-trainings");
    if (!training)
      return await handler(res, 404, { message: "Training not found" });
    await handler(res, 200, training);
  } catch (error) {
    await handler(res, 500, { error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const training = await Training.findByIdAndDelete(id);
    if (!training)
      return await handler(res, 404, { message: "Training not found" });
    training.sportsmans.forEach(async (sportsmanId) => {
      const sportsman = await Sportsman.findById(sportsmanId);
      if (sportsman) {
        sportsman.trainings.pull(training._id);
        await sportsman.save();
      }
    });
    await handler(res, 200, {});
  } catch (error) {
    await handler(res, 500, { error: error.message });
  }
});

module.exports = router;
*/

const router = require("express").Router();
const { Training } = require("../models/Training");
const { Sportsman } = require("../models/Sportsman");
const { handler, authenticatedToken } = require("../helpers");
const transporter = require("../nodemailerConfig");
const fs = require("fs").promises;
const handlebars = require("handlebars");

router.post("/", authenticatedToken, async (req, res) => {
  const { direction, level, date, duration, coach, sportsmans } = req.body;
  try {
    const training = new Training({
      direction,
      level,
      date,
      duration,
      coach,
      email,
      sportsmans: sportsmans || [],
    });
    await training.save();

    for (const id of sportsmans) {
      const sportsman = await Sportsman.findById(id);
      if (sportsman) {
        sportsman.trainings.push(training._id);
        await sportsman.save();
      }
    }

    await handler(res, 201, training);
  } catch (error) {
    await handler(res, 400, { error: error.message });
  }
});

router.get("/", authenticatedToken, async (req, res) => {
  try {
    const filters = {};

    if (req.query.direction) {
      filters.direction = req.query.direction;
    }
    if (req.query.level) {
      filters.level = req.query.level;
    }
    if (req.query.date) {
      filters.date = req.query.date;
    }
    if (req.query.duration) {
      filters.duration = req.query.duration;
    }
    if (req.query.coach) {
      filters.coach = req.query.coach;
    }

    const trainings = await Training.find(filters).populate("sportsmans", "-password -trainings");
    await handler(res, 200, trainings);
  } catch (error) {
    await handler(res, 500, { error: error.message });
  }
});

router.put("/:id", authenticatedToken, async (req, res) => {
  const { id } = req.params;
  try {
    const filters = {};

    if (req.body.direction) {
      filters.direction = req.body.direction;
    }
    if (req.body.level) {
      filters.level = req.body.level;
    }
    if (req.body.date) {
      filters.date = req.body.date;
    }
    if (req.body.duration) {
      filters.duration = req.body.duration;
    }
    if (req.body.coach) {
      filters.coach = req.body.coach;
    }

    const training = await Training.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    ).populate("sportsmans", "-password, -trainings");

    if (!training) {
      return await handler(res, 404, { message: "Training not found" });
    }

    if (Object.keys(filters).length > 0) {
      for (const key in filters) {
        if (Object.hasOwnProperty.call(filters, key)) {
          if (training[key] !== filters[key]) {
            return await handler(res, 400, { message: `Invalid ${key}` });
          }
        }
      }
    }
    const html = await fs.readFile(__dirname + "/../emailTemplate.hbs", "utf-8");
    const template = handlebars.compile(html);
    const replacements = {
      title: "Training Updated",
      message: `Hello ${req.sportsman.sportsmanname}, your training details have been updated!`,
    };
    const htmlToSend = template(replacements);

    const mailOptions = {
      from: process.env.USER,
      to: req.sportsman.email,
      subject: "Training Updated",
      html: htmlToSend,
    };

    await transporter.sendMail(mailOptions);
    await handler(res, 200, training);
  } catch (error) {
    await handler(res, 500, { error: error.message });
  }
});

router.delete("/:id", authenticatedToken, async (req, res) => {
  const { id } = req.params;
  try {
    const filters = {};

    if (req.query.direction) {
      filters.direction = req.query.direction;
    }
    if (req.query.level) {
      filters.level = req.query.level;
    }
    if (req.query.date) {
      filters.date = req.query.date;
    }
    if (req.query.duration) {
      filters.duration = req.query.duration;
    }
    if (req.query.coach) {
      filters.coach = req.query.coach;
    }


    const training = await Training.findByIdAndDelete(id);

    if (!training) {
      return await handler(res, 404, { message: "Training not found" });
    }

    if (Object.keys(filters).length > 0) {
      for (const key in filters) {
        if (Object.hasOwnProperty.call(filters, key)) {
          if (training[key] !== filters[key]) {
            return await handler(res, 400, { message: `Invalid ${key}` });
          }
        }
      }
    }

    for (const sportsmanId of training.sportsmans) {
      const sportsman = await Sportsman.findById(sportsmanId);
      if (sportsman) {
        sportsman.trainings.pull(training._id);
        await sportsman.save();
      }
    }

    await handler(res, 200, {});
  } catch (error) {
    await handler(res, 500, { error: error.message });
  }
});

module.exports = router;

