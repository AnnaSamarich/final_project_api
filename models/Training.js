const { Schema, model } = require("mongoose");
const Joi = require("joi");
const { required } = require("joi");

const trainingSchema = Schema(
  {
    direction: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    coach: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    sportsmans: [{ type: Schema.Types.ObjectId, ref: "Sportsman" }],
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

const trainingJoiSchema = Joi.object({
  direction: Joi.string().min(2).max(30).required(),
  level: Joi.string().min(2).max(30).required(),
  date: Joi.string().min(2).max(30).required(),
  duration: Joi.string().min(2).max(30).required(),
  duration: Joi.string().min(2).max(30).required(),
  coach: Joi.array().items(Joi.string().hex().length(24)),
  email: Joi.string().min(2).max(30).required(),
});

const Training = model("Training", trainingSchema);
module.exports = { Training, trainingJoiSchema };

