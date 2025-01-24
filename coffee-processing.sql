BEGIN;

CREATE TABLE batch_details (
    id SERIAL PRIMARY KEY,
    batch_number VARCHAR(20) NOT NULL,
    bag_number INT NOT NULL,
    bag_weight FLOAT NOT NULL
);

CREATE TABLE latest_batch (
    id SERIAL PRIMARY KEY,
    latest_batch_number VARCHAR(20) NOT NULL
);

INSERT INTO latest_batch (latest_batch_number) VALUES ('2025-01-15-0001');

CREATE TABLE BagData (
    id SERIAL PRIMARY KEY,
    batchNumber VARCHAR(255) NOT NULL,
    bagNumber INTEGER NOT NULL,
    weight FLOAT NOT NULL,
    createdAt TIMESTAMPTZ NOT NULL,
    updatedAt TIMESTAMPTZ NOT NULL
);

INSERT INTO BagData (id, batchNumber, bagNumber, weight, createdAt, updatedAt) VALUES
(1, '12-01-2025-0001', 1, 10.0, '2025-01-12 12:44:48.848+07', '2025-01-12 12:44:48.848+07'),
(2, '12-01-2025-0001', 2, 10.0, '2025-01-12 12:44:48.848+07', '2025-01-12 12:44:48.848+07'),
(3, '12-01-2025-0002', 1, 10.0, '2025-01-12 12:47:47.671+07', '2025-01-12 12:47:47.671+07'),
(4, '12-01-2025-0002', 2, 10.0, '2025-01-12 12:47:47.671+07', '2025-01-12 12:47:47.671+07'),
(5, '12-01-2025-0003', 1, 10.0, '2025-01-12 12:48:22.082+07', '2025-01-12 12:48:22.082+07'),
(6, '12-01-2025-0003', 2, 10.0, '2025-01-12 12:48:22.082+07', '2025-01-12 12:48:22.082+07'),
(7, '12-01-2025-0004', 1, 10.0, '2025-01-12 12:54:05.384+07', '2025-01-12 12:54:05.384+07'),
(8, '12-01-2025-0004', 2, 10.0, '2025-01-12 12:54:05.384+07', '2025-01-12 12:54:05.384+07'),
(9, '12-01-2025-0005', 1, 10.0, '2025-01-12 12:57:18.036+07', '2025-01-12 12:57:18.036+07'),
(10, '12-01-2025-0005', 2, 10.0, '2025-01-12 12:57:18.036+07', '2025-01-12 12:57:18.036+07'),
(11, '12-01-2025-0006', 1, 10.0, '2025-01-12 12:59:09.001+07', '2025-01-12 12:59:09.001+07'),
(12, '12-01-2025-0006', 2, 10.0, '2025-01-12 12:59:09.001+07', '2025-01-12 12:59:09.001+07'),
(13, '12-01-2025-0007', 1, 10.0, '2025-01-12 13:04:01.137+07', '2025-01-12 13:04:01.137+07'),
(14, '12-01-2025-0007', 2, 10.0, '2025-01-12 13:04:01.137+07', '2025-01-12 13:04:01.137+07'),
(15, '12-01-2025-0008', 1, 10.0, '2025-01-12 13:04:57.437+07', '2025-01-12 13:04:57.437+07'),
(16, '12-01-2025-0008', 2, 10.0, '2025-01-12 13:04:57.437+07', '2025-01-12 13:04:57.437+07'),
(17, '12-01-2025-0009', 1, 123.0, '2025-01-12 13:08:01.106+07', '2025-01-12 13:08:01.106+07'),
(18, '13-01-2025-0001', 1, 100.0, '2025-01-13 12:58:07.981+07', '2025-01-13 12:58:07.981+07'),
(19, '13-01-2025-0001', 2, 100.0, '2025-01-13 12:58:07.981+07', '2025-01-13 12:58:07.981+07'),
(20, '14-01-2025-0001', 1, 10.0, '2025-01-14 14:36:03.173+07', '2025-01-14 14:36:03.173+07'),
(21, '14-01-2025-0001', 2, 10.0, '2025-01-14 14:36:03.173+07', '2025-01-14 14:36:03.173+07'),
(22, '14-01-2025-0001', 3, 10.0, '2025-01-14 14:36:03.173+07', '2025-01-14 14:36:03.173+07'),
(23, '14-01-2025-0001', 4, 12.0, '2025-01-14 14:36:03.173+07', '2025-01-14 14:36:03.173+07'),
(24, '14-01-2025-0001', 5, 12.0, '2025-01-14 14:36:03.173+07', '2025-01-14 14:36:03.173+07'),
(25, '14-01-2025-0001', 6, 12.0, '2025-01-14 14:36:03.173+07', '2025-01-14 14:36:03.173+07'),
(26, '14-01-2025-0001', 7, 12.0, '2025-01-14 14:36:03.173+07', '2025-01-14 14:36:03.173+07'),
(27, '14-01-2025-0001', 8, 12.0, '2025-01-14 14:36:03.173+07', '2025-01-14 14:36:03.173+07'),
(28, '14-01-2025-0001', 9, 12.0, '2025-01-14 14:36:03.173+07', '2025-01-14 14:36:03.173+07'),
(29, '14-01-2025-0001', 10, 12.0, '2025-01-14 14:36:03.173+07', '2025-01-14 14:36:03.173+07'),
(30, '14-01-2025-0002', 1, 120.0, '2025-01-14 16:22:13.166+07', '2025-01-14 16:22:13.166+07'),
(31, '14-01-2025-0002', 2, 120.0, '2025-01-14 16:22:13.166+07', '2025-01-14 16:22:13.166+07'),
(32, '15-01-2025-0001', 1, 10.0, '2025-01-15 14:35:54.657+07', '2025-01-15 14:35:54.657+07'),
(33, '15-01-2025-0001', 2, 10.0, '2025-01-15 14:35:54.657+07', '2025-01-15 14:35:54.657+07'),
(34, '15-01-2025-0001', 3, 10.0, '2025-01-15 14:35:54.657+07', '2025-01-15 14:35:54.657+07'),
(35, '15-01-2025-0001', 4, 10.0, '2025-01-15 14:35:54.657+07', '2025-01-15 14:35:54.657+07'),
(36, '15-01-2025-0001', 5, 10.0, '2025-01-15 14:35:54.657+07', '2025-01-15 14:35:54.657+07'),
(37, '15-01-2025-0001', 6, 10.0, '2025-01-15 14:35:54.657+07', '2025-01-15 14:35:54.657+07'),
(38, '15-01-2025-0001', 7, 10.0, '2025-01-15 14:35:54.657+07', '2025-01-15 14:35:54.657+07'),
(39, '15-01-2025-0001', 8, 10.0, '2025-01-15 14:35:54.657+07', '2025-01-15 14:35:54.657+07'),
(40, '15-01-2025-0001', 9, 10.0, '2025-01-15 14:35:54.657+07', '2025-01-15 14:35:54.657+07'),
(41, '15-01-2025-0001', 10, 10.0, '2025-01-15 14:35:54.657+07', '2025-01-15 14:35:54.657+07'),
(42, '15-01-2025-0001', 11, 10.0, '2025-01-15 14:35:54.657+07', '2025-01-15 14:35:54.657+07');
CREATE TABLE "LatestBatches" (
  id SERIAL PRIMARY KEY,
  batchNumber VARCHAR(255) NOT NULL DEFAULT '0001' UNIQUE,
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL
);

CREATE TABLE "Batches" (
  id SERIAL PRIMARY KEY,
  batchNumber VARCHAR(255) NOT NULL UNIQUE,
  farmerName VARCHAR(255) NOT NULL,
  weight FLOAT NOT NULL,
  quantity INTEGER NOT NULL,
  dateReceived TIMESTAMP NOT NULL,
  rfidTagId VARCHAR(255),
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL
);

CREATE TABLE "QCData" (
  id SERIAL PRIMARY KEY,
  batchNumber TEXT NOT NULL,
  ripeness TEXT NOT NULL,
  color TEXT NOT NULL,
  foreignMatter TEXT NOT NULL,
  overallQuality TEXT NOT NULL,
  qcNotes TEXT,
  qcDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "QCData" VALUES
(250, '2025-01-01-0001', 'Ripe', 'Dark Red', 'None', 'Good', 'No issues', '2025-01-01 08:00:00', '2025-01-15 09:45:36', '2025-01-15 09:45:36'),
(251, '2024-11-01-0002', 'Overripe', 'Brown', 'Some', 'Fair', 'Minor issues', '2024-11-01 09:00:00', '2025-01-15 09:45:36', '2025-01-15 09:45:36'),
(252, '2024-11-04-0001', 'Excellent', 'Bright Red', 'None', 'Excellent', 'All good', '2024-11-04 10:00:00', '2025-01-15 09:45:36', '2025-01-15 09:45:36'),
(253, '2024-11-05-0001', 'Fair', 'Red', 'Yes', 'Poor', 'Needs attention', '2024-11-05 11:00:00', '2025-01-15 09:45:36', '2025-01-15 09:45:36'),
(254, '2024-11-06-0001', 'High Moisture', 'Dark Red', 'None', 'Fair', 'Watch out for mold', '2024-11-06 12:00:00', '2025-01-15 09:45:36', '2025-01-15 09:45:36'),
(255, '2024-11-08-0001', 'Ripe', 'Red', 'None', 'Good', 'No issues', '2024-11-08 13:00:00', '2025-01-15 09:45:36', '2025-01-15 09:45:36'),
(256, '2024-11-09-0001', 'Fair', 'Red', 'Yes', 'Fair', 'Some foreign matter', '2024-11-09 14:00:00', '2025-01-15 09:45:36', '2025-01-15 09:45:36'),
(257, '2024-11-10-0001', 'Ripe', 'Red', 'Yes', 'Good', 'No issues', '2024-11-10 15:00:00', '2025-01-15 09:45:36', '2025-01-15 09:45:36'),
(258, '2024-11-11-0001', 'Excellent', 'Dark Red', 'None', 'Excellent', 'No issues', '2024-11-11 16:00:00', '2025-01-15 09:45:36', '2025-01-15 09:45:36'),
(259, '2024-11-13-0001', 'Ripe', 'Red', 'None', 'Good', 'All good', '2024-11-13 17:00:00', '2025-01-15 09:45:36', '2025-01-15 09:45:36'),
(260, '2024-11-14-0001', 'Slightly Underripe', 'Light Red', 'None', 'Fair', 'Minor issues', '2024-11-14 18:00:00', '2025-01-15 09:45:36', '2025-01-15 09:45:36'),
(261, '2024-11-15-0001', 'Ripe', 'Dark Red', 'None', 'Good', 'No issues', '2024-11-15 19:00:00', '2025-01-15 09:45:36', '2025-01-15 09:45:36'),
(262, '2024-11-17-0001', 'Ripe', 'Red', 'None', 'Good', 'No issues', '2024-11-17 20:00:00', '2025-01-15 09:45:36', '2025-01-15 09:45:36'),
(263, '2024-11-18-0001', 'Fair', 'Red', 'Yes', 'Fair', 'Some foreign matter', '2024-11-18 21:00:00', '2025-01-15 09:45:36', '2025-01-15 09:45:36'),
(264, '2024-11-19-0001', 'Excellent', 'Bright Red', 'None', 'Excellent', 'All good', '2024-11-19 22:00:00', '2025-01-15 09:45:36', '2025-01-15 09:45:36'),
(265, '2024-11-20-0001', 'High Moisture', 'Dark Red', 'None', 'Fair', 'Watch out for mold', '2024-11-20 23:00:00', '2025-01-15 09:45:36', '2025-01-15 09:45:36'),
(266, '2024-11-21-0001', 'Ripe', 'Red', 'None', 'Good', 'No issues', '2024-11-21 00:00:00', '2025-01-15 09:45:36', '2025-01-15 09:45:36'),
(267, '2024-11-22-0001', 'Excellent', 'Bright Red', 'None', 'Excellent', 'No issues', '2024-11-22 01:00:00', '2025-01-15 09:45:36', '2025-01-15 09:45:36'),
(268, '2024-11-23-0001', 'Ripe', 'Red', 'None', 'Good', 'All good', '2024-11-23 02:00:00', '2025-01-15 09:45:36', '2025-01-15 09:45:36'),
(269, '2024-11-25-0001', 'Fair', 'Red', 'Yes', 'Fair', 'Some foreign matter', '2024-11-25 03:00:00', '2025-01-15 09:45:36', '2025-01-15 09:45:36'),
(270, '2024-11-26-0001', 'Ripe', 'Dark Red', 'None', 'Good', 'No issues', '2024-11-26 04:00:00', '2025-01-15 09:45:36', '2025-01-15 09:45:36'),
(271, '2024-11-28-0001', 'Excellent', 'Bright Red', 'None', 'Excellent', 'All good', '2024-11-28 05:00:00', '2025-01-15 09:45:36', '2025-01-15 09:45:36'),
(272, '2024-11-30-0001', 'High Moisture', 'Dark Red', 'None', 'Fair', 'Watch out for mold', '2024-11-30 06:00:00', '2025-01-15 09:45:36', '2025-01-15 09:45:36'),
(273, '2024-12-01-0001', 'Ripe', 'Dark Red', 'None', 'Good', 'No issues', '2024-12-01 07:00:00', '2025-01-15 09:45:36', '2025-01-15 09:45:36'),
(274, '2024-12-14-0001', 'Fair', 'Red', 'Yes', 'Fair', 'Some foreign matter', '2024-12-14 08:00:00', '2025-01-15 09:45:36', '2025-01-15 09:45:36'),
(275, '2024-12-15-0001', 'Ripe', 'Red', 'None', 'Good', 'All good', '2024-12-15 09:00:00', '2025-01-15 09:45:36', '2025-01-15 09:45:36'),
(276, '2024-12-17-0001', 'Slightly Underripe', 'Light Red', 'None', 'Fair', 'Minor issues', '2024-12-17 10:00:00', '2025-01-15 09:45:36', '2025-01-15 09:45:36'),
(277, '2024-12-18-0001', 'Ripe', 'Dark Red', 'None', 'Good', 'No issues', '2024-12-18 11:00:00', '2025-01-15 09:45:36', '2025-01-15 09:45:36'),
(278, '2024-12-20-0001', 'Excellent', 'Bright Red', 'None', 'Excellent', 'No issues', '2024-12-20 12:00:00', '2025-01-15 09:45:36', '2025-01-15 09:45:36');
CREATE TABLE Farmers (
    farmerID SERIAL PRIMARY KEY,
    farmerName TEXT NOT NULL UNIQUE,
    farmerAddress TEXT NOT NULL,
    farmerLandArea REAL NOT NULL,
    farmerContact TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    farmType TEXT CHECK(farmType IN ('Arabica', 'Robusta', 'Mix')) NOT NULL,
    registrationDate DATE DEFAULT CURRENT_DATE,
    isActive INTEGER DEFAULT 1,
    notes TEXT
);

INSERT INTO Farmers (farmerID, farmerName, farmerAddress, farmerLandArea, farmerContact, latitude, longitude, farmType, registrationDate, isActive, notes) VALUES
(7, 'John Doe', '123 Coffee Road, Plantation City, CoffeeLand', 5.5, '1234567890', 10.12345, 20.54321, 'Arabica', '2025-01-16', 1, 'asdasd'),
(8, 'Audi', 'lionking', 1000.0, '08080808088', NULL, NULL, 'Robusta', '2025-01-16', 1, 'amaann'),
(9, 'Jeremy', 'kinglion', 1000.0, '08123123123', NULL, NULL, 'Arabica', '2025-01-16', 1, 'asdasd'),
(10, 'Testing', 'singarajaskidipapap', 123.0, '123123123', NULL, NULL, 'Robusta', '2025-01-16', 1, 'aman broohh mantep ini'),
(11, 'Nyoman', 'Pupuan', 100.0, '08080808', NULL, NULL, 'Robusta', '2025-01-16', 1, 'amann'),
(12, 'Wadidaw', 'singaraja', 1000.0, '08080808', NULL, NULL, 'Robusta', '2025-01-17', 1, 'asdasd');

CREATE TABLE PostprocessingData (
    id SERIAL PRIMARY KEY,
    batchNumber TEXT NOT NULL UNIQUE,
    type TEXT,
    processingType TEXT,
    weight REAL NOT NULL,
    totalBags INTEGER NOT NULL,
    storedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quality TEXT NOT NULL
);

INSERT INTO PostprocessingData (batchNumber, type, processingType, weight, totalBags, storedDate, notes, createdAt, updatedAt, quality) VALUES
('2025-01-22-0001', 'Robusta', 'Natural', 1000.0, 20, '2025-01-22 17:56:07.908 +07:00', 'aman', '2025-01-22 17:56:07.908 +07:00', '2025-01-22 17:56:07.908 +07:00', 'G4'),
('2025-01-22-0002', 'Robusta', 'Natural', 1000.0, 20, '2025-01-22 17:59:19.025 +07:00', 'aman', '2025-01-22 17:59:19.025 +07:00', '2025-01-22 17:59:19.025 +07:00', 'G4'),
('2025-01-22-0003', 'Robusta', 'Natural', 1000.0, 20, '2025-01-22 17:59:25.421 +07:00', 'aman', '2025-01-22 17:59:25.421 +07:00', '2025-01-22 17:59:25.421 +07:00', 'G4'),
('2025-01-22-0004', 'Arabica', 'Wet Hulled', 500.0, 10, '2025-01-22 18:03:11.659 +07:00', 'aman', '2025-01-22 18:03:11.659 +07:00', '2025-01-22 18:03:11.659 +07:00', 'Specialty'),
('2025-01-22-0005', 'Arabica', 'Honey', 100.0, 2, '2025-01-22 18:03:22.333 +07:00', 'aman', '2025-01-22 18:03:22.333 +07:00', '2025-01-22 18:03:22.333 +07:00', 'Specialty');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    name TEXT NOT NULL
);

INSERT INTO users (email, password, role, createdAt, updatedAt, name) VALUES
('audiarmadhani.aa@gmail.com', '$2b$10$/k.uWJT9gyXqs02JwcL.WurRM8Go9.DhZWI5r5H3xU9DYvq6AfwUW', 'admin', '2025-01-20 08:06:46.752 +00:00', '2025-01-20 08:06:46.762 +00:00', 'Audi Armadhani'),
('info@kopifabriekindonesia.com', '$2b$10$OM4Q2dVP4CbyhRoKx.Wq0ebWs6d5TWQulUulnh89TL9YSYwTTowNW', 'staff', '2025-01-20 10:09:42.136 +00:00', '2025-01-20 10:09:42.144 +00:00', 'Kopi Fabriek Indonesia');

CREATE TABLE TargetMetrics (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    processingType TEXT,
    quality TEXT,
    metric TEXT NOT NULL,
    timeFrame TEXT NOT NULL,
    targetValue REAL NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO TargetMetrics (type, processingType, quality, metric, timeFrame, targetValue, startDate, endDate, createdAt, updatedAt) VALUES
('Arabica', 'Wet Hull', 'Specialty', 'Total Weight Produced', 'Weekly', 200.0, '2025-01-13', '2025-01-19', '2025-01-21 18:40:19.725 +07:00', '2025-01-21 18:40:19.725 +07:00'),
('Robusta', 'Natural', 'G4', 'Total Weight Produced', 'Weekly', 20000.0, '2025-01-13', '2025-01-19', '2025-01-21 18:41:16.719 +07:00', '2025-01-21 18:41:16.719 +07:00'),
('Arabica', 'Natural', 'Specialty', 'Total Weight Produced', 'Weekly', 200.0, '2025-01-19', '2025-01-25', '2025-01-21 21:41:41.249 +07:00', '2025-01-21 21:41:41.249 +07:00'),
('Arabica', 'Natural', 'Specialty', 'Total Weight Produced', 'Weekly', 200.0, '2025-01-26', '2025-02-01', '2025-01-21 21:42:41.784 +07:00', '2025-01-21 21:42:41.784 +07:00');

CREATE TABLE latest_pp_batch (
    id SERIAL UNIQUE PRIMARY KEY,
    latest_batch_number VARCHAR(20) NOT NULL
);

INSERT INTO latest_pp_batch (latest_batch_number) VALUES
('2025-01-22-0005');

COMMIT;
