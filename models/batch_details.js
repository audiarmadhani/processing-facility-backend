const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('batch_details', {
    id: {
      type: "SERIAL",
      allowNull: true,
      primaryKey: true,
      unique: true
    },
    batch_number: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    bag_number: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    bag_weight: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'batch_details',
    timestamps: false
  });
};
