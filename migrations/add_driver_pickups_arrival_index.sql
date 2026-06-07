-- Speed up year-filtered pickup queries on Our Farmers map
CREATE INDEX IF NOT EXISTS idx_driver_pickups_arrival
  ON driver_pickups (arrival_timestamp DESC);
