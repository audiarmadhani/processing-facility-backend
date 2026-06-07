const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models'); // Sequelize instance
const dotenv = require('dotenv');

// Import routes
const preprocessingRoutes = require('./routes/preprocessingRoutes');
const postprocessingRoutes = require('./routes/postprocessingRoutes');
const receivingRoutes = require('./routes/receivingRoutes');
const qcRoutes = require('./routes/qcRoutes');
const latestBatchRoute = require('./routes/latestBatchRoute');
const dashboardRoutes = require('./routes/dashboardRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const shipperRoutes = require('./routes/shipperRoutes');
const userRoutes = require('./routes/userRoutes');
const targetRoutes = require('./routes/targetMetricsRoutes');
const databaseRoutes = require('./routes/databaseRoutes')
const transportRoutes = require('./routes/transportRoutes')
const locationRoutes = require('./routes/locationRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const expensesRoutes = require('./routes/expensesRoutes')
const postprocessingQCRoutes = require('./routes/postprocessingQCRoutes')
const uploadImageRoutes = require('./routes/uploadImageRoutes')
const uploadInvoiceRoutes = require('./routes/uploadInvoiceRoutes')
const calendarEventRoutes = require('./routes/calendarEventRoutes')
const rfidRoutes = require('./routes/rfidRoutes')
const wetmillRoutes = require('./routes/wetmillRoutes')
const fermentationRoutes = require('./routes/fermentationRoutes')
const dryingRoutes = require('./routes/dryingRoutes')
const drymillRoutes = require('./routes/drymillRoutes')
const OMSRoutes = require('./routes/OMSRoutes')
const IMSRoutes = require('./routes/IMSRoutes')
const inventoryRoutes = require('./routes/inventoryRoutes')
const updatesRoutes = require('./routes/updatesRoutes')
const officeInventoryRoutes = require('./routes/officeInventoryRoutes')
const driverPickupRoutes = require('./routes/driverPickupRoutes')

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware configuration
const allowedOrigins = [
  'http://localhost:3000', // Platform frontend (local)
  'http://localhost:3001', // Cherry pickup driver app (local)
  'https://kopifabriek-platform.vercel.app', // Platform frontend (production)
  process.env.DRIVER_APP_ORIGIN, // e.g. https://your-driver-app.vercel.app
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Server-to-server or same-origin requests (no Origin header)
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Any localhost port in development
      if (
        process.env.NODE_ENV !== 'production' &&
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
      ) {
        return callback(null, true);
      }
      if (
        process.env.NODE_ENV !== 'production' &&
        /^http:\/\/localhost:\d+$/.test(origin)
      ) {
        return callback(null, true);
      }
      console.warn('[CORS] Blocked origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API routes
const apiRoutes = [
  preprocessingRoutes,
  postprocessingRoutes,
  receivingRoutes,
  qcRoutes,
  latestBatchRoute,
  dashboardRoutes,
  uploadRoutes,
  farmerRoutes,
  shipperRoutes,
  userRoutes,
  targetRoutes,
  databaseRoutes,
  transportRoutes,
  locationRoutes,
  paymentRoutes,
  expensesRoutes,
  postprocessingQCRoutes,
  uploadImageRoutes,
  uploadInvoiceRoutes,
  calendarEventRoutes,
  rfidRoutes,
  wetmillRoutes,
  fermentationRoutes,
  dryingRoutes,
  drymillRoutes,
  OMSRoutes,
  IMSRoutes,
  inventoryRoutes,
  updatesRoutes,
  officeInventoryRoutes,
  driverPickupRoutes,
];

apiRoutes.forEach(route => app.use('/api', route));

// Serve static files for the React frontend (if applicable)
// const frontendPath = path.join(__dirname, '../frontend/build');
// app.use(express.static(frontendPath));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(frontendPath, 'index.html'));
// });

// Database connection and server initialization
(async () => {
  try {
    console.log('⏳ Connecting to the database...');
    await sequelize.authenticate(); // Sequelize authentication
    console.log('✅ Database connected successfully.');

    console.log('⏳ Synchronizing database models...');
    await sequelize.sync(); // Synchronize Sequelize models
    console.log('✅ Database models synchronized.');

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start the server:', error.message);
    process.exit(1); // Exit the process if initialization fails
  }
})();