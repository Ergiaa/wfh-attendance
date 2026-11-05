CREATE DATABASE IF NOT EXISTS employees_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS attendance_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'employees_user'@'%' IDENTIFIED BY 'employees_pass';
CREATE USER IF NOT EXISTS 'attendance_user'@'%' IDENTIFIED BY 'attendance_pass';

GRANT ALL PRIVILEGES ON employees_db.*  TO 'employees_user'@'%';
GRANT ALL PRIVILEGES ON attendance_db.* TO 'attendance_user'@'%';
FLUSH PRIVILEGES;
