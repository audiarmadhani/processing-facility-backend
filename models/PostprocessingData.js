const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ReceivingData', {
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
    type: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
    processingType: {
        type: DataTypes.STRING(255),
        allowNull: true
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
