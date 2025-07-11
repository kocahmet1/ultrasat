import React from 'react';
import '../styles/Careers.css';

function Careers() {

  return (
    <div className="careers-page">
      <div className="careers-container">
        <h1>Join Our Mission</h1>
        <p className="careers-subtitle">Help us democratize education and empower students to achieve their dreams.</p>
        
        <section className="culture-section">
          <h2>Our Culture</h2>
          <p>
            At UltraSATPrep, we're building more than just a product – we're creating a culture that values 
            innovation, collaboration, and student success. Our team is passionate about education technology 
            and committed to making a meaningful impact in students' lives.
          </p>
          
          <div className="culture-values">
            <div className="culture-value">
              <h3>🤝 Collaborative</h3>
              <p>We believe the best solutions come from diverse perspectives working together.</p>
            </div>
            <div className="culture-value">
              <h3>🚀 Innovative</h3>
              <p>We're always exploring new ways to improve education through technology.</p>
            </div>
            <div className="culture-value">
              <h3>🎯 Student-Focused</h3>
              <p>Everything we do is centered around helping students succeed.</p>
            </div>
            <div className="culture-value">
              <h3>📈 Growth-Minded</h3>
              <p>We support each other's professional and personal development.</p>
            </div>
          </div>
        </section>



        <section className="internship-section">
          <h2>Internship Program</h2>
          <p>
            Our internship program offers students and recent graduates the opportunity to gain 
            real-world experience in education technology. Interns work on meaningful projects, 
            receive mentorship from senior team members, and contribute to our mission of student success.
          </p>
          
          <div className="internship-benefits">
            <ul>
              <li>Competitive stipend and potential for full-time offers</li>
              <li>Mentorship from industry professionals</li>
              <li>Real impact on product development</li>
              <li>Networking opportunities with education leaders</li>
              <li>Professional development workshops</li>
            </ul>
          </div>
        </section>

        <section className="contact-recruiting">
          <h2>Questions About Careers?</h2>
          <p>
            Don't see a position that fits your skills? We're always looking for talented individuals 
            who are passionate about education. Send us your resume at 
            <strong> careers@ultrasatprep.com</strong> and tell us how you'd like to contribute to our mission.
          </p>
          
          <div className="recruiting-cta">
            <button className="contact-btn">Contact Recruiting Team</button>
            <a href="/contact" className="general-contact">General Contact Form</a>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Careers; 