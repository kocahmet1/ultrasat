import React from 'react';
import '../styles/TermsOfService.css';

function TermsOfService() {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using UltraSATPrep ("the Service"), you accept and agree to be bound by the terms 
            and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>UltraSATPrep provides online SAT test preparation services, including:</p>
          <ul>
            <li>Practice exams and quizzes</li>
            <li>Educational content and study materials</li>
            <li>Progress tracking and performance analytics</li>
            <li>Personalized learning recommendations</li>
            <li>Vocabulary and concept banks</li>
            <li>Flashcard systems and study tools</li>
          </ul>
        </section>

        <section>
          <h2>3. User Accounts</h2>
          
          <h3>3.1 Account Registration</h3>
          <p>To access certain features, you must create an account by providing:</p>
          <ul>
            <li>A valid email address</li>
            <li>A secure password</li>
            <li>Basic profile information</li>
          </ul>

          <h3>3.2 Account Security</h3>
          <p>You are responsible for:</p>
          <ul>
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized access</li>
            <li>Ensuring your account information is accurate and up-to-date</li>
          </ul>

          <h3>3.3 Account Termination</h3>
          <p>
            We reserve the right to terminate or suspend your account at our discretion if you violate 
            these terms or engage in inappropriate behavior.
          </p>
        </section>

        <section>
          <h2>4. Acceptable Use Policy</h2>
          <p>You agree not to use the Service to:</p>
          <ul>
            <li>Violate any laws or regulations</li>
            <li>Share your account with other users</li>
            <li>Attempt to hack, reverse engineer, or compromise our systems</li>
            <li>Upload malicious content or software</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Use automated tools to access our content</li>
            <li>Reproduce, distribute, or sell our proprietary content</li>
            <li>Create derivative works from our materials</li>
          </ul>
        </section>

        <section>
          <h2>5. Intellectual Property Rights</h2>
          
          <h3>5.1 Our Content</h3>
          <p>
            All content on UltraSATPrep, including but not limited to text, graphics, logos, images, 
            software, and practice questions, is the property of UltraSATPrep or its licensors and is 
            protected by copyright and other intellectual property laws.
          </p>

          <h3>5.2 User License</h3>
          <p>
            We grant you a limited, non-exclusive, non-transferable license to access and use our Service 
            for personal, non-commercial educational purposes only.
          </p>

          <h3>5.3 User-Generated Content</h3>
          <p>
            By submitting content to our Service (such as questions, comments, or feedback), you grant us 
            a non-exclusive, royalty-free license to use, modify, and distribute such content for the 
            operation and improvement of our Service.
          </p>
        </section>

        <section>
          <h2>6. Subscription and Payment Terms</h2>
          
          <h3>6.1 Premium Features</h3>
          <p>
            Certain features require a paid subscription. Subscription fees are charged in advance and 
            are non-refundable except as required by law.
          </p>

          <h3>6.2 Billing and Renewals</h3>
          <p>
            Subscriptions automatically renew unless cancelled before the renewal date. You can cancel 
            your subscription at any time through your account settings.
          </p>

          <h3>6.3 Price Changes</h3>
          <p>
            We reserve the right to change subscription prices with 30 days' notice. Price changes will 
            not affect your current billing cycle.
          </p>

          <h3>6.4 Refund Policy</h3>
          <p>
            Refunds are generally not provided for subscription fees. However, we may provide refunds 
            at our discretion for exceptional circumstances.
          </p>
        </section>

        <section>
          <h2>7. Educational Disclaimer</h2>
          <p>
            UltraSATPrep is designed to help students prepare for the SAT exam. However:
          </p>
          <ul>
            <li>We do not guarantee specific test score improvements</li>
            <li>Our practice tests are simulations and may not perfectly reflect the actual exam</li>
            <li>Test preparation results vary based on individual effort and ability</li>
            <li>We are not affiliated with or endorsed by the College Board</li>
          </ul>
        </section>

        <section>
          <h2>8. Privacy and Data Protection</h2>
          <p>
            Your privacy is important to us. Our collection and use of personal information is governed 
            by our Privacy Policy, which is incorporated into these Terms of Service by reference.
          </p>
        </section>

        <section>
          <h2>9. Disclaimers and Limitation of Liability</h2>
          
          <h3>9.1 Service Availability</h3>
          <p>
            We strive to provide reliable service but cannot guarantee 100% uptime. The Service is provided 
            "as is" without warranties of any kind.
          </p>

          <h3>9.2 Limitation of Liability</h3>
          <p>
            To the maximum extent permitted by law, UltraSATPrep shall not be liable for any indirect, 
            incidental, special, consequential, or punitive damages arising from your use of the Service.
          </p>

          <h3>9.3 Maximum Liability</h3>
          <p>
            Our total liability to you for any claims arising from these Terms shall not exceed the amount 
            you paid us in the 12 months preceding the claim.
          </p>
        </section>

        <section>
          <h2>10. Third-Party Services</h2>
          <p>
            Our Service may integrate with third-party services (such as payment processors, analytics tools, 
            or educational content providers). We are not responsible for the availability, accuracy, or 
            content of such third-party services.
          </p>
        </section>

        <section>
          <h2>11. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless UltraSATPrep and its affiliates from any claims, 
            damages, losses, or expenses arising from your use of the Service or violation of these Terms.
          </p>
        </section>

        <section>
          <h2>12. Governing Law and Dispute Resolution</h2>
          
          <h3>12.1 Governing Law</h3>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction 
            where UltraSATPrep is based.
          </p>

          <h3>12.2 Dispute Resolution</h3>
          <p>
            Any disputes arising from these Terms will be resolved through binding arbitration rather than 
            in court, except for claims that may be brought in small claims court.
          </p>
        </section>

        <section>
          <h2>13. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify users of material changes 
            by email or through our Service. Continued use of the Service after changes constitutes acceptance 
            of the new Terms.
          </p>
        </section>

        <section>
          <h2>14. Termination</h2>
          <p>
            These Terms remain in effect until terminated by either party. Upon termination, your right to 
            use the Service ceases immediately, but provisions regarding intellectual property, disclaimers, 
            and limitation of liability shall survive.
          </p>
        </section>

        <section>
          <h2>15. Severability</h2>
          <p>
            If any provision of these Terms is found to be unenforceable or invalid, the remaining provisions 
            will continue to be valid and enforceable.
          </p>
        </section>

        <section>
          <h2>16. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <div className="contact-info">
            <p><strong>Email:</strong> legal@ultrasatprep.com</p>
            <p><strong>Support:</strong> support@ultrasatprep.com</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default TermsOfService; 