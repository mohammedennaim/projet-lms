-- Affectations de test pour l'employé ID 18
USE lms_database;

INSERT INTO affectation (user_id, course_id, created_at) VALUES (18, 1, NOW()) ON DUPLICATE KEY UPDATE course_id = course_id;
INSERT INTO affectation (user_id, course_id, created_at) VALUES (18, 2, NOW()) ON DUPLICATE KEY UPDATE course_id = course_id;
