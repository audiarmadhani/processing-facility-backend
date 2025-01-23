const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('PreprocessingData', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true, // Use autoIncrement for primary key
      unique: true
    },
    batchNumber: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    bagsProcessed: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    processingDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'PreprocessingData',
    timestamps: true
    // Removed the indexes array
  });
};