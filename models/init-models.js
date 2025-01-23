var DataTypes = require("sequelize").DataTypes;
var _BagData = require("./BagData");
var _Batches = require("./Batches");
var _LatestBatches = require("./LatestBatches");
var _PreprocessingData = require("./PreprocessingData");
var _QCData = require("./QCData");
var _ReceivingData_backup = require("./ReceivingData_backup");
var _batch_details = require("./batch_details");
var _latest_batch = require("./latest_batch");
var _FarmerData = require("./FarmerData");
var _ReceivingData = require("./ReceivingData");
var _TargetMetrics = require("./TargetMetrics");



function initModels(sequelize) {
  var BagData = _BagData(sequelize, DataTypes);
  var Batches = _Batches(sequelize, DataTypes);
  var LatestBatches = _LatestBatches(sequelize, DataTypes);
  var PreprocessingData = _PreprocessingData(sequelize, DataTypes);
  var QCData = _QCData(sequelize, DataTypes);
  var ReceivingData = _ReceivingData(sequelize, DataTypes);
  var ReceivingData_backup = _ReceivingData_backup(sequelize, DataTypes);
  var batch_details = _batch_details(sequelize, DataTypes);
  var latest_batch = _latest_batch(sequelize, DataTypes);
  var FarmerData = _FarmerData(sequelize, DataTypes);
  var TargetMetrics = _TargetMetrics(sequelize, DataTypes);


  BagData.belongsTo(ReceivingData, { as: "batchNumber_ReceivingDatum", foreignKey: "batchNumber"});
  ReceivingData.hasMany(BagData, { as: "BagData", foreignKey: "batchNumber"});

  return {
    BagData,
    Batches,
    LatestBatches,
    PreprocessingData,
    QCData,
    ReceivingData,
    ReceivingData_backup,
    batch_details,
    latest_batch,
    FarmerData,
    TargetMetrics
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
