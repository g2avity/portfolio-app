-- Fix STAR memo field order from TARS to STAR
-- This will update both the template row and user's row
UPDATE custom_sections 
SET content = jsonb_build_object(
  'type', content->>'type',
  'order', content->'order',
  'fields', jsonb_build_array('situation', 'task', 'action', 'result'),
  'layout', content->'layout',
  'entries', COALESCE(content->'entries', '[]'::jsonb),
  'isPublic', content->'isPublic',
  'template', jsonb_build_object(
    'situation', content->'template'->'situation',
    'task', content->'template'->'task',
    'action', content->'template'->'action',
    'result', content->'template'->'result'
  ),
  'allowCode', content->'allowCode',
  'maxEntries', content->'maxEntries',
  'allowImages', content->'allowImages'
)
WHERE content->>'type' = 'star-memo' 
AND content->'template' IS NOT NULL;
