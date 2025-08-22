import React, { useState } from 'react';
import { findRecipesByIngredients } from './api';
import PantryRecipeCard from './PantryRecipeCard';

/* This is meant to search for recipes based on the ingredients that the user puts in the search bar
* PantrySearch finds the recipes through PantryRecipeCard which will display the recipes 
*/

const PantrySearch = ({ user, favorites }) => {
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
        console.log("Toggled favorite for:", recipeData);
    };

    return (
      <div className="container mb-5"> 
        <h2 className="text-center mb-3">Use Ingredients You Already Have</h2>

        <form onSubmit={handleSearch}>
            <div className="input-group">
                <input 
                 type="text"
                 className="form-control text-black"
                 placeholder="Enter ingredients (e.g. eggs, chicken, salmon)"
                 value={ingredients}
                 onChange={(e) => setIngredients(e.target.value)}
                />
                <button className="btn btn-primary" type="submit" disabled={loading}>
                 {loading ? "Searching..." : "Find recipes"}
                </button>
            </div>
        </form>

        {/* Error Message */}
        {error && (
            <div className="alert alert-danger text-center mt-3" role="alert">
                {error}
            </div>
        )}

        {/* Loading State */}
        {loading && (
            <div className="text-center py-5">
                <span className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </span>
            </div>
        )}

        {/* Recipe Results */}
        {!loading && recipes.length > 0 && (
            <div className="mt-4">
                <h3 className="mb-3">Found {recipes.length} recipes you can make!</h3>
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {recipes.map((recipe) => (
                        <div className="col" key={recipe.id}>
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

        {/* No Results */}
        {!loading && recipes.length === 0 && ingredients && (
            <div className="text-center py-5 text-muted">
                No recipes found with those ingredients. Try different ingredients or check your spelling.
            </div>
        )}
      </div>
    );
};

export default PantrySearch;