require('dotenv').config();
const express = require('express');
const { connectDB } = require("./config/db");

const app = express();
const port = process.env.port || 3001;
const cors = require('cors');

// Connect and sync database
connectDB();

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// enable CORS for all routes (must be before route registration)
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
}));

//Routes
const userRoutes = require("./routes/userRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const specialtyRoutes = require("./routes/specialtyRoutes");
const doctorSpecialtyRoutes = require("./routes/doctorSpecialtyRoutes");
const doctorAvailabilityRoutes = require("./routes/doctorAvailabilityRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const waitlistRoutes = require("./routes/waitlistRoutes");
const patientInsuranceRoutes = require("./routes/patientInsuranceRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const medicalRecordRoutes = require("./routes/medicalRecordRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");


app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/specialties", specialtyRoutes);
app.use("/api/doctor-specialties", doctorSpecialtyRoutes);
app.use("/api/doctor-availability", doctorAvailabilityRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/waitlist", waitlistRoutes);
app.use("/api/patient-insurance", patientInsuranceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);



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


module.exports = app;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});