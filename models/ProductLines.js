const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ProductLines', {
    id: {
      type: "SERIAL",
      allowNull: true,
      primaryKey: true,
      unique: true
    },
    productLine: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    abbreviation: {
        type: DataTypes.STRING(20),
        allowNull: false
      }
  }, {
    sequelize,
    tableName: 'ProductLines',
    timestamps: false
  });
};
