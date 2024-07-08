const { Schema, model } = require("mongoose");
const Joi = require("joi");
const sportsmanSchema = Schema(
  {
    preferences: {
      type: String,
      required: true,
    },
    sportsmanname: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    trainings: [{ type: Schema.Types.ObjectId, ref: "Training" }],
  },
  { versionKey: false, timestamps: true },
);

const sportsmanJoiSchema = Joi.object({
  preferences: Joi.string().min(3).max(30).required(),
  sportsmanname: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  email: Joi.string().email().required(),
  trainings: Joi.array().items(Joi.string().hex().length(24)),
});

const Sportsman = model("Sportsman", sportsmanSchema);
module.exports = { Sportsman, sportsmanJoiSchema };
