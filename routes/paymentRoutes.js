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

    // Save the transport data
    const [transportData] = await sequelize.query(
      `
      INSERT INTO "PaymentData" ("farmerName", "farmerID", "totalAmount", "date", "paymentMethod", "paymentDescription", "isPaid") 
      VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *
      `,
      {
        replacements: [farmerName, farmerID, totalAmount, date, paymentMethod, paymentDescription, isPaid],
        transaction: t,
      }
    );

    // Commit the transaction
    await t.commit();

    // Respond with success
    res.status(201).json({
      message: 'Payment data created successfully',
      transportData: transportData[0], // Return the created record
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
    const [notPaid] = await sequelize.query(`SELECT * FROM "PaymentData" WHERE "isPaid" = 0`);
    const [isPaid] = await sequelize.query(`SELECT * FROM "PaymentData" WHERE "isPaid" = 1`);
    
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