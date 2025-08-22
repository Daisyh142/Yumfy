import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addToRecentlyViewed } from "./userDataStorage";
import { getCurrentUser } from "./localAuth";

const PantryRecipeCard = ({id, image, title, usedIngredients, missingIngredients, onToggleFavorite, user, favorites}) => {
    const [isFavorited, setIsFavorited] = useState(false);
    const navigate = useNavigate();

    // Check if recipe is favorited when component mounts or favorites change
    useEffect(() => {
        if (user) {
            const favorited = favorites?.some(fav => fav.id === id) || false;
            setIsFavorited(favorited);
        } else {
            setIsFavorited(false);
        }
    }, [user, id, favorites]);

    const handleToggleFavorite = () => {
        if (!user) {
            navigate('/login', {
                state: { redirectTo: `/recipe/${id}` }
            });
            return;
        }
        
        const newFavoriteStatus = !isFavorited;
        setIsFavorited(newFavoriteStatus);
        if (onToggleFavorite) {
          onToggleFavorite({ 
            id, 
            title, 
            image, 
            initialRating: 0,
            initialReviews: 0,
            isFavorited: newFavoriteStatus 
          });
        }
    };

    return (
        <div className="card h-100 shadow-sm position-relative">
            <img src={image} className="card-img-top" alt={title} style={{ height: "200px", objectFit: "cover" }} />
            
            <div className="card-body d-flex flex-column">
                <h5 className="card-title">{title}</h5>
                
                {/* Used Ingredients */}
                <div className="mb-2">
                    <p className="card-text text-success mb-1">
                        <strong>✓ You have ({usedIngredients?.length || 0}):</strong>
                    </p>
                    <small className="text-muted">
                        {usedIngredients?.map(ingredient => ingredient.name).join(", ") || "None"}
                    </small>
                </div>

                {/* Missing Ingredients */}
                <div className="mb-3">
                    <p className="card-text text-warning mb-1">
                        <strong>⚠ You need ({missingIngredients?.length || 0}):</strong>
                    </p>
                    <small className="text-muted">
                        {missingIngredients?.map(ingredient => ingredient.name).join(", ") || "None"}
                    </small>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto d-flex justify-content-between align-items-center">
                    <button 
                        className={`btn ${isFavorited ? 'btn-danger' : 'btn-outline-danger'}`}
                        onClick={handleToggleFavorite}
                    >
                        <i className={`bi ${isFavorited ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                        {isFavorited ? ' Favorited' : ' Favorite'}
                    </button>
                    
                    <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                            // Track that user viewed this recipe
                            const currentUser = getCurrentUser();
                            if (currentUser) {
                                addToRecentlyViewed(currentUser.email, {
                                    id: id,
                                    title: title,
                                    image: image
                                });
                            }
                            navigate(`/recipe/${id}`);
                        }}
                    >
                        View Recipe
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PantryRecipeCard;