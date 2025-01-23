const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('latest_pp_batch', {
    id: {
      type: "SERIAL",
      allowNull: true,
      primaryKey: true,
      unique: true
    },
    latest_batch_number: {
      type: DataTypes.STRING(20),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'latest_pp_batch',
    timestamps: false
  });
};
