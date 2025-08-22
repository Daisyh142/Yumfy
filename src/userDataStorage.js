// Unified localStorage-based user data management
// Stores all user data (favorites, ratings, preferences) in one place per user

const USER_DATA_PREFIX = 'yumfy_user_data_';

// Get all user data for a specific user
export function getUserData(userEmail) {
  if (!userEmail) return getDefaultUserData();
  
  try {
    const key = USER_DATA_PREFIX + userEmail;
    const stored = localStorage.getItem(key);
    const userData = stored ? JSON.parse(stored) : getDefaultUserData();
    
    // Ensure all required properties exist (for backward compatibility)
    return {
      ...getDefaultUserData(),
      ...userData
    };
  } catch (error) {
    console.error('Error loading user data:', error);
    return getDefaultUserData();
  }
}

// Default user data structure
function getDefaultUserData() {
  return {
    favorites: [],
    ratings: {},
    recentlyViewed: [],
    preferences: {
      theme: 'light',
      emailNotifications: true
    },
    profile: {
      bio: '',
      favoritesCuisines: []
    }
  };
}

// Save all user data for a specific user
export function saveUserData(userEmail, userData) {
  if (!userEmail) return;
  
  try {
    const key = USER_DATA_PREFIX + userEmail;
    localStorage.setItem(key, JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

// FAVORITES FUNCTIONS
export function getUserFavorites(userEmail) {
  const userData = getUserData(userEmail);
  return userData.favorites;
}

export function addToFavorites(userEmail, recipe) {
  const userData = getUserData(userEmail);
  
  // Check if recipe is already favorited
  if (!userData.favorites.some(fav => fav.id === recipe.id)) {
    const newFavorite = {
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      dateAdded: new Date().toISOString(),
      initialRating: recipe.initialRating || 0,
      initialReviews: recipe.initialReviews || 0
    };
    
    userData.favorites.push(newFavorite);
    saveUserData(userEmail, userData);
  }
  
  return userData.favorites;
}

export function removeFromFavorites(userEmail, recipeId) {
  const userData = getUserData(userEmail);
  userData.favorites = userData.favorites.filter(fav => fav.id !== recipeId);
  saveUserData(userEmail, userData);
  return userData.favorites;
}

export function isRecipeFavorited(userEmail, recipeId) {
  if (!userEmail || !recipeId) return false;
  const userData = getUserData(userEmail);
  return userData.favorites.some(fav => fav.id === recipeId);
}

export function clearUserFavorites(userEmail) {
  const userData = getUserData(userEmail);
  userData.favorites = [];
  saveUserData(userEmail, userData);
}

// RATINGS FUNCTIONS
export function getUserRatings(userEmail) {
  const userData = getUserData(userEmail);
  return userData.ratings;
}

export function setRecipeRating(userEmail, recipeId, rating, recipeTitle = '', recipeImage = '') {
  if (!userEmail || !recipeId) return;
  
  const userData = getUserData(userEmail);
  
  if (rating === 0) {
    // Remove rating if set to 0
    delete userData.ratings[recipeId];
  } else {
    // Save rating with metadata
    userData.ratings[recipeId] = {
      rating: rating,
      title: recipeTitle,
      image: recipeImage,
      dateRated: new Date().toISOString()
    };
  }
  
  saveUserData(userEmail, userData);
  return userData.ratings;
}

export function getRecipeRating(userEmail, recipeId) {
  if (!userEmail || !recipeId) return 0;
  const userData = getUserData(userEmail);
  return userData.ratings[recipeId]?.rating || 0;
}

export function getRatedRecipes(userEmail) {
  if (!userEmail) return [];
  
  const userData = getUserData(userEmail);
  return Object.entries(userData.ratings).map(([recipeId, data]) => ({
    id: parseInt(recipeId),
    rating: data.rating,
    title: data.title,
    image: data.image,
    dateRated: data.dateRated
  })).sort((a, b) => new Date(b.dateRated) - new Date(a.dateRated)); // Most recent first
}

export function clearUserRatings(userEmail) {
  const userData = getUserData(userEmail);
  userData.ratings = {};
  saveUserData(userEmail, userData);
}

// PREFERENCES FUNCTIONS (for future use)
export function getUserPreferences(userEmail) {
  const userData = getUserData(userEmail);
  return userData.preferences;
}

export function updateUserPreferences(userEmail, preferences) {
  const userData = getUserData(userEmail);
  userData.preferences = { ...userData.preferences, ...preferences };
  saveUserData(userEmail, userData);
  return userData.preferences;
}

// PROFILE FUNCTIONS (for future use)
export function getUserProfile(userEmail) {
  const userData = getUserData(userEmail);
  return userData.profile;
}

export function updateUserProfile(userEmail, profile) {
  const userData = getUserData(userEmail);
  userData.profile = { ...userData.profile, ...profile };
  saveUserData(userEmail, userData);
  return userData.profile;
}

// UTILITY FUNCTIONS
export function clearAllUserData(userEmail) {
  if (!userEmail) return;
  
  try {
    const key = USER_DATA_PREFIX + userEmail;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
}

export function exportUserData(userEmail) {
  return getUserData(userEmail);
}

export function importUserData(userEmail, userData) {
  const validatedData = {
    ...getDefaultUserData(),
    ...userData
  };
  saveUserData(userEmail, validatedData);
}

// RECENTLY VIEWED FUNCTIONS
export function addToRecentlyViewed(userEmail, recipe) {
  if (!userEmail || !recipe.id) return;
  
  const userData = getUserData(userEmail);
  const viewedRecipe = {
    id: recipe.id,
    title: recipe.title,
    image: recipe.image,
    dateViewed: new Date().toISOString()
  };
  
  // Remove if already exists to avoid duplicates
  userData.recentlyViewed = userData.recentlyViewed.filter(item => item.id !== recipe.id);
  
  // Add to beginning of array
  userData.recentlyViewed.unshift(viewedRecipe);
  
  // Keep only last 10 viewed recipes
  userData.recentlyViewed = userData.recentlyViewed.slice(0, 10);
  
  saveUserData(userEmail, userData);
  return userData.recentlyViewed;
}

export function getRecentlyViewed(userEmail) {
  if (!userEmail) return [];
  
  const userData = getUserData(userEmail);
  return userData.recentlyViewed;
}

export function clearRecentlyViewed(userEmail) {
  const userData = getUserData(userEmail);
  userData.recentlyViewed = [];
  saveUserData(userEmail, userData);
}
