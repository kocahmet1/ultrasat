import React from 'react';
import '../styles/AboutUs.css';

function AboutUs() {
  return (
    <div className="about-page">
      <div className="about-container">
        <h1>About UltraSATPrep</h1>
        <p className="hero-subtitle">Empowering students to achieve their SAT goals through innovative, personalized test preparation.</p>
        
        <section className="mission-section">
          <h2>Our Mission</h2>
          <p>
            At UltraSATPrep, we believe every student deserves access to high-quality, personalized SAT preparation. 
            Our mission is to democratize test prep by providing adaptive, AI-powered learning experiences that 
            help students achieve their highest potential on the SAT exam.
          </p>
        </section>

        <section className="story-section">
          <h2>Our Story</h2>
          <p>
            Founded by educators and technologists who understand the challenges students face in standardized 
            test preparation, UltraSATPrep was born from a simple belief: test prep should be engaging, 
            effective, and accessible to everyone.
          </p>
          <p>
            We recognized that traditional test prep methods often fail to address individual learning styles 
            and pace. That's why we built UltraSATPrep as an adaptive learning platform that personalizes the 
            study experience for each student, ensuring they focus on areas where they need the most improvement.
          </p>
        </section>

        <section className="values-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-item">
              <h3>🎯 Personalization</h3>
              <p>Every student learns differently. Our adaptive technology tailors the learning experience to individual needs and learning patterns.</p>
            </div>
            <div className="value-item">
              <h3>📊 Data-Driven</h3>
              <p>We use analytics and performance data to continuously improve our platform and help students make informed study decisions.</p>
            </div>
            <div className="value-item">
              <h3>🌟 Excellence</h3>
              <p>We're committed to providing the highest quality content and user experience to help students achieve their best possible scores.</p>
            </div>
            <div className="value-item">
              <h3>🤝 Accessibility</h3>
              <p>Quality test preparation should be available to all students, regardless of their background or financial circumstances.</p>
            </div>
            <div className="value-item">
              <h3>🚀 Innovation</h3>
              <p>We continuously evolve our platform using the latest educational technology and learning science research.</p>
            </div>
            <div className="value-item">
              <h3>💡 Empowerment</h3>
              <p>We empower students with the tools, knowledge, and confidence they need to succeed on the SAT and beyond.</p>
            </div>
          </div>
        </section>

        <section className="approach-section">
          <h2>Our Approach</h2>
          <div className="approach-features">
            <div className="feature">
              <h3>Adaptive Learning Technology</h3>
              <p>Our AI-powered system adapts to your learning pace and style, providing personalized question recommendations and study paths.</p>
            </div>
            <div className="feature">
              <h3>Comprehensive Content Library</h3>
              <p>Access thousands of practice questions, detailed explanations, and study materials covering all SAT sections.</p>
            </div>
            <div className="feature">
              <h3>Real-Time Progress Tracking</h3>
              <p>Monitor your improvement with detailed analytics and performance insights that guide your study strategy.</p>
            </div>
            <div className="feature">
              <h3>Expert-Crafted Materials</h3>
              <p>All our content is developed by SAT experts and educators who understand the test inside and out.</p>
            </div>
          </div>
        </section>

        <section className="team-section">
          <h2>Our Team</h2>
          <p>
            UltraSATPrep is built by a diverse team of educators, software engineers, data scientists, and 
            student success specialists who are passionate about education technology and student achievement.
          </p>
          <div className="team-highlights">
            <div className="team-stat">
              <h3>50+</h3>
              <p>Years of Combined Education Experience</p>
            </div>
            <div className="team-stat">
              <h3>10+</h3>
              <p>SAT Subject Matter Experts</p>
            </div>
            <div className="team-stat">
              <h3>24/7</h3>
              <p>Student Support Available</p>
            </div>
          </div>
        </section>

        <section className="commitment-section">
          <h2>Our Commitment to Students</h2>
          <p>
            We're committed to student success beyond just test scores. UltraSATPrep helps build critical 
            thinking skills, academic confidence, and study habits that benefit students throughout their 
            educational journey.
          </p>
          <ul>
            <li>Continuous platform improvements based on user feedback</li>
            <li>Regular content updates to reflect current SAT formats</li>
            <li>Responsive customer support and student success coaching</li>
            <li>Transparent pricing with no hidden fees</li>
            <li>Commitment to data privacy and security</li>
          </ul>
        </section>

        <section className="contact-cta">
          <h2>Get in Touch</h2>
          <p>
            Have questions about UltraSATPrep? We'd love to hear from you. 
            <a href="/contact" className="contact-link"> Contact our team</a> or 
            <a href="/help" className="help-link"> visit our help center</a> for more information.
          </p>
        </section>
      </div>
    </div>
  );
}

export default AboutUs; 