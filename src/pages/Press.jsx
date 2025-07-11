import React from 'react';
import '../styles/Press.css';

function Press() {

  return (
    <div className="press-page">
      <div className="press-container">
        <h1>Press & Media</h1>
        <p className="press-subtitle">
          Media resources, company information, and the latest news from UltraSATPrep.
        </p>
        
        <section className="company-overview">
          <h2>Company Overview</h2>
          <p className="company-description">
            UltraSATPrep is a leading education technology company that provides AI-powered, 
            personalized SAT test preparation. Our adaptive learning platform helps students 
            achieve their highest potential by providing customized study paths, real-time 
            progress tracking, and comprehensive practice materials.
          </p>
        </section>



        <section className="guidelines">
          <h2>Media Guidelines</h2>
          <div className="guidelines-content">
            <h3>Using Our Brand</h3>
            <ul>
              <li>Always use "UltraSATPrep" as one word with capital U, SAT, and P</li>
              <li>Use our official logos and brand colors as provided in the media kit</li>
              <li>Do not modify, distort, or recreate our logos</li>
              <li>Maintain adequate white space around logos</li>
            </ul>
            
            <h3>Attribution</h3>
            <ul>
              <li>Please include a link to ultrasatprep.com in online articles</li>
              <li>Use official company descriptions and executive bios provided</li>
              <li>Contact us for fact-checking before publication</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Press; 