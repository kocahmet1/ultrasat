import React, { useState } from 'react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { auth } from '../firebase/config';
import { Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography, Box, Card, CardContent, CircularProgress, Grid, Checkbox, FormControlLabel, Divider, IconButton, Tooltip, Alert } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { normalizeSubcategoryId } from '../utils/helpers';
import { getKebabCaseFromAnyFormat, getSubcategoryIdFromString } from '../utils/subcategoryConstants';

const QuestionGenerator = ({ subcategories }) => {
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
      
      // Get the current user's Firebase ID token for authentication
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('You must be logged in to generate questions');
      }
      
      const idToken = await currentUser.getIdToken();
      
      // Call the Cloud Function endpoint
      let questions;
      
      // Check if we're in development mode or the function isn't deployed yet
      const useDevMode = process.env.NODE_ENV === 'development' || true;
      
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
        // Use the actual Cloud Function
        const functionUrl = 'https://us-central1-bluebook-practice.cloudfunctions.net/generateQuestions';
        
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
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
      const selectedQuestionsToSave = generatedQuestions.filter(q => 
        selectedQuestions.includes(q.id)
      );
      
      if (selectedQuestionsToSave.length === 0) {
        setError('No questions selected to save');
        setStatus('preview');
        return;
      }
      
      // Check for duplicates before saving
      const potentialDuplicates = [];
      for (const question of selectedQuestionsToSave) {
        const querySnapshot = await getDocs(
          query(collection(db, 'questions'), where('text', '==', question.text))
        );
        
        if (!querySnapshot.empty) {
          potentialDuplicates.push(question.text.substring(0, 30) + '...');
        }
      }
      
      if (potentialDuplicates.length > 0) {
        setError(`Potential duplicates found: ${potentialDuplicates.join(', ')}. Please review and edit questions.`);
        setStatus('preview');
        return;
      }
      
      // Save each question to Firestore
      const savedQuestions = [];
      for (const question of selectedQuestionsToSave) {
        // Remove the temporary id before saving
        const { id, regenerating, ...questionData } = question;
        
        // CRITICAL FIX: Ensure both subcategoryId and subcategory fields are properly set
        // This ensures compatibility with both legacy systems and the new smart quiz system
        const subcategorySource = question.subCategory || question.subcategory;
        
        if (subcategorySource) {
          // Get numeric ID for backward compatibility
          const numericSubcategoryId = getSubcategoryIdFromString(subcategorySource);
          if (numericSubcategoryId) {
            questionData.subcategoryId = numericSubcategoryId;
          }
          
          // Set canonical kebab-case format for smart quiz compatibility
          const kebabSubcategory = getKebabCaseFromAnyFormat(subcategorySource);
          if (kebabSubcategory) {
            questionData.subcategory = kebabSubcategory;
          } else {
            // Fallback to original format if normalization fails
            questionData.subcategory = subcategorySource;
          }
          
          console.log(`QuestionGenerator: Saving question with subcategoryId=${numericSubcategoryId}, subcategory=${questionData.subcategory}`);
        }
        
        // Add created timestamp
        questionData.createdAt = new Date().toISOString();
        questionData.createdBy = auth.currentUser?.uid || 'unknown';
        
        // Add to Firestore
        const docRef = await addDoc(collection(db, 'questions'), questionData);
        savedQuestions.push({ id: docRef.id, ...questionData });
      }
      
      setStatus('idle');
      setGeneratedQuestions([]);
      setSelectedQuestions([]);
      setError(null);
      
      // Success message - using a more subtle approach than alert()
      const saveCount = savedQuestions.length;
      const successMessage = `Successfully saved ${saveCount} question${saveCount !== 1 ? 's' : ''}!`;
      
      // We'll display this as an alert in the UI
      setError(null);
      alert(successMessage);
      
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
      
      // Check if we're in development mode or the function isn't deployed yet
      const useDevMode = process.env.NODE_ENV === 'development' || true;
      
      let newQuestion;
      
      if (useDevMode) {
        // Mock regenerate one question
        await new Promise(resolve => setTimeout(resolve, 1500));
        newQuestion = (await generateMockQuestions(subcategoryName, difficulty, 1, includePassage))[0];
      } else {
        // Get the current user's Firebase ID token for authentication
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('You must be logged in to regenerate questions');
        }
        
        const idToken = await currentUser.getIdToken();
        
        // Call the Cloud Function endpoint to regenerate just one question
        const functionUrl = 'https://us-central1-[YOUR-FIREBASE-PROJECT-ID].cloudfunctions.net/generateQuestions';
        
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
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
  
  // For development purposes, you can uncomment this to see what a real AI response might look like
  // This is helpful for testing the UI with more realistic data
  const mockAIResponseExample = {
    "questions": [
      {
        "text": "Based on the passage, what is the main purpose of photosynthesis in plants?",
        "choices": [
          {"id": "A", "text": "To produce oxygen as a waste product"},
          {"id": "B", "text": "To convert light energy into chemical energy"},
          {"id": "C", "text": "To absorb carbon dioxide from the atmosphere"},
          {"id": "D", "text": "To create chlorophyll in the leaves"}
        ],
        "correctChoice": "B",
        "explanation": "The passage states that photosynthesis is the process by which plants convert light energy from the sun into chemical energy in the form of glucose. While producing oxygen and absorbing carbon dioxide are part of the process, they are not the main purpose. Creating chlorophyll is not the purpose of photosynthesis; rather, chlorophyll is the pigment that enables photosynthesis to occur.",
        "difficulty": "medium",
        "subCategory": "Central Ideas and Details",
        "subcategoryId": "central-ideas-details",
        "passage": "Photosynthesis is the process by which plants convert light energy from the sun into chemical energy in the form of glucose. This process occurs primarily in the leaves, where specialized structures called chloroplasts contain the green pigment chlorophyll, which absorbs light energy. During photosynthesis, plants take in carbon dioxide from the air through tiny pores called stomata and water from the soil through their roots. Using the energy from sunlight, plants combine carbon dioxide and water to produce glucose and oxygen. The glucose serves as food for the plant, providing energy and raw materials for growth, while oxygen is released into the atmosphere as a byproduct. This remarkable process not only sustains plant life but also produces the oxygen that animals, including humans, need to breathe, and removes carbon dioxide, a greenhouse gas, from the atmosphere."
      }
    ]
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

export default QuestionGenerator;
