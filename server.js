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
const userRoutes = require('./routes/userRoutes');
const targetRoutes = require('./routes/targetMetricsRoutes');
const databaseRoutes = require('./routes/databaseRoutes')
const transportRoutes = require('./routes/transportRoutes')
const locationRoutes = require('./routes/locationRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const expensesRoutes = require('./routes/expensesRoutes')
const postprocessingQCRoutes = require('./routes/postprocessingQCRoutes')
const uploadImageRoutes = require('./routes/uploadImageRoutes')
const calendarEventRoutes = require('./routes/calendarEventRoutes')
const rfidRoutes = require('./routes/rfidRoutes')
const wetmillRoutes = require('./routes/wetmillRoutes')
const dryingRoutes = require('./routes/dryingRoutes')


// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware configuration
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000', // Replace with your local frontend address
      'https://kopifabriek-platform.vercel.app', // Replace with your deployed frontend URL
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow requests from these origins
    } else {
      callback(new Error('Not allowed by CORS')); // Block other origins
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

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
  userRoutes,
  targetRoutes,
  databaseRoutes,
  transportRoutes,
  locationRoutes,
  paymentRoutes,
  expensesRoutes,
  postprocessingQCRoutes,
  uploadImageRoutes,
  calendarEventRoutes,
  rfidRoutes,
  wetmillRoutes,
  dryingRoutes,
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