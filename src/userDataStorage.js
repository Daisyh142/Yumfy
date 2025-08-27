
const USER_DATA_PREFIX = 'yumfy_user_data_';

export function getUserData(userEmail) {
  if (!userEmail) return getDefaultUserData();
  
  try {
    const key = USER_DATA_PREFIX + userEmail;
    const stored = localStorage.getItem(key);
    const userData = stored ? JSON.parse(stored) : getDefaultUserData();
    
    return {
      ...getDefaultUserData(),
      ...userData
    };
  } catch (error) {
    console.error('Error loading user data:', error);
    return getDefaultUserData();
  }
}

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

export function saveUserData(userEmail, userData) {
  if (!userEmail) return;
  
  try {
    const key = USER_DATA_PREFIX + userEmail;
    localStorage.setItem(key, JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

export function getUserFavorites(userEmail) {
  const userData = getUserData(userEmail);
  return userData.favorites;
}

export function addToFavorites(userEmail, recipe) {
  const userData = getUserData(userEmail);
  
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

export function getUserRatings(userEmail) {
  const userData = getUserData(userEmail);
  return userData.ratings;
}

export function setRecipeRating(userEmail, recipeId, rating, recipeTitle = '', recipeImage = '') {
  if (!userEmail || !recipeId) return;
  
  const userData = getUserData(userEmail);
  
  if (rating === 0) {
    delete userData.ratings[recipeId];
  } else {
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
  })).sort((a, b) => new Date(b.dateRated) - new Date(a.dateRated)); 
}

export function clearUserRatings(userEmail) {
  const userData = getUserData(userEmail);
  userData.ratings = {};
  saveUserData(userEmail, userData);
}

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

export function addToRecentlyViewed(userEmail, recipe) {
  if (!userEmail || !recipe.id) return;
  
  const userData = getUserData(userEmail);
  const viewedRecipe = {
    id: recipe.id,
    title: recipe.title,
    image: recipe.image,
    dateViewed: new Date().toISOString()
  };
  
  userData.recentlyViewed = userData.recentlyViewed.filter(item => item.id !== recipe.id);
  
  userData.recentlyViewed.unshift(viewedRecipe);
  
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
