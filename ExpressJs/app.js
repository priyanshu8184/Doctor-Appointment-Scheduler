const express = require('express');
const app = express();
const port = 3001;

const userRoutes = require("./routes/userRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const specialtyRoutes = require("./routes/specialtyRoutes");

app.use(express.json());


// Home route
app.get("/", (req, res) => {
    res.json({
        message: "HealPoint API is running"
    });
});

// 404 route
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/specialties", specialtyRoutes);
module.exports = app;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});