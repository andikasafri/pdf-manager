/*
  # Initial setup for PDF Manager

  1. New Tables
    - `pdf_files` 
      - `id` (uuid, primary key)
      - `name` (text, name of the file)
      - `size` (integer, file size in bytes)
      - `storage_path` (text, path to the file in storage)
      - `content_type` (text, MIME type of the file)
      - `created_at` (timestamptz, creation timestamp)

  2. Security
    - Enable RLS on `pdf_files` table
    - Add policy for unauthenticated users to select all records
    - Add policy for unauthenticated users to insert records
*/

-- Create pdf_files table
CREATE TABLE IF NOT EXISTS pdf_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  size integer NOT NULL,
  storage_path text NOT NULL,
  content_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE pdf_files ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access"
  ON pdf_files
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert"
  ON pdf_files
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public delete"
  ON pdf_files
  FOR DELETE
  TO anon
  USING (true);