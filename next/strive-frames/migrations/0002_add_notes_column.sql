-- Add notes column to normal_moves table
ALTER TABLE normal_moves ADD COLUMN notes VARCHAR;

-- Add notes column to special_moves table
ALTER TABLE special_moves ADD COLUMN notes VARCHAR;

-- Add notes column to overdrive_moves table
ALTER TABLE overdrive_moves ADD COLUMN notes VARCHAR; 