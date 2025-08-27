import React, { useEffect, useState } from "react";
import RecipeCard from "./RecipeView"; 
import { fetchRecipes } from "./api";
import { ImageWithFallback } from "./components/ImageWithFallback"; 

const CuisineSection = ({ title, subtitle, cuisine, onToggleFavorite, user, favorites, isShowcase = false }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

  const [offset, setOffset] = useState(0); 
  const [hasMore, setHasMore] = useState(true); 
  const RECIPES_PER_LOAD = 10;

  const showcaseData = {
    "Italian": {
      image: "https://images.unsplash.com/photo-1661661089799-225db8cd9274?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwcGFzdGElMjBmb29kfGVufDF8fHx8MTc1NTg2MDc0MXww&ixlib=rb-4.1.0&q=80&w=1080",
      gradient: "linear-gradient(135deg, rgba(34, 197, 94, 0.8), rgba(239, 68, 68, 0.8))",
      description: "Classic pasta, pizza, and Mediterranean flavors"
    },
    "Asian": {
      image: "https://images.unsplash.com/photo-1614955177711-2540ad25432b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHN0aXIlMjBmcnklMjBmb29kfGVufDF8fHx8MTc1NTg3NzY0MHww&ixlib=rb-4.1.0&q=80&w=1080",
      gradient: "linear-gradient(135deg, rgba(249, 115, 22, 0.8), rgba(251, 191, 36, 0.8))",
      description: "Fresh ingredients, bold flavors, and healthy options"
    },
    "Mexican": {
      image: "https://images.unsplash.com/photo-1640953503824-4ce6db2d2af6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXhpY2FuJTIwdGFjb3MlMjBmb29kfGVufDF8fHx8MTc1NTg2MDY4OXww&ixlib=rb-4.1.0&q=80&w=1080",
      gradient: "linear-gradient(135deg, rgba(220, 38, 127, 0.8), rgba(251, 146, 60, 0.8))",
      description: "Spicy and flavorful with fresh ingredients"
    },
    "Indian": {
      image: "https://images.unsplash.com/photo-1661661089799-225db8cd9274?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwcGFzdGElMjBmb29kfGVufDF8fHx8MTc1NTg2MDc0MXww&ixlib=rb-4.1.0&q=80&w=1080",
      gradient: "linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(236, 72, 153, 0.8))",
      description: "Rich spices and aromatic curries"
    }
  };

  useEffect(() => {
    if (isShowcase) return; 

    const loadRecipes = () => {
      if (!hasMore && offset !== 0) return;

      setLoading(true); 
      setError(null); 

      const fetchParams = { cuisine, offset, number: RECIPES_PER_LOAD };

      fetchRecipes(fetchParams)
        .then(data => {
          const processedRecipes = data.results.map(recipe => ({
            ...recipe,
            image: recipe.image || `https://via.placeholder.com/300x200?text=${recipe.title.split(' ')[0]}`, 
            initialRating: recipe.spoonacularScore ? Math.round(recipe.spoonacularScore / 20) : 4,
            initialReviews: recipe.aggregateLikes ? Math.round(recipe.aggregateLikes * 0.3) : 0, 
          }));
          
          setRecipes(prevRecipes => 
            offset === 0 ? processedRecipes : [...prevRecipes, ...processedRecipes]
          );
          setHasMore(processedRecipes.length === RECIPES_PER_LOAD);
          
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching recipes:", err);
          setError("Failed to load recipes. Please try again later."); 
          setLoading(false);
        });
    };

    loadRecipes();
  }, [cuisine, offset, hasMore, isShowcase]); 

  const handleLoadMore = () => {
    setOffset(prevOffset => prevOffset + RECIPES_PER_LOAD); 
  };
 
  if (isShowcase) {
    const cuisineData = showcaseData[cuisine] || showcaseData["Italian"];
    
    return (
      <div className="col-md-6 col-lg-3">
        <div className="card bg-dark text-white border-0 overflow-hidden h-100" style={{minHeight: '20rem'}}>
          <ImageWithFallback
            src={cuisineData.image}
            alt={title}
            className="card-img"
            style={{height: '100%', objectFit: 'cover'}}
          />
          <div 
            className="card-img-overlay d-flex flex-column justify-content-end"
            style={{background: cuisineData.gradient}}
          >
            <div className="text-center">
              <h5 className="card-title fw-bold fs-4 mb-2">{title}</h5>
              <p className="card-text small opacity-90">{cuisineData.description}</p>
              <button className="btn btn-light btn-sm fw-medium">
                Explore {title}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-4">
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="h3 fw-bold mb-1">{title}</h2>
            {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
          </div>
        </div>
      </div>

      {loading && recipes.length === 0 ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading recipes...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      ) : (
        <div className="row g-3 flex-nowrap overflow-auto pb-3" style={{scrollBehavior: 'smooth'}}>
          {recipes.map((recipe, idx) => (
            <div key={`${recipe.id}-${idx}`} className="col-auto" style={{minWidth: '18rem', maxWidth: '18rem'}}>
              <RecipeCard
                id={recipe.id}
                image={recipe.image}
                title={recipe.title}
                initialRating={recipe.initialRating}
                initialReviews={recipe.initialReviews}
                onToggleFavorite={onToggleFavorite}
                initiallyFavorited={favorites?.some(fav => fav.id === recipe.id) || false}
                isAuthenticated={!!user}
                favorites={favorites}
                disableRatingFetch={true}
              />
            </div>
          ))}
          
          {hasMore && !loading && (
            <div className="col-auto d-flex align-items-center" style={{minWidth: '12rem'}}>
              <button 
                className="btn btn-outline-primary h-100 w-100 d-flex flex-column justify-content-center align-items-center"
                onClick={handleLoadMore}
                style={{minHeight: '200px'}}
              >
                <i className="bi bi-plus-circle mb-2" style={{fontSize: '2rem'}}></i>
                <span>Load More</span>
              </button>
            </div>
          )}
          
          {loading && recipes.length > 0 && (
            <div className="col-auto d-flex align-items-center" style={{minWidth: '12rem'}}>
              <div className="h-100 w-100 d-flex justify-content-center align-items-center" style={{minHeight: '200px'}}>
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading more recipes...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default CuisineSection;