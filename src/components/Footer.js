import React from "react";

export function Footer() {
  return (
    <footer className="bg-dark text-white py-4">
      <div className="container">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <div className="d-flex align-items-center mb-3 mb-md-0">
            <div className="bg-primary p-2 rounded me-2">
              <i className="bi bi-chef-hat-fill text-white" style={{ fontSize: '20px' }}></i>
            </div>
            <div>
              <h6 className="text-primary mb-0 fw-bold">Yumfy</h6>
              <small className="text-white">Smart Recipe Discovery</small>
            </div>
          </div>
          <div className="text-center text-md-end">
            <p className="text-white small mb-0">
              © 2025 Yumfy. Developed by Daisy Hernandez
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
