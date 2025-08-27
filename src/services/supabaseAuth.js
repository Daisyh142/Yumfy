import { supabase } from '../supabase';

export async function signUp(email, password, name = '') {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0]
        }
      }
    });

    if (error) throw error;

    return {
      id: data.user?.id,
      email: data.user?.email,
      name: data.user?.user_metadata?.name || name
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    return {
      id: data.user?.id,
      email: data.user?.email,
      name: data.user?.user_metadata?.name || email.split('@')[0]
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error signing out:', error);
    throw new Error(error.message);
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    
    return user ? {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email?.split('@')[0]
    } : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export function isAuthenticated() {
  return getCurrentUser() !== null;
}

export function onAuthStateChange(callback) {
  const authData = supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user ? {
      id: session.user.id,
      email: session.user.email,
      name: session.user.user_metadata?.name || session.user.email?.split('@')[0]
    } : null;
    
    callback(event, user);
  });

  return authData; 
}
