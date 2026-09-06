/*
# Add btn_label and btn_color to file_pricing

1. Modified Tables
- `file_pricing`: Added `btn_label` (text, default 'Télécharger') and `btn_color` (text, default '#F97316')
  - These let the admin customize the download button text and color per file from the admin panel.
2. Security
- No policy changes; existing RLS policies already cover the new columns.
*/

ALTER TABLE file_pricing ADD COLUMN IF NOT EXISTS btn_label text DEFAULT 'Télécharger';
ALTER TABLE file_pricing ADD COLUMN IF NOT EXISTS btn_color text DEFAULT '#F97316';
