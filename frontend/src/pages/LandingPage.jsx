import React from 'react';
import { Link } from 'react-router-dom';
import campusLogo from '../../../docs/assets/kju_campus_logo.png';
import heroImage from '../../../docs/assets/kju_campus_hero_image.jpeg';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <img src={campusLogo} alt="Kristu Jayanti University Logo" className="university-logo" />
          <div className="brand-text">
            <span className="brand-name">CampusSkills</span>
            <span className="brand-sub">Kristu Jayanti University</span>
          </div>
        </div>
        <div className="nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <a href="#access">Access</a>
        </div>
        <div className="nav-actions">
          <Link to="/login" className="btn-signin">SIGN IN</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-background">
          <img src={heroImage} alt="KJU Campus" className="hero-img" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">
            Where Students Learn<br />
            <span className="hero-highlight">From Each Other</span>
          </h1>
          <p className="hero-subtitle">
            A trusted peer-to-peer platform where KJU students teach, learn,<br/>
            and grow together—building skills and connections that last<br/>
            beyond the classroom.
          </p>
          <Link to="/login" className="btn-primary-inverted">ENTER CAMPUS SKILLS</Link>
          
          <div className="hero-stats">
            <div className="stat-pill">
              <strong>500+</strong>
              <span>Active students</span>
            </div>
            <div className="stat-pill">
              <strong>50+</strong>
              <span>Skills offered</span>
            </div>
            <div className="stat-pill">
              <strong>Campus-only</strong>
              <span>Verified access</span>
            </div>
          </div>
        </div>
      </header>

      {/* What is CampusSkills */}
      <section className="section about-section" id="about">
        <div className="about-grid">
          <div className="about-text-content">
            <span className="section-eyebrow">What is CampusSkills</span>
            <h2>Your college's own<br/>skill exchange</h2>
            <p>CampusSkills is a peer learning platform built exclusively for your college. No outsiders, no random internet strangers — just your classmates, seniors, and juniors sharing what they know best.</p>
          </div>
          <div className="about-cards">
            <div className="about-card">
              <div className="about-card-icon icon-purple">🎓</div>
              <div className="about-card-text">
                <h3>Peer-to-Peer Learning</h3>
                <p>Connect with students in your college who teach skills — from coding to communication, design to data science.</p>
              </div>
            </div>
            <div className="about-card">
              <div className="about-card-icon icon-yellow">🤝</div>
              <div className="about-card-text">
                <h3>Give & Take</h3>
                <p>Teach what you're good at. Learn what you're not. Build genuine campus relationships through skills.</p>
              </div>
            </div>
            <div className="about-card">
              <div className="about-card-icon icon-orange">🔒</div>
              <div className="about-card-text">
                <h3>Campus-Only Access</h3>
                <p>Only verified students from your college can join. A trusted, familiar community you can rely on.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section how-it-works" id="how-it-works">
        <div className="section-header center">
          <span className="section-eyebrow">How it works</span>
          <h2>Up and running in minutes</h2>
        </div>
        <div className="steps-container">
          <div className="step-line"></div>
          <div className="step-card">
            <div className="step-icon">🔑</div>
            <h3>Sign up</h3>
            <p>Log in with your college email to get verified and join your campus community.</p>
          </div>
          <div className="step-card">
            <div className="step-icon">🪪</div>
            <h3>Build your profile</h3>
            <p>Add your year, branch, skills you teach, and skills you want to learn.</p>
          </div>
          <div className="step-card">
            <div className="step-icon">🔍</div>
            <h3>Get matched</h3>
            <p>Browse smart suggestions — people who need what you know, and know what you need.</p>
          </div>
          <div className="step-card">
            <div className="step-icon">🚀</div>
            <h3>Start sessions</h3>
            <p>Book sessions, track progress, leave reviews, and grow your campus reputation.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section features-section" id="features">
        <div className="section-header left">
          <span className="section-eyebrow">Features</span>
          <h2>Everything you need</h2>
          <p>Built specifically for how college students actually learn and<br/>collaborate.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon bg-purple">🗺️</div>
            <h3>Smart Skill Matching</h3>
            <p>The app surfaces the best peer matches based on what you're teaching and learning — no endless scrolling.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon bg-green">📅</div>
            <h3>Session Booking</h3>
            <p>Request, accept, and schedule sessions directly in the app. Keep track of past and upcoming sessions.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon bg-yellow">⭐</div>
            <h3>Ratings & Reviews</h3>
            <p>Build your campus reputation as a teacher or learner. Honest reviews from real classmates.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon bg-blue">💬</div>
            <h3>In-App Messaging</h3>
            <p>Chat with your peers to plan sessions, share resources, and stay connected without leaving the app.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon bg-teal">💳</div>
            <h3>UPI Payments</h3>
            <p>If you charge for your time, get paid directly via UPI — fast and native to how India transacts.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon bg-indigo">🏆</div>
            <h3>Skill Portfolio</h3>
            <p>Your profile becomes your campus résumé — skills taught, sessions done, ratings earned.</p>
          </div>
        </div>
      </section>

      {/* Access */}
      <section className="section access-section" id="access">
        <div className="access-container">
          <div className="access-blob-bg"></div>
          <div className="access-content">
            <h2>Built only for your college</h2>
            <p>
              CampusSkills is not a public platform. It's a closed community —<br/>
              only students from your specific college can create accounts and<br/>
              access the app. This keeps the community trusted, familiar, and<br/>
              actually useful.
            </p>
            <div className="check-pills">
              <div className="check-pill">✓ Verified college email</div>
              <div className="check-pill">✓ No public access</div>
              <div className="check-pill">✓ Campus community only</div>
              <div className="check-pill">✓ Students you already know</div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="section bottom-cta">
        <h2>Ready to learn<br/>from your campus?</h2>
        <p>Your seniors know things you don't yet. Your juniors are<br/>hungry to learn what you have. CampusSkills brings<br/>them all together.</p>
      </section>
    </div>
  );
};

export default LandingPage;
