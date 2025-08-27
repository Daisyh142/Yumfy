import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "./services/supabaseAuth";
import { getRecipeRating, setRecipeRating, addToRecentlyViewed } from "./services/supabaseUserData";


const RecipeView = ({ image, title, initialRating = 0, initialReviews = 0, id, onToggleFavorite, persistFavorite, initiallyFavorited = false, isAuthenticated = false, favorites, disableRatingFetch = false }) => {
  const [isFavorited, setIsFavorited] = useState(initiallyFavorited); 
  const [userRating, setUserRating] = useState(initialRating); 
  const [hoverRating, setHoverRating] = useState(0); 
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingRating, setIsSavingRating] = useState(false);
  const saveTimerRef = useRef(null);
  const latestRatingRef = useRef(userRating);


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
    if (initiallyFavorited) {
      setIsFavorited(true);
    } else if (favorites) {
      const favorited = favorites.some(fav => fav.id === id);
      setIsFavorited(favorited);
    } else {
      setIsFavorited(false);
    }

    if (!disableRatingFetch) {
      const loadUserRating = async () => {
        const user = await getCurrentUser();
        if (user) {
          const savedRating = await getRecipeRating(id);
          setUserRating(savedRating);
        }
      };
      loadUserRating();
    }
  }, [initiallyFavorited, id, favorites, disableRatingFetch]);


  return (
    <div className="card h-100 shadow-sm position-relative">
      <img src={image} alt={title} className="card-img-top" style={{ objectFit: "cover", height: "180px" }} loading="lazy" />
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
              onClick={async () => {
                const newRating = userRating === starValue ? 0 : starValue;
                setUserRating(newRating);
                latestRatingRef.current = newRating;
                if (saveTimerRef.current) {
                  clearTimeout(saveTimerRef.current);
                }
                saveTimerRef.current = setTimeout(async () => {
                  setIsSavingRating(true);
                  const user = await getCurrentUser();
                  if (user) {
                    try {
                      await setRecipeRating(id, latestRatingRef.current, title, image);
                    } catch (e) {
                      console.error('Save rating failed:', e?.message || e);
                      setUserRating(userRating);
                      latestRatingRef.current = userRating;
                      alert('Failed to save rating. Please try again.');
                    }
                  }
                  setIsSavingRating(false);
                }, 800);
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
          onClick={async () => {
            try {
              const user = await getCurrentUser();
              if (user) {
                addToRecentlyViewed({ id, title, image }).catch((err) => {
                  console.error('Error tracking recently viewed:', err);
                });
              }
            } catch (e) {

            } finally {
              navigate(`/recipe/${id}`);
            }
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
