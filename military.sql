-- Create the database 

CREATE DATABASE MILITARY; 
USE MILITARY; 

-- 1. Units Table 
CREATE TABLE units ( 
unit_id INT PRIMARY KEY, 
unit_name VARCHAR(50) NOT NULL, 
unit_type VARCHAR(50) NOT NULL, 
location VARCHAR(100), 
commander_id INT DEFAULT NULL 
);


select *from units;
 -- 2. Soldiers Table 
CREATE TABLE soldiers ( 
serviceid INT PRIMARY KEY AUTO_INCREMENT, 
first_name VARCHAR(50) NOT NULL, 
last_name VARCHAR(50) NOT NULL, 
date_of_birth DATE NOT NULL, 
gender ENUM('M', 'F', 'O') DEFAULT NULL, 
`rank` VARCHAR(50) NOT NULL, 
branch VARCHAR(50) NOT NULL, 
unit_id INT NOT NULL, 
enlistment_date DATE NOT NULL, 
discharge_date DATE DEFAULT NULL, 
status ENUM('Active', 'Inactive', 'Retired') DEFAULT 'Active', 
blood_type ENUM('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-') DEFAULT NULL, 
last_known_location VARCHAR(100) DEFAULT NULL, 
FOREIGN  KEY  (unit_id)  REFERENCES  units(unit_id)  ON  DELETE  CASCADE  ON 
UPDATE CASCADE 
);
select *from soldiers;

 -- 3. Equipment Table 
CREATE TABLE equipment ( 
equipment_id INT PRIMARY KEY AUTO_INCREMENT, 
type VARCHAR(50) NOT NULL, 
serial_number VARCHAR(50) UNIQUE NOT NULL, 
status ENUM('Active', 'Inactive', 'Under Maintenance') DEFAULT 'Active' 
);
select *from equipment;

 -- 4. Assignments Table 
CREATE TABLE assignments ( 
assignment_id INT PRIMARY KEY AUTO_INCREMENT, 
serviceid INT NOT NULL, 
equipment_id INT NOT NULL, 
date_assigned DATE NOT NULL, 
date_returned DATE DEFAULT NULL, 
FOREIGN  KEY  (serviceid)  REFERENCES  soldiers(serviceid)  ON  DELETE  CASCADE 
ON UPDATE CASCADE, 
FOREIGN  KEY  (equipment_id)  REFERENCES  equipment(equipment_id)  ON  DELETE 
CASCADE ON UPDATE CASCADE, 
CHECK (date_returned IS NULL OR date_returned >= date_assigned) 
); 
select *from assignments;

-- 5. Missions Table 
CREATE TABLE missions ( 
mission_id INT PRIMARY KEY AUTO_INCREMENT, 
mission_name VARCHAR(100) NOT NULL, 
objective TEXT DEFAULT NULL, 
status ENUM('Planned', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Planned', 
serviceid INT NOT NULL, 
assignment_id INT NOT NULL, 
FOREIGN  KEY  (serviceid)  REFERENCES  soldiers(serviceid)  ON  DELETE 
CASCADE, 
FOREIGN  KEY  (assignment_id)  REFERENCES  assignments(assignment_id)  ON 
DELETE CASCADE 
);
select *from missions;

 -- 6. Training Courses Table 
CREATE TABLE training_courses ( 
course_id INT PRIMARY KEY AUTO_INCREMENT, 
course_name VARCHAR(100) NOT NULL, 
serviceid INT NOT NULL, 
duration_days INT NOT NULL, 
instructor_id INT NOT NULL, 
institute VARCHAR(255) NOT NULL, 
FOREIGN  KEY  (serviceid)  REFERENCES  soldiers(serviceid)  ON  DELETE  CASCADE 
ON UPDATE CASCADE, 
FOREIGN  KEY  (instructor_id)  REFERENCES  soldiers(serviceid)  ON  DELETE 
CASCADE 
);
select *from training_courses;
 
 -- 7. Medical Records Table 
CREATE TABLE medical_records ( 
record_id INT PRIMARY KEY AUTO_INCREMENT, 
serviceid INT NOT NULL, 
blood_type ENUM('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-') DEFAULT NULL, 
allergies TEXT DEFAULT NULL, 
vaccination_status VARCHAR(50) DEFAULT NULL, 
date_recorded DATE NOT NULL DEFAULT CURRENT_DATE, 
FOREIGN  KEY  (serviceid)  REFERENCES  soldiers(serviceid)  ON  DELETE  CASCADE 
ON UPDATE CASCADE 
); 
select *from medical_records;

-- 8. Dependents Table 
CREATE TABLE dependents ( 
dependent_id INT PRIMARY KEY AUTO_INCREMENT, 
serviceid INT NOT NULL, 
name VARCHAR(100) NOT NULL, 
relationship VARCHAR(20) NOT NULL, 
date_of_birth DATE DEFAULT NULL, 
FOREIGN  KEY  (serviceid)  REFERENCES  soldiers(serviceid)  ON  DELETE  CASCADE 
ON UPDATE CASCADE 
);
select *from dependents;

 -- 9. Payroll Table 
CREATE TABLE payroll ( 
payroll_id INT PRIMARY KEY AUTO_INCREMENT, 
serviceid INT NOT NULL, 
month VARCHAR(7) NOT NULL, 
base_salary DECIMAL(10,2) NOT NULL, 
allowances DECIMAL(10,2) DEFAULT 0, 
net_pay  DECIMAL(10,2)  GENERATED  ALWAYS  AS  (base_salary  +  allowances) 
STORED, 
FOREIGN  KEY  (serviceid)  REFERENCES  soldiers(serviceid)  ON  DELETE  CASCADE 
ON UPDATE CASCADE 
);
select *from payroll;
