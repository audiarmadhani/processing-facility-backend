/**
 * Lateral join to the latest FermentationData row per batch (for experimentNumber).
 * @param {string} batchAlias SQL table alias that exposes "batchNumber"
 */
function fermentationExperimentJoin(batchAlias = 'r') {
  return `
  LEFT JOIN LATERAL (
    SELECT fd."experimentNumber"
    FROM "FermentationData" fd
    WHERE fd."batchNumber" = ${batchAlias}."batchNumber"
    ORDER BY fd.id DESC
    LIMIT 1
  ) fer ON true
`;
}

module.exports = { fermentationExperimentJoin };
