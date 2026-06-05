-- Tasting evaluation fields for GB QC (sample roast / start QC)
ALTER TABLE "PostprocessingQCData"
  ADD COLUMN IF NOT EXISTS "tastingNotes" TEXT,
  ADD COLUMN IF NOT EXISTS "okForFurtherProcess" BOOLEAN;
