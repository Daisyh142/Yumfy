import React, { useEffect, useState } from "react";
import RecipeCard from "./RecipeView"; 
import { fetchRecipes } from "./api"; 

const CuisineSection = ({ title, subtitle, cuisine, onToggleFavorite, user, favorites }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

  const [offset, setOffset] = useState(0); 
  const [hasMore, setHasMore] = useState(true); 
  const RECIPES_PER_LOAD = 10; 

  useEffect(() => {
    if (!hasMore && offset !== 0) return;

    setLoading(true); 
    setError(null); 

    fetchRecipes({ cuisine, offset, number: RECIPES_PER_LOAD })
      .then(data => {
        const processedRecipes = data.results.map(recipe => ({
          ...recipe,
          image: recipe.image || `https://via.placeholder.com/300x200?text=${recipe.title.split(' ')[0]}`, 
          initialRating: 0, 
          initialReviews: 0, 
        }));
        setRecipes(prevRecipes => [...prevRecipes, ...processedRecipes]);
        setHasMore(processedRecipes.length === RECIPES_PER_LOAD); 
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching recipes:", err);
        setError("Failed to load recipes. Please try again later."); 
        setLoading(false);
      });
  }, [cuisine, offset, hasMore]); 

  const handleLoadMore = () => {
    setOffset(prevOffset => prevOffset + RECIPES_PER_LOAD); 
  };
 
  return (
    <section className="py-4">
      <div className="mb-4">
        <h2 className="h4 fw-bold">{title}</h2>
        {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
      </div>

      {loading && offset === 0 ? (
        <div className="text-center py-5">Loading recipes...</div>
      ) : error ? (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-5 text-muted">No recipes found for this section.</div>
      ) : (
        <div className="d-flex flex-row flex-nowrap overflow-auto pb-3"> 
          {recipes.map((recipe, index) => (
            <div className="flex-shrink-0 me-3" style={{ width: '18rem' }} key={index}>
              <RecipeCard
                id={recipe.id} 
                image={recipe.image}
                title={recipe.title}
                initialRating={recipe.initialRating} 
                initialReviews={recipe.initialReviews} 
                onToggleFavorite={onToggleFavorite}
                isAuthenticated={!!user}
                initiallyFavorited={favorites?.some(fav => fav.id === recipe.id) || false}
                favorites={favorites}
              />
            </div>
          ))}
          {!loading && hasMore && (
            <div className="flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: '10rem' }}>
              <button className="btn btn-outline-primary" onClick={handleLoadMore}>
                Load More
              </button>
            </div>
          )}
          {loading && offset > 0 && (
             <div className="flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: '10rem' }}>
                <span className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading more...</span>
                </span>
             </div>
          )}
        </div>
      )}
    </section>
  );
};

export default CuisineSection;
