const WEIGHT_FLOW_STAGES = [
  { key: 'receiving', label: 'Receiving', field: 'receiving_weight' },
  { key: 'preprocessing', label: 'Preprocessing', field: 'preprocessing_weight' },
  { key: 'wetmill', label: 'Wet Mill', field: 'wetmill_weight' },
  { key: 'fermentation', label: 'Fermentation', field: 'fermentation_weight' },
  { key: 'drying', label: 'Drying', field: 'drying_weight' },
  { key: 'drymill', label: 'Dry Mill', field: 'dry_mill_weight' },
];

function parseWeight(value) {
  if (value == null || value === 'N/A' || value === '') return 0;
  const n = parseFloat(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function rowKey(row) {
  return `${row.batchNumber}|${row.processingType}|${row.producer || ''}`;
}

function buildActiveStages(row) {
  const stages = WEIGHT_FLOW_STAGES.map((stage, canonicalIndex) => ({
    ...stage,
    canonicalIndex,
    weight: parseWeight(row[stage.field]),
  })).filter((stage) => stage.weight > 0 || stage.key === 'receiving');

  const receiving = stages.find((s) => s.key === 'receiving');
  if (receiving && receiving.weight === 0) {
    const maxOther = stages.reduce((max, s) => Math.max(max, s.weight), 0);
    if (maxOther === 0) return [];
  }

  return stages.filter((s) => s.weight > 0 || s.key === 'receiving');
}

function reorderStagesMonotonically(stages) {
  if (stages.length <= 1) return { ordered: stages, reordered: false };

  const canonicalOrder = stages.map((s) => s.key).join('>');
  const receiving = stages.find((s) => s.key === 'receiving');
  const others = stages.filter((s) => s.key !== 'receiving');

  others.sort((a, b) => {
    if (b.weight !== a.weight) return b.weight - a.weight;
    return a.canonicalIndex - b.canonicalIndex;
  });

  const ordered = receiving ? [receiving, ...others] : others;
  const reordered = ordered.map((s) => s.key).join('>') !== canonicalOrder;
  return { ordered, reordered };
}

function buildLinearLinks(orderedStages) {
  const links = [];

  for (let i = 0; i < orderedStages.length - 1; i += 1) {
    const from = orderedStages[i];
    const to = orderedStages[i + 1];
    links.push({ from_node: from.label, to_node: to.label, value: to.weight });
    const loss = from.weight - to.weight;
    if (loss > 0) {
      links.push({ from_node: from.label, to_node: `${from.label} Loss`, value: loss });
    }
  }

  return links;
}

function buildGradeLinks(dryMillStage, grades) {
  const links = [];
  if (!grades.length) return links;

  const dryMillWeight = dryMillStage?.weight || 0;
  const totalGradeWeight = grades.reduce((sum, g) => sum + g.stored_weight, 0);
  const effectiveDryMillWeight = dryMillWeight > 0 ? dryMillWeight : totalGradeWeight;

  for (const grade of grades) {
    if (grade.stored_weight > 0) {
      links.push({
        from_node: 'Dry Mill',
        to_node: `Stored: ${grade.grade}`,
        value: grade.stored_weight,
      });
    }
  }

  const remainder = effectiveDryMillWeight - totalGradeWeight;
  if (remainder > 0) {
    links.push({
      from_node: 'Dry Mill',
      to_node: 'Dry Mill Loss',
      value: remainder,
    });
  }

  return links;
}

function buildLinksForRow(row, grades = []) {
  const activeStages = buildActiveStages(row);
  if (activeStages.length === 0) return { links: [], reordered: false };

  const { ordered, reordered } = reorderStagesMonotonically(activeStages);
  const links = buildLinearLinks(ordered);

  const dryMillStage = ordered.find((s) => s.key === 'drymill');
  if (dryMillStage && grades.length > 0) {
    links.push(...buildGradeLinks(dryMillStage, grades));
  }

  return { links, reordered };
}

function aggregateLinks(allLinks) {
  const map = new Map();
  for (const link of allLinks) {
    if (!link.value || link.value <= 0) continue;
    const key = `${link.from_node}|${link.to_node}`;
    map.set(key, (map.get(key) || 0) + link.value);
  }
  return Array.from(map.entries())
    .map(([key, value]) => {
      const [from_node, to_node] = key.split('|');
      return { from_node, to_node, value: Math.round(value * 100) / 100 };
    })
    .filter((l) => l.value > 0);
}

function groupGradesByRowKey(gradeRows) {
  const map = new Map();
  for (const grade of gradeRows) {
    const key = rowKey(grade);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(grade);
  }
  return map;
}

function sumStageWeights(pipelineRows) {
  return WEIGHT_FLOW_STAGES.map((stage, canonicalIndex) => ({
    ...stage,
    canonicalIndex,
    weight: pipelineRows.reduce((sum, row) => sum + parseWeight(row[stage.field]), 0),
  }));
}

function aggregateGradeWeights(gradeRows) {
  const map = new Map();
  for (const grade of gradeRows) {
    const weight = parseWeight(grade.stored_weight);
    if (weight <= 0) continue;
    map.set(grade.grade, (map.get(grade.grade) || 0) + weight);
  }
  return Array.from(map.entries()).map(([grade, stored_weight]) => ({ grade, stored_weight }));
}

function buildFacilityLinks(pipelineRows, gradeRows) {
  const stageTotals = sumStageWeights(pipelineRows);
  const receivingTotal = stageTotals[0]?.weight || 0;
  if (receivingTotal <= 0) return { links: [], reordered: false, gradeBranchCount: 0 };

  let lastIdx = 0;
  for (let i = stageTotals.length - 1; i >= 0; i -= 1) {
    if (stageTotals[i].weight > 0) {
      lastIdx = i;
      break;
    }
  }

  const { ordered, reordered } = reorderStagesMonotonically(stageTotals.slice(0, lastIdx + 1));
  const links = buildLinearLinks(ordered);

  const gradeTotals = aggregateGradeWeights(gradeRows);
  const dryMillStage = ordered.find((s) => s.key === 'drymill');
  if (gradeTotals.length > 0) {
    const stageForGrades = dryMillStage || ordered[ordered.length - 1];
    links.push(...buildGradeLinks(stageForGrades, gradeTotals));
  }

  return { links, reordered, gradeBranchCount: gradeTotals.length };
}

function buildWeightFlowSankey(pipelineRows, gradeRows = [], filters = {}) {
  const { links, reordered, gradeBranchCount } = buildFacilityLinks(pipelineRows, gradeRows);
  const aggregatedLinks = aggregateLinks(links);
  const totalReceivingWeight = pipelineRows.reduce(
    (sum, row) => sum + parseWeight(row.receiving_weight),
    0
  );

  return {
    links: aggregatedLinks,
    meta: {
      batchCount: pipelineRows.length,
      reorderedBatchCount: reordered ? 1 : 0,
      gradeBranchCount,
      totalReceivingWeight: Math.round(totalReceivingWeight * 100) / 100,
      filters,
    },
  };
}

module.exports = {
  WEIGHT_FLOW_STAGES,
  parseWeight,
  buildActiveStages,
  reorderStagesMonotonically,
  buildLinksForRow,
  aggregateLinks,
  sumStageWeights,
  buildFacilityLinks,
  buildWeightFlowSankey,
};
