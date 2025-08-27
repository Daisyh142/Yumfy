import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import { getRecipeDetails } from './api';
import { getCurrentUser } from './services/supabaseAuth';
import { addToRecentlyViewed } from './services/supabaseUserData';
const RecipeDetails = ({onToggleFavorite, user, favorites}) => {
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFavorited, setIsFavorited] = useState(false);


    const {recipeId} = useParams();
    const navigate = useNavigate();


    useEffect(() => {
        const fetchRecipeDetails = async () => {
            try {
                setLoading(true);
                const data = await getRecipeDetails(recipeId);
                setRecipe(data);
                
                const currentUser = await getCurrentUser();
                if (currentUser && data) {
                    addToRecentlyViewed({
                        id: data.id,
                        title: data.title,
                        image: data.image
                    }).catch((error) => {
                        console.error('Error tracking recently viewed:', error);
                    });
                }
            } catch (err) {
                console.error("Error fetching recipe details:", err);
                setError("Failed to load recipe details");
            } finally {
                setLoading(false)
            }
        };  


        if (recipeId) {
            fetchRecipeDetails();
        }
    }, [recipeId]);


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


    const formatAmount = (amount) => {
        if (amount == null) return '';
        const rounded = Math.round((Number(amount) + Number.EPSILON) * 100) / 100;
        if (Math.abs(rounded - 0.25) < 0.01) return '1/4';
        if (Math.abs(rounded - 0.5) < 0.01) return '1/2';
        if (Math.abs(rounded - 0.75) < 0.01) return '3/4';
        return String(rounded).replace(/\.00$/, '').replace(/\.0$/, '');
    };

    const formatIngredientLine = (ing) => {
        if (!ing) return '';
        if (ing.original && typeof ing.original === 'string') {
            return normalizeUnits(ing.original.trim());
        }
        const amount = formatAmount(ing.amount);
        const unit = (ing.unit || '').trim();
        const name = (ing.name || ing.nameClean || '').trim();
        return normalizeUnits([amount, unit, name].filter(Boolean).join(' ').trim());
    };

    const stripHtml = (text) => String(text || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const cleanMarketing = (text) => {
        const titleNorm = String(recipe?.title || '')
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        const blacklist = [
            /spoonacular score/i,
            /per serving/i,
            /fans/i,
            /from preparation to the plate/i,
            /this recipe from/i,
            /hor d'oeuvre/i,
            /price per serving/i,
            /similar recipes?/i,
            /are very similar/i,
            /might be a recipe you should try/i,
            /it can be enjoyed any time/i,
            /it is an inexpensive recipe/i
        ];

        const sentences = String(text).split(/(?<=[.!?])\s+/);
        const seen = new Set();
        const filtered = [];

        for (const s of sentences) {
            const sTrim = (s || '').trim();
            if (!sTrim) continue;
            if (blacklist.some((re) => re.test(sTrim))) continue;

            const sNorm = sTrim
                .toLowerCase()
                .replace(/[^\w\s]/g, '')
                .replace(/\s+/g, ' ')
                .trim();

            if (titleNorm) {
                if (sNorm === titleNorm) continue;
                if (sNorm.includes(`${titleNorm} , ${titleNorm}`)) continue;
                if (sNorm.includes(`${titleNorm} and ${titleNorm}`)) continue;
            }

            if (seen.has(sNorm)) continue;
            seen.add(sNorm);
            filtered.push(sTrim);
            if (filtered.length >= 1) break;
        }
        return filtered.join(' ').trim();
    };

    const normalizeUnits = (text) => {
        if (!text) return '';
        let s = String(text);
        s = s.replace(/\b(\d+)\s?T\b/g, '$1 tbsp'); 
        s = s.replace(/\b(\d+)\s?t\b/g, '$1 tsp'); 
        s = s.replace(/\b(\d+)\s?c\b/gi, '$1 cup');
        s = s.replace(/\bpkg\b/gi, 'package');
        s = s.replace(/\blbs\b/gi, 'lb');
        return s;
    };

    const cleanedSummary = recipe && recipe.summary ? cleanMarketing(stripHtml(recipe.summary)) : '';

    return (
        <div className="min-vh-100 bg-white">
            <div className="container-xxl py-3">
                <div className="d-flex align-items-center">
                    <button 
                        onClick={() => {
                            if (window.history.length > 1) {
                                navigate(-1);
                            } else {
                                navigate('/');
                            }
                        }}
                        className="btn btn-outline-primary d-flex align-items-center gap-2"
                    >
                        <i className="bi bi-arrow-left"></i>
                        Back to Recipes
                    </button>
                </div>
            </div>

            <div className="container-xxl mb-5">
                <div className="row g-4">
                    <div className="col-lg-6">
                        <div className="position-relative rounded-3 overflow-hidden shadow-lg">
                            <img
                                src={recipe.image}
                                alt={recipe.title}
                                className="w-100"
                                style={{ height: "400px", objectFit: "cover" }}
                            />
                            <div className="position-absolute top-0 end-0 p-3">
                                <button 
                                    className="btn btn-light rounded-circle p-2 favorite-btn"
                                    onClick={handleToggleFavorite}
                                >
                                    <i className={`bi ${isFavorited ? 'bi-heart-fill text-danger' : 'bi-heart text-muted'}`} style={{fontSize: '20px'}}></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="h-100 d-flex flex-column justify-content-center">
                            <div className="mb-3">
                                {recipe.cuisines && recipe.cuisines.length > 0 && (
                                    <span className="badge bg-secondary mb-2">{recipe.cuisines[0]}</span>
                                )}
                                <h1 className="display-5 fw-bold mb-3">{recipe.title}</h1>
                                {cleanedSummary && (
                                    <p className="text-muted fs-5 mb-4">{cleanedSummary}</p>
                                )}
                            </div>

                            <div className="d-flex align-items-center mb-4">
                                <div className="d-flex align-items-center me-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <i
                                            key={star}
                                            className={`bi ${star <= Math.floor((recipe.spoonacularScore || 80) / 20) ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
                                            style={{fontSize: '20px'}}
                                        ></i>
                                    ))}
                                    <span className="ms-2 fw-semibold">{((recipe.spoonacularScore || 80) / 20).toFixed(1)}</span>
                                </div>
                                <span className="text-muted">({recipe.aggregateLikes || 0} likes)</span>
                            </div>

                            <div className="row g-3">
                                <div className="col-6 col-md-3">
                                    <div className="text-center p-3 bg-light rounded">
                                        <i className="bi bi-clock text-primary mb-2" style={{fontSize: '24px'}}></i>
                                        <div className="small text-muted">Prep Time</div>
                                        <div className="fw-semibold">{recipe.preparationMinutes || 15} min</div>
                                    </div>
                                </div>
                                <div className="col-6 col-md-3">
                                    <div className="text-center p-3 bg-light rounded">
                                        <i className="bi bi-stopwatch text-primary mb-2" style={{fontSize: '24px'}}></i>
                                        <div className="small text-muted">Cook Time</div>
                                        <div className="fw-semibold">{recipe.readyInMinutes} min</div>
                                    </div>
                                </div>
                                <div className="col-6 col-md-3">
                                    <div className="text-center p-3 bg-light rounded">
                                        <i className="bi bi-people text-primary mb-2" style={{fontSize: '24px'}}></i>
                                        <div className="small text-muted">Servings</div>
                                        <div className="fw-semibold">{recipe.servings}</div>
                                    </div>
                                </div>
                                <div className="col-6 col-md-3">
                                    <div className="text-center p-3 bg-light rounded">
                                        <i className="bi bi-award text-primary mb-2" style={{fontSize: '24px'}}></i>
                                        <div className="small text-muted">Health Score</div>
                                        <div className="fw-semibold">{recipe.healthScore}/100</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-xxl">
                <div className="row g-5">
                    <div className="col-lg-4">
                        <div className="card shadow-sm h-100">
                            <div className="card-header bg-primary text-white">
                                <h3 className="card-title mb-0">Ingredients</h3>
                            </div>
                            <div className="card-body">
                                <ul className="list-unstyled mb-0">
                                    {recipe.extendedIngredients?.map((ingredient, index) => (
                                        <li key={index} className="py-2 border-bottom">
                                            <span className="fw-medium">{formatIngredientLine(ingredient)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-8">
                        <div className="card shadow-sm mb-4">
                            <div className="card-header bg-secondary text-white">
                                <h3 className="card-title mb-0">Instructions</h3>
                            </div>
                            <div className="card-body p-0">
                                <div className="list-group list-group-flush">
                                    {recipe.analyzedInstructions?.[0]?.steps && recipe.analyzedInstructions[0].steps.length > 0 ? (
                                        recipe.analyzedInstructions[0].steps.map((step, index) => (
                                            <div key={index} className="list-group-item instruction-step border-0 py-4 px-4">
                                                <div className="d-flex align-items-start">
                                                    <div className="flex-shrink-0 me-3">
                                                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: "32px", height: "32px"}}>
                                                            <span className="fw-bold">{index + 1}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <p className="mb-0 lh-base">{normalizeUnits(step.step)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : recipe.instructions ? (
                                        <div className="list-group-item instruction-step border-0 py-4 px-4">
                                            <div className="d-flex align-items-start">
                                                <div className="flex-shrink-0 me-3">
                                                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: "32px", height: "32px"}}>
                                                        <span className="fw-bold">1</span>
                                                    </div>
                                                </div>
                                                <div className="flex-grow-1">
                                                    <p className="mb-0 lh-base">{normalizeUnits(cleanMarketing(stripHtml(recipe.instructions)))}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : recipe.summary ? (
                                        <div className="list-group-item instruction-step border-0 py-4 px-4">
                                            <div className="d-flex align-items-start">
                                                <div className="flex-shrink-0 me-3">
                                                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: "32px", height: "32px"}}>
                                                        <span className="fw-bold">1</span>
                                                    </div>
                                                </div>
                                                <div className="flex-grow-1">
                                                    <p className="mb-0 lh-base">{normalizeUnits(cleanMarketing(stripHtml(recipe.summary)))}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="list-group-item border-0 py-4 px-4">
                                            <p className="text-muted mb-0">Instructions not available for this recipe</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {recipe.nutrition && (
                            <div className="card shadow-sm">
                                <div className="card-header bg-light">
                                    <h3 className="card-title mb-0 d-flex align-items-center">
                                        <i className="bi bi-info-circle me-2" style={{fontSize: '20px'}}></i>
                                        Nutrition Information
                                    </h3>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        {recipe.nutrition.nutrients?.slice(0, 6).map((nutrient, index) => (
                                            <div key={index} className="col-6 col-md-2">
                                                <div className="text-center">
                                                    <div className="h5 text-primary mb-1">{Math.round(nutrient.amount)}{nutrient.unit}</div>
                                                    <div className="small text-muted">{nutrient.name}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="row mt-5">
                    <div className="col-12">
                        <div className="card shadow-sm">
                            <div className="card-header">
                                <h3 className="card-title mb-0">Recipe Rating</h3>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-4 text-center border-end">
                                        <div className="display-1 text-primary fw-bold">{((recipe.spoonacularScore || 80) / 20).toFixed(1)}</div>
                                        <div className="d-flex justify-content-center mb-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <i
                                                    key={star}
                                                    className={`bi ${star <= Math.floor((recipe.spoonacularScore || 80) / 20) ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
                                                    style={{fontSize: '20px'}}
                                                ></i>
                                            ))}
                                        </div>
                                        <div className="text-muted">Yumfy Score: {recipe.spoonacularScore ? recipe.spoonacularScore.toFixed(2) : 'N/A'}</div>
                                    </div>
                                    <div className="col-md-8">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h5>Recipe Information</h5>
                                        </div>
                                        <div className="mb-3">
                                            <strong>Source:</strong> {recipe.sourceName || 'Spoonacular'}
                                        </div>
                                        {recipe.sourceUrl && (
                                            <div className="mb-3">
                                                <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary">
                                                    View Original Recipe
                                                </a>
                                            </div>
                                        )}
                                        <div className="text-muted">
                                            {recipe.summary && (
                                                <div dangerouslySetInnerHTML={{ __html: recipe.summary }}></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-5"></div>
        </div>
    );
};

export default RecipeDetails;  