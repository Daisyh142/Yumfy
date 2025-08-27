import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './home';
import FavoritesPage from './FavoritesPage'; 
import Header from './Header'; 
import RecipeDetails from './RecipeDetails';
import Login from './Login';
import ProfilePage from './ProfilePage';
import { getCurrentUser, onAuthStateChange } from './services/supabaseAuth';
import { getUserFavorites, addToFavorites, removeFromFavorites } from './services/supabaseUserData';
import { AIChatbox } from './components/AIChatbox';

function App() {
  const [favorites, setFavorites] = useState([]);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          const userFavorites = await getUserFavorites();
          setFavorites(userFavorites);
        } else {
          setFavorites([]);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        setFavorites([]);
      } finally {
        setAuthChecked(true);
      }
    };

    initAuth();

    const { data: { subscription } } = onAuthStateChange(async (event, user) => {
      console.log('Auth state changed:', event, user);
      setUser(user);
      
      if (user) {
        const userFavorites = await getUserFavorites();
        setFavorites(userFavorites);
      } else {
        setFavorites([]);
      }
      
      setAuthChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleToggleFavorite = async (recipeData) => {
    if (!user) return;
    
    try {
      let newFavorites;
      
      const isCurrentlyFavorited = favorites.some(fav => fav.id === recipeData.id);
      console.log('Is currently favorited:', isCurrentlyFavorited);
      
      if (isCurrentlyFavorited) {
        console.log('Removing from favorites...');
        newFavorites = await removeFromFavorites(recipeData.id);
      } else {
        console.log('Adding to favorites...');
        newFavorites = await addToFavorites(recipeData);
      }
      
      console.log('New favorites from Supabase:', newFavorites);
      
      setFavorites(newFavorites);
      console.log("Favorites updated for", user.email, ":", newFavorites);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (!authChecked) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Header user={user} setUser={setUser} /> 
        <Routes>
          <Route 
            path="/" 
            element={<Home onToggleFavorite={handleToggleFavorite} user={user} favorites={favorites} />} 
          />
          <Route 
            path="/favorites" 
            element={<FavoritesPage favorites={favorites} onToggleFavorite={handleToggleFavorite} user={user} />} 
          />
          <Route
            path="/recipe/:recipeId" 
            element={<RecipeDetails onToggleFavorite={handleToggleFavorite} user={user} favorites={favorites} />} 
          />
          <Route 
            path="/login" 
            element={<Login setUser={setUser} />} 
          />
          <Route 
            path="/profile" 
            element={<ProfilePage user={user} setUser={setUser} favorites={favorites} onToggleFavorite={handleToggleFavorite} />} 
          />
        </Routes>
        <AIChatbox />
      </div>
    </Router>
  );
}

export default App;
