import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "./localAuth";
import { getRecipeRating, setRecipeRating, addToRecentlyViewed } from "./userDataStorage";

const RecipeView = ({ image, title, initialRating = 0, initialReviews = 0, id, onToggleFavorite, persistFavorite, initiallyFavorited = false, isAuthenticated = false, favorites }) => {
  const [isFavorited, setIsFavorited] = useState(initiallyFavorited); 
  const [userRating, setUserRating] = useState(initialRating); 
  const [hoverRating, setHoverRating] = useState(0); 
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  // Handler for when user clicks favorite button and if user wants to favorite an item they will need to login
  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate(`/login`, {
        state: {redirectTo: `/recipe/${id}`}
      });
      return;
    }

    if (isSaving) return; 
    const newFavoriteStatus = !isFavorited;
    setIsFavorited(newFavoriteStatus);
    setIsSaving(true);
    
    try {
      // Call the App's favorite handler with the correct data structure
      if (onToggleFavorite) {
        onToggleFavorite({
          id: id,
          title: title,
          image: image,
          initialRating: initialRating,
          initialReviews: initialReviews,
          isFavorited: newFavoriteStatus
        });
      }
      
      // Also call persistFavorite if provided (for backward compatibility)
      if (persistFavorite){
        await persistFavorite({recipeId: id, title, image, isFavorited: newFavoriteStatus})
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setIsFavorited(!newFavoriteStatus);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    // Check if recipe is favorited based on favorites prop
    if (initiallyFavorited) {
      setIsFavorited(true);
    } else if (favorites) {
      const favorited = favorites.some(fav => fav.id === id);
      setIsFavorited(favorited);
    } else {
      setIsFavorited(false);
    }

    // Load user's saved rating for this recipe
    const user = getCurrentUser();
    if (user) {
      const savedRating = getRecipeRating(user.email, id);
      setUserRating(savedRating);
    }
  }, [initiallyFavorited, id, favorites]);


  return (
    <div className="card h-100 shadow-sm position-relative">
      <img src={image} alt={title} className="card-img-top" style={{ objectFit: "cover", height: "180px" }} />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{title}</h5>
        
        <div className="mb-2 d-flex align-items-center">
          {[1, 2, 3, 4, 5].map((starValue) => (
            <i 
              key={starValue}
              className={
                `bi bi-star${(starValue <= userRating || starValue <= hoverRating) ? '-fill' : ''} text-warning me-1`
              }
              onMouseEnter={() => setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(0)} 
              onClick={() => {
                const newRating = userRating === starValue ? 0 : starValue;
                setUserRating(newRating);
                // Save rating to localStorage
                const user = getCurrentUser();
                if (user) {
                  setRecipeRating(user.email, id, newRating, title, image);
                }
              }}
              style={{ cursor: 'pointer' }}
              title="Click to rate, Click to reset" 
            ></i>
          ))}
          <span className="ms-2 text-muted">
            {userRating > 0 ? `${userRating}/5` : `${initialRating}/5`}
            {initialReviews > 0 && ` (${initialReviews} reviews)`}
          </span>
        </div>

        <button 
          className="btn btn-outline-primary mt-auto"
          onClick={() => {
            // Track that user viewed this recipe
            const user = getCurrentUser();
            if (user) {
              addToRecentlyViewed(user.email, {
                id: id,
                title: title,
                image: image
              });
            }
            navigate(`/recipe/${id}`);
          }}
        >
          <i className="bi bi-eye"></i> View Recipe
        </button>
        
        <button
          className="btn btn-light position-absolute top-0 end-0 m-2 p-1 border-0"
          onClick={handleToggleFavorite}
          disabled={isSaving}
          aria-pressed={isFavorited}
          aria-busy={isSaving}
          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          title={isSaving ? "Saving..." : isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          <i className={isFavorited ? "bi bi-heart-fill text-danger" : "bi bi-heart"}></i>
          <span className="visually-hidden">
            {isFavorited ? "Remove from favorites" : "Add to favorites"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default RecipeView;
