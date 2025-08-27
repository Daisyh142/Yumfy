import React from "react";
import RecipeCard from "./RecipeView";

const FavoritesPage = ({ favorites, onToggleFavorite, user }) => {
  return (
    <div className="container py-4">
      <h2 className="h3 fw-bold mb-4">My Favorite Recipes</h2>
      {favorites.length === 0 ? (
        <div className="text-center text-muted py-5">
          <p className="lead">You haven't favorited any recipes yet!</p>
          <p>Click the heart icon on any recipe to add it here.</p>
        </div>
      ) : (
        <div className="row g-3">
          {favorites.map((recipe, idx) => (
            <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2" key={`${recipe.id}-${idx}`}>
              <RecipeCard
                id={recipe.id}
                image={recipe.image}
                title={recipe.title}
                initialRating={recipe.initialRating} 
                initialReviews={recipe.initialReviews} 
                onToggleFavorite={onToggleFavorite} 
                isAuthenticated={!!user}
                initiallyFavorited={true} 
                favorites={favorites}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage; 