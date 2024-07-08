require("dotenv").config();
const mongoose = require("mongoose");
const { app } = require("../app");

const { M_NAME, M_PASSWORD, M_PARAMS, M_DB, PORT } = process.env;

const M_STR = `mongodb+srv://${M_NAME}:${M_PASSWORD}@${M_PARAMS}/${M_DB}`;

mongoose
  .connect(M_STR)
  .then(() => {
    app.listen(PORT);
  })
  .catch((error) => {
    throw new Error(error);
  });
