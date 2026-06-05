const assert = require('assert');
const {
  parseWeight,
  buildActiveStages,
  reorderStagesMonotonically,
  buildLinksForRow,
  aggregateLinks,
  buildWeightFlowSankey,
} = require('../utils/weightFlowSankey');

function testParseWeight() {
  assert.strictEqual(parseWeight('500'), 500);
  assert.strictEqual(parseWeight('N/A'), 0);
  assert.strictEqual(parseWeight(null), 0);
}

function testFullCherryPath() {
  const row = {
    batchNumber: 'B1',
    processingType: 'Washed',
    producer: 'Farm A',
    receiving_weight: 1000,
    preprocessing_weight: 950,
    wetmill_weight: 900,
    fermentation_weight: 850,
    drying_weight: 800,
    dry_mill_weight: 750,
  };
  const grades = [
    { grade: 'G1', stored_weight: 400 },
    { grade: 'G2', stored_weight: 300 },
  ];
  const { links } = buildLinksForRow(row, grades);

  assert.ok(links.some((l) => l.from_node === 'Receiving' && l.to_node === 'Preprocessing'));
  assert.ok(links.some((l) => l.from_node === 'Dry Mill' && l.to_node === 'Stored: G1'));
  assert.ok(links.some((l) => l.from_node === 'Dry Mill' && l.to_node === 'Stored: G2'));
  assert.ok(links.some((l) => l.from_node === 'Dry Mill' && l.to_node === 'Dry Mill Loss' && l.value === 50));
}

function testSkippedFermentation() {
  const row = {
    receiving_weight: 500,
    preprocessing_weight: 480,
    wetmill_weight: 460,
    fermentation_weight: 0,
    drying_weight: 440,
    dry_mill_weight: 420,
  };
  const stages = buildActiveStages(row);
  assert.ok(!stages.some((s) => s.key === 'fermentation'));
}

function testMonotonicReorder() {
  const stages = [
    { key: 'receiving', label: 'Receiving', canonicalIndex: 0, weight: 200 },
    { key: 'wetmill', label: 'Wet Mill', canonicalIndex: 2, weight: 200 },
    { key: 'drying', label: 'Drying', canonicalIndex: 4, weight: 250 },
  ];
  const { ordered, reordered } = reorderStagesMonotonically(stages);
  assert.strictEqual(reordered, true);
  assert.strictEqual(ordered[0].key, 'receiving');
  assert.strictEqual(ordered[1].key, 'drying');
  assert.strictEqual(ordered[2].key, 'wetmill');
}

function testGreenBeanShortcut() {
  const row = {
    receiving_weight: 300,
    preprocessing_weight: 0,
    wetmill_weight: 0,
    fermentation_weight: 0,
    drying_weight: 0,
    dry_mill_weight: 280,
  };
  const grades = [{ grade: 'G1', stored_weight: 250 }];
  const { links } = buildLinksForRow(row, grades);
  assert.ok(links.some((l) => l.from_node === 'Receiving' && l.to_node === 'Dry Mill'));
  assert.ok(links.some((l) => l.to_node === 'Stored: G1'));
}

function testLossNodes() {
  const row = {
    receiving_weight: 1000,
    preprocessing_weight: 800,
    wetmill_weight: 0,
    fermentation_weight: 0,
    drying_weight: 0,
    dry_mill_weight: 0,
  };
  const { links } = buildLinksForRow(row, []);
  const receivingLoss = links.find((l) => l.to_node === 'Receiving Loss');
  assert.ok(receivingLoss);
  assert.strictEqual(receivingLoss.value, 200);
}

function testAggregation() {
  const result = buildWeightFlowSankey(
    [
      {
        batchNumber: 'B1',
        processingType: 'Washed',
        producer: 'A',
        receiving_weight: 100,
        preprocessing_weight: 90,
        wetmill_weight: 0,
        fermentation_weight: 0,
        drying_weight: 0,
        dry_mill_weight: 0,
      },
      {
        batchNumber: 'B2',
        processingType: 'Natural',
        producer: 'B',
        receiving_weight: 200,
        preprocessing_weight: 180,
        wetmill_weight: 0,
        fermentation_weight: 0,
        drying_weight: 0,
        dry_mill_weight: 0,
      },
    ],
    [],
    { timeframe: 'this_year' }
  );

  assert.strictEqual(result.meta.batchCount, 2);
  assert.strictEqual(result.meta.totalReceivingWeight, 300);
  const receivingToPrep = result.links.find(
    (l) => l.from_node === 'Receiving' && l.to_node === 'Preprocessing'
  );
  assert.strictEqual(receivingToPrep.value, 270);
}

function testFacilityRollupEndToEnd() {
  const result = buildWeightFlowSankey(
    [
      {
        batchNumber: 'B1',
        processingType: 'Washed',
        producer: 'A',
        receiving_weight: 100,
        preprocessing_weight: 90,
        wetmill_weight: 80,
        fermentation_weight: 0,
        drying_weight: 70,
        dry_mill_weight: 60,
      },
      {
        batchNumber: 'B2',
        processingType: 'Natural',
        producer: 'B',
        receiving_weight: 200,
        preprocessing_weight: 180,
        wetmill_weight: 0,
        fermentation_weight: 0,
        drying_weight: 0,
        dry_mill_weight: 0,
      },
    ],
    [{ grade: 'G1', stored_weight: 50 }],
    { timeframe: 'this_year' }
  );

  assert.ok(result.links.some((l) => l.from_node === 'Preprocessing' && l.to_node === 'Wet Mill'));
  assert.ok(result.links.some((l) => l.from_node === 'Wet Mill' && l.to_node === 'Drying'));
  assert.ok(result.links.some((l) => l.from_node === 'Dry Mill' && l.to_node === 'Stored: G1'));
}

function run() {
  testParseWeight();
  testFullCherryPath();
  testSkippedFermentation();
  testMonotonicReorder();
  testGreenBeanShortcut();
  testLossNodes();
  testAggregation();
  testFacilityRollupEndToEnd();
  console.log('weightFlowSankey tests passed');
}

run();
