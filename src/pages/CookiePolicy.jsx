import React from 'react';
import '../styles/CookiePolicy.css';

function CookiePolicy() {
  return (
    <div className="cookie-policy-page">
      <div className="cookie-policy-container">
        <h1>Cookie Policy</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2>1. What Are Cookies?</h2>
          <p>
            Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) 
            when you visit our website. They help us provide you with a better experience by remembering 
            your preferences and analyzing how you use our service.
          </p>
        </section>

        <section>
          <h2>2. How We Use Cookies</h2>
          <p>UltraSATPrep uses cookies for several important purposes:</p>
          <ul>
            <li>Authentication and security</li>
            <li>Remembering your preferences and settings</li>
            <li>Analyzing website performance and usage</li>
            <li>Providing personalized content and recommendations</li>
            <li>Enabling social media features</li>
            <li>Improving our services and user experience</li>
          </ul>
        </section>

        <section>
          <h2>3. Types of Cookies We Use</h2>
          
          <h3>3.1 Essential Cookies</h3>
          <p>These cookies are necessary for the website to function properly and cannot be disabled:</p>
          <ul>
            <li><strong>Authentication cookies:</strong> Keep you logged in during your session</li>
            <li><strong>Security cookies:</strong> Protect against cross-site request forgery and other security threats</li>
            <li><strong>Load balancing cookies:</strong> Ensure optimal performance across our servers</li>
            <li><strong>Session cookies:</strong> Maintain your session state as you navigate through the site</li>
          </ul>

          <h3>3.2 Functional Cookies</h3>
          <p>These cookies enhance your experience by remembering your choices:</p>
          <ul>
            <li><strong>Preference cookies:</strong> Remember your settings and preferences</li>
            <li><strong>Progress tracking cookies:</strong> Save your progress through lessons and quizzes</li>
            <li><strong>Language cookies:</strong> Remember your language preference</li>
            <li><strong>Theme cookies:</strong> Remember your display preferences (light/dark mode)</li>
          </ul>

          <h3>3.3 Analytics Cookies</h3>
          <p>These cookies help us understand how you use our website:</p>
          <ul>
            <li><strong>Google Analytics:</strong> Tracks website usage, page views, and user behavior</li>
            <li><strong>Performance monitoring:</strong> Identifies technical issues and loading times</li>
            <li><strong>A/B testing cookies:</strong> Help us test different versions of features</li>
            <li><strong>Heatmap cookies:</strong> Understand how users interact with different page elements</li>
          </ul>

          <h3>3.4 Marketing Cookies</h3>
          <p>These cookies are used to deliver relevant advertisements:</p>
          <ul>
            <li><strong>Advertising cookies:</strong> Show you relevant ads based on your interests</li>
            <li><strong>Social media cookies:</strong> Enable sharing content on social platforms</li>
            <li><strong>Conversion tracking:</strong> Measure the effectiveness of our marketing campaigns</li>
            <li><strong>Retargeting cookies:</strong> Show you relevant content when you visit other websites</li>
          </ul>
        </section>

        <section>
          <h2>4. Third-Party Cookies</h2>
          <p>We use services from trusted third parties that may set their own cookies:</p>
          
          <h3>4.1 Google Services</h3>
          <ul>
            <li><strong>Google Analytics:</strong> Website traffic analysis and user behavior insights</li>
            <li><strong>Google Fonts:</strong> Delivery of web fonts for better typography</li>
            <li><strong>Google reCAPTCHA:</strong> Protection against spam and abuse</li>
          </ul>

          <h3>4.2 Educational Content Providers</h3>
          <ul>
            <li><strong>Khan Academy:</strong> Integration with external educational content</li>
            <li><strong>Educational APIs:</strong> Access to standardized test preparation materials</li>
          </ul>

          <h3>4.3 Payment Processors</h3>
          <ul>
            <li><strong>Stripe:</strong> Secure payment processing for subscriptions</li>
            <li><strong>PayPal:</strong> Alternative payment method processing</li>
          </ul>

          <h3>4.4 Social Media Platforms</h3>
          <ul>
            <li><strong>Facebook:</strong> Social sharing and login functionality</li>
            <li><strong>Twitter:</strong> Social sharing features</li>
            <li><strong>LinkedIn:</strong> Professional networking integration</li>
          </ul>
        </section>

        <section>
          <h2>5. Managing Your Cookie Preferences</h2>
          
          <h3>5.1 Browser Settings</h3>
          <p>You can control cookies through your browser settings:</p>
          <ul>
            <li>Accept or reject cookies before they are saved</li>
            <li>Delete cookies that have already been saved</li>
            <li>Block cookies from specific websites</li>
            <li>Block third-party cookies entirely</li>
          </ul>

          <h3>5.2 Cookie Management Tools</h3>
          <p>We provide tools to help you manage your cookie preferences:</p>
          <ul>
            <li>Cookie preference center (available in your account settings)</li>
            <li>Opt-out options for marketing cookies</li>
            <li>Granular control over different cookie categories</li>
          </ul>

          <h3>5.3 Browser-Specific Instructions</h3>
          <div className="browser-instructions">
            <h4>Chrome:</h4>
            <p>Settings → Privacy and security → Cookies and other site data</p>
            
            <h4>Firefox:</h4>
            <p>Settings → Privacy & Security → Cookies and Site Data</p>
            
            <h4>Safari:</h4>
            <p>Preferences → Privacy → Manage Website Data</p>
            
            <h4>Edge:</h4>
            <p>Settings → Site permissions → Cookies and site data</p>
          </div>
        </section>

        <section>
          <h2>6. Impact of Disabling Cookies</h2>
          <p>
            While you can disable cookies, this may impact your experience on UltraSATPrep:
          </p>
          
          <h3>6.1 Essential Functions</h3>
          <ul>
            <li>You may not be able to stay logged in</li>
            <li>Your progress may not be saved between sessions</li>
            <li>Security features may not work properly</li>
            <li>Some interactive features may not function</li>
          </ul>

          <h3>6.2 Personalization</h3>
          <ul>
            <li>Your preferences and settings won't be remembered</li>
            <li>Recommendations may be less relevant</li>
            <li>You may see repeated content or prompts</li>
            <li>The interface may revert to default settings each visit</li>
          </ul>
        </section>

        <section>
          <h2>7. Cookie Retention</h2>
          
          <h3>7.1 Session Cookies</h3>
          <p>
            Session cookies are temporary and are deleted when you close your browser or log out.
          </p>

          <h3>7.2 Persistent Cookies</h3>
          <p>
            Persistent cookies remain on your device for a specified period or until you delete them:
          </p>
          <ul>
            <li><strong>Authentication cookies:</strong> 30 days</li>
            <li><strong>Preference cookies:</strong> 1 year</li>
            <li><strong>Analytics cookies:</strong> 2 years</li>
            <li><strong>Marketing cookies:</strong> 90 days</li>
          </ul>
        </section>

        <section>
          <h2>8. International Users</h2>
          <p>
            If you are located in the European Economic Area (EEA), United Kingdom, or other regions 
            with specific cookie laws, you have additional rights:
          </p>
          <ul>
            <li>Right to be informed about our cookie usage</li>
            <li>Right to consent to non-essential cookies</li>
            <li>Right to withdraw consent at any time</li>
            <li>Right to object to certain types of cookies</li>
          </ul>
        </section>

        <section>
          <h2>9. Children's Privacy</h2>
          <p>
            We take special care with users under 18. If you are under 18, please have a parent or 
            guardian review this Cookie Policy with you. We do not knowingly collect personal information 
            from children under 13 without parental consent.
          </p>
        </section>

        <section>
          <h2>10. Updates to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time to reflect changes in our practices, 
            technology, or legal requirements. We will notify you of significant changes by:
          </p>
          <ul>
            <li>Posting a notice on our website</li>
            <li>Sending an email notification</li>
            <li>Updating the "Last updated" date at the top of this policy</li>
          </ul>
        </section>

        <section>
          <h2>11. Contact Us</h2>
          <p>
            If you have any questions about our use of cookies or this Cookie Policy, please contact us:
          </p>
          <div className="contact-info">
            <p><strong>Email:</strong> privacy@ultrasatprep.com</p>
            <p><strong>Support:</strong> support@ultrasatprep.com</p>
            <p><strong>Data Protection Officer:</strong> dpo@ultrasatprep.com</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default CookiePolicy; 