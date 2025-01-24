-- Disable foreign key constraints (PostgreSQL does not support PRAGMA commands)
SET session_replication_role = 'replica';

BEGIN;

-- Create `ReceivingData_backup` table
CREATE TABLE ReceivingData_backup (
    id SERIAL PRIMARY KEY,
    batchNumber VARCHAR(255) NOT NULL UNIQUE,
    farmerName VARCHAR(255) NOT NULL,
    weight DOUBLE PRECISION NOT NULL,
    totalBags INTEGER NOT NULL,
    receivingDate TIMESTAMP NOT NULL,
    notes TEXT,
    price NUMERIC,
    updatedBy VARCHAR(20),
    createdAt TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP NOT NULL
);

-- Create `PreprocessingData` table
CREATE TABLE PreprocessingData (
    id SERIAL PRIMARY KEY,
    batchNumber VARCHAR(255) NOT NULL,
    bagsProcessed INTEGER NOT NULL,
    processingDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    createdAt TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP NOT NULL
);

-- Insert data into `PreprocessingData`
INSERT INTO PreprocessingData (id, batchNumber, bagsProcessed, processingDate, createdAt, updatedAt)
VALUES
(18, '2025-01-10-0001', 10, '2025-01-17 08:58:22', '2025-01-17 08:58:22', '2025-01-17 08:58:22');

-- Create `ReceivingData` table
CREATE TABLE ReceivingData (
    id SERIAL PRIMARY KEY,
    batchNumber VARCHAR(255) NOT NULL UNIQUE,
    farmerName VARCHAR(255) NOT NULL,
    weight DOUBLE PRECISION NOT NULL,
    totalBags INTEGER NOT NULL,
    receivingDate TIMESTAMP NOT NULL,
    notes TEXT,
    price NUMERIC,
    updatedBy VARCHAR(20),
    createdAt TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP NOT NULL,
    type VARCHAR(20)
);
INSERT INTO ReceivingData VALUES(98,'2025-01-01-0001','Farmer A',150.5,5,'2025-01-01','Good quality cherries',750.25,NULL,'2025-01-01','2025-01-01','Arabica');
INSERT INTO ReceivingData VALUES(99,'2024-01-11-0002','Farmer B',200.0,8,'2024-11-01','Slightly overripe',1000.0,NULL,'2024-11-01','2024-11-01','Robusta');
INSERT INTO ReceivingData VALUES(100,'2024-04-11-0001','Farmer C',175.8000000000000113,7,'2024-11-04','Excellent condition',879.0,NULL,'2024-11-04','2024-11-04','Robusta');
INSERT INTO ReceivingData VALUES(101,'2024-05-11-0001','Farmer D',180.0,6,'2024-11-05','Foreign matter detected',720.0,NULL,'2024-11-05','2024-11-05','Arabica');
INSERT INTO ReceivingData VALUES(102,'2024-06-11-0001','Farmer E',160.3000000000000113,5,'2024-11-06','High moisture content',801.5,NULL,'2024-11-06','2024-11-06','Robusta');
INSERT INTO ReceivingData VALUES(103,'2024-08-11-0001','Farmer F',190.1999999999999887,8,'2024-11-08','Uniform ripeness',950.100000000000022,NULL,'2024-11-08','2024-11-08','Robusta');
INSERT INTO ReceivingData VALUES(104,'2024-09-11-0001','Farmer G',170.4000000000000056,6,'2024-11-09','Fair quality',850.2000000000000454,NULL,'2024-11-09','2024-11-09','Arabica');
INSERT INTO ReceivingData VALUES(105,'2024-10-11-0001','Farmer H',210.0,9,'2024-11-10','Foreign matter detected',1050.0,NULL,'2024-11-10','2024-11-10','Arabica');
INSERT INTO ReceivingData VALUES(106,'2024-11-11-0001','Farmer I',180.5,7,'2024-11-11','Excellent condition',902.5,NULL,'2024-11-11','2024-11-11','Robusta');
INSERT INTO ReceivingData VALUES(107,'2024-13-11-0001','Farmer J',195.0,7,'2024-11-13','Good ripeness',975.0,NULL,'2024-11-13','2024-11-13','Robusta');
INSERT INTO ReceivingData VALUES(108,'2024-14-11-0001','Farmer K',175.5,6,'2024-11-14','Slightly underripe',877.5,NULL,'2024-11-14','2024-11-14','Arabica');
INSERT INTO ReceivingData VALUES(109,'2024-15-11-0001','Farmer L',185.0,7,'2024-11-15','Good quality cherries',925.0,NULL,'2024-11-15','2024-11-15','Robusta');
INSERT INTO ReceivingData VALUES(110,'2024-11-17-0001','Farmer M',165.0,5,'2024-11-17','Good ripeness',825.0,NULL,'2024-11-17','2024-11-17','Arabica');
INSERT INTO ReceivingData VALUES(111,'2024-11-18-0001','Farmer N',170.1999999999999887,6,'2024-11-18','Fair quality',851.0,NULL,'2024-11-18','2024-11-18','Arabica');
INSERT INTO ReceivingData VALUES(112,'2024-11-19-0001','Farmer O',210.0,8,'2024-11-19','Excellent condition',1050.0,NULL,'2024-11-19','2024-11-19','Arabica');
INSERT INTO ReceivingData VALUES(113,'2024-11-20-0001','Farmer P',190.0,6,'2024-11-20','High moisture content',950.0,NULL,'2024-11-20','2024-11-20','Arabica');
INSERT INTO ReceivingData VALUES(114,'2024-11-21-0001','Farmer Q',180.4000000000000056,7,'2024-11-21','Uniform ripeness',902.0,NULL,'2024-11-21','2024-11-21','Robusta');
INSERT INTO ReceivingData VALUES(115,'2024-11-22-0001','Farmer R',200.0,9,'2024-11-22','Good quality cherries',1000.0,NULL,'2024-11-22','2024-11-22','Robusta');
INSERT INTO ReceivingData VALUES(116,'2024-11-23-0001','Farmer S',220.0,10,'2024-11-23','Slightly overripe',1100.0,NULL,'2024-11-23','2024-11-23','Robusta');
INSERT INTO ReceivingData VALUES(117,'2024-11-25-0001','Farmer T',175.8000000000000113,5,'2024-11-25','Good ripeness',879.0,NULL,'2024-11-25','2024-11-25','Arabica');
INSERT INTO ReceivingData VALUES(118,'2024-11-26-0001','Farmer U',165.3000000000000113,8,'2024-11-26','Fair quality',826.5,NULL,'2024-11-26','2024-11-26','Robusta');
INSERT INTO ReceivingData VALUES(119,'2024-11-28-0001','Farmer V',195.0,7,'2024-11-28','Excellent condition',975.0,NULL,'2024-11-28','2024-11-28','Robusta');
INSERT INTO ReceivingData VALUES(120,'2024-11-30-0001','Farmer W',180.5,6,'2024-11-30','High moisture content',902.5,NULL,'2024-11-30','2024-11-30','Robusta');
INSERT INTO ReceivingData VALUES(121,'2024-12-01-0001','Farmer X',150.5,5,'2024-12-01','Good quality cherries',750.25,NULL,'2024-12-01','2024-12-01','Robusta');
INSERT INTO ReceivingData VALUES(122,'2024-12-03-0001','Farmer Y',200.0,8,'2024-12-03','Excellent condition',1000.0,NULL,'2024-12-03','2024-12-03','Arabica');
INSERT INTO ReceivingData VALUES(123,'2024-12-05-0001','Farmer Z',175.5,6,'2024-12-05','Slightly underripe',877.5,NULL,'2024-12-05','2024-12-05','Arabica');
INSERT INTO ReceivingData VALUES(124,'2024-12-06-0001','Farmer A',190.0,8,'2024-12-06','Uniform ripeness',950.0,NULL,'2024-12-06','2024-12-06','Arabica');
INSERT INTO ReceivingData VALUES(125,'2024-12-08-0001','Farmer B',180.8000000000000113,7,'2024-12-08','High moisture content',904.0,NULL,'2024-12-08','2024-12-08','Robusta');
INSERT INTO ReceivingData VALUES(126,'2024-12-10-0001','Farmer C',200.1999999999999887,8,'2024-12-10','Foreign matter detected',1001.0,NULL,'2024-12-10','2024-12-10','Arabica');
INSERT INTO ReceivingData VALUES(127,'2024-12-12-0001','Farmer D',170.5999999999999944,6,'2024-12-12','Fair quality',853.0,NULL,'2024-12-12','2024-12-12','Arabica');
INSERT INTO ReceivingData VALUES(128,'2024-12-14-0001','Farmer E',220.0,10,'2024-12-14','Good quality cherries',1100.0,NULL,'2024-12-14','2024-12-14','Arabica');
INSERT INTO ReceivingData VALUES(129,'2024-12-16-0001','Farmer F',190.5,7,'2024-12-16','Slightly overripe',952.5,NULL,'2024-12-16','2024-12-16','Arabica');
INSERT INTO ReceivingData VALUES(130,'2024-12-18-0001','Farmer G',180.0,8,'2024-12-18','Excellent condition',900.0,NULL,'2024-12-18','2024-12-18','Arabica');
INSERT INTO ReceivingData VALUES(131,'2024-12-20-0001','Farmer H',200.0,9,'2024-12-20','Uniform ripeness',1000.0,NULL,'2024-12-20','2024-12-20','Robusta');
INSERT INTO ReceivingData VALUES(132,'2024-12-22-0001','Farmer I',175.8000000000000113,5,'2024-12-22','High moisture content',879.0,NULL,'2024-12-22','2024-12-22','Arabica');
INSERT INTO ReceivingData VALUES(133,'2024-12-24-0001','Farmer J',210.0,9,'2024-12-24','Fair quality',1050.0,NULL,'2024-12-24','2024-12-24','Arabica');
INSERT INTO ReceivingData VALUES(134,'2024-12-26-0001','Farmer K',180.0,6,'2024-12-26','Good quality cherries',900.0,NULL,'2024-12-26','2024-12-26','Robusta');
INSERT INTO ReceivingData VALUES(135,'2024-12-28-0001','Farmer L',160.3000000000000113,5,'2024-12-28','Slightly underripe',801.5,NULL,'2024-12-28','2024-12-28','Robusta');
INSERT INTO ReceivingData VALUES(136,'2024-12-30-0001','Farmer M',190.1999999999999887,8,'2024-12-30','Excellent condition',950.100000000000022,NULL,'2024-12-30','2024-12-30','Arabica');
INSERT INTO ReceivingData VALUES(137,'2025-01-01-0002','Farmer AA',1600.0,10,'2025-01-01','First batch of January',160.0,NULL,'2025-01-01','2025-01-01','Robusta');
INSERT INTO ReceivingData VALUES(138,'2025-01-03-0001','Farmer B',1200.0,8,'2025-01-03','First batch from Farmer B',120.0,NULL,'2025-01-03','2025-01-03','Arabica');
INSERT INTO ReceivingData VALUES(139,'2025-01-03-0002','Farmer B',1300.0,8,'2025-01-03','First batch from Farmer B',130.0,NULL,'2025-01-03','2025-01-03','Robusta');
INSERT INTO ReceivingData VALUES(140,'2025-01-05-0001','Farmer C',1300.0,9,'2025-01-05','First batch from Farmer C',130.0,NULL,'2025-01-05','2025-01-05','Robusta');
INSERT INTO ReceivingData VALUES(141,'2025-01-07-0001','Farmer D',1400.0,10,'2025-01-07','First batch from Farmer D',140.0,NULL,'2025-01-07','2025-01-07','Robusta');
INSERT INTO ReceivingData VALUES(142,'2025-01-10-0001','Farmer E',1600.0,12,'2025-01-10','First batch from Farmer E',160.0,NULL,'2025-01-10','2025-01-10','Robusta');
INSERT INTO ReceivingData VALUES(143,'2025-01-12-0001','Farmer F',1100.0,7,'2025-01-12','First batch from Farmer F',110.0,NULL,'2025-01-12','2025-01-12','Arabica');
INSERT INTO ReceivingData VALUES(144,'2025-01-14-0001','Farmer G',1700.0,11,'2025-01-14','First batch from Farmer G',170.0,NULL,'2025-01-14','2025-01-14','Arabica');
;

COMMIT;

-- Re-enable foreign key constraints
SET session_replication_role = 'origin';