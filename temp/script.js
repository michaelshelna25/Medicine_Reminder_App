document.getElementById('reminderForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const medicineName = document.getElementById('medicineName').value;
    const dosage = document.getElementById('dosage').value;
    const scheduledTime = document.getElementById('scheduledTime').value;

    console.log('Form data:', { medicineName, dosage, scheduledTime });

    // Validate if scheduledTime is in the future
    const now = new Date();
    const selectedTime = new Date(`${now.toDateString()} ${scheduledTime}:00`); // Add seconds for proper parsing
    if (selectedTime <= now) {
        alert('Scheduled time must be in the future.');
        return;
    }

    if (medicineName && dosage && scheduledTime) {
        try {
            const response = await fetch('http://localhost:5000/api/reminders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ medicineName, dosage, scheduledTime }),
            });

            console.log('Response status:', response.status); // Debugging line
            if (response.ok) {
                alert('Reminder added successfully!');
                loadReminders();
                document.getElementById('reminderForm').reset(); 
            } else {
                const errorResponse = await response.json();
                console.log('Error response:', errorResponse); // Debugging line
                alert('Failed to add reminder. Server returned an error: ' + errorResponse.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to add reminder. Check the console for details.');
        }
    } else {
        alert('Please fill in all fields.');
    }
});

// Load reminders from the backend
async function loadReminders() {
    try {
        const response = await fetch('http://localhost:5000/api/reminders');
        if (!response.ok) {
            throw new Error('Failed to fetch reminders.');
        }
        const reminders = await response.json();
        const reminderList = document.getElementById('reminderList');

        reminderList.innerHTML = ''; // Clear the list
        reminders.forEach(reminder => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span><strong>${reminder.medicineName}</strong> - ${reminder.dosage} at ${reminder.scheduledTime}</span>
                <button onclick="deleteReminder('${reminder.id}')">Delete</button>
            `;
            reminderList.appendChild(li);
        });
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load reminders. Check the console for details.');
    }
}

// Delete a reminder
async function deleteReminder(id) {
    try {
        const response = await fetch(`http://localhost:5000/api/reminders/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            alert('Reminder deleted successfully!');
            loadReminders(); // Refresh the reminders list
        } else {
            alert('Failed to delete reminder. Server returned an error.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete reminder. Check the console for details.');
    }
}

// Load reminders when the page loads
window.onload = loadReminders;
