const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Batches', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true
    },
    batchNumber: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    farmerName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    dateReceived: {
      type: DataTypes.DATE,
      allowNull: false
    },
    rfidTagId: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Batches',
    timestamps: true
  });
};
