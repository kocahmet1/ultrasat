import React from 'react';
import '../styles/Accessibility.css';

function Accessibility() {
  return (
    <div className="accessibility-page">
      <div className="accessibility-container">
        <h1>Accessibility Statement</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2>1. Our Commitment to Accessibility</h2>
          <p>
            UltraSATPrep is committed to ensuring that our website and services are accessible to everyone, 
            including people with disabilities. We believe that all students should have equal access to 
            quality SAT test preparation resources, regardless of their abilities or disabilities.
          </p>
        </section>

        <section>
          <h2>2. Accessibility Standards</h2>
          <p>
            We strive to meet or exceed the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA 
            standards established by the World Wide Web Consortium (W3C). These guidelines help make 
            web content more accessible to people with a wide range of disabilities.
          </p>
          
          <h3>2.1 WCAG 2.1 Principles</h3>
          <p>Our accessibility efforts focus on the four main principles:</p>
          <ul>
            <li><strong>Perceivable:</strong> Information must be presentable in ways users can perceive</li>
            <li><strong>Operable:</strong> Interface components must be operable by all users</li>
            <li><strong>Understandable:</strong> Information and UI operation must be understandable</li>
            <li><strong>Robust:</strong> Content must be robust enough for various assistive technologies</li>
          </ul>
        </section>

        <section>
          <h2>3. Accessibility Features</h2>
          
          <h3>3.1 Visual Accessibility</h3>
          <ul>
            <li><strong>High contrast mode:</strong> Enhanced color contrast for better visibility</li>
            <li><strong>Scalable text:</strong> All text can be resized up to 200% without loss of functionality</li>
            <li><strong>Alternative text:</strong> Descriptive alt text for all images and graphics</li>
            <li><strong>Color independence:</strong> Information is not conveyed by color alone</li>
            <li><strong>Focus indicators:</strong> Clear visual indicators for keyboard navigation</li>
          </ul>

          <h3>3.2 Motor Accessibility</h3>
          <ul>
            <li><strong>Keyboard navigation:</strong> Full functionality available via keyboard</li>
            <li><strong>Large click targets:</strong> Buttons and links are sufficiently large</li>
            <li><strong>Drag and drop alternatives:</strong> Alternative methods for interactive elements</li>
            <li><strong>Timeout extensions:</strong> Ability to extend or disable time limits</li>
          </ul>

          <h3>3.3 Cognitive Accessibility</h3>
          <ul>
            <li><strong>Clear navigation:</strong> Consistent and intuitive navigation structure</li>
            <li><strong>Simple language:</strong> Content written in clear, simple language</li>
            <li><strong>Progress indicators:</strong> Clear indication of progress through tasks</li>
            <li><strong>Error prevention:</strong> Clear instructions and error messages</li>
            <li><strong>Reading assistance:</strong> Support for text-to-speech tools</li>
          </ul>

          <h3>3.4 Auditory Accessibility</h3>
          <ul>
            <li><strong>Captions:</strong> Closed captions for all video content</li>
            <li><strong>Transcripts:</strong> Text transcripts for audio content</li>
            <li><strong>Visual alerts:</strong> Visual alternatives to audio notifications</li>
            <li><strong>Volume controls:</strong> User control over audio levels</li>
          </ul>
        </section>

        <section>
          <h2>4. Assistive Technology Support</h2>
          <p>
            UltraSATPrep is designed to work with various assistive technologies:
          </p>
          
          <h3>4.1 Screen Readers</h3>
          <ul>
            <li>JAWS (Job Access With Speech)</li>
            <li>NVDA (NonVisual Desktop Access)</li>
            <li>VoiceOver (macOS and iOS)</li>
            <li>TalkBack (Android)</li>
            <li>Dragon NaturallySpeaking</li>
          </ul>

          <h3>4.2 Browser Compatibility</h3>
          <p>Our website is compatible with accessibility features in:</p>
          <ul>
            <li>Chrome (with accessibility extensions)</li>
            <li>Firefox (with accessibility features)</li>
            <li>Safari (with VoiceOver integration)</li>
            <li>Edge (with built-in accessibility tools)</li>
          </ul>
        </section>

        <section>
          <h2>5. Specific Accessibility Features for SAT Prep</h2>
          
          <h3>5.1 Practice Tests</h3>
          <ul>
            <li><strong>Extended time:</strong> Options for extended test time accommodations</li>
            <li><strong>Large print:</strong> Ability to increase text size for better readability</li>
            <li><strong>Read-aloud:</strong> Text-to-speech functionality for questions and answers</li>
            <li><strong>Pause and resume:</strong> Ability to pause and resume tests as needed</li>
            <li><strong>Navigation aids:</strong> Easy navigation between questions</li>
          </ul>

          <h3>5.2 Study Materials</h3>
          <ul>
            <li><strong>Audio descriptions:</strong> Verbal descriptions of mathematical diagrams</li>
            <li><strong>Tactile graphics:</strong> Support for tactile display devices</li>
            <li><strong>Simplified layouts:</strong> Clean, uncluttered page designs</li>
            <li><strong>Flexible pacing:</strong> Self-paced learning modules</li>
          </ul>

          <h3>5.3 Interactive Features</h3>
          <ul>
            <li><strong>Voice commands:</strong> Voice control for navigation and answers</li>
            <li><strong>Switch navigation:</strong> Support for switch devices</li>
            <li><strong>Eye tracking:</strong> Compatibility with eye-tracking devices</li>
            <li><strong>Head tracking:</strong> Support for head-controlled navigation</li>
          </ul>
        </section>

        <section>
          <h2>6. Ongoing Accessibility Efforts</h2>
          
          <h3>6.1 Regular Testing</h3>
          <p>We conduct regular accessibility testing including:</p>
          <ul>
            <li>Automated accessibility scans</li>
            <li>Manual testing with assistive technologies</li>
            <li>User testing with people with disabilities</li>
            <li>Expert accessibility reviews</li>
          </ul>

          <h3>6.2 Staff Training</h3>
          <p>Our team receives regular training on:</p>
          <ul>
            <li>Accessibility best practices</li>
            <li>Assistive technology usage</li>
            <li>Inclusive design principles</li>
            <li>Legal accessibility requirements</li>
          </ul>

          <h3>6.3 Content Review</h3>
          <p>All new content undergoes accessibility review for:</p>
          <ul>
            <li>Proper heading structure</li>
            <li>Alternative text for images</li>
            <li>Keyboard accessibility</li>
            <li>Color contrast compliance</li>
          </ul>
        </section>

        <section>
          <h2>7. Known Limitations</h2>
          <p>
            We are continuously working to improve accessibility, but we acknowledge some current limitations:
          </p>
          <ul>
            <li>Some complex mathematical equations may require additional screen reader support</li>
            <li>Certain interactive graphing tools are being updated for better accessibility</li>
            <li>Some third-party embedded content may have accessibility limitations</li>
            <li>PDF documents are being converted to more accessible formats</li>
          </ul>
          <p>
            We are actively working to address these limitations and welcome feedback on accessibility issues.
          </p>
        </section>

        <section>
          <h2>8. Accommodation Requests</h2>
          <p>
            If you require specific accommodations that are not currently available, please contact us. 
            We will work with you to find suitable alternatives or implement necessary features.
          </p>
          
          <h3>8.1 Available Accommodations</h3>
          <ul>
            <li>Extended time for practice tests</li>
            <li>Alternative formats for study materials</li>
            <li>One-on-one accessibility support sessions</li>
            <li>Custom user interface modifications</li>
            <li>Priority customer support for accessibility issues</li>
          </ul>
        </section>

        <section>
          <h2>9. Third-Party Content</h2>
          <p>
            While we strive to ensure all content on our platform is accessible, some third-party 
            content may not meet our accessibility standards. We work with our content partners to 
            improve accessibility and provide alternative formats when possible.
          </p>
        </section>

        <section>
          <h2>10. Legal Compliance</h2>
          <p>
            UltraSATPrep is committed to complying with applicable accessibility laws and regulations, including:
          </p>
          <ul>
            <li>Americans with Disabilities Act (ADA)</li>
            <li>Section 508 of the Rehabilitation Act</li>
            <li>Web Content Accessibility Guidelines (WCAG) 2.1</li>
            <li>State and local accessibility requirements</li>
          </ul>
        </section>

        <section>
          <h2>11. Feedback and Contact Information</h2>
          <p>
            We welcome your feedback on the accessibility of UltraSATPrep. Please let us know if you 
            encounter accessibility barriers or have suggestions for improvement.
          </p>
          <div className="contact-info">
            <p><strong>Accessibility Coordinator:</strong> accessibility@ultrasatprep.com</p>
            <p><strong>Phone:</strong> 1-800-ULTRASAT (1-800-858-7278)</p>
            <p><strong>TTY:</strong> 1-800-858-7279</p>
            <p><strong>General Support:</strong> support@ultrasatprep.com</p>
            <p><strong>Mailing Address:</strong><br />
               UltraSATPrep Accessibility Team<br />
               123 Education Street<br />
               Learning City, LC 12345
            </p>
          </div>
          
          <h3>11.1 Response Time</h3>
          <p>
            We aim to respond to accessibility inquiries within 2 business days and resolve 
            accessibility issues within 5 business days when possible.
          </p>
        </section>

        <section>
          <h2>12. Updates and Improvements</h2>
          <p>
            This accessibility statement is reviewed and updated regularly. We continuously monitor 
            accessibility standards and implement improvements to enhance the user experience for 
            all students.
          </p>
          <p>
            For the most current information about our accessibility features and ongoing improvements, 
            please check back regularly or contact our accessibility team.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Accessibility; 