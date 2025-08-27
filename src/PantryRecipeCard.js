import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addToRecentlyViewed } from "./services/supabaseUserData";
import { getCurrentUser } from "./services/supabaseAuth";


const PantryRecipeCard = ({id, image, title, usedIngredients, missingIngredients, onToggleFavorite, user, favorites}) => {
    const [isFavorited, setIsFavorited] = useState(false);
    const navigate = useNavigate();

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
                <div className="mb-2">
                    <p className="card-text text-success mb-1">
                        <strong>✓ You have ({usedIngredients?.length || 0}):</strong>
                    </p>
                    <small className="text-muted">
                        {usedIngredients?.map(ingredient => ingredient.name).join(", ") || "None"}
                    </small>
                </div>
                <div className="mb-3">
                    <p className="card-text text-warning mb-1">
                        <strong>⚠ You need ({missingIngredients?.length || 0}):</strong>
                    </p>
                    <small className="text-muted">
                        {missingIngredients?.map(ingredient => ingredient.name).join(", ") || "None"}
                    </small>
                </div>
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
                        onClick={async () => {
                            try {
                                const currentUser = await getCurrentUser();
                                if (currentUser) {
                                    addToRecentlyViewed({ id, title, image }).catch(() => {});
                                }
                            } catch (_) {}
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