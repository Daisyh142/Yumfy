import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signIn, signUp } from './localAuth';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.redirectTo || '/';
  const [authError, setAuthError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);
    
    try {
      let user;
      if (isSignUp) {
        user = await signUp(email, password, name);
      } else {
        user = await signIn(email, password);
      }
      
      if (setUser) {
        setUser(user);
      }
      
      navigate(redirectTo);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="h4 mb-3">{isSignUp ? 'Sign Up' : 'Login'}</h2>
      <form onSubmit={handleSubmit} className="col-12 col-md-6 col-lg-4">
        {authError && <div className="alert alert-danger">{authError}</div>}
        
        {isSignUp && (
          <div className="mb-3">
            <label className="form-label">Name (optional)</label>
            <input 
              type="text" 
              className="form-control text-dark" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Your name"
            />
          </div>
        )}
        
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input 
            type="email" 
            className="form-control text-dark" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input 
            type="password" 
            className="form-control text-dark" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            minLength="6"
          />
        </div>
        
        <button 
          className="btn btn-primary" 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
        </button>
        
        <div className="mt-3">
          <button 
            type="button" 
            className="btn btn-link p-0" 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setAuthError(null);
            }}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
        
        {!isSignUp && (
          <div className="mt-3">
            <small className="text-muted">
            @ Disclamier: All personal information collected by Yumfy is done so exclusively with your consent. No information is collected automatically. Yumfy does not store any personal information as all the information will be saved on your local drive and you have full control over your own data. 
            </small>
          </div>
        )}
      </form>
    </div>
  );
};

export default Login;


