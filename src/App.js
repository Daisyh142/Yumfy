import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './home';
import FavoritesPage from './FavoritesPage'; 
import Header from './Header'; 
import RecipeDetails from './RecipeDetails';
import Login from './Login';
import ProfilePage from './ProfilePage';
import { getCurrentUser } from './localAuth';
import { getUserFavorites, addToFavorites, removeFromFavorites } from './userDataStorage';

function App() {
  const [favorites, setFavorites] = useState([]);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Check authentication status and load favorites on app load
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    // Load favorites for the current user
    if (currentUser) {
      const userFavorites = getUserFavorites(currentUser.email);
      setFavorites(userFavorites);
    } else {
      setFavorites([]);
    }
    
    setAuthChecked(true);
  }, []);

  // Update favorites when user changes (login/logout)
  useEffect(() => {
    if (user) {
      const userFavorites = getUserFavorites(user.email);
      setFavorites(userFavorites);
    } else {
      setFavorites([]);
    }
  }, [user]); 

  const handleToggleFavorite = (recipeData) => {
    if (!user) return; // Should not happen due to auth checks, but safety first
    
    let newFavorites;
    
    if (recipeData.isFavorited) {
      // Add to favorites
      newFavorites = addToFavorites(user.email, recipeData);
    } else {
      // Remove from favorites  
      newFavorites = removeFromFavorites(user.email, recipeData.id);
    }
    
    // Update React state to reflect the change immediately
    setFavorites(newFavorites);
    console.log("Favorites updated for", user.email, ":", newFavorites);
  };

  // Show loading until auth is checked
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
            element={<RecipeDetails onToggleFavorite={handleToggleFavorite} user={user} />} 
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
      </div>
    </Router>
  );
}

export default App;
