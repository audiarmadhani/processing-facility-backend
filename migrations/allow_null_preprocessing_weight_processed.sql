-- Allow sending batches to wet mill before cherry weight is known
ALTER TABLE "PreprocessingData"
  ALTER COLUMN "weightProcessed" DROP NOT NULL;
