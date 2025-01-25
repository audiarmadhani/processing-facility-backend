const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('PostprocessingData', {
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
    referenceNumber: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    type: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
    processingType: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
    productLine: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    producer: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    totalBags: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    storedDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    quality: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'PostprocessingData',
    timestamps: true,
  });
};
