const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('QCData', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true
    },
    batchNumber: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    ripeness: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    color: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    foreignMatter: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    overallQuality: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    qcNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    qcDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'QCData',
    timestamps: true
  });
};
