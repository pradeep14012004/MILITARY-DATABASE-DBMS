const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static('public'));

require('dotenv').config();
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

db.query('SELECT 1', (err, results) => {
    if (err) {
        console.error('Database connection test failed:', err);
    } else {
        console.log('Database connection test succeeded:', results);
    }
});


app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/home', (req, res) => res.sendFile(path.join(__dirname, 'public', 'home.html')));
app.get('/aasi', (req, res) => res.sendFile(path.join(__dirname, 'public', 'aSsi.html')));

app.get('/depe', (req, res) => res.sendFile(path.join(__dirname, 'public', 'depe.html')));
app.get('/equip', (req, res) => res.sendFile(path.join(__dirname, 'public', 'equip.html')));

app.get('/med', (req, res) => res.sendFile(path.join(__dirname, 'public', 'med.html')));
app.get('/mission', (req, res) => res.sendFile(path.join(__dirname, 'public', 'mission.html')));
app.get('/pay', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pay.html')));


app.get('/sold', (req, res) => res.sendFile(path.join(__dirname, 'public', 'sold.html')));
app.get('/train', (req, res) => res.sendFile(path.join(__dirname, 'public', 'train.html')));

app.get('/unit', (req, res) => res.sendFile(path.join(__dirname, 'public', 'unit.html')));

app.post('/api/qua', (req, res) => {
    const { serviceid, course_id, date_completed, score } = req.body;

    const query = `
        INSERT INTO qua_table (serviceid, course_id, date_completed, score)
        VALUES (?, ?, ?, ?)
    `;
    db.query(query, [serviceid, course_id, date_completed, score], (err, results) => {
        if (err) {
            console.error('Error inserting data into qua_table:', err);
            res.status(500).send('Error saving qualification');
        } else {
            res.status(200).send('Qualification saved successfully');
        }
    });
});

app.get('/api/qua', (req, res) => {
    const query = 'SELECT * FROM qua_table';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching qualifications:', err);
            res.status(500).send('Error fetching qualifications');
        } else {
            res.json(results);
        }
    });
});

app.get('/api/units', (req, res) => {
    const query = 'SELECT unit_id, unit_name, unit_type, location, commander_id, parent_unit_id FROM units';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching units:', err);
            return res.status(500).json({ error: 'Failed to fetch units' });
        }
        res.status(200).json(results);
    });
});

app.post('/api/units', (req, res) => {
    const { unit_id, unit_name, unit_type, location, commander_id, parent_unit_id } = req.body;

    const query = `
        INSERT INTO units (unit_id, unit_name, unit_type, location, commander_id, parent_unit_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [unit_id, unit_name, unit_type, location, commander_id, parent_unit_id], (err, result) => {
        if (err) {
            console.error('Error adding unit:', err);
            return res.status(500).json({ error: 'Failed to add unit' });
        }
        res.status(201).json({ message: 'Unit added successfully' });
    });
});

app.put('/api/units/:id', (req, res) => {
    const { id } = req.params;
    const { unit_name, unit_type, location, commander_id, parent_unit_id } = req.body;

    const query = `
        UPDATE units
        SET unit_name = ?, unit_type = ?, location = ?, commander_id = ?, parent_unit_id = ?
        WHERE unit_id = ?
    `;
    db.query(query, [unit_name, unit_type, location, commander_id, parent_unit_id, id], (err, result) => {
        if (err) {
            console.error('Error updating unit:', err);
            return res.status(500).json({ error: 'Failed to update unit' });
        }
        res.status(200).json({ message: 'Unit updated successfully' });
    });
});

// Delete a unit
app.delete('/api/units/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM units WHERE unit_id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting unit:', err);
            return res.status(500).json({ error: 'Failed to delete unit' });
        }
        res.status(200).json({ message: 'Unit deleted successfully' });
    });
});


app.get('/api/courses', (req, res) => {
    const query = 'SELECT * FROM courses';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching courses:', err);
            res.status(500).send('Error fetching courses');
        } else {
            res.json(results);
        }
    });
});


app.post('/api/courses', (req, res) => {
    const { course_id, service_id, course_name, duration_days, instructor_id, institute } = req.body;

    const query = `
        INSERT INTO courses (course_id, service_id, course_name, duration_days, instructor_id, institute)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [course_id, service_id, course_name, duration_days, instructor_id, institute], (err, result) => {
        if (err) {
            console.error('Error inserting course:', err);
            return res.status(500).json({ error: 'Failed to add course' });
        }
        res.status(201).json({ message: 'Course added successfully' });
    });
});


app.put('/api/courses/:id', (req, res) => {
    const { id } = req.params;
    const { service_id, course_name, duration_days, instructor_id, institute } = req.body;

    const query = 'UPDATE courses SET service_id = ?, course_name = ?, duration_days = ?, instructor_id = ?, institute = ? WHERE course_id = ?';
    db.query(query, [service_id, course_name, duration_days, instructor_id, institute, id], (err, results) => {
        if (err) {
            console.error('Error updating course:', err);
            res.status(500).send('Error updating course');
        } else {
            res.send('Course updated successfully');
        }
    });
});


app.delete('/api/courses/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM courses WHERE course_id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error deleting course:', err);
            res.status(500).send('Error deleting course');
        } else {
            res.send('Course deleted successfully');
        }
    });
});


app.post('/api/equipment', (req, res) => {
    const { type, serial_number, status } = req.body;

    if (!type || !serial_number || !status) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const query = `
        INSERT INTO equipment (type, serial_number, status)
        VALUES (?, ?, ?)
    `;
    db.query(query, [type, serial_number, status], (err, result) => {
        if (err) {
            console.error('Error inserting equipment:', err);
            return res.status(500).json({ error: 'Failed to add equipment' });
        }
        res.status(201).json({ message: 'Equipment added successfully', id: result.insertId });
    });
});

app.get('/api/equipment', (req, res) => {
    const query = 'SELECT * FROM equipment';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching equipment:', err);
            return res.status(500).json({ error: 'Failed to fetch equipment' });
        }
        res.status(200).json(results);
    });
});

app.put('/api/equipment/:id', (req, res) => {
    const { id } = req.params;
    const { type, serial_number, status } = req.body;

    if (!type || !serial_number || !status) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const query = `
        UPDATE equipment
        SET type = ?, serial_number = ?, status = ?
        WHERE equipment_id = ?
    `;
    db.query(query, [type, serial_number, status, id], (err, result) => {
        if (err) {
            console.error('Error updating equipment:', err);
            return res.status(500).json({ error: 'Failed to update equipment' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Equipment not found' });
        }
        res.status(200).json({ message: 'Equipment updated successfully' });
    });
});


app.delete('/api/equipment/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM equipment WHERE equipment_id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting equipment:', err);
            return res.status(500).json({ error: 'Failed to delete equipment' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Equipment not found' });
        }
        res.status(200).json({ message: 'Equipment deleted successfully' });
    });
});


app.post('/api/assignments', (req, res) => {
    const { serviceid, equipment_id, date_assigned, date_returned } = req.body;

    if (!serviceid || !equipment_id || !date_assigned) {
        return res.status(400).json({ error: 'All required fields must be filled.' });
    }

    const query = `
        INSERT INTO assignments (serviceid, equipment_id, date_assigned, date_returned)
        VALUES (?, ?, ?, ?)
    `;
    db.query(query, [serviceid, equipment_id, date_assigned, date_returned || null], (err, result) => {
        if (err) {
            console.error('Error inserting assignment:', err);
            return res.status(500).json({ error: 'Failed to add assignment' });
        }
        res.status(201).json({ message: 'Assignment added successfully', id: result.insertId });
    });
});


app.get('/api/assignments', (req, res) => {
    const query = 'SELECT * FROM assignments';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching assignments:', err);
            return res.status(500).json({ error: 'Failed to fetch assignments' });
        }
        res.status(200).json(results);
    });
});


app.put('/api/assignments/:id', (req, res) => {
    const { id } = req.params;
    const { serviceid, equipment_id, date_assigned, date_returned } = req.body;

    if (!serviceid || !equipment_id || !date_assigned) {
        return res.status(400).json({ error: 'All required fields must be filled.' });
    }

    const query = `
        UPDATE assignments
        SET serviceid = ?, equipment_id = ?, date_assigned = ?, date_returned = ?
        WHERE assignment_id = ?
    `;
    db.query(query, [serviceid, equipment_id, date_assigned, date_returned || null, id], (err, result) => {
        if (err) {
            console.error('Error updating assignment:', err);
            return res.status(500).json({ error: 'Failed to update assignment' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Assignment not found' });
        }
        res.status(200).json({ message: 'Assignment updated successfully' });
    });
});


app.delete('/api/assignments/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM assignments WHERE assignment_id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting assignment:', err);
            return res.status(500).json({ error: 'Failed to delete assignment' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Assignment not found' });
        }
        res.status(200).json({ message: 'Assignment deleted successfully' });
    });
});

app.post('/api/dependents', (req, res) => {
    const { serviceid, name, relationship, date_of_birth } = req.body;

    if (!serviceid || !name || !relationship) {
        return res.status(400).json({ error: 'All required fields must be filled.' });
    }

    const query = `
        INSERT INTO dependents (serviceid, name, relationship, date_of_birth)
        VALUES (?, ?, ?, ?)
    `;
    db.query(query, [serviceid, name, relationship, date_of_birth || null], (err, result) => {
        if (err) {
            console.error('Error inserting dependent:', err);
            return res.status(500).json({ error: 'Failed to add dependent' });
        }
        res.status(201).json({ message: 'Dependent added successfully', id: result.insertId });
    });
});

app.get('/api/dependents', (req, res) => {
    const query = 'SELECT * FROM dependents';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching dependents:', err);
            return res.status(500).json({ error: 'Failed to fetch dependents' });
        }
        res.status(200).json(results);
    });
});

app.put('/api/dependents/:id', (req, res) => {
    const { id } = req.params;
    const { serviceid, name, relationship, date_of_birth } = req.body;

    if (!serviceid || !name || !relationship) {
        return res.status(400).json({ error: 'All required fields must be filled.' });
    }

    const query = `
        UPDATE dependents
        SET serviceid = ?, name = ?, relationship = ?, date_of_birth = ?
        WHERE dependent_id = ?
    `;
    db.query(query, [serviceid, name, relationship, date_of_birth || null, id], (err, result) => {
        if (err) {
            console.error('Error updating dependent:', err);
            return res.status(500).json({ error: 'Failed to update dependent' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Dependent not found' });
        }
        res.status(200).json({ message: 'Dependent updated successfully' });
    });
});

app.delete('/api/dependents/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM dependents WHERE dependent_id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting dependent:', err);
            return res.status(500).json({ error: 'Failed to delete dependent' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Dependent not found' });
        }
        res.status(200).json({ message: 'Dependent deleted successfully' });
    });
});

function fetchEquipment() {
    const equipments = JSON.parse(localStorage.getItem('equipments')) || [];
    renderEquipmentTable(equipments);
}

function renderEquipmentTable(equipments) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = ''; 

    equipments.forEach(equipment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${equipment.equipment_id}</td>
            <td>${equipment.type}</td>
            <td>${equipment.serial_number}</td>
            <td>${equipment.status}</td>
            <td>
                <button onclick="editEquipment(${equipment.equipment_id})">Edit</button>
                <button onclick="deleteEquipment(${equipment.equipment_id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function fetchAndRenderTable() {
    fetch('http://localhost:3001/api/assignments')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch assignments');
            }
            return response.json();
        })
        .then(data => {
            renderTable(data);
        })
        .catch(error => console.error('Error fetching assignments:', error));
}

function deleteAssignment(id) {
    if (confirm('Permanently delete this assignment record?')) {
        fetch(`http://localhost:3001/api/assignments/${id}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete assignment');
                }
                return response.json();
            })
            .then(data => {
                alert('Assignment deleted successfully');
                fetchAndRenderTable(); 
            })
            .catch(error => console.error('Error deleting assignment:', error));
    }
}

app.post('/api/courses', (req, res) => {
    const { course_name, duration_days, instructor_id, serviceid, institute } = req.body;

    const query = `
        INSERT INTO training_courses (course_name, duration_days, instructor_id, institute, serviceid)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(query, [course_name, duration_days, instructor_id, institute, serviceid], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(500).send('Error inserting data');
            return;
        }
        res.status(200).send('Course added successfully');
    });
});

app.post('/api/training_courses', (req, res) => {
    const { course_name, duration_days, instructor_id, institute, serviceid } = req.body;

    const insertQuery = `
        INSERT INTO training_courses (course_name, duration_days, instructor_id, institute, serviceid)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(insertQuery, [course_name, duration_days, instructor_id, institute, serviceid], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(500).send('Error inserting data');
            return;
        }

        
        const selectQuery = `SELECT * FROM training_courses`;
        db.query(selectQuery, (err, courses) => {
            if (err) {
                console.error('Error fetching data:', err);
                res.status(500).send('Error fetching data');
                return;
            }
            res.status(200).json(courses); 
        });
    });
});

app.post('/api/miss', (req, res) => {
    const { mission_name, objective, status, serviceid, assignment_id } = req.body;

    const query = `
        INSERT INTO missions (mission_name, objective, status, serviceid, assignment_id)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(query, [mission_name, objective, status, serviceid, assignment_id], (err, results) => {
        if (err) {
            console.error('Error inserting mission:', err);
            res.status(500).send('Error creating mission');
        } else {
            res.status(200).send('Mission created successfully');
        }
    });
});

app.get('/api/miss', (req, res) => {
    const query = `
        SELECT mission_id, mission_name, objective, status, serviceid, assignment_id
        FROM missions
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching missions:', err);
            res.status(500).send('Error fetching missions');
        } else {
            res.status(200).json(results);
        }
    });
});

app.put('/api/miss/:id', (req, res) => {
    const { id } = req.params;
    const { mission_name, objective, status, serviceid, assignment_id } = req.body;

    const query = `
        UPDATE missions
        SET mission_name = ?, objective = ?, status = ?, serviceid = ?, assignment_id = ?
        WHERE mission_id = ?
    `;

    db.query(query, [mission_name, objective, status, serviceid, assignment_id, id], (err, results) => {
        if (err) {
            console.error('Error updating mission:', err);
            res.status(500).send('Error updating mission');
        } else {
            res.status(200).send('Mission updated successfully');
        }
    });
});

app.delete('/api/miss/:id', (req, res) => {
    const { id } = req.params;

    const query = `
        DELETE FROM missions
        WHERE mission_id = ?
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error deleting mission:', err);
            res.status(500).send('Error deleting mission');
        } else {
            res.status(200).send('Mission deleted successfully');
        }
    });
});

app.post('/api/train', (req, res) => {
    const { course_id, service_id, course_name, duration_days, instructor_id, institute } = req.body;

    const query = `
        INSERT INTO train_table (course_id, service_id, course_name, duration_days, instructor_id, institute)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [course_id, service_id, course_name, duration_days, instructor_id, institute], (err, results) => {
        if (err) {
            console.error('Error inserting data into train_table:', err);
            res.status(500).send('Error inserting data');
        } else {
            res.status(200).send('Course added successfully');
        }
    });
});

app.post('/api/courses', (req, res) => {
    const { course_id, service_id, course_name, duration_days, instructor_id, institute } = req.body;

    if (!course_id || !service_id || !course_name || !duration_days || !instructor_id || !institute) {
        return res.status(400).send('All fields are required');
    }

    const query = 'INSERT INTO courses (course_id, service_id, course_name, duration_days, instructor_id, institute) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [course_id, service_id, course_name, duration_days, instructor_id, institute], (err, results) => {
        if (err) {
            console.error('Error adding course:', err);
            return res.status(500).send('Error adding course');
        }
        res.send('Course added successfully');
    });
});

app.get('/api/training_courses', (req, res) => {
    const query = 'SELECT * FROM training_courses';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching training courses:', err);
            res.status(500).json({ error: 'Failed to fetch training courses' });
        } else {
            res.status(200).json(results);
        }
    });
});

app.put('/api/training_courses/:id', (req, res) => {
    const { id } = req.params;
    const { course_name, duration_days, instructor_id, institute, serviceid } = req.body;

    const query = `
        UPDATE training_courses
        SET course_name = ?, duration_days = ?, instructor_id = ?, institute = ?, serviceid = ?
        WHERE course_id = ?
    `;

    db.query(query, [course_name, duration_days, instructor_id, institute, serviceid, id], (err, result) => {
        if (err) {
            console.error('Error updating course:', err);
            return res.status(500).json({ error: 'Failed to update course' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.status(200).json({ message: 'Course updated successfully' });
    });
});

app.delete('/api/training_courses/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM training_courses WHERE course_id = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting course:', err);
            return res.status(500).json({ error: 'Failed to delete course' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.status(200).json({ message: 'Course deleted successfully' });
    });
});

app.post('/api/med', (req, res) => {
    const { serviceid, blood_type, allergies, vaccination_status, date_recorded } = req.body;

    if (!serviceid || !date_recorded) {
        return res.status(400).json({ error: 'Service ID and Date Recorded are required.' });
    }

    const query = `
        INSERT INTO medical_records (serviceid, blood_type, allergies, vaccination_status, date_recorded)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(query, [serviceid, blood_type || null, allergies || null, vaccination_status || null, date_recorded], (err, result) => {
        if (err) {
            console.error('Error inserting medical record:', err);
            return res.status(500).json({ error: 'Failed to add medical record' });
        }
        res.status(201).json({ message: 'Medical record added successfully', id: result.insertId });
    });
});


app.get('/api/med', (req, res) => {
    const query = 'SELECT * FROM medical_records';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching medical records:', err);
            return res.status(500).json({ error: 'Failed to fetch medical records' });
        }
        res.status(200).json(results);
    });
});


app.get('/api/med/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM med_table WHERE record_id = ?';

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'Failed to fetch medical record' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Medical record not found' });
        }
        res.status(200).json(results[0]);
    });
});


app.put('/api/med/:id', (req, res) => {
    const { id } = req.params;
    const { serviceid, blood_type, allergies, vaccination_status, date_recorded } = req.body;

    const query = `
        UPDATE medical_records
        SET serviceid = ?, blood_type = ?, allergies = ?, vaccination_status = ?, date_recorded = ?
        WHERE record_id = ?
    `;
    db.query(query, [serviceid, blood_type || null, allergies || null, vaccination_status || null, date_recorded, id], (err, result) => {
        if (err) {
            console.error('Error updating medical record:', err);
            return res.status(500).json({ error: 'Failed to update medical record' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Medical record not found' });
        }
        res.status(200).json({ message: 'Medical record updated successfully' });
    });
});

app.delete('/api/med/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM medical_records WHERE record_id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting medical record:', err);
            return res.status(500).json({ error: 'Failed to delete medical record' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Medical record not found' });
        }
        res.status(200).json({ message: 'Medical record deleted successfully' });
    });
});




app.post('/api/payroll', (req, res) => {
    const { serviceid, month, base_salary, allowances } = req.body;

    if (!serviceid || !month || !base_salary) {
        return res.status(400).json({ error: 'Service ID, Month, and Base Salary are required.' });
    }

    const query = `
        INSERT INTO payroll (serviceid, month, base_salary, allowances)
        VALUES (?, ?, ?, ?)
    `;
    db.query(query, [serviceid, month, base_salary, allowances || 0], (err, result) => {
        if (err) {
            console.error('Error inserting payroll data:', err);
            return res.status(500).json({ error: 'Failed to save payroll data' });
        }
        res.status(201).json({ message: 'Payroll data saved successfully', id: result.insertId });
    });
});

app.get('/api/payroll', (req, res) => {
    const query = 'SELECT * FROM payroll';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching payroll data:', err);
            return res.status(500).json({ error: 'Failed to fetch payroll data' });
        }
        res.status(200).json(results);
    });
});

app.put('/api/payroll/:id', (req, res) => {
    const { id } = req.params;
    const { serviceid, month, base_salary, allowances, net_pay } = req.body;

    const query = `
        UPDATE payroll
        SET serviceid = ?, month = ?, base_salary = ?, allowances = ?, net_pay = ?
        WHERE payroll_id = ?
    `;
    db.query(query, [serviceid, month, base_salary, allowances || 0, net_pay, id], (err, result) => {
        if (err) {
            console.error('Error updating payroll data:', err);
            return res.status(500).json({ error: 'Failed to update payroll data' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Payroll record not found' });
        }
        res.status(200).json({ message: 'Payroll data updated successfully' });
    });
});

app.delete('/api/payroll/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM payroll WHERE payroll_id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting payroll data:', err);
            return res.status(500).json({ error: 'Failed to delete payroll data' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Payroll record not found' });
        }
        res.status(200).json({ message: 'Payroll data deleted successfully' });
    });
});

function handleFormSubmit(event) {
    event.preventDefault();

    const mission_name = missionNameInput.value.trim();
    const objective = objectiveInput.value.trim();
    const status = statusInput.value;
    const serviceid = document.getElementById('serviceid').value;
    const assignment_id = document.getElementById('assignment_id').value;

    if (!mission_name || !serviceid || !assignment_id) {
        showAlert('Mission name, Service ID, and Assignment ID are required!', 'danger');
        return;
    }

    const missionId = missionIdInput.value;

    const data = {
        mission_name,
        objective,
        status,
        serviceid,
        assignment_id,
    };

    const method = missionId ? 'PUT' : 'POST';
    const url = missionId ? `/api/miss/${missionId}` : '/api/miss';

    fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save mission');
            }
            return response.text();
        })
        .then(message => {
            showAlert(message, 'success');
            resetForm();
            fetchMissions();
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Error saving mission', 'danger');
        });
}

function fetchMissions() {
    fetch('/api/miss')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch missions');
            }
            return response.json();
        })
        .then(data => {
            missions = data;
            displayMissions();
        })
        .catch(error => {
            console.error('Error fetching missions:', error);
            showAlert('Error fetching missions', 'danger');
        });
}

function editMission(id) {
    const mission = missions.find(m => m.mission_id === id);

    if (mission) {
        formTitle.textContent = 'Edit Mission';
        missionIdInput.value = mission.mission_id;
        missionNameInput.value = mission.mission_name;
        objectiveInput.value = mission.objective;
        statusInput.value = mission.status;
        document.getElementById('serviceid').value = mission.serviceid;
        document.getElementById('assignment_id').value = mission.assignment_id;

        submitBtn.textContent = 'Update Mission';
        cancelBtn.style.display = 'inline-block';

        // Scroll to form
        document.querySelector('header').scrollIntoView({ behavior: 'smooth' });
    }
}

function addEquipment(type, serialNumber, status) {
    fetch('http://localhost:3001/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, serial_number: serialNumber, status }),
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || 'Failed to add equipment');
                });
            }
            return response.json();
        })
        .then(message => {
            alert(message.message || 'Equipment added successfully!');
            this.refreshEquipmentList(); // Refresh the equipment list
        })
        .catch(error => {
            alert(error.message);
            console.error('Error adding equipment:', error);
        });
}

// Get all payroll records
app.get('/api/payroll', (req, res) => {
    const query = 'SELECT * FROM payroll';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching payroll data:', err);
            res.status(500).json({ error: 'Failed to fetch payroll data' });
        } else {
            res.status(200).json(results);
        }
    });
});

app.post('/api/payroll', (req, res) => {
    const { serviceid, month, base_salary, allowances, net_pay } = req.body;
    const query = 'INSERT INTO payroll (serviceid, month, base_salary, allowances, net_pay) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [serviceid, month, base_salary, allowances, net_pay], (err, result) => {
        if (err) {
            console.error('Error adding payroll record:', err);
            res.status(500).json({ error: 'Failed to add payroll record' });
        } else {
            res.status(201).json({ message: 'Payroll record added successfully', id: result.insertId });
        }
    });
});


app.put('/api/payroll/:id', (req, res) => {
    const { id } = req.params;
    const { serviceid, month, base_salary, allowances, net_pay } = req.body;
    const query = 'UPDATE payroll SET serviceid = ?, month = ?, base_salary = ?, allowances = ?, net_pay = ? WHERE payroll_id = ?';
    db.query(query, [serviceid, month, base_salary, allowances, net_pay, id], (err, result) => {
        if (err) {
            console.error('Error updating payroll record:', err);
            res.status(500).json({ error: 'Failed to update payroll record' });
        } else {
            res.status(200).json({ message: 'Payroll record updated successfully' });
        }
    });
});

app.delete('/api/payroll/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM payroll WHERE payroll_id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting payroll record:', err);
            res.status(500).json({ error: 'Failed to delete payroll record' });
        } else {
            res.status(200).json({ message: 'Payroll record deleted successfully' });
        }
    });
});

function addCourse(e) {
    e.preventDefault();

    const courseName = document.getElementById('add-course-name').value;
    const duration = parseInt(document.getElementById('add-duration').value);
    const instructorId = parseInt(document.getElementById('add-instructor-id').value);
    const institute = document.getElementById('add-institute').value;
    const serviceId = parseInt(document.getElementById('add-service-id').value);

    const newCourse = {
        course_name: courseName,
        duration_days: duration,
        instructor_id: instructorId,
        institute: institute,
        serviceid: serviceId
    };

    fetch('http://localhost:3000/api/training_courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to add course');
            }
            return response.json();
        })
        .then(message => {
            alert(message.message);
            loadCourses(); 
            document.getElementById('add-course-form').reset();
        })
        .catch(error => console.error('Error adding course:', error));
}

function loadCourses() {
    fetch('http://localhost:3000/api/training_courses')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch courses');
            }
            return response.json();
        })
        .then(data => {
            const coursesList = document.getElementById('courses-list');
            coursesList.innerHTML = '';

            if (data.length === 0) {
                coursesList.innerHTML = '<tr><td colspan="7">No courses available</td></tr>';
                return;
            }

            data.forEach(course => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${course.course_id}</td>
                    <td>${course.course_name}</td>
                    <td>${course.duration_days}</td>
                    <td>${course.instructor_id}</td>
                    <td>${course.institute}</td>
                    <td>${course.serviceid}</td>
                    <td>
                        <button onclick="loadCourseForEdit(${course.course_id})">Edit</button>
                        <button onclick="deleteCourse(${course.course_id})">Delete</button>
                    </td>
                `;
                coursesList.appendChild(row);
            });
        })
        .catch(error => console.error('Error loading courses:', error));
}

function updateCourse(e) {
    e.preventDefault();

    const courseId = parseInt(document.getElementById('edit-course-id').value);
    const courseName = document.getElementById('edit-course-name').value;
    const duration = parseInt(document.getElementById('edit-duration').value);
    const instructorId = parseInt(document.getElementById('edit-instructor-id').value);
    const institute = document.getElementById('edit-institute').value;
    const serviceId = parseInt(document.getElementById('edit-service-id').value);

    const updatedCourse = {
        course_name: courseName,
        duration_days: duration,
        instructor_id: instructorId,
        institute: institute,
        serviceid: serviceId
    };

    fetch(`http://localhost:3000/api/training_courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCourse)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update course');
            }
            return response.json();
        })
        .then(message => {
            alert(message.message);
            loadCourses(); 
            cancelEdit();
        })
        .catch(error => console.error('Error updating course:', error));
}

function deleteCourse(courseId) {
    if (!confirm('Are you sure you want to delete this course?')) return;

    fetch(`http://localhost:3000/api/training_courses/${courseId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete course');
            }
            return response.json();
        })
        .then(message => {
            alert(message.message);
            loadCourses(); 
        })
        .catch(error => console.error('Error deleting course:', error));
}

function populateDropdowns() {
    const soldiers = JSON.parse(localStorage.getItem('soldiers')) || [
        { serviceid: 1, rank: 'Captain' },
        { serviceid: 2, rank: 'Lieutenant' }
    ];
    const soldierDropdown = document.getElementById('serviceid');
    soldierDropdown.innerHTML = soldiers.map(soldier =>
        `<option value="${soldier.serviceid}">${soldier.serviceid} (${soldier.rank})</option>`
    ).join('');

    
    const equipment = JSON.parse(localStorage.getItem('equipment')) || [
        { equipment_id: 1, name: 'Rifle' },
        { equipment_id: 2, name: 'Helmet' }
    ];
    const equipmentDropdown = document.getElementById('equipment_id');
    equipmentDropdown.innerHTML = equipment.map(item =>
        `<option value="${item.equipment_id}">${item.name}</option>`
    ).join('');

   
    const assignments = JSON.parse(localStorage.getItem('assignments')) || [];
    const assignmentDropdown = document.getElementById('assignment_id');
    assignmentDropdown.innerHTML = assignments.map(assignment =>
        `<option value="${assignment.assignment_id}">${assignment.assignment_id}</option>`
    ).join('');
}

function populateAssignmentIdDropdown() {
    fetch('http://localhost:3001/api/assignments')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch assignment IDs');
            }
            return response.json();
        })
        .then(data => {
            const assignmentIdInput = document.getElementById('assignment_id');
            assignmentIdInput.innerHTML = data.map(assignment =>
                `<option value="${assignment.assignment_id}">${assignment.assignment_id}</option>`
            ).join('');
        })
        .catch(error => console.error('Error fetching assignment IDs:', error));
};

app.get('/api/soldiers', (req, res) => {
    const query = 'SELECT * FROM soldiers';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching soldiers:', err);
            return res.status(500).json({ error: 'Failed to fetch soldiers' });
        }
        res.status(200).json(results);
    });
});

app.get('/api/soldiers/:id', (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT first_name, last_name, date_of_birth, gender, \`rank\`, branch, unit_id,
               enlistment_date, discharge_date, status, blood_type, last_known_location
        FROM soldiers
        WHERE serviceid = ?
    `;
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error fetching soldier:', err);
            return res.status(500).json({ error: 'Failed to fetch soldier' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Soldier not found' });
        }
        res.status(200).json(results[0]);
    });
});

app.post('/api/soldiers', (req, res) => {
    const {
        first_name, last_name, date_of_birth, gender, rank, branch, unit_id,
        enlistment_date, discharge_date, status, blood_type, last_known_location
    } = req.body;

    const query = `
        INSERT INTO soldiers (
            first_name, last_name, date_of_birth, gender, \`rank\`, branch, unit_id,
            enlistment_date, discharge_date, status, blood_type, last_known_location
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [
        first_name, last_name, date_of_birth, gender, rank, branch, unit_id,
        enlistment_date, discharge_date || null, status, blood_type || null, last_known_location || null
    ], (err, result) => {
        if (err) {
            console.error('Error adding soldier:', err);
            return res.status(500).json({ error: 'Failed to add soldier' });
        }
        res.status(201).json({ message: 'Soldier added successfully' });
    });
});

app.put('/api/soldiers/:id', (req, res) => {
    const { id } = req.params;
    const {
        first_name, last_name, date_of_birth, gender, rank, branch, unit_id,
        enlistment_date, discharge_date, status, blood_type, last_known_location
    } = req.body;

    const query = `
        UPDATE soldiers
        SET first_name = ?, last_name = ?, date_of_birth = ?, gender = ?, \`rank\` = ?,
            branch = ?, unit_id = ?, enlistment_date = ?, discharge_date = ?, status = ?,
            blood_type = ?, last_known_location = ?
        WHERE serviceid = ?
    `;
    db.query(query, [
        first_name, last_name, date_of_birth, gender, rank, branch, unit_id,
        enlistment_date, discharge_date || null, status, blood_type || null, last_known_location || null, id
    ], (err, result) => {
        if (err) {
            console.error('Error updating soldier:', err);
            return res.status(500).json({ error: 'Failed to update soldier' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Soldier not found' });
        }
        res.status(200).json({ message: 'Soldier updated successfully' });
    });
});


app.delete('/api/soldiers/:id', (req, res) => {
    const { id } = req.params;
    const deleteTrainingCoursesQuery = 'DELETE FROM training_courses WHERE instructor_id = ?';
    db.query(deleteTrainingCoursesQuery, [id], (err) => {
        if (err) {
            console.error('Error deleting related training courses:', err);
            return res.status(500).json({ error: 'Failed to delete related training courses' });
        }
        
        const deleteSoldierQuery = 'DELETE FROM soldiers WHERE serviceid = ?';
        db.query(deleteSoldierQuery, [id], (err, result) => {
            if (err) {
                console.error('Error deleting soldier:', err);
                return res.status(500).json({ error: 'Failed to delete soldier' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Soldier not found' });
            }
            res.status(200).json({ message: 'Soldier and related training courses deleted successfully' });
        });
    });
});


const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

