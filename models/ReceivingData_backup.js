const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ReceivingData_backup', {
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
    totalBags: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    receivingDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.REAL,
      allowNull: true
    },
    updatedBy: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'ReceivingData_backup',
    timestamps: true,
    indexes: [
      {
        name: "sqlite_autoindex_ReceivingData_backup_1",
        unique: true,
        fields: [
          { name: "batchNumber" },
        ]
      },
    ]
  });
};
