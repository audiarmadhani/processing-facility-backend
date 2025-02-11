const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// Route for creating payment data
router.post('/payment', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      farmerName,
      farmerID,
      totalAmount,
      date,
      paymentMethod,
      paymentDescription,
      isPaid,
    } = req.body;

    // Get the latest batch number
    const [batchResult] = await sequelize.query(
      `SELECT latest_batch_number FROM latest_batch`,
      { transaction: t }
    );
    // Assume batchResult is an array with at least one row
    const batchNumber = batchResult[0].latest_batch_number;

    // Insert the payment data along with the batch number
    const [paymentData] = await sequelize.query(
      `
      INSERT INTO "PaymentData" 
        ("farmerName", "farmerID", "totalAmount", "date", "paymentMethod", "paymentDescription", "isPaid", "batchNumber") 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
      `,
      {
        replacements: [farmerName, farmerID, totalAmount, date, paymentMethod, paymentDescription, isPaid, batchNumber],
        transaction: t,
      }
    );

    // Commit the transaction
    await t.commit();

    // Respond with the created record
    res.status(201).json({
      message: 'Payment data created successfully',
      paymentData: paymentData[0],
    });
  } catch (err) {
    // Rollback transaction on error
    await t.rollback();
    console.error('Error creating payment data:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Route for fetching all payment data
router.get('/payment', async (req, res) => {
  try {
    const [notPaid] = await sequelize.query(`SELECT pd.*, CASE WHEN pd."paymentMethod" = 'Bank Transfer' THEN fm."bankAccount" ELSE NULL END AS "bankAccount", CASE WHEN pd."paymentMethod" = 'Bank Transfer' THEN fm."bankName" ELSE '' END AS "bankName" FROM "PaymentData" pd LEFT JOIN "Farmers" fm on pd."farmerID" = fm."farmerID" WHERE "isPaid" = 0`);
    const [isPaid] = await sequelize.query(`SELECT pd.*, CASE WHEN pd."paymentMethod" = 'Bank Transfer' THEN fm."bankAccount" ELSE NULL END AS "bankAccount", CASE WHEN pd."paymentMethod" = 'Bank Transfer' THEN fm."bankName" ELSE '' END AS "bankName" FROM "PaymentData" pd LEFT JOIN "Farmers" fm on pd."farmerID" = fm."farmerID" WHERE "isPaid" = 1`);
    
    // Combine both results into a single response object
    res.json({
      notPaid,
      isPaid,
    });
  } catch (err) {
    console.error('Error fetching payment data:', err);
    res.status(500).json({ message: 'Failed to fetch payment data.' });
  }
});

// Route for updating payment data
router.put('/payment/:id', async (req, res) => {
  const { id } = req.params;
  const t = await sequelize.transaction();
  try {
    const {
      isPaid,
    } = req.body;

    // Get today's date for paymentDate
    const paymentDate = isPaid === 1 ? new Date() : null; // Set paymentDate to today if isPaid is 1

    // Update the payment data
    const [updatedPaymentData] = await sequelize.query(
      `
      UPDATE "PaymentData"
      SET "isPaid" = ?, "paymentDate" = ?
      WHERE "id" = ?
      RETURNING *
      `,
      {
        replacements: [isPaid, paymentDate, id],
        transaction: t,
      }
    );

    // Commit the transaction
    await t.commit();

    // Respond with success
    res.status(200).json({
      message: 'Payment data updated successfully',
      updatedPaymentData: updatedPaymentData[0], // Return the updated record
    });
  } catch (err) {
    // Rollback transaction on error
    await t.rollback();
    console.error('Error updating payment data:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;