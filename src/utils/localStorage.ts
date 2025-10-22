/**
 * LocalStorage utilities untuk SmartLib Ubhara
 * Frontend-only data persistence
 */

import { Book, User, Borrowing, Activity } from '../types';
import { mockBooks, currentUser, adminUser } from '../data/mockData';

// ============================================
// STORAGE KEYS
// ============================================
const KEYS = {
  BOOKS: 'smartlib_books',
  USERS: 'smartlib_users',
  BORROWINGS: 'smartlib_borrowings',
  ACTIVITIES: 'smartlib_activities',
  CURRENT_USER: 'smartlib_currentUser',
  BORROWING_COUNTER: 'smartlib_borrowingCounter',
};

// ============================================
// INITIALIZATION
// ============================================
export function initializeLocalStorage() {
  // Initialize books if not exists
  if (!localStorage.getItem(KEYS.BOOKS)) {
    localStorage.setItem(KEYS.BOOKS, JSON.stringify(mockBooks));
  }

  // Initialize users with demo accounts
  if (!localStorage.getItem(KEYS.USERS)) {
    const initialUsers = [adminUser, currentUser];
    localStorage.setItem(KEYS.USERS, JSON.stringify(initialUsers));
  }

  // Initialize empty borrowings
  if (!localStorage.getItem(KEYS.BORROWINGS)) {
    localStorage.setItem(KEYS.BORROWINGS, JSON.stringify([]));
  }

  // Initialize empty activities
  if (!localStorage.getItem(KEYS.ACTIVITIES)) {
    localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify([]));
  }

  // Initialize borrowing counter
  if (!localStorage.getItem(KEYS.BORROWING_COUNTER)) {
    localStorage.setItem(KEYS.BORROWING_COUNTER, '0');
  }
}

// ============================================
// BOOKS
// ============================================
export function getBooks(): Book[] {
  const data = localStorage.getItem(KEYS.BOOKS);
  return data ? JSON.parse(data) : mockBooks;
}

export function saveBooks(books: Book[]): void {
  localStorage.setItem(KEYS.BOOKS, JSON.stringify(books));
}

export function addBook(book: Omit<Book, 'id'>): Book {
  const books = getBooks();
  const newBook: Book = {
    ...book,
    id: `book-${Date.now()}`,
  };
  books.push(newBook);
  saveBooks(books);
  return newBook;
}

export function updateBook(id: string, updates: Partial<Book>): Book | null {
  const books = getBooks();
  const index = books.findIndex(b => b.id === id);
  if (index === -1) return null;
  
  books[index] = { ...books[index], ...updates };
  saveBooks(books);
  return books[index];
}

export function deleteBook(id: string): boolean {
  const books = getBooks();
  const filtered = books.filter(b => b.id !== id);
  if (filtered.length === books.length) return false;
  
  saveBooks(filtered);
  return true;
}

// ============================================
// USERS
// ============================================
export function getUsers(): User[] {
  const data = localStorage.getItem(KEYS.USERS);
  return data ? JSON.parse(data) : [adminUser, currentUser];
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
}

export function addUser(user: Omit<User, 'id'>): User {
  const users = getUsers();
  const newUser: User = {
    ...user,
    id: `user-${Date.now()}`,
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function getUserById(id: string): User | null {
  const users = getUsers();
  return users.find(u => u.id === id) || null;
}

// ============================================
// BORROWINGS
// ============================================
export function getBorrowings(): Borrowing[] {
  const data = localStorage.getItem(KEYS.BORROWINGS);
  return data ? JSON.parse(data) : [];
}

export function saveBorrowings(borrowings: Borrowing[]): void {
  localStorage.setItem(KEYS.BORROWINGS, JSON.stringify(borrowings));
}

export function addBorrowing(borrowing: Omit<Borrowing, 'id'>): Borrowing {
  const borrowings = getBorrowings();
  
  // Get and increment counter
  const counter = parseInt(localStorage.getItem(KEYS.BORROWING_COUNTER) || '0') + 1;
  localStorage.setItem(KEYS.BORROWING_COUNTER, counter.toString());
  
  const newBorrowing: Borrowing = {
    ...borrowing,
    id: `borrowing-${Date.now()}`,
  };
  
  borrowings.push(newBorrowing);
  saveBorrowings(borrowings);
  return newBorrowing;
}

export function updateBorrowing(id: string, updates: Partial<Borrowing>): Borrowing | null {
  const borrowings = getBorrowings();
  const index = borrowings.findIndex(b => b.id === id);
  if (index === -1) return null;
  
  borrowings[index] = { ...borrowings[index], ...updates };
  saveBorrowings(borrowings);
  return borrowings[index];
}

export function getBorrowingsByUser(userId: string): Borrowing[] {
  const borrowings = getBorrowings();
  return borrowings.filter(b => b.userId === userId);
}

// ============================================
// ACTIVITIES
// ============================================
export function getActivities(): Activity[] {
  const data = localStorage.getItem(KEYS.ACTIVITIES);
  return data ? JSON.parse(data) : [];
}

export function saveActivities(activities: Activity[]): void {
  localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(activities));
}

export function addActivity(
  userId: string,
  userName: string,
  userRole: 'admin' | 'member',
  action: Activity['action'],
  description: string
): Activity {
  const activities = getActivities();
  
  const newActivity: Activity = {
    id: `activity-${Date.now()}`,
    userId,
    userName,
    userRole,
    action,
    description,
    timestamp: new Date(),
  };
  
  activities.unshift(newActivity); // Add to beginning
  saveActivities(activities);
  return newActivity;
}

// ============================================
// CURRENT USER SESSION
// ============================================
export function getCurrentUser(): User | null {
  const data = localStorage.getItem(KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
}

export function saveCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(KEYS.CURRENT_USER);
  }
}

// ============================================
// RESET / CLEAR
// ============================================
export function resetAllData(): void {
  localStorage.removeItem(KEYS.BOOKS);
  localStorage.removeItem(KEYS.USERS);
  localStorage.removeItem(KEYS.BORROWINGS);
  localStorage.removeItem(KEYS.ACTIVITIES);
  localStorage.removeItem(KEYS.BORROWING_COUNTER);
  // Keep current user session
  initializeLocalStorage();
}

export function clearSession(): void {
  localStorage.removeItem(KEYS.CURRENT_USER);
}

export function clearAll(): void {
  Object.values(KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}
