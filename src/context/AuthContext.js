import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (authUser) => {
    if (!authUser) {
      setUser(null);
      setUserRole(null);
      setUserProfile(null);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();
    if (!error && data) {
      setUserRole(data.role);
      setUserProfile(data);
    }
    setUser(authUser);
  };

  useEffect(() => {
    // Load whatever session already exists (e.g. app was reopened)
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadProfile(session?.user ?? null).finally(() => setLoading(false));
    });

    // React to future sign-in/sign-out events
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProfile(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const register = async (email, password, fullName, phone, sector) => {
    // full_name/phone/sector land in the user's metadata, which the
    // handle_new_user trigger in schema.sql reads to create the profile row
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone, sector },
      },
    });
    if (error) throw error;
    return data;
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userRole, userProfile, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};