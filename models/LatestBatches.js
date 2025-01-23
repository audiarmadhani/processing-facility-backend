const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('LatestBatches', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true
    },
    batchNumber: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "0001",
      unique: true
    }
  }, {
    sequelize,
    tableName: 'LatestBatches',
    timestamps: true,
    indexes: [
      {
        name: "sqlite_autoindex_LatestBatches_1",
        unique: true,
        fields: [
          { name: "batchNumber" },
        ]
      },
    ]
  });
};
