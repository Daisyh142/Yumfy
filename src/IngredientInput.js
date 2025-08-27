import React, { useState } from "react";

export function IngredientInput({ onIngredientsChange }) {
  const [ingredients, setIngredients] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const addIngredient = () => {
    if (inputValue.trim() && !ingredients.includes(inputValue.trim())) {
      const newIngredients = [...ingredients, inputValue.trim()];
      setIngredients(newIngredients);
      setInputValue("");
      if (onIngredientsChange) {
        onIngredientsChange(newIngredients);
      }
    }
  };

  const removeIngredient = (ingredient) => {
    const newIngredients = ingredients.filter(item => item !== ingredient);
    setIngredients(newIngredients);
    if (onIngredientsChange) {
      onIngredientsChange(newIngredients);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addIngredient();
    }
  };

  const handleQuickAdd = (ingredient) => {
    if (!ingredients.includes(ingredient)) {
      const newIngredients = [...ingredients, ingredient];
      setIngredients(newIngredients);
      if (onIngredientsChange) {
        onIngredientsChange(newIngredients);
      }
    }
  };

  const commonIngredients = [
    'Chicken', 'Beef', 'Rice', 'Pasta', 'Tomatoes', 'Onions', 
    'Garlic', 'Cheese', 'Eggs', 'Milk', 'Bread', 'Potatoes'
  ];

  return (
    <section className="py-5 bg-white">
      <div className="container" style={{maxWidth: '56rem'}}>
        <div className="text-center mb-5">
          <div className="d-flex justify-content-center mb-3">
            <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
              <i className="bi bi-refrigerator" style={{ fontSize: '32px', color: 'var(--bs-primary)' }}></i>
            </div>
          </div>
          <h2 className="display-6 fw-bold mb-3">What's in Your Kitchen?</h2>
          <p className="fs-5 text-muted mx-auto" style={{maxWidth: '32rem'}}>
            Add the ingredients you have available, and we'll suggest delicious recipes you can make right now.
          </p>
        </div>

        <div className="card shadow-lg border-0">
          <div className="card-body p-4 p-md-5">
            <div className="row g-2 mb-4">
              <div className="col">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add an ingredient (e.g., chicken, tomatoes, rice...)"
                />
              </div>
              <div className="col-auto">
                <button 
                  className="btn btn-primary btn-lg px-4" 
                  onClick={addIngredient}
                >
                  <i className="bi bi-plus me-2" style={{ fontSize: '16px' }}></i>
                  Add
                </button>
              </div>
            </div>

            <div className="mb-4">
              <p className="small text-muted mb-3">Quick add:</p>
              <div className="d-flex flex-wrap gap-2">
                {commonIngredients.map((ingredient) => (
                  <button
                    key={ingredient}
                    className={`btn btn-sm rounded-pill ${
                      ingredients.includes(ingredient) 
                        ? 'btn-outline-secondary disabled' 
                        : 'btn-outline-primary'
                    }`}
                    onClick={() => handleQuickAdd(ingredient)}
                    disabled={ingredients.includes(ingredient)}
                  >
                    {ingredient}
                  </button>
                ))}
              </div>
            </div>

            {ingredients.length > 0 && (
              <div>
                <p className="fw-medium text-dark mb-3">
                  Your ingredients ({ingredients.length}):
                </p>
                <div className="d-flex flex-wrap gap-2 mb-4">
                  {ingredients.map((ingredient) => (
                    <span
                      key={ingredient}
                      className="badge bg-primary fs-6 py-2 px-3 d-flex align-items-center gap-2"
                    >
                      {ingredient}
                      <button
                        onClick={() => removeIngredient(ingredient)}
                        className="btn-close btn-close-white"
                        style={{fontSize: '0.75rem'}}
                        aria-label="Remove ingredient"
                      />
                    </span>
                  ))}
                </div>
                <button 
                  className="btn btn-secondary btn-lg w-100"
                  onClick={() => {
                    console.log('Find recipes with:', ingredients);
                  }}
                >
                  Find Recipes with These Ingredients ({ingredients.length})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
