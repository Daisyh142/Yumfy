import React from "react";
import { NavLink, useNavigate } from "react-router-dom"; 
import { signOut } from "./services/supabaseAuth";

const Header = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  return (
    <header className="w-100 bg-white border-bottom border-light py-3 sticky-top">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <NavLink className="d-flex align-items-center text-decoration-none" to="/">
              <div className="bg-primary p-2 rounded me-2">
                <i className="bi bi-chef-hat-fill text-white" style={{ fontSize: '24px' }}></i>
              </div>
              <h1 className="h3 fw-bold text-primary mb-0">Yumfy</h1>
            </NavLink>
          </div>
          
          <nav className="d-none d-md-flex align-items-center">
            <NavLink 
              to="/" 
              className="text-dark text-decoration-none me-4 fw-medium"
              style={({ isActive }) => ({ color: isActive ? 'var(--bs-primary)' : '' })}
            >
              Recipes
            </NavLink>
            <NavLink 
              to="/favorites" 
              className="text-dark text-decoration-none me-4 fw-medium"
              style={({ isActive }) => ({ color: isActive ? 'var(--bs-primary)' : '' })}
            >
              My Favorites
            </NavLink>
          </nav>
          
          <div className="d-flex align-items-center">
            <NavLink to="/favorites" className="btn btn-link text-dark p-2 me-2" title="My Favorites">
              <i className="bi bi-heart" style={{ fontSize: '20px' }}></i>
            </NavLink>
            
            {user ? (
              <div className="dropdown">
                <button
                  className="btn btn-link text-dark p-2 dropdown-toggle border-0" 
                  id="navbarDropdown" 
                  type="button"
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                  title={user.name || user.email}
                >
                  <i className="bi bi-person-circle" style={{ fontSize: '20px' }}></i>
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                  <li>
                    <span className="dropdown-item-text">
                      <strong>{user.name || user.email}</strong>
                    </span>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <NavLink className="dropdown-item" to="/profile">
                      <i className="bi bi-person me-2"></i>
                      My Profile
                    </NavLink>
                  </li>
                  <li>
                    <NavLink className="dropdown-item" to="/favorites">
                      <i className="bi bi-heart me-2"></i>
                      My Favorites
                    </NavLink>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <NavLink className="btn btn-link text-dark p-2" to="/login" title="Login">
                <i className="bi bi-person" style={{ fontSize: '20px' }}></i>
              </NavLink>
            )}
            
            <button 
              className="btn btn-link text-dark p-2 d-md-none ms-2" 
              type="button" 
              data-bs-toggle="offcanvas" 
              data-bs-target="#mobileMenu"
              aria-controls="mobileMenu"
            >
              <i className="bi bi-list" style={{ fontSize: '24px' }}></i>
            </button>
          </div>
        </div>
      </div>

      <div className="offcanvas offcanvas-end" tabIndex="-1" id="mobileMenu" aria-labelledby="mobileMenuLabel">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="mobileMenuLabel">Menu</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <nav className="d-flex flex-column">
            <NavLink 
              to="/" 
              className="text-dark text-decoration-none py-2 fw-medium"
              data-bs-dismiss="offcanvas"
            >
              Recipes
            </NavLink>
            <NavLink 
              to="/favorites" 
              className="text-dark text-decoration-none py-2 fw-medium"
              data-bs-dismiss="offcanvas"
            >
              My Favorites
            </NavLink>
            {user && (
              <>
                <hr />
                <NavLink 
                  to="/profile" 
                  className="text-dark text-decoration-none py-2 fw-medium"
                  data-bs-dismiss="offcanvas"
                >
                  <i className="bi bi-person me-2"></i>
                  My Profile
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 