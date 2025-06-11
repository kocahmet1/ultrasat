import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { auth } from '../firebase/config';
import { Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography, Box, Card, CardContent, CircularProgress, Grid, Checkbox, FormControlLabel, Divider, IconButton, Tooltip, Alert } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { normalizeSubcategoryId } from '../utils/helpers';
import { getKebabCaseFromAnyFormat } from '../utils/subcategoryConstants';

const QuestionGeneratorLive = ({ subcategories }) => {
  // Generator state
  const [subcategory, setSubcategory] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [quantity, setQuantity] = useState(5);
  const [includePassage, setIncludePassage] = useState(false);
  
  // Process state
  const [status, setStatus] = useState('idle'); // idle, generating, preview, saving
  const [error, setError] = useState(null);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  
  // Editor state
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // Handle form submission
  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (!subcategory) {
      setError('Please select a subcategory');
      return;
    }
    
    if (quantity < 1 || quantity > 20) {
      setError('Please select between 1-20 questions');
      return;
    }
    
    setStatus('generating');
    setError(null);
    
    try {
      // Find the full subcategory name for better prompting
      const subcategoryObj = subcategories.find(s => s.id === subcategory);
      const subcategoryName = subcategoryObj ? subcategoryObj.name : subcategory;
      
      // Authentication is handled on the server side
      // We'll add client-side auth checks back when deployed to production
      // For now, we're using a development mode that doesn't require authentication
      
      // Call the Cloud Function endpoint
      let questions;
      
      // IMPORTANT: Using the real API, not mock data
      const useDevMode = false;
      
      if (useDevMode) {
        // Use mock data in development
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        questions = await generateMockQuestions(
          subcategoryName, 
          difficulty, 
          quantity, 
          includePassage
        );
      } else {
        // Use our new API service (update this URL when deployed to Render.com)
        const apiUrl = 'http://localhost:3001/api/generate-questions';
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
            // No authorization header needed during development
            // We'll add this back when deployed to production
          },
          body: JSON.stringify({ 
            subcategory: subcategoryName, 
            difficulty, 
            quantity,
            includePassage 
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate questions');
        }
        
        const data = await response.json();
        questions = data.questions;
      }
      
      setGeneratedQuestions(questions);
      setSelectedQuestions(questions.map(q => q.id));
      setStatus('preview');
    } catch (err) {
      console.error('Error generating questions:', err);
      setError(err.message || 'Failed to generate questions. Please try again.');
      setStatus('idle');
    }
  };

  const handleSaveQuestions = async () => {
    setStatus('saving');
    
    try {
      const questionsToSave = generatedQuestions.filter(q => 
        selectedQuestions.includes(q.id)
      );
      
      let savedCount = 0;
      const warnings = [];
      
      for (const question of questionsToSave) {
        // Ensure we don't save the temporary ID
        const questionToSave = { ...question };
        delete questionToSave.id;
        
        // Normalize difficulty before saving
        let originalDifficulty = questionToSave.difficulty;
        let normalizedDifficulty = 'medium'; // Default
        
        if (typeof originalDifficulty === 'string') {
          const lowerDifficulty = originalDifficulty.toLowerCase();
          if (lowerDifficulty === 'easy') normalizedDifficulty = 'easy';
          else if (lowerDifficulty === 'medium') normalizedDifficulty = 'medium';
          else if (lowerDifficulty === 'hard') normalizedDifficulty = 'hard';
          // If unknown string, defaults to 'medium'
        } else {
          // If not a string (or missing), defaults to 'medium'
          warnings.push(`AI question difficulty was missing or invalid ('${originalDifficulty}'), defaulted to 'medium'. Text: ${questionToSave.text.substring(0, 30)}...`);
        }
        questionToSave.difficulty = normalizedDifficulty;
        
        // Normalize subcategory ID (use the helper function)
        const subcategorySource = questionToSave.subCategory || questionToSave.subcategory;
        
        if (subcategorySource) {
          // Get numeric ID for backward compatibility
          const numericSubcategoryId = normalizeSubcategoryId(subcategorySource);
          if (numericSubcategoryId) {
            questionToSave.subcategoryId = numericSubcategoryId;
          }
          
          // Set canonical kebab-case format for smart quiz compatibility
          const kebabSubcategory = getKebabCaseFromAnyFormat(subcategorySource);
          if (kebabSubcategory) {
            questionToSave.subcategory = kebabSubcategory;
          } else {
            // Fallback to original format if normalization fails
            questionToSave.subcategory = subcategorySource;
          }
          
          console.log(`QuestionGeneratorLive: Saving question with subcategoryId=${numericSubcategoryId}, subcategory=${questionToSave.subcategory}`);
        } else {
          warnings.push(`Could not normalize subcategory for AI question: '${questionToSave.subCategory}'. Text: ${questionToSave.text.substring(0, 30)}...`);
        }
        
        // Ensure skillTags exist, add subcategory as a default tag
        if (!questionToSave.skillTags || !Array.isArray(questionToSave.skillTags)) {
          questionToSave.skillTags = [];
        }
        if (questionToSave.subCategory && !questionToSave.skillTags.includes(questionToSave.subCategory)) {
          questionToSave.skillTags.push(questionToSave.subCategory); 
        }
        
        // Add timestamps
        questionToSave.createdAt = new Date();
        questionToSave.updatedAt = new Date();
        
        // Save to Firestore
        await addDoc(collection(db, 'questions'), questionToSave);
        savedCount++;
      }
      
      // Display feedback
      let feedbackMessage = `Successfully saved ${savedCount} questions.`;
      if (warnings.length > 0) {
        feedbackMessage += `\n\nWarnings encountered:\n- ${warnings.slice(0, 5).join('\n- ')}`;
        if (warnings.length > 5) feedbackMessage += `\n...and ${warnings.length - 5} more.`;
      }
      alert(feedbackMessage); // Consider using a more robust notification system
      
      setStatus('idle');
      setGeneratedQuestions([]);
      setSelectedQuestions([]);
      setError(null);
    } catch (err) {
      console.error('Error saving questions:', err);
      setError(`Failed to save questions: ${err.message}`);
      setStatus('preview');
    }
  };

  const handleRegenerateQuestion = async (questionId) => {
    setGeneratedQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return { ...q, regenerating: true };
      }
      return q;
    }));
    
    try {
      // Find the full subcategory name for better prompting
      const subcategoryObj = subcategories.find(s => s.id === subcategory);
      const subcategoryName = subcategoryObj ? subcategoryObj.name : subcategory;
      
      // Get the current question to regenerate
      const questionToRegenerate = generatedQuestions.find(q => q.id === questionId);
      
      // IMPORTANT: Using the real API, not mock data
      const useDevMode = false;
      
      let newQuestion;
      
      if (useDevMode) {
        // Mock regenerate one question
        await new Promise(resolve => setTimeout(resolve, 1500));
        newQuestion = (await generateMockQuestions(subcategoryName, difficulty, 1, includePassage))[0];
      } else {
        // Use our new API service for regenerating a question
        const apiUrl = 'http://localhost:3001/api/generate-questions';
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
            // No authorization header needed during development
          },
          body: JSON.stringify({ 
            subcategory: subcategoryName, 
            difficulty: questionToRegenerate.difficulty,
            quantity: 1,
            includePassage: !!questionToRegenerate.passage
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to regenerate question');
        }
        
        const data = await response.json();
        newQuestion = data.questions[0];
      }
      
      // Keep the same ID
      newQuestion.id = questionId;
      
      setGeneratedQuestions(prev => prev.map(q => {
        if (q.id === questionId) {
          return newQuestion;
        }
        return q;
      }));
    } catch (err) {
      console.error('Error regenerating question:', err);
      
      // Remove the regenerating flag
      setGeneratedQuestions(prev => prev.map(q => {
        if (q.id === questionId) {
          return { ...q, regenerating: false };
        }
        return q;
      }));
      
      setError(`Failed to regenerate question: ${err.message}`);
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
  };

  const handleSaveEdit = (editedQuestion) => {
    setGeneratedQuestions(prev => 
      prev.map(q => q.id === editedQuestion.id ? editedQuestion : q)
    );
    setEditingQuestion(null);
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
  };

  const handleToggleSelection = (questionId) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  const handleDeleteQuestion = (questionId) => {
    setGeneratedQuestions(prev => prev.filter(q => q.id !== questionId));
    setSelectedQuestions(prev => prev.filter(id => id !== questionId));
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedQuestions(generatedQuestions.map(q => q.id));
    } else {
      setSelectedQuestions([]);
    }
  };

  // This function generates mock questions for development/preview purposes
  const generateMockQuestions = async (subcategoryName, difficulty, quantity, includePassage) => {
    // For development, generate mock questions that match your schema
    const mockQuestions = [];
    
    // If including a passage, create one mock passage
    let passage = null;
    if (includePassage) {
      passage = `This is a sample passage about ${subcategoryName}. It would contain relevant information that the questions will refer to. In a real implementation, this would be generated by the LLM based on the subcategory.`;
    }
    
    for (let i = 0; i < quantity; i++) {
      const mockQuestion = {
        id: `temp-${Date.now()}-${i}`, // Temporary ID
        text: `Sample ${subcategoryName} question #${i+1} (${difficulty} difficulty)`,
        choices: [
          { id: 'A', text: 'Sample answer choice A' },
          { id: 'B', text: 'Sample answer choice B' },
          { id: 'C', text: 'Sample answer choice C' },
          { id: 'D', text: 'Sample answer choice D' }
        ],
        correctChoice: 'A',
        explanation: `This explanation would describe why A is the correct answer for this ${subcategoryName} question.`,
        difficulty: difficulty,
        subCategory: subcategoryName,
        subcategoryId: normalizeSubcategoryId(subcategoryName),
        passage: passage
      };
      
      mockQuestions.push(mockQuestion);
    }
    
    return mockQuestions;
  };

  // Question Editor component (could be moved to its own file)
  const QuestionEditor = ({ question, onSave, onCancel }) => {
    const [editedQuestion, setEditedQuestion] = useState({ ...question });
    
    const handleChange = (field, value) => {
      setEditedQuestion(prev => ({ ...prev, [field]: value }));
    };
    
    const handleChoiceChange = (choiceId, text) => {
      setEditedQuestion(prev => ({
        ...prev,
        choices: prev.choices.map(c => 
          c.id === choiceId ? { ...c, text } : c
        )
      }));
    };
    
    return (
      <Box sx={{ p: 2, mb: 3, border: '1px solid #e0e0e0', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>Edit Question</Typography>
        
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Question Text"
          value={editedQuestion.text}
          onChange={(e) => handleChange('text', e.target.value)}
          margin="normal"
        />
        
        {editedQuestion.passage && (
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Passage"
            value={editedQuestion.passage}
            onChange={(e) => handleChange('passage', e.target.value)}
            margin="normal"
          />
        )}
        
        <Typography variant="subtitle1" sx={{ mt: 2 }}>Answer Choices</Typography>
        
        {editedQuestion.choices.map((choice) => (
          <Box key={choice.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={editedQuestion.correctChoice === choice.id}
                  onChange={() => handleChange('correctChoice', choice.id)}
                />
              }
              label={`${choice.id}.`}
            />
            <TextField
              fullWidth
              value={choice.text}
              onChange={(e) => handleChoiceChange(choice.id, e.target.value)}
              size="small"
            />
          </Box>
        ))}
        
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Explanation"
          value={editedQuestion.explanation}
          onChange={(e) => handleChange('explanation', e.target.value)}
          margin="normal"
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button variant="outlined" onClick={onCancel} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => onSave(editedQuestion)}
            startIcon={<SaveIcon />}
          >
            Save Changes
          </Button>
        </Box>
      </Box>
    );
  };

  // Render the question card
  const renderQuestionCard = (question) => {
    const isSelected = selectedQuestions.includes(question.id);
    
    return (
      <Card 
        key={question.id} 
        sx={{ 
          mb: 2, 
          border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
          opacity: isSelected ? 1 : 0.7
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isSelected}
                  onChange={() => handleToggleSelection(question.id)}
                />
              }
              label={`Question (${question.difficulty})`}
            />
            
            <Box>
              <Tooltip title="Edit Question">
                <IconButton onClick={() => handleEditQuestion(question)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Regenerate Question">
                <IconButton 
                  onClick={() => handleRegenerateQuestion(question.id)}
                  disabled={question.regenerating}
                >
                  {question.regenerating ? 
                    <CircularProgress size={20} /> : 
                    <RefreshIcon />
                  }
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Delete Question">
                <IconButton onClick={() => handleDeleteQuestion(question.id)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          {question.passage && (
            <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>Passage:</Typography>
              <Typography variant="body2">{question.passage}</Typography>
            </Box>
          )}
          
          <Typography variant="body1" gutterBottom>
            <strong>Q:</strong> {question.text}
          </Typography>
          
          <Box sx={{ pl: 2, mt: 1 }}>
            {question.choices.map((choice) => (
              <Typography 
                key={choice.id} 
                variant="body2" 
                sx={{ 
                  mb: 0.5, 
                  fontWeight: choice.id === question.correctChoice ? 'bold' : 'normal',
                  color: choice.id === question.correctChoice ? 'success.main' : 'text.primary'
                }}
              >
                {choice.id}. {choice.text} 
                {choice.id === question.correctChoice && ' ✓'}
              </Typography>
            ))}
          </Box>
          
          <Box sx={{ mt: 2, bgcolor: '#f8f8f8', p: 1, borderRadius: 1 }}>
            <Typography variant="subtitle2" color="textSecondary">Explanation:</Typography>
            <Typography variant="body2">{question.explanation}</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="question-generator">
      <Typography variant="h5" gutterBottom>AI Question Generator</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {status === 'idle' || status === 'generating' ? (
        <form onSubmit={handleGenerate}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Subcategory</InputLabel>
                <Select
                  value={subcategory}
                  label="Subcategory"
                  onChange={(e) => setSubcategory(e.target.value)}
                  disabled={status === 'generating'}
                >
                  <MenuItem value="">
                    <em>Select a subcategory</em>
                  </MenuItem>
                  {subcategories.map((subcategory) => (
                    <MenuItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={difficulty}
                  label="Difficulty"
                  onChange={(e) => setDifficulty(e.target.value)}
                  disabled={status === 'generating'}
                >
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="hard">Hard</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                InputProps={{ inputProps: { min: 1, max: 20 } }}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                disabled={status === 'generating'}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includePassage}
                    onChange={(e) => setIncludePassage(e.target.checked)}
                    disabled={status === 'generating'}
                  />
                }
                label="Include Reading Passage"
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={status === 'generating'}
              startIcon={status === 'generating' ? <CircularProgress size={20} /> : null}
            >
              {status === 'generating' ? 'Generating...' : 'Generate Questions'}
            </Button>
          </Box>
        </form>
      ) : (
        <Box>
          {editingQuestion ? (
            <QuestionEditor
              question={editingQuestion}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          ) : null}
          
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedQuestions.length === generatedQuestions.length}
                  indeterminate={selectedQuestions.length > 0 && selectedQuestions.length < generatedQuestions.length}
                  onChange={handleSelectAll}
                />
              }
              label={`${selectedQuestions.length} of ${generatedQuestions.length} questions selected`}
            />
            
            <Box>
              <Button
                variant="outlined"
                onClick={() => setStatus('idle')}
                sx={{ mr: 2 }}
                disabled={status === 'saving'}
              >
                Cancel
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveQuestions}
                disabled={selectedQuestions.length === 0 || status === 'saving'}
                startIcon={status === 'saving' ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                {status === 'saving' ? 'Saving...' : 'Save Selected Questions'}
              </Button>
            </Box>
          </Box>
          
          {generatedQuestions.map(renderQuestionCard)}
        </Box>
      )}
    </div>
  );
};

export default QuestionGeneratorLive;
