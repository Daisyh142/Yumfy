const AUTH_KEY = 'yumfy_auth_user';
const USERS_KEY = 'yumfy_users';

const defaultUsers = [
  { email: 'demo@yumfy.com', password: 'demo123', name: 'Demo User' },
  { email: 'test@test.com', password: 'test123', name: 'Test User' }
];

function initializeUsers() {
  const existingUsers = getStoredUsers();
  if (existingUsers.length === 0) {
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }
}

function getStoredUsers() {
  try {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    
  }
}

export function getCurrentUser() {
  try {
    const user = localStorage.getItem(AUTH_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return getCurrentUser() !== null;
}

export async function signIn(email, password) {
  initializeUsers();
  
  const users = getStoredUsers();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  const { password: _, ...userSession } = user;
  localStorage.setItem(AUTH_KEY, JSON.stringify(userSession));
  
  return userSession;
}

export async function signUp(email, password, name = '') {
  initializeUsers();
  
  const users = getStoredUsers();
  
  if (users.find(u => u.email === email)) {
    throw new Error('User already exists with this email');
  }
  
  const newUser = { email, password, name: name || email.split('@')[0] };
  users.push(newUser);
  saveUsers(users);
  
  const { password: _, ...userSession } = newUser;
  localStorage.setItem(AUTH_KEY, JSON.stringify(userSession));
  
  return userSession;
}

export function signOut() {
  localStorage.removeItem(AUTH_KEY);
}

initializeUsers();
