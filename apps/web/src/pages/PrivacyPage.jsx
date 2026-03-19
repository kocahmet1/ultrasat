import React from 'react';
import '../styles/PrivacyPage.css';

function PrivacyPage() {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2>1. Introduction</h2>
          <p>
            Welcome to UltraSATPrep ("we," "our," or "us"). This Privacy Policy explains how we collect, 
            use, disclose, and safeguard your information when you visit our website and use our services. 
            By using UltraSATPrep, you consent to the data practices described in this policy.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          
          <h3>2.1 Personal Information</h3>
          <p>We may collect the following personal information:</p>
          <ul>
            <li>Name and email address when you create an account</li>
            <li>Profile information and preferences</li>
            <li>Payment information for premium features (processed securely through third-party providers)</li>
            <li>Communication data when you contact our support team</li>
          </ul>

          <h3>2.2 Usage Data</h3>
          <p>We automatically collect information about your use of our service:</p>
          <ul>
            <li>Quiz and test performance data</li>
            <li>Study progress and analytics</li>
            <li>Device information and browser type</li>
            <li>IP address and location data</li>
            <li>Website usage patterns and preferences</li>
          </ul>

          <h3>2.3 Educational Data</h3>
          <p>To provide personalized learning experiences, we collect:</p>
          <ul>
            <li>Test scores and performance metrics</li>
            <li>Learning progress and skill assessments</li>
            <li>Study habits and time spent on platform</li>
            <li>Content interactions and preferences</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use the collected information for the following purposes:</p>
          <ul>
            <li>Providing and improving our educational services</li>
            <li>Personalizing your learning experience and recommendations</li>
            <li>Processing payments and managing subscriptions</li>
            <li>Communicating with you about your account and our services</li>
            <li>Analyzing usage patterns to enhance our platform</li>
            <li>Ensuring platform security and preventing fraud</li>
            <li>Complying with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2>4. Information Sharing and Disclosure</h2>
          <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>
          
          <h3>4.1 Service Providers</h3>
          <p>We may share information with trusted third-party service providers who assist us in:</p>
          <ul>
            <li>Payment processing</li>
            <li>Data analytics and platform improvement</li>
            <li>Customer support services</li>
            <li>Email communication services</li>
          </ul>

          <h3>4.2 Legal Requirements</h3>
          <p>We may disclose your information when required by law, legal process, or to:</p>
          <ul>
            <li>Comply with legal obligations</li>
            <li>Protect and defend our rights or property</li>
            <li>Prevent or investigate possible wrongdoing</li>
            <li>Protect the personal safety of users or the public</li>
          </ul>

          <h3>4.3 Business Transfers</h3>
          <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</p>
        </section>

        <section>
          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational security measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction. These measures include:
          </p>
          <ul>
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security assessments and updates</li>
            <li>Access controls and authentication measures</li>
            <li>Secure hosting and backup systems</li>
          </ul>
          <p>
            However, no method of transmission over the internet or electronic storage is 100% secure. 
            While we strive to protect your personal information, we cannot guarantee its absolute security.
          </p>
        </section>

        <section>
          <h2>6. Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to provide our services and fulfill 
            the purposes outlined in this Privacy Policy. We may retain certain information for longer periods as 
            required by law or for legitimate business purposes such as:
          </p>
          <ul>
            <li>Maintaining academic records and progress tracking</li>
            <li>Resolving disputes and enforcing agreements</li>
            <li>Complying with legal and regulatory requirements</li>
          </ul>
        </section>

        <section>
          <h2>7. Your Rights and Choices</h2>
          <p>Depending on your location, you may have the following rights regarding your personal information:</p>
          
          <h3>7.1 Access and Portability</h3>
          <p>You can access and download your personal data through your account settings.</p>
          
          <h3>7.2 Correction and Updates</h3>
          <p>You can update your personal information directly in your account or by contacting us.</p>
          
          <h3>7.3 Deletion</h3>
          <p>You can request deletion of your account and associated data, subject to legal and contractual retention requirements.</p>
          
          <h3>7.4 Communication Preferences</h3>
          <p>You can opt out of promotional communications while still receiving essential service-related messages.</p>
        </section>

        <section>
          <h2>8. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to enhance your experience on our platform. 
            These technologies help us:
          </p>
          <ul>
            <li>Remember your preferences and settings</li>
            <li>Analyze website traffic and usage patterns</li>
            <li>Provide personalized content and recommendations</li>
            <li>Improve our services and user experience</li>
          </ul>
          <p>You can control cookie settings through your browser preferences.</p>
        </section>

        <section>
          <h2>9. Children's Privacy</h2>
          <p>
            Our services are designed for users aged 13 and older. We do not knowingly collect personal information 
            from children under 13 without parental consent. If we become aware that we have collected personal 
            information from a child under 13, we will take steps to delete such information promptly.
          </p>
        </section>

        <section>
          <h2>10. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own. 
            We ensure that such transfers comply with applicable data protection laws and implement 
            appropriate safeguards to protect your information.
          </p>
        </section>

        <section>
          <h2>11. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our practices or 
            for other operational, legal, or regulatory reasons. We will notify you of any material changes 
            by posting the updated policy on our website and updating the "Last updated" date.
          </p>
        </section>

        <section>
          <h2>12. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <div className="contact-info">
            <p><strong>Email:</strong> privacy@ultrasatprep.com</p>
            <p><strong>Support:</strong> support@ultrasatprep.com</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPage; 