import { supabase } from './supabase';
import type { PdfFile } from './supabase';

// Upload a PDF file to Supabase storage and store metadata in the database
export async function uploadPdf(file: File): Promise<PdfFile | null> {
  try {
    // Create a unique file path
    const filePath = `${Date.now()}-${file.name}`;
    
    // Upload file to Supabase storage
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('pdfs')
      .upload(filePath, file);
      
    if (storageError) {
      console.error('Error uploading to storage:', storageError);
      throw storageError;
    }
    
    // Store file metadata in the database
    const { data: dbData, error: dbError } = await supabase
      .from('pdf_files')
      .insert({
        name: file.name,
        size: file.size,
        storage_path: filePath,
        content_type: file.type,
      })
      .select()
      .single();
      
    if (dbError) {
      console.error('Error inserting into database:', dbError);
      // Clean up the storage if database insert fails
      await supabase.storage.from('pdfs').remove([filePath]);
      throw dbError;
    }
    
    return dbData;
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
}

// Get all PDF files from the database
export async function getPdfFiles(): Promise<PdfFile[]> {
  try {
    const { data, error } = await supabase
      .from('pdf_files')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching PDF files:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getPdfFiles:', error);
    return [];
  }
}

// Get a specific PDF file by ID
export async function getPdfFile(id: string): Promise<PdfFile | null> {
  try {
    const { data, error } = await supabase
      .from('pdf_files')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching PDF file:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getPdfFile:', error);
    return null;
  }
}

// Get a public URL for a PDF file
export async function getPdfUrl(path: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .storage
      .from('pdfs')
      .createSignedUrl(path, 60 * 60); // 1 hour expiry
      
    if (error) {
      console.error('Error creating signed URL:', error);
      throw error;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error('Error in getPdfUrl:', error);
    return null;
  }
}

// Delete a PDF file
export async function deletePdfFile(id: string, path: string): Promise<boolean> {
  try {
    // Delete from storage first
    const { error: storageError } = await supabase
      .storage
      .from('pdfs')
      .remove([path]);
      
    if (storageError) {
      console.error('Error removing from storage:', storageError);
      throw storageError;
    }
    
    // Then delete metadata from database
    const { error: dbError } = await supabase
      .from('pdf_files')
      .delete()
      .eq('id', id);
      
    if (dbError) {
      console.error('Error deleting from database:', dbError);
      throw dbError;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deletePdfFile:', error);
    return false;
  }
}