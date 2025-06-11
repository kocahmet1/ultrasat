import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useReview } from '../contexts/ReviewContext';
import { getHumanReadableSubcategory } from '../utils/subcategoryUtils';
import '../styles/ReviewTile.css';

/**
 * Dashboard tile that shows skills needing review
 * This component is displayed on the Dashboard/Progress page
 */
const ReviewTile = () => {
  const { needsReviewItems, dueItemsCount, isLoading, useRepairEngine } = useReview();
  const navigate = useNavigate();
  
  // Don't show anything if the Repair Engine is disabled
  if (!useRepairEngine) {
    return null;
  }
  
  // Determines which skills are due for review (dueAt <= now)
  const getDueItems = () => {
    const now = new Date();
    return needsReviewItems.filter(item => {
      const dueDate = item.dueAt instanceof Date ? item.dueAt : item.dueAt?.toDate();
      return dueDate && dueDate <= now;
    });
  };
  
  // All skills that need review
  const dueItems = getDueItems();
  
  // Format the due date in a readable way
  const formatDueDate = (date) => {
    if (!date) return 'Unknown';
    
    const dueDate = date instanceof Date ? date : date.toDate();
    const now = new Date();
    const diffMs = dueDate - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Due now';
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else {
      return `In ${diffDays} days`;
    }
  };
  
  // Handle clicking on a skill to view the lesson
  const handleViewLesson = (skillTag) => {
    navigate(`/lesson/${skillTag}`);
  };
  
  // Handle starting a practice drill for a skill
  const handleStartDrill = (skillTag) => {
    navigate(`/skill-drill/${skillTag}`);
  };
  
  if (isLoading) {
    return (
      <Card className="review-tile">
        <Card.Header>
          <h5>Skills to Review</h5>
        </Card.Header>
        <Card.Body className="text-center py-4">
          <div className="loading-spinner"></div>
          <p className="mt-3">Loading skills...</p>
        </Card.Body>
      </Card>
    );
  }
  
  return (
    <Card className="review-tile">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5>Skills to Review</h5>
        {dueItemsCount > 0 && (
          <Badge bg="danger" pill>{dueItemsCount}</Badge>
        )}
      </Card.Header>
      <Card.Body>
        {dueItems.length === 0 ? (
          <div className="text-center py-4">
            <p className="mb-0">{needsReviewItems.length > 0 ? "You're all caught up! No skills need review right now." : "Welcome! Complete questions to identify skills for review."}</p>
          </div>
        ) : (
          <div className="review-items-list">
            {dueItems.map((item, index) => (
              <div key={index} className="review-item">
                <div className="review-item-header">
                  <h6>{getHumanReadableSubcategory(item.skillTag)}</h6>
                  <Badge 
                    bg={item.wrongCount > 2 ? "danger" : "warning"} 
                    pill
                  >
                    {item.wrongCount > 1 ? `${item.wrongCount} mistakes` : "1 mistake"}
                  </Badge>
                </div>
                <div className="review-item-actions">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => handleViewLesson(item.skillTag)}
                  >
                    View Lesson
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => handleStartDrill(item.skillTag)}
                  >
                    Practice
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card.Body>
      <Card.Footer>
        <small className="text-muted">Complete skill drills to improve areas that need work</small>
      </Card.Footer>
    </Card>
  );
};

export default ReviewTile;
