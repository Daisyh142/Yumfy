import React from "react";
import { NavLink, useNavigate } from "react-router-dom"; 
import { signOut } from "./localAuth";

const Header = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    setUser(null);
    navigate('/');
  };
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-navbar-custom py-3 sticky-top">
      <div className="container-fluid">
        {/* Logo */}
        <NavLink className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-chef-hat h4 mb-0 me-2 text-primary"></i>
          <h1 className="h1 mb-0 text-black">Yumfy</h1>
        </NavLink>

        {/* Toggler for mobile */} 
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Links and Search Bar */}
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" activeClassName="active" to="/">Home</NavLink>
            </li>
            {/* You can add more navigation items here, like Cuisines, Popular */}
            <li className="nav-item">
              <NavLink className="nav-link" activeClassName="active" to="/favorites">My Favorites</NavLink>
            </li>
          </ul>
          
          {/* User Authentication */}
          <div className="navbar-nav me-4">
            {user ? (
              <div className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle text-white btn btn-link border-0 p-0" 
                  id="navbarDropdown" 
                  type="button"
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle me-1"></i>
                  {user.name || user.email}
                </button>
                <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                  <li>
                    <NavLink className="dropdown-item" to="/profile">
                      <i className="bi bi-person me-1"></i>
                      My Profile
                    </NavLink>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-1"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <NavLink className="nav-link text-white" to="/login">
                <i className="bi bi-person-circle me-1"></i>
                Login
              </NavLink>
            )}
          </div>
          {/* Search Bar */}
          <form className="d-flex">
            <div className="input-group">
              <span className="input-group-text" id="search-addon"><i className="bi bi-search"></i></span>
              <input 
                type="search" 
                className="form-control text-dark"
                placeholder="Search for recipes..."
                aria-label="Search"
                aria-describedby="search-addon"
              />
              <button className="btn btn-primary" type="submit">
                Search
              </button>
            </div>
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Header; 