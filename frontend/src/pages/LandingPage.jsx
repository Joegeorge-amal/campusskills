import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, CalendarDays, Star, MessageCircle, CreditCard, Trophy, Key, IdCard, Search, Rocket, GraduationCap, Handshake, Lock } from 'lucide-react';
import campusLogo from '../../../docs/assets/kju_campus_logo.png';
import heroImage from '../../../docs/assets/kju_campus_hero_image.jpeg';
import './LandingPage.css';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.7
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1, 
      transition: { duration: 0.5, ease: "easeOut" } 
    }
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <motion.nav 
        className="landing-nav"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div 
          className="nav-brand"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ cursor: 'pointer' }}
        >
          <img src={campusLogo} alt="Kristu Jayanti University Logo" className="university-logo" />
          <div className="brand-text">
            <span className="brand-name">Campus<span className="brand-accent">Skills</span></span>
            <span className="brand-sub">Kristu Jayanti University</span>
          </div>
        </div>
        <div className="nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <a href="#access">Access</a>
        </div>
        <div className="nav-actions">
          <Link to="/login" className="btn-signin">Sign in <span className="btn-arrow">&rarr;</span></Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-background">
          <motion.img 
            src={heroImage} 
            alt="KJU Campus" 
            className="hero-img" 
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          <div className="hero-overlay"></div>
        </div>
        <motion.div 
          className="hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.h1 className="hero-title" variants={itemVariants}>
            Where Students Learn<br />
            <span className="hero-highlight">From Each Other</span>
          </motion.h1>
          <motion.p className="hero-subtitle" variants={itemVariants}>
            A trusted peer-to-peer platform where KJU students teach, learn,<br/>
            and grow together—building skills and connections that last<br/>
            beyond the classroom.
          </motion.p>
          <motion.div variants={itemVariants}>
            <Link to="/login" className="btn-primary-inverted">Enter CampusSkills</Link>
          </motion.div>
          
          <motion.div className="hero-stats" variants={itemVariants}>
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
          </motion.div>
        </motion.div>
      </header>

      {/* What is CampusSkills */}
      <section className="section about-section" id="about">
        <div className="about-grid">
          <motion.div 
            className="about-text-content"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.2 }
              }
            }}
          >
            <motion.span className="section-eyebrow" variants={itemVariants}>What is CampusSkills</motion.span>
            <motion.h2 variants={itemVariants}>Your college's own<br/>skill exchange</motion.h2>
            <motion.p variants={itemVariants}>CampusSkills is a peer learning platform built exclusively for your college. No outsiders, no random internet strangers — just your classmates, seniors, and juniors sharing what they know best.</motion.p>
          </motion.div>
          <div className="about-cards">
            <motion.div 
              className="about-card"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="about-card-icon icon-purple">
                <GraduationCap color="#4f46e5" size={24} strokeWidth={2.5} />
              </div>
              <div className="about-card-text">
                <h3>Peer-to-Peer Learning</h3>
                <p>Connect with students in your college who teach skills — from coding to communication, design to data science.</p>
              </div>
            </motion.div>
            <motion.div 
              className="about-card"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            >
              <div className="about-card-icon icon-yellow">
                <Handshake color="#0f766e" size={24} strokeWidth={2.5} />
              </div>
              <div className="about-card-text">
                <h3>Give & Take</h3>
                <p>Teach what you're good at. Learn what you're not. Build genuine campus relationships through skills.</p>
              </div>
            </motion.div>
            <motion.div 
              className="about-card"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            >
              <div className="about-card-icon icon-orange">
                <Lock color="#c2410c" size={24} strokeWidth={2.5} />
              </div>
              <div className="about-card-text">
                <h3>Campus-Only Access</h3>
                <p>Only verified students from your college can join. A trusted, familiar community you can rely on.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section how-it-works" id="how-it-works">
        <motion.div 
          className="section-header center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.2 }
            }
          }}
        >
          <motion.span className="section-eyebrow" variants={itemVariants}>How it works</motion.span>
          <motion.h2 variants={itemVariants}>Up and running in minutes</motion.h2>
        </motion.div>
        <motion.div 
          className="steps-container"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.18, delayChildren: 0.1 }
            }
          }}
        >
          <motion.div 
            className="step-line"
            initial={{ scaleX: 0, originX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ 
              scaleX: { duration: 0.54, ease: "linear", delay: 0.1 },
              opacity: { duration: 0.01, delay: 0.1 } 
            }}
          ></motion.div>
          <motion.div className="step-card" variants={itemVariants}>
            <div className="step-icon">
              <Key color="#ca8a04" size={32} strokeWidth={2} />
            </div>
            <h3>Sign up</h3>
            <p>Log in with your college email to get verified and join your campus community.</p>
          </motion.div>
          <motion.div className="step-card" variants={itemVariants}>
            <div className="step-icon">
              <IdCard color="#2563eb" size={32} strokeWidth={2} />
            </div>
            <h3>Build your profile</h3>
            <p>Add your year, branch, skills you teach, and skills you want to learn.</p>
          </motion.div>
          <motion.div className="step-card" variants={itemVariants}>
            <div className="step-icon">
              <Search color="#9333ea" size={32} strokeWidth={2} />
            </div>
            <h3>Get matched</h3>
            <p>Browse smart suggestions — people who need what you know, and know what you need.</p>
          </motion.div>
          <motion.div className="step-card" variants={itemVariants}>
            <div className="step-icon">
              <Rocket color="#ec4899" size={32} strokeWidth={2} />
            </div>
            <h3>Start sessions</h3>
            <p>Book sessions, track progress, leave reviews, and grow your campus reputation.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="section features-section" id="features">
        <motion.div 
          className="section-header left"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.15 }
            }
          }}
        >
          <motion.span className="section-eyebrow" variants={itemVariants}>Features</motion.span>
          <motion.h2 variants={itemVariants}>Everything you need</motion.h2>
          <motion.p variants={itemVariants}>Built specifically for how college students actually learn and<br/>collaborate.</motion.p>
        </motion.div>
        <div className="features-grid">
          <motion.div 
            className="feature-card"
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0 }}
          >
            <div className="feature-icon bg-purple">
              <Map color="#4f46e5" size={22} strokeWidth={2.5} />
            </div>
            <h3>Smart Skill Matching</h3>
            <p>The app surfaces the best peer matches based on what you're teaching and learning — no endless scrolling.</p>
          </motion.div>
          <motion.div 
            className="feature-card"
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          >
            <div className="feature-icon bg-green">
              <CalendarDays color="#16a34a" size={22} strokeWidth={2.5} />
            </div>
            <h3>Session Booking</h3>
            <p>Request, accept, and schedule sessions directly in the app. Keep track of past and upcoming sessions.</p>
          </motion.div>
          <motion.div 
            className="feature-card"
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
          >
            <div className="feature-icon bg-yellow">
              <Star color="#ca8a04" size={22} strokeWidth={2.5} />
            </div>
            <h3>Ratings & Reviews</h3>
            <p>Build your campus reputation as a teacher or learner. Honest reviews from real classmates.</p>
          </motion.div>
          <motion.div 
            className="feature-card"
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0 }}
          >
            <div className="feature-icon bg-blue">
              <MessageCircle color="#2563eb" size={22} strokeWidth={2.5} />
            </div>
            <h3>In-App Messaging</h3>
            <p>Chat with your peers to plan sessions, share resources, and stay connected without leaving the app.</p>
          </motion.div>
          <motion.div 
            className="feature-card"
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          >
            <div className="feature-icon bg-teal">
              <CreditCard color="#0d9488" size={22} strokeWidth={2.5} />
            </div>
            <h3>UPI Payments</h3>
            <p>If you charge for your time, get paid directly via UPI — fast and native to how India transacts.</p>
          </motion.div>
          <motion.div 
            className="feature-card"
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
          >
            <div className="feature-icon bg-indigo">
              <Trophy color="#4338ca" size={22} strokeWidth={2.5} />
            </div>
            <h3>Skill Portfolio</h3>
            <p>Your profile becomes your campus résumé — skills taught, sessions done, ratings earned.</p>
          </motion.div>
        </div>
      </section>

      {/* Access */}
      <section className="section access-section" id="access">
        <motion.div 
          className="access-container"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
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
        </motion.div>
      </section>

      {/* Bottom CTA */}
      <motion.section 
        className="section bottom-cta"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
          }
        }}
      >
        <motion.h2 variants={itemVariants}>Ready to learn<br/>from your campus?</motion.h2>
        <motion.p variants={itemVariants}>Your seniors know things you don't yet. Your juniors are<br/>hungry to learn what you have. CampusSkills brings<br/>them all together.</motion.p>
        <motion.div variants={itemVariants} style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/login" className="btn-signin btn-bottom-cta" style={{ padding: '12px 32px', fontSize: '1.125rem' }}>
            Join CampusSkills
          </Link>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            Back to top
          </button>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default LandingPage;
