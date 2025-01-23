const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('FarmerData', {
    farmerID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    farmerName: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: false
    },
    farmerAddress: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    farmerLandArea: {
      type: DataTypes.REAL,
      allowNull: false
    },
    farmerContact: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    latitude: {
      type: DataTypes.REAL,
      allowNull: true
    },
    longitude: {
      type: DataTypes.REAL,
      allowNull: true
    },
    farmType: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    registrationDate: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isActive: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    isActive: {
        type: DataTypes.TEXT,
        allowNull: true
      }
  }, {
    sequelize,
    tableName: 'ReceivingData',
    timestamps: true,
    indexes: [
      {
        name: "sqlite_autoindex_ReceivingData_1",
        unique: true,
        fields: [
          { name: "batchNumber" },
        ]
      },
    ]
  });
};
