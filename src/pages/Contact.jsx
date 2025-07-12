import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import '../styles/Contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // EmailJS configuration - you'll need to replace these with your actual values
      const serviceID = process.env.REACT_APP_EMAILJS_SERVICE_ID || 'your_service_id';
      const templateID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'your_template_id';
      const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'your_public_key';
      
      // Prepare template parameters
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        category: formData.category,
        to_name: 'UltraSAT Support',
        reply_to: formData.email,
      };

      // Send email using EmailJS
      await emailjs.send(serviceID, templateID, templateParams, publicKey);
      
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'general'
      });
    } catch (error) {
      console.error('EmailJS Error:', error);
      setError('Failed to send message. Please try again or contact us directly at hello@ultrasatprep.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        <h1>Contact Us</h1>
        <p className="contact-subtitle">Get in touch with our team. We're here to help you succeed on your SAT journey.</p>
        
        <div className="contact-content">
          <div className="contact-form-section">
            <h2>Send us a Message</h2>
            {submitted ? (
              <div className="success-message">
                <h3>✅ Message Sent Successfully!</h3>
                <p>Thank you for contacting us. We'll get back to you within 24 hours.</p>
                <button 
                  className="send-another-btn"
                  onClick={() => setSubmitted(false)}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                {error && (
                  <div className="error-message">
                    <p>{error}</p>
                  </div>
                )}
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="billing">Billing & Subscriptions</option>
                      <option value="feedback">Feedback & Suggestions</option>
                      <option value="partnership">Partnership Opportunities</option>
                      <option value="press">Press & Media</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="Brief description of your inquiry"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Please provide details about your inquiry..."
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          <div className="contact-info-section">
            <h2>Get in Touch</h2>
            
            <div className="contact-methods">
              <div className="contact-method">
                <h3>📧 Email Support</h3>
                <p><strong>General Inquiries:</strong> <a href="mailto:hello@ultrasatprep.com">hello@ultrasatprep.com</a></p>
                <p><strong>Technical Support:</strong> <a href="mailto:support@ultrasatprep.com">support@ultrasatprep.com</a></p>
                <p><strong>Billing Questions:</strong> <a href="mailto:billing@ultrasatprep.com">billing@ultrasatprep.com</a></p>
                <p><strong>Press & Media:</strong> <a href="mailto:press@ultrasatprep.com">press@ultrasatprep.com</a></p>
              </div>
              
              <div className="contact-method">
                <h3>💬 Alternative Contact</h3>
                <p>If the form above doesn't work, you can always reach us directly at:</p>
                <p><strong><a href="mailto:hello@ultrasatprep.com?subject=Contact%20from%20UltraSAT%20User">hello@ultrasatprep.com</a></strong></p>
                <p>We typically respond within 24 hours.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact; 