-- Optional reason/note when a batch is moved between drying areas
ALTER TABLE "DryingAreaMovements"
  ADD COLUMN IF NOT EXISTS notes TEXT;
