var DataTypes = require("sequelize").DataTypes;
var _BagData = require("./BagData");
var _PreprocessingData = require("./PreprocessingData");
var _QCData = require("./QCData");
var _latest_batch = require("./latest_batch");
var _ReceivingData = require("./ReceivingData");
var _TargetMetrics = require("./TargetMetrics");



function initModels(sequelize) {
  var BagData = _BagData(sequelize, DataTypes);
  var PreprocessingData = _PreprocessingData(sequelize, DataTypes);
  var QCData = _QCData(sequelize, DataTypes);
  var ReceivingData = _ReceivingData(sequelize, DataTypes);
  var latest_batch = _latest_batch(sequelize, DataTypes);
  var TargetMetrics = _TargetMetrics(sequelize, DataTypes);


  BagData.belongsTo(ReceivingData, { as: "batchNumber_ReceivingDatum", foreignKey: "batchNumber"});
  ReceivingData.hasMany(BagData, { as: "BagData", foreignKey: "batchNumber"});

  return {
    BagData,
    PreprocessingData,
    QCData,
    ReceivingData,
    latest_batch,
    TargetMetrics
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
