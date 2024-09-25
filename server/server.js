const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/appointments', {
    useNewUrlParser: true,
    useUnifiedTopology: true,

});


const appointmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    start: {
        type: Date,  // Mongoose will automatically cast valid date strings to Date objects
        required: true,
    },
    end: {
        type: Date,  // Ensure this is Date type as well
        required: true,
    },
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
app.use(cors({
    origin: 'http://localhost:3000'  // or your frontend URL
}));

// API routes
app.post('/api/appointments', async (req, res) => {
    const { title, start, end } = req.body;
    const newAppointment = new Appointment({ title, start, end });
    await newAppointment.save();
    res.json(newAppointment);
});

app.get('/api/appointments', async (req, res) => {
    const appointments = await Appointment.find();
    res.json(appointments);
});

app.put('/api/appointments/:id', async (req, res) => {
    const { title, start, end } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { title, start, end }, { new: true });
    res.json(appointment);
});

app.delete('/api/appointments/:id', async (req, res) => {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment deleted' });
});

const port = 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
