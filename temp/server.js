const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

app.use(cors({ origin: '*' })); // Allow all origins
app.use(bodyParser.json());

let reminders = [];
let idCounter = 1;

// Add a reminder
app.post('/api/reminders', (req, res) => {
    const { medicineName, dosage, scheduledTime } = req.body;

    // Validation check
    if (!medicineName || !dosage || !scheduledTime) {
        console.log('Invalid data:', req.body); // Debugging line
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const newReminder = {
        id: idCounter++,
        medicineName,
        dosage,
        scheduledTime,
    };
    reminders.push(newReminder);
    console.log('Added new reminder:', newReminder); // Debugging line
    res.status(201).json(newReminder);
});

// Get all reminders
app.get('/api/reminders', (req, res) => {
    res.json(reminders);
});

// Delete a reminder
app.delete('/api/reminders/:id', (req, res) => {
    const id = parseInt(req.params.id);
    reminders = reminders.filter(reminder => reminder.id !== id);
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
