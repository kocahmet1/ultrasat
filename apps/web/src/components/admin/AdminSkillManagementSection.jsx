import React from 'react';

function AdminSkillManagementSection({
  onCreateSkill,
  onEditSkill,
  skillTags
}) {
  return (
    <div className="skills-tab">
      <div className="tab-header">
        <h2>Skill Management</h2>
        <button className="primary-button" onClick={onCreateSkill}>
          Create Skill Tag
        </button>
      </div>

      <div className="skills-list">
        {skillTags.length === 0 ? (
          <div className="no-results">
            <p>No skill tags found. Create your first skill tag to get started.</p>
          </div>
        ) : (
          skillTags.map(skill => (
            <div key={skill.id} className="skill-item">
              <div className="skill-content">
                <h3>{skill.name}</h3>
                <p>{skill.description || 'No description'}</p>
              </div>
              <div className="skill-meta">
                <span>Category: {skill.category || 'Uncategorized'}</span>
              </div>
              <div className="skill-actions">
                <button onClick={() => onEditSkill(skill.id)}>
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminSkillManagementSection;
