import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminAccessButton from '../components/AdminAccessButton';
import '../styles/HomePage.css';

function HomePage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const particlesRef = useRef(null);
  
  useEffect(() => {
    // Create particle effect
    if (particlesRef.current) {
      const container = particlesRef.current;
      const particleCount = window.innerWidth > 768 ? 50 : 30;
      
      // Clear any existing particles
      container.innerHTML = '';
      
      // Create the particles
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size between 3px and 10px
        const size = Math.random() * 7 + 3;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random position
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        particle.style.left = `${left}%`;
        particle.style.top = `${top}%`;
        
        // Random opacity
        particle.style.opacity = Math.random() * 0.5 + 0.1;
        
        // Random animation duration
        const duration = Math.random() * 10 + 5;
        particle.style.animationDuration = `${duration}s`;
        
        // Random animation delay
        const delay = Math.random() * 5;
        particle.style.animationDelay = `${delay}s`;
        
        container.appendChild(particle);
      }
    }
  }, []);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  return (
    <div className="home-container">
      <div className="particles-bg" ref={particlesRef}></div>
      <header className="home-header">
        <div className="logo-container">
          <div className="logo-icon">
            <div className="logo-circle"></div>
            <div className="logo-pulse"></div>
          </div>
          <h1>Veritas<span>AI</span> Prep</h1>
        </div>
        <nav className="main-nav">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/resources">Resources</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            {currentUser ? (
              <>
                <li><Link to="/profile">My Profile</Link></li>
                <li><button className="nav-button" onClick={handleLogout}>Logout</button></li>
              </>
            ) : (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/signup">Sign Up</Link></li>
              </>
            )}
          </ul>
        </nav>
      </header>
      
      <main className="home-main">
        <section className="hero-section">
          <div className="hero-content">
            <h2>AI-Powered Digital SAT Prep</h2>
            <p>
              Experience precision test preparation with our AI-enhanced digital simulator.
              Get personalized analytics and adaptive practice to maximize your score.
            </p>
            <Link to={currentUser ? "/exam/landing" : "/login"} className="cta-button">
              {currentUser ? "Take Practice Exam" : "Sign In to Start"}
            </Link>
          </div>
          <div className="hero-image">
            <div className="image-placeholder">
              <div className="demo-text">Exam Interface Preview</div>
              {/* Subtle neural network in background */}
              <div className="neural-network">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="node" 
                    style={{
                      top: `${Math.random() * 80 + 10}%`,
                      left: `${Math.random() * 80 + 10}%`,
                      animationDelay: `${Math.random() * 4}s`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
        
        <section className="showcase-section">
          <h2>Practice Like the Real Thing</h2>
          <div className="screenshots-container">
            <div className="screenshot">
              <div className="screenshot-placeholder">
                <div className="placeholder-text">Exam Interface</div>
              </div>
              <p>Identical format to the official Digital SAT</p>
            </div>
            <div className="screenshot">
              <div className="screenshot-placeholder">
                <div className="placeholder-text">Reading Module</div>
              </div>
              <p>Built-in tools match the actual test experience</p>
            </div>
            <div className="screenshot">
              <div className="screenshot-placeholder">
                <div className="placeholder-text">Math Module</div>
              </div>
              <p>Digital calculator and formula sheet included</p>
            </div>
          </div>
        </section>

        <section className="analytics-section">
          <h2>AI-Powered Analytics</h2>
          <div className="analytics-container">
            <div className="analytics-chart">
              <div className="chart-placeholder">
                <div className="placeholder-text">Performance Breakdown</div>
              </div>
              <p>Detailed analysis by question type and difficulty</p>
            </div>
            <div className="analytics-text">
              <h3>Personalized Insights</h3>
              <p>Our AI engine analyzes your answers to identify patterns and provide targeted recommendations for improvement.</p>
              <ul className="analytics-features">
                <li>Score prediction with 99% accuracy</li>
                <li>Personalized study plans</li>
                <li>Question-by-question breakdown</li>
                <li>Time management analysis</li>
              </ul>
            </div>
          </div>
        </section>
        
        <section className="call-to-action">
          <h2>Ready to Improve Your Score?</h2>
          <p>Start with a full-length practice test to assess your current level</p>
          <Link to={currentUser ? "/exam/landing" : "/login"} className="cta-button">
            {currentUser ? "Start Practice Exam" : "Sign In to Begin"}
          </Link>
          {currentUser && (
            <div className="secondary-actions">
              <Link to="/exam/module/1" className="secondary-link">Reading</Link>
              <Link to="/exam/module/2" className="secondary-link">Writing</Link>
              <Link to="/exam/module/3" className="secondary-link">Math (No Calc)</Link>
              <Link to="/exam/module/4" className="secondary-link">Math (Calculator)</Link>
            </div>
          )}
          {!currentUser && (
            <p className="sign-up-prompt">New user? <Link to="/signup" className="text-link">Create an account</Link> to save your progress</p>
          )}
        </section>
      </main>
      
      {/* Admin Access Utility - only visible when logged in */}
      {currentUser && <AdminAccessButton />}
      
      <footer className="home-footer">
        <p>&copy; 2025 AI-Powered Digital SAT Prep | Cutting-Edge Learning Technology</p>
      </footer>
    </div>
  );
}

export default HomePage;
