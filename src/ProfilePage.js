import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from './services/supabaseAuth';
import { getUserRatings, clearAllUserData, getRecentlyViewed } from './services/supabaseUserData';
import RecipeCard from './RecipeView';


const ProfilePage = ({ user, setUser, favorites, onToggleFavorite }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [ratedRecipes, setRatedRecipes] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setEditForm({
      name: user.name || '',
      email: user.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    const loadUserData = async () => {
      const ratings = await getUserRatings();
      const viewed = await getRecentlyViewed();
      setRatedRecipes(ratings);
      setRecentlyViewed(viewed);
    };
    loadUserData();
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleClearFavorites = async () => {
    if (window.confirm('Are you sure you want to clear all your favorites? This cannot be undone.')) {
      try {
        await clearAllUserData(); 
        showMessage('success', 'All favorites cleared successfully!');
      } catch (error) {
        console.error('Error clearing favorites:', error);
        showMessage('error', 'Failed to clear favorites');
      }
    }
  };

  const handleClearRatings = async () => {
    if (window.confirm('Are you sure you want to clear all your ratings? This cannot be undone.')) {
      try {
        await clearAllUserData(); 
        setRatedRecipes([]);
        showMessage('success', 'All ratings cleared successfully!');
      } catch (error) {
        console.error('Error clearing ratings:', error);
        showMessage('error', 'Failed to clear ratings');
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This will permanently delete all your data and cannot be undone.')) {
      if (window.confirm('This is your final warning. Your account and all data will be permanently deleted. Are you absolutely sure?')) {
        try {
          await clearAllUserData();
          
          await signOut();
          setUser(null);
          showMessage('info', 'Account deleted successfully');
          navigate('/');
        } catch (error) {
          console.error('Error deleting user data:', error);
          showMessage('error', 'Failed to delete account');
        }
      }
    }
  };

  if (!user) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="card">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-person-circle" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
              </div>
              <h5 className="card-title">{user.name || user.email}</h5>
              <p className="card-text text-muted">{user.email}</p>
              <button 
                className="btn btn-outline-primary btn-sm me-2"
                onClick={() => setShowEditProfile(!showEditProfile)}
              >
                <i className="bi bi-pencil"></i> Edit Profile
              </button>
              <button 
                className="btn btn-outline-danger btn-sm"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right"></i> Logout
              </button>
            </div>
          </div>
          <div className="card mt-3">
            <div className="card-body">
              <h6 className="card-title">Your Activity</h6>
              <div className="d-flex justify-content-between mb-2">
                <span>Favorites:</span>
                <span className="badge bg-primary">{favorites?.length || 0}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Ratings:</span>
                <span className="badge bg-success">{ratedRecipes.length}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Recently Viewed:</span>
                <span className="badge bg-info">{recentlyViewed.length}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-9">
          {message.text && (
            <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
              {message.text}
              <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
            </div>
          )}
          {showEditProfile && (
            <div className="card mb-4">
              <div className="card-header">
                <h5>Edit Profile</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input 
                        type="text" 
                        className="form-control"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input 
                        type="email" 
                        className="form-control"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                
                <hr />
                <h6>Change Password</h6>
                <div className="row">
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Current Password</label>
                      <input 
                        type="password" 
                        className="form-control"
                        value={editForm.currentPassword}
                        onChange={(e) => setEditForm({...editForm, currentPassword: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">New Password</label>
                      <input 
                        type="password" 
                        className="form-control"
                        value={editForm.newPassword}
                        onChange={(e) => setEditForm({...editForm, newPassword: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Confirm New Password</label>
                      <input 
                        type="password" 
                        className="form-control"
                        value={editForm.confirmPassword}
                        onChange={(e) => setEditForm({...editForm, confirmPassword: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-between">
                  <div>
                    <button className="btn btn-primary me-2" onClick={() => showMessage('info', 'Profile update functionality coming soon!')}>
                      Save Changes
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowEditProfile(false)}>
                      Cancel
                    </button>
                  </div>
                  <button className="btn btn-danger" onClick={handleDeleteAccount}>
                    <i className="bi bi-trash"></i> Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
          <ul className="nav nav-tabs mb-3">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <i className="bi bi-grid"></i> Overview
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'favorites' ? 'active' : ''}`}
                onClick={() => setActiveTab('favorites')}
              >
                <i className="bi bi-heart"></i> Favorites ({favorites?.length || 0})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'ratings' ? 'active' : ''}`}
                onClick={() => setActiveTab('ratings')}
              >
                <i className="bi bi-star"></i> Ratings ({ratedRecipes.length})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <i className="bi bi-gear"></i> Settings
              </button>
            </li>
          </ul>
          <div className="tab-content">
            {activeTab === 'overview' && (
              <div>
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">
                      <i className="bi bi-clock-history text-info me-2"></i>
                      Recently Viewed Recipes
                    </h5>

                    {recentlyViewed.length > 0 ? (
                      <div>
                        <div className="row">
                          {recentlyViewed.slice(0, 8).map((recipe, idx) => (
                            <div key={`${recipe.id}-${recipe.dateViewed || idx}`} className="col-12 mb-3">
                              <div className="d-flex align-items-center p-2 border rounded">
                                <img 
                                  src={recipe.image} 
                                  alt={recipe.title}
                                  className="rounded me-3"
                                  style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                />
                                <div className="flex-grow-1 me-3">
                                  <div className="fw-medium">{recipe.title}</div>
                                  <small className="text-muted">
                                    {(() => { const d = new Date(recipe.dateViewed); return isNaN(d.getTime()) ? '-' : d.toLocaleDateString(); })()}
                                  </small>
                                </div>
                                <button 
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => navigate(`/recipe/${recipe.id}`)}
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        {recentlyViewed.length > 8 && (
                          <div className="text-center mt-3">
                            <small className="text-muted">
                              And {recentlyViewed.length - 8} more recently viewed recipes
                            </small>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <i className="bi bi-clock-history" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                        <h5 className="mt-3">No recipes viewed yet</h5>
                        <p className="text-muted">Start exploring recipes to see your viewing history here!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4>Your Favorite Recipes</h4>
                  {favorites && favorites.length > 0 && (
                    <button className="btn btn-outline-danger btn-sm" onClick={handleClearFavorites}>
                      <i className="bi bi-trash"></i> Clear All Favorites
                    </button>
                  )}
                </div>
                {favorites && favorites.length > 0 ? (
                  <div className="row g-3">
                    {favorites.map((recipe) => (
                      <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={recipe.id}>
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
                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-heart" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                    <h5 className="mt-3">No favorites yet</h5>
                    <p className="text-muted">Start exploring recipes and click the heart icon to add them here!</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'ratings' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4>Your Recipe Ratings</h4>
                  {ratedRecipes.length > 0 && (
                    <button className="btn btn-outline-danger btn-sm" onClick={handleClearRatings}>
                      <i className="bi bi-trash"></i> Clear All Ratings
                    </button>
                  )}
                </div>
                {ratedRecipes.length > 0 ? (
                  <div className="row">
                    {ratedRecipes.map((recipe, idx) => (
                      <div className="col-12 col-md-6 col-lg-4 mb-3" key={`${recipe.id}-${recipe.dateRated || idx}`}>
                        <div className="card">
                          <img 
                            src={recipe.image} 
                            alt={recipe.title}
                            className="card-img-top"
                            style={{ height: '150px', objectFit: 'cover' }}
                          />
                          <div className="card-body">
                            <h6 className="card-title">{recipe.title}</h6>
                            <div className="d-flex align-items-center justify-content-between">
                              <div>
                                {[...Array(5)].map((_, i) => (
                                  <i 
                                    key={i} 
                                    className={`bi bi-star${i < recipe.rating ? '-fill' : ''} text-warning`}
                                  ></i>
                                ))}
                                <span className="ms-2 text-muted">{recipe.rating}/5</span>
                              </div>
                              <button 
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => navigate(`/recipe/${recipe.id}`)}
                              >
                                View
                              </button>
                            </div>
                            <small className="text-muted">
                              Rated on {new Date(recipe.dateRated).toLocaleDateString()}
                            </small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-star" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                    <h5 className="mt-3">No ratings yet</h5>
                    <p className="text-muted">Start rating recipes by clicking on the stars!</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div>
                <h4>Account Settings</h4>
                <div className="row">
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">Data Management</h5>
                        <p className="card-text text-muted">Manage your personal data and account preferences.</p>
                        <button className="btn btn-outline-warning me-2" onClick={handleClearFavorites}>
                          Clear Favorites
                        </button>
                        <button className="btn btn-outline-warning" onClick={handleClearRatings}>
                          Clear Ratings
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-danger">
                      <div className="card-body">
                        <h5 className="card-title text-danger">Danger Zone</h5>
                        <p className="card-text text-muted">Permanently delete your account and all associated data.</p>
                        <button className="btn btn-danger" onClick={handleDeleteAccount}>
                          <i className="bi bi-trash"></i> Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
