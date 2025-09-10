-- H2 Database Migration Script
-- Run this script to change DESCRIPTION column from VARCHAR(2000) to TEXT

-- Connect to the database first with these settings:
-- JDBC URL: jdbc:h2:file:./data/fixpoint
-- User: sa
-- Password: password

-- Check current column definition
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'REPORTS' AND COLUMN_NAME = 'DESCRIPTION';

-- Change the column type to TEXT (unlimited length)
ALTER TABLE REPORTS ALTER COLUMN DESCRIPTION SET DATA TYPE TEXT;

-- Verify the change
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'REPORTS' AND COLUMN_NAME = 'DESCRIPTION';

-- You should see DATA_TYPE as 'CLOB' or 'TEXT' and CHARACTER_MAXIMUM_LENGTH as NULL
