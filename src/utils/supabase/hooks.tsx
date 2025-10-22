import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';
import { Book, User, Borrowing, Activity } from '../../types';
import { mockBooks, currentUser, adminUser, mockBorrowings, mockActivities } from '../../data/mockData';

// Initialize Supabase client
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabase = createClient(supabaseUrl, publicAnonKey);

// Flag to track if Supabase is available
let supabaseAvailable = true;

// ============================================
// BOOKS HOOK
// ============================================
export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch books from Supabase (with fallback to mockData)
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('title', { ascending: true });

      if (error) throw error;

      setBooks(data || []);
      setError(null);
      supabaseAvailable = true;
    } catch (err: any) {
      console.warn('⚠️ Supabase tidak tersedia, menggunakan mock data untuk books');
      supabaseAvailable = false;
      setBooks(mockBooks);
      setError(null); // Don't show error, fallback is working
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('books-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'books' }, () => {
        fetchBooks();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Add book
  const addBook = async (bookData: Omit<Book, 'id'>) => {
    if (!supabaseAvailable) {
      console.warn('⚠️ Supabase tidak tersedia - mode offline');
      return { success: false, error: 'Database offline - fitur tambah buku tidak tersedia dalam mode demo' };
    }
    
    try {
      const { data, error } = await supabase
        .from('books')
        .insert([bookData])
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (err: any) {
      console.error('Error adding book:', err);
      return { success: false, error: err.message };
    }
  };

  // Update book
  const updateBook = async (id: string, bookData: Partial<Book>) => {
    if (!supabaseAvailable) {
      console.warn('⚠️ Supabase tidak tersedia - mode offline');
      return { success: false, error: 'Database offline - fitur update buku tidak tersedia dalam mode demo' };
    }
    
    try {
      const { data, error } = await supabase
        .from('books')
        .update(bookData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (err: any) {
      console.error('Error updating book:', err);
      return { success: false, error: err.message };
    }
  };

  // Delete book
  const deleteBook = async (id: string) => {
    if (!supabaseAvailable) {
      console.warn('⚠️ Supabase tidak tersedia - mode offline');
      return { success: false, error: 'Database offline - fitur hapus buku tidak tersedia dalam mode demo' };
    }
    
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (err: any) {
      console.error('Error deleting book:', err);
      return { success: false, error: err.message };
    }
  };

  return { books, loading, error, addBook, updateBook, deleteBook };
}

// ============================================
// USERS HOOK
// ============================================
export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users from Supabase (with fallback to mockData)
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
      setError(null);
      supabaseAvailable = true;
    } catch (err: any) {
      console.warn('⚠️ Supabase tidak tersedia, menggunakan mock data untuk users');
      supabaseAvailable = false;
      setUsers([currentUser, adminUser]);
      setError(null); // Don't show error, fallback is working
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('users-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchUsers();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Add user
  const addUser = async (userData: Omit<User, 'id'> | User) => {
    if (!supabaseAvailable) {
      console.warn('⚠️ Supabase tidak tersedia - mode offline');
      return { success: false, error: 'Database offline - fitur registrasi tidak tersedia dalam mode demo' };
    }
    
    try {
      // If user has an ID, preserve it
      const userToInsert = 'id' in userData 
        ? userData 
        : userData;

      const { data, error } = await supabase
        .from('users')
        .insert([userToInsert])
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (err: any) {
      console.error('Error adding user:', err);
      return { success: false, error: err.message };
    }
  };

  return { users, loading, error, addUser };
}

// ============================================
// BORROWINGS HOOK
// ============================================
export function useBorrowings() {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch borrowings from Supabase (with fallback to mockData)
  const fetchBorrowings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('borrowings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBorrowings(data || []);
      setError(null);
      supabaseAvailable = true;
    } catch (err: any) {
      console.warn('⚠️ Supabase tidak tersedia, menggunakan mock data untuk borrowings');
      supabaseAvailable = false;
      setBorrowings(mockBorrowings);
      setError(null); // Don't show error, fallback is working
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowings();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('borrowings-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'borrowings' }, () => {
        fetchBorrowings();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Add borrowing
  const addBorrowing = async (borrowingData: Omit<Borrowing, 'id'>) => {
    if (!supabaseAvailable) {
      console.warn('⚠️ Supabase tidak tersedia - mode offline');
      return { success: false, error: 'Database offline - fitur peminjaman tidak tersedia dalam mode demo' };
    }
    
    try {
      const { data, error } = await supabase
        .from('borrowings')
        .insert([borrowingData])
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (err: any) {
      console.error('Error adding borrowing:', err);
      return { success: false, error: err.message };
    }
  };

  // Update borrowing
  const updateBorrowing = async (id: string, borrowingData: Partial<Borrowing>) => {
    if (!supabaseAvailable) {
      console.warn('⚠️ Supabase tidak tersedia - mode offline');
      return { success: false, error: 'Database offline - fitur update peminjaman tidak tersedia dalam mode demo' };
    }
    
    try {
      const { data, error } = await supabase
        .from('borrowings')
        .update(borrowingData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (err: any) {
      console.error('Error updating borrowing:', err);
      return { success: false, error: err.message };
    }
  };

  return { borrowings, loading, error, addBorrowing, updateBorrowing };
}

// ============================================
// ACTIVITIES HOOK
// ============================================
export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch activities from Supabase (with fallback to mockData)
  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;

      setActivities(data || []);
      setError(null);
      supabaseAvailable = true;
    } catch (err: any) {
      console.warn('⚠️ Supabase tidak tersedia, menggunakan mock data untuk activities');
      supabaseAvailable = false;
      setActivities(mockActivities);
      setError(null); // Don't show error, fallback is working
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('activities-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, () => {
        fetchActivities();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Add activity
  const addActivity = async (activityData: Omit<Activity, 'id'>) => {
    if (!supabaseAvailable) {
      // Silently fail for activities in offline mode - not critical
      console.warn('⚠️ Supabase tidak tersedia - activity log dilewati');
      return { success: true, data: null }; // Return success to not break the flow
    }
    
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert([activityData])
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (err: any) {
      console.error('Error adding activity:', err);
      return { success: false, error: err.message };
    }
  };

  return { activities, loading, error, addActivity };
}

// Export supabase client for direct use if needed
export { supabase };
