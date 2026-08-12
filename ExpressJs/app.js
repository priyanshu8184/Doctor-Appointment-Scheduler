const express = require('express');
const app = express();
const port = 3001;

const userRoutes = require("./routes/userRoutes");

app.use(express.json());

//===============================
// user Routes
//===============================

app.use("/api/users", userRoutes);

module.exports = app;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});