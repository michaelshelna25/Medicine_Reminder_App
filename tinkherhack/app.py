from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow all origins

# Configure SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///medicines.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Medicine Model
class Medicine(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    dosage = db.Column(db.String(50), nullable=False)
    scheduled_time = db.Column(db.String(10), nullable=False)

# Create database tables
with app.app_context():
    db.create_all()

# In-memory reminders list
reminders = []
id_counter = 1

# Route for Home Page (Medicine Form)
@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        medicine_name = request.form["medicine-name"]
        dosage = request.form["dosage"]
        scheduled_time = request.form["scheduled-time"]

        if not medicine_name or not dosage or not scheduled_time:
            return jsonify({"error": "All fields are required"}), 400

        new_medicine = Medicine(name=medicine_name, dosage=dosage, scheduled_time=scheduled_time)
        db.session.add(new_medicine)
        db.session.commit()
        return redirect(url_for("index"))

    medicines = Medicine.query.all()
    return render_template("index.html", medicines=medicines)

# Route to Delete Medicine Entry
@app.route("/delete/<int:id>")
def delete(id):
    medicine = Medicine.query.get(id)
    if medicine:
        db.session.delete(medicine)
        db.session.commit()
    return redirect(url_for("index"))

# Add a reminder (API)
@app.route('/api/reminders', methods=['POST'])
def add_reminder():
    global id_counter
    data = request.get_json()
    
    medicine_name = data.get('medicineName')
    dosage = data.get('dosage')
    scheduled_time = data.get('scheduledTime')
    
    # Validation check
    if not medicine_name or not dosage or not scheduled_time:
        print('Invalid data:', data)  # Debugging line
        return jsonify({'error': 'All fields are required.'}), 400
    
    new_reminder = {
        'id': id_counter,
        'medicineName': medicine_name,
        'dosage': dosage,
        'scheduledTime': scheduled_time
    }
    
    reminders.append(new_reminder)
    id_counter += 1
    print('Added new reminder:', new_reminder)  # Debugging line
    return jsonify(new_reminder), 201

# Get all reminders (API)
@app.route('/api/reminders', methods=['GET'])
def get_reminders():
    return jsonify(reminders)

# Delete a reminder (API)
@app.route('/api/reminders/<int:id>', methods=['DELETE'])
def delete_reminder(id):
    global reminders
    reminders = [reminder for reminder in reminders if reminder['id'] != id]
    return '', 204

if __name__ == "__main__":
    app.run(debug=True)
