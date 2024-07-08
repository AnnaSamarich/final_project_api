const express = require("express");
const morgan = require("morgan");
const { sportsmanRouter, trainingRouter } = require("./controllers");
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs").promises;

const app = express();

app.use(express.json());
app.use(morgan("dev"));

const { PORT, SERVICE, USER, PASS } = process.env;

const readHTMLFile = async (path) => {
    return await fs.readFile(path, { encoding: "utf-8" });
};

const config = {
    service: SERVICE,
    auth: {
        user: USER,
        pass: PASS,
    },
};

app.post("/send-email", async (req, res) => {
    const { email, name, text } = req.body;
    const transporter = nodemailer.createTransport(config);

    try {
        const html = await readHTMLFile(__dirname + "/emailTemplate.hbs");
        const template = handlebars.compile(html);
        const htmlToSend = template({ name, text });

        const emailOptions = {
            from: USER,
            to: email,
            subject: "Registration successfully",
            html: htmlToSend,
        };

        await transporter.sendMail(emailOptions);
        res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

app.use("/api/sportsman", sportsmanRouter);
app.use("/api/training", trainingRouter);

module.exports = { app };

