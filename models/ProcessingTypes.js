const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ProcessingTypes', {
    id: {
      type: "SERIAL",
      allowNull: true,
      primaryKey: true,
      unique: true
    },
    processingType: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    abbreviation: {
        type: DataTypes.STRING(20),
        allowNull: false
      }
  }, {
    sequelize,
    tableName: 'ProcessingTypes',
    timestamps: false
  });
};
