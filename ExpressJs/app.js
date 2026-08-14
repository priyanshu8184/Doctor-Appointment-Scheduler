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
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Allow specific HTTP methods
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
const adminRoutes = require("./routes/adminRoutes");
const messageRoutes = require("./routes/messageRoutes");

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
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);


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


const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

const Message = require("./models/Message");
io.on('connection', (socket) => {
    console.log('User connected to socket:', socket.id);

    socket.on('join_room', (data) => {
        socket.join(`room_${data.appointmentId}`);
        console.log(`User joined room_${data.appointmentId}`);
    });

    socket.on('send_message', async (data) => {
        try {
            const savedMsg = await Message.create({
                appointment_id: data.appointmentId,
                sender_id: data.senderId,
                sender_role: data.senderRole,
                message_text: data.messageText
            });

            io.to(`room_${data.appointmentId}`).emit('receive_message', {
                message_id: savedMsg.message_id,
                appointment_id: savedMsg.appointment_id,
                sender_id: savedMsg.sender_id,
                sender_role: savedMsg.sender_role,
                message_text: savedMsg.message_text,
                created_at: savedMsg.created_at,
                User: {
                    email: data.senderEmail
                }
            });
        } catch (e) {
            console.error("Error saving socket message:", e);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected from socket:', socket.id);
    });
});

module.exports = app;

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});