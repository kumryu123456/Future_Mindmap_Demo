-- Diagnostic SQL to check PostgreSQL encoding settings
SELECT 
  name,
  setting,
  unit,
  context
FROM pg_settings 
WHERE name IN (
  'server_encoding',
  'client_encoding', 
  'lc_collate',
  'lc_ctype',
  'timezone'
);

-- Check database encoding
SELECT 
  datname,
  encoding,
  pg_encoding_to_char(encoding) as encoding_name
FROM pg_database 
WHERE datname = current_database();

-- Test UTF-8 handling
SELECT '안녕하세요' as korean_test, 
       length('안녕하세요') as char_length,
       octet_length('안녕하세요') as byte_length;