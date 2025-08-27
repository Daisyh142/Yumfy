import React, { useState } from 'react';
import { findRecipesByIngredients } from './api';
import PantryRecipeCard from './PantryRecipeCard';
import { ImageWithFallback } from './components/ImageWithFallback';


const PantrySearch = ({ user, favorites, onToggleFavorite }) => {
    const [ingredients, setIngredients] = useState("");
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!ingredients.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const data = await findRecipesByIngredients({
                ingredients: ingredients,
                number: 8
            });
            setRecipes(data);
        } catch (err) {
            console.error("Error fetching recipes:", err);
            setError("Failed to find recipes. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFavorite = (recipeData) => {
        if (onToggleFavorite) {
            onToggleFavorite(recipeData);
        }
    };

    return (
      <section className="position-relative bg-light py-5 overflow-hidden">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="mb-4">
                <div className="d-flex align-items-center text-secondary mb-3">
                  <i className="bi bi-stars me-2" style={{ fontSize: '20px' }}></i>
                  <span className="small fw-medium">Cook smarter, not harder</span>
                </div>
                
                <h1 className="display-4 fw-bold text-dark lh-sm mb-4">
                  Turn Your
                  <span className="text-primary"> Ingredients</span>
                  <br />
                  Into Amazing
                  <span className="text-secondary"> Meals</span>
                </h1>
                
                <p className="fs-5 text-muted mb-5" style={{maxWidth: '28rem'}}>
                  Tell us what's in your kitchen and we'll show you delicious recipes you can make right now.
                </p>
              </div>
              <div className="mb-4">
                <form onSubmit={handleSearch}>
                  <div className="position-relative mb-3">
                    <i className="bi bi-search position-absolute text-muted" style={{left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '20px'}}></i>
                    <input
                      type="text"
                      className="form-control form-control-lg border-2 rounded-3 shadow-sm"
                      placeholder="Enter ingredients (e.g. eggs, chicken, salmon)"
                      value={ingredients}
                      onChange={(e) => setIngredients(e.target.value)}
                      disabled={loading}
                      style={{paddingLeft: '3rem', paddingRight: '6rem'}}
                    />
                    <button 
                      type="submit"
                      className="btn btn-primary position-absolute top-50 end-0 translate-middle-y me-2 rounded-2"
                      disabled={loading}
                      style={{fontSize: '0.9rem'}}
                    >
                      {loading ? "Searching..." : "Find Recipes"}
                    </button>
                  </div>
                </form>
                
                <div className="d-flex flex-wrap align-items-center gap-2">
                  <span className="small text-muted">Popular:</span>
                  {['Chicken', 'Pasta', 'Vegetables', 'Rice'].map((tag) => (
                    <button
                      key={tag}
                      className="btn btn-outline-secondary btn-sm rounded-pill"
                      onClick={() => setIngredients(tag.toLowerCase())}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              {error && (
                  <div className="alert alert-danger" role="alert">
                      {error}
                  </div>
              )}
            </div>
            <div className="col-lg-6">
              <div className="position-relative">
                <div className="rounded-3 overflow-hidden shadow-lg">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1614260025937-b4ecb6eb9165?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMGZyZXNoJTIwaW5ncmVkaWVudHMlMjB2ZWdldGFibGVzJTIwZnJ1aXRzJTIwY29va2luZ3xlbnwxfHx8fDE3NTU4Nzc1OTh8MA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Fresh colorful ingredients"
                    className="w-100"
                    style={{height: '400px', objectFit: 'cover'}}
                  />
                </div>
                <div className="position-absolute bg-white p-3 rounded-3 shadow-lg" style={{top: '-1rem', left: '-1rem'}}>
                  <div className="h4 fw-bold text-primary mb-0">2.5k+</div>
                  <div className="small text-muted">Recipes</div>
                </div>
                
                <div className="position-absolute bg-secondary text-white p-3 rounded-3 shadow-lg" style={{bottom: '-1rem', right: '-1rem'}}>
                  <div className="h4 fw-bold mb-0">4.9★</div>
                  <div className="small opacity-75">Avg Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {loading && (
            <div className="container">
              <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Searching for recipes...</p>
              </div>
            </div>
        )}
        {!loading && recipes.length > 0 && (
            <div className="container mt-5">
                <div className="text-center mb-4">
                  <h2 className="h3 fw-bold">Found {recipes.length} recipes you can make!</h2>
                  <p className="text-muted">Here are some delicious options with your ingredients</p>
                </div>
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {recipes.map((recipe, idx) => (
                        <div className="col" key={`${recipe.id}-${idx}`}>
                            <PantryRecipeCard
                                id={recipe.id}
                                image={recipe.image}
                                title={recipe.title}
                                usedIngredients={recipe.usedIngredients}
                                missingIngredients={recipe.missedIngredients}
                                onToggleFavorite={handleToggleFavorite}
                                user={user}
                                favorites={favorites}
                            />
                        </div>
                    ))}
                </div>
            </div>
        )}
        {!loading && recipes.length === 0 && ingredients && (
            <div className="container">
              <div className="text-center py-5">
                  <i className="bi bi-search" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                  <h4 className="mt-3 text-muted">No recipes found</h4>
                  <p className="text-muted">Try different ingredients or check your spelling.</p>
              </div>
            </div>
        )}
      </section>
    );
};

export default PantrySearch;