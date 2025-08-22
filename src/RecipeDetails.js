import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import { getRecipeDetails } from './api';
import { getCurrentUser } from './localAuth';
import { addToRecentlyViewed } from './userDataStorage';

const RecipeDetails = ({onToggleFavorite, user}) => {
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFavorited, setIsFavorited] = useState(false);

    //Gets the information from the URL and navigation
    const {recipeId} = useParams();
    const navigate = useNavigate();

    //Effect will run when the component loads and when recipeid changes 
    useEffect(() => {
        const fetchRecipeDetails = async () => {
            try {
                setLoading(true);
                const data = await getRecipeDetails(recipeId);
                setRecipe(data);
                
                // Track that user viewed this recipe
                const currentUser = getCurrentUser();
                if (currentUser && data) {
                    addToRecentlyViewed(currentUser.email, {
                        id: data.id,
                        title: data.title,
                        image: data.image
                    });
                }
            } catch (err) {
                console.error("Error fetching recipe details:", err);
                setError("Failed to load recipe details");
            } finally {
                setLoading(false)
            }
        };  

        //Will only run if there is a recipeId and will re-run if the id changes
        if (recipeId) {
            fetchRecipeDetails();
        }
    }, [recipeId]);

    //Handler for when user clicks favorite button
    const handleToggleFavorite = () => {
        if (!user) {
            navigate('/login', {
                state: { redirectTo: `/recipe/${recipeId}` }
            });
            return;
        }
        
        const newFavoriteStatus =!isFavorited;
        setIsFavorited(newFavoriteStatus);
        if(onToggleFavorite) {
            onToggleFavorite({
                id: recipe.id,
                title: recipe.title,
                image: recipe.image,
                isFavorited: newFavoriteStatus
            });
        }
    };

     // If still loading, show spinner
     if (loading) {
        return (
            <div className="container mt-4">
                <div className="text-center py-5">
                    <span className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading recipe...</span>
                    </span>
                </div>
            </div>
        );
    }

    // If error or no recipe, show error message
    if (error || !recipe) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger text-center" role="alert">
                    {error || "Recipe not found"}
                </div>
                <div className="text-center">
                    <button className="btn btn-primary" onClick={() => navigate(-1)}>
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // MAIN RENDER - show the complete recipe details
    return (
        <div className="container mt-4">
            {/* Back Button - goes to previous page */}
            <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left"></i> Back
            </button>

            <div className="row">
                {/* Left Column - Recipe Image */}
                <div className="col-md-6">
                    <img 
                        src={recipe.image} 
                        alt={recipe.title}
                        className="img-fluid rounded shadow"
                    />
                </div>

                {/* Right Column - Recipe Information */}
                <div className="col-md-6">
                    <h1 className="mb-3">{recipe.title}</h1>
                    
                    {/* Recipe Statistics in a grid */}
                    <div className="row mb-3">
                        <div className="col-4">
                            <small className="text-muted">Ready in</small>
                            <div className="fw-bold">{recipe.readyInMinutes} min</div>
                        </div>
                        <div className="col-4">
                            <small className="text-muted">Servings</small>
                            <div className="fw-bold">{recipe.servings}</div>
                        </div>
                        <div className="col-4">
                            <small className="text-muted">Health Score</small>
                            <div className="fw-bold">{recipe.healthScore}/100</div>
                        </div>
                    </div>

                    {/* Favorite Button */}
                    <div className="mb-4">
                        <button 
                            className={`btn ${isFavorited ? 'btn-danger' : 'btn-outline-danger'} me-2`}
                            onClick={handleToggleFavorite}
                        >
                            <i className={`bi ${isFavorited ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                            {isFavorited ? ' Remove from Favorites' : ' Add to Favorites'}
                        </button>
                    </div>

                    {/* Recipe Summary (HTML content from API) */}
                    {recipe.summary && (
                        <div className="mb-4">
                            <h5>About This Recipe</h5>
                            <div 
                                className="text-muted"
                                dangerouslySetInnerHTML={{ __html: recipe.summary }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Section - Ingredients and Instructions */}
            <div className="row mt-5">
                {/* Left Column - Ingredients List */}
                <div className="col-md-6">
                    <h3>Ingredients</h3>
                    <ul className="list-group list-group-flush">
                        {recipe.extendedIngredients?.map((ingredient, index) => (
                            <li key={index} className="list-group-item">
                                <strong>{ingredient.amount} {ingredient.unit}</strong> {ingredient.name}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Right Column - Instructions */}
                <div className="col-md-6">
                    <h3>Instructions</h3>
                    {recipe.analyzedInstructions?.[0]?.steps ? (
                        <ol className="list-group list-group-numbered">
                            {recipe.analyzedInstructions[0].steps.map((step, index) => (
                                <li key={index} className="list-group-item">
                                    {step.step}
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <div className="alert alert-info">
                            Instructions not available for this recipe.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecipeDetails;  