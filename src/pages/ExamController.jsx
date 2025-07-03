import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubcategories } from '../contexts/SubcategoryContext';
import ExamModule from '../components/ExamModule';
import Intermission from '../components/Intermission';
import { 
  getExamModuleByNumber, 
  getExamModuleQuestions, 
  enrichQuestionWithNewCategories 
} from '../firebase/services';
import { enrichQuestionsWithNewCategories } from '../utils/categoryUtils';
import { enrichQuestionsWithSubcategory } from '../utils/subcategoryUtils';
import { recordSubcategoryProgress } from '../firebase/subcategoryServices';

function ExamController() {
  const navigate = useNavigate();
  const { moduleId } = useParams();
  const { currentUser, saveComprehensiveExamResult } = useAuth();
  const { getSubcategoryNameById } = useSubcategories();
  
  // Store questions for each module separately
  const [moduleQuestions, setModuleQuestions] = useState({
    1: [],
    2: [],
    3: [],
    4: []
  });
  const [currentModuleQuestions, setCurrentModuleQuestions] = useState([]);
  
  // Track responses for skill analysis
  const [examResponses, setExamResponses] = useState([]);
  
  const [moduleData, setModuleData] = useState({
    1: { answers: [], crossedOut: {} },
    2: { answers: [], crossedOut: {} },
    3: { answers: [], crossedOut: {} },
    4: { answers: [], crossedOut: {} }
  });
  
  // Module metadata
  const [moduleMetadata, setModuleMetadata] = useState({
    1: { title: "Module 1: Reading and Writing", calculatorAllowed: false },
    2: { title: "Module 2: Reading and Writing", calculatorAllowed: false },
    3: { title: "Module 3: Math - No Calculator", calculatorAllowed: false },
    4: { title: "Module 4: Math - Calculator Allowed", calculatorAllowed: true }
  });
  
  const [score, setScore] = useState(0);
  const [intermissionTime, setIntermissionTime] = useState(10 * 60); // 10 minutes
  const [isLoading, setIsLoading] = useState(true);
  const [loadedModules, setLoadedModules] = useState([]);
  const [loadError, setLoadError] = useState(null);
  
  // Debug logging
  useEffect(() => {
    console.log('ExamController initialized with moduleId:', moduleId);
  }, [moduleId]);

  // Load questions for all modules when the component mounts
  useEffect(() => {
    const loadAllModuleQuestions = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        
        console.log('Loading questions for all modules from Firebase...');
        
        // Define module numbers to load
        const moduleNumbers = [1, 2, 3, 4];
        const loadedModuleData = {};
        const updatedModuleMetadata = { ...moduleMetadata };
        const loadedQuestions = {};
        const successfullyLoadedModules = [];
        
        // Load each module and its questions
        for (const moduleNumber of moduleNumbers) {
          try {
            // Load the module metadata
            const moduleInfo = await getExamModuleByNumber(moduleNumber);
            
            // Update module metadata
            updatedModuleMetadata[moduleNumber] = {
              title: moduleInfo.title || `Module ${moduleNumber}`,
              calculatorAllowed: moduleInfo.calculatorAllowed || moduleNumber === 4,
              timeLimit: moduleInfo.timeLimit || 1920, // 32 minutes in seconds
              description: moduleInfo.description || ''
            };
            
            // Load the module questions
            const questions = await getExamModuleQuestions(moduleInfo.id);
            
            // Ensure all questions have proper category paths and skill tags
            const enrichedQuestions = questions.map(q => enrichQuestionWithNewCategories(q));
            
            // Save the questions
            loadedQuestions[moduleNumber] = enrichedQuestions;
            successfullyLoadedModules.push(moduleNumber);
            
            console.log(`Loaded ${enrichedQuestions.length} questions for module ${moduleNumber}`);
          } catch (error) {
            console.error(`Error loading module ${moduleNumber}:`, error);
            // Continue with other modules if one fails
          }
        }
        
        // Update state with loaded data
        if (Object.keys(loadedQuestions).length > 0) {
          setModuleQuestions(loadedQuestions);
          setLoadedModules(successfullyLoadedModules);
          setModuleMetadata(updatedModuleMetadata);
          setIsLoading(false);
        } else {
          // If no modules were loaded successfully
          setLoadError('No exam modules found. Please create modules in the admin dashboard.');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading all module questions:', error);
        setLoadError('An error occurred while loading exam modules. Please try again later.');
        setIsLoading(false);
      }
    };
    
    loadAllModuleQuestions();
  }, []);
  
  // Update current module questions when moduleId changes
  useEffect(() => {
    if (moduleId && /^\d+$/.test(moduleId)) {
      const currentModule = parseInt(moduleId);
      if (moduleQuestions[currentModule]) {
        console.log(`Setting current module questions for module ${currentModule}`);
        setCurrentModuleQuestions(moduleQuestions[currentModule]);
      }
    }
  }, [moduleId, moduleQuestions]);

  // Helper function to initialize new module data
  const initializeNewModuleData = (allModuleQuestions) => {
    console.log('Initializing new module data for all modules');
    const initialModuleData = {};
    
    // Initialize data for each module
    for (let moduleNum = 1; moduleNum <= 4; moduleNum++) {
      const questions = allModuleQuestions[moduleNum] || [];
      initialModuleData[moduleNum] = { 
        answers: new Array(questions.length).fill(''), 
        crossedOut: {} 
      };
      
      // Initialize crossed out options
      questions.forEach((_, index) => {
        ['A', 'B', 'C', 'D'].forEach(letter => {
          initialModuleData[moduleNum].crossedOut[`${index}-${letter}`] = false;
        });
      });
    }
    
    setModuleData(initialModuleData);
  };

  // Handle module completion
  const handleModuleComplete = async (data) => {
    const { moduleNumber, answers, crossedOut } = data;
    console.log('ExamController: handleModuleComplete called with moduleNumber:', moduleNumber);
    console.log('Answers received:', answers);
    
    // Track detailed responses for skill analysis
    const currentQuestions = moduleQuestions[moduleNumber];
    const moduleResponses = answers.map((answer, index) => {
      const question = currentQuestions[index];
      const startTime = Date.now() - Math.floor(Math.random() * 60000); // Simulated start time
      const endTime = Date.now(); // Current time as end time
      
      return {
        question,
        selectedAnswer: answer,
        isCorrect: (answer === (question.answer || question.correct)),
        moduleId: moduleNumber,
        timeSpent: (endTime - startTime) / 1000, // in seconds
        timestamp: new Date().toISOString()
      };
    });
    
    // Add these responses to our tracked responses
    setExamResponses(prev => [...prev, ...moduleResponses]);
    
    // Record each question attempt for progress tracking
    try {
      if (currentUser && currentUser.uid) {
        await Promise.all(
          moduleResponses.map(resp => {
            return recordSubcategoryProgress(
              currentUser.uid,
              resp.question,
              resp.isCorrect,
              resp.timeSpent,
              'practice-exam'
            );
          })
        );
      }
    } catch (error) {
      console.error('Error recording subcategory progress:', error);
    }
    
    // Update module data
    setModuleData(prev => {
      const newData = { ...prev };
      newData[moduleNumber] = { answers, crossedOut };
      return newData;
    });
    
    // Store the current module state in sessionStorage to persist during navigation
    const updatedModuleData = {
      ...moduleData,
      [moduleNumber]: { answers, crossedOut }
    };
    

    // Save module data
    setModuleData(prevData => ({
      ...prevData,
      [data.moduleNumber]: {
        answers: data.answers,
        crossedOut: data.crossedOut
      }
    }));

    // Save last module ID for results page
    localStorage.setItem('lastModuleId', data.moduleNumber);

    // Process and store question responses with skill tags for later analysis
    if (data.questions && data.questions.length > 0) {
      const moduleResponses = data.questions.map((question, index) => {
        const selectedAnswer = data.answers[index] || '';
        // Use question.answer if available, otherwise fall back to question.correct
        const correctAnswer = question.answer || question.correct || '';
        const isCorrect = selectedAnswer === correctAnswer;

        return {
          question: {
            ...question,
            id: question.id || `module-${data.moduleNumber}-q-${index}`,
            // Use subcategory information instead of skill tags
            subcategoryId: question.subcategoryId || (question.subCategory ? question.subCategory.toLowerCase().replace(/\s+/g, '-') : '')
          },
          selectedAnswer,
          isCorrect,
          moduleId: data.moduleNumber,
          timeSpent: 60 + Math.floor(Math.random() * 60), // Simulated time between 60-120 seconds
          timestamp: new Date().toISOString()
        };
      });

      // Add these responses to the overall exam responses
      setExamResponses(prev => [...prev, ...moduleResponses]);
    }

    // Determine next module or finish
    const nextModule = data.moduleNumber + 1;

    // If we've completed all 4 modules, calculate score and navigate to results
    if (nextModule > 4) {
      calculateScore();
      return;
    }

    // If we've completed module 2, go to intermission
    if (nextModule === 3) {
      navigate('/exam/intermission');
      return;
    }

    // Otherwise, go to the next module
    navigate(`/exam/${nextModule}`);
  };

  // Handle intermission completion
  const handleIntermissionComplete = () => {
    navigate('/exam/3');
  };

  // Calculate the final score and save the exam results to Firestore
  const calculateScore = async () => {
    // Calculate final score across all modules
    let correctAnswers = 0;
    let totalQuestions = 0;
    let allResponses = [];
    let readingWritingCorrect = 0;
    let readingWritingTotal = 0;
    let mathCorrect = 0;
    let mathTotal = 0;
    
    // First use detailed response data if available
    if (examResponses.length > 0) {
      console.log('Using tracked exam responses:', examResponses.length);
      console.log('Correct answers count:', examResponses.filter(r => r.isCorrect).length);
      console.log('Sample responses:', examResponses.slice(0, 3));
      correctAnswers = examResponses.filter(r => r.isCorrect).length;
      totalQuestions = examResponses.length;
      allResponses = examResponses;
      
      // Calculate section scores (Reading/Writing vs Math)
      examResponses.forEach(response => {
        const moduleNum = response.moduleId;
        if (moduleNum <= 2) { // Reading/Writing modules
          readingWritingTotal++;
          if (response.isCorrect) readingWritingCorrect++;
        } else { // Math modules
          mathTotal++;
          if (response.isCorrect) mathCorrect++;
        }
      });
    } else {
      console.log('Fallback: Calculating from module data');
      // Fallback: Calculate from module data if we don't have tracked responses
      
      // Calculate score for each module and collect detailed response data
      for (let moduleNum = 1; moduleNum <= 4; moduleNum++) {
        const moduleAnswers = moduleData[moduleNum].answers;
        const questions = moduleQuestions[moduleNum];
        
        if (questions && questions.length > 0) {
          // Ensure questions have subcategory information
          const enrichedQuestions = enrichQuestionsWithSubcategory(questions);
          
          enrichedQuestions.forEach((question, index) => {
            // Check if the answer property exists; if not, fall back to 'correct'
            const correctAnswer = question.answer || question.correct;
            
            // Normalize answer types for comparison (convert both to strings)
            const userAnswer = String(moduleAnswers[index]);
            const correctAnswerStr = String(correctAnswer);
            const isCorrect = userAnswer === correctAnswerStr;
            
            console.log(`Question ${index} comparison:`, { 
              userAnswer, 
              correctAnswer: correctAnswerStr, 
              isCorrect,
              userAnswerType: typeof moduleAnswers[index],
              correctAnswerType: typeof correctAnswer
            });
            
            if (isCorrect) {
              correctAnswers++;
              
              // Increment section counters
              if (moduleNum <= 2) { // Reading/Writing
                readingWritingCorrect++;
              } else { // Math
                mathCorrect++;
              }
            }
            
            totalQuestions++;
            
            // Increment section total counters
            if (moduleNum <= 2) { // Reading/Writing
              readingWritingTotal++;
            } else { // Math
              mathTotal++;
            }
            
            // Add to detailed responses for skill tracking
            if (moduleAnswers[index]) {
              // Normalize subcategory if present
              let subcategory = question.subcategory || '';
              let subcategoryId = question.subcategoryId || null;
              
              allResponses.push({
                question: {
                  ...question,
                  id: question.id || `module-${moduleNum}-q-${index}`
                },
                questionId: question.id || `module-${moduleNum}-q-${index}`,
                userAnswer: moduleAnswers[index],
                correctAnswer: correctAnswer,
                isCorrect,
                moduleId: moduleNum,
                timeSpent: 60 + Math.floor(Math.random() * 60), // Simulated time between 60-120 seconds
                subcategory,
                subcategoryId,
                category: question.category || (moduleNum <= 2 ? 'reading-writing' : 'math'),
                mainCategory: question.mainCategory || '',
                timestamp: new Date().toISOString()
              });
            }
          });
        }
      }
    }
    
    // Calculate percentage score
    const percentageScore = Math.round((correctAnswers / totalQuestions) * 100);
    setScore(percentageScore);
    
    // Calculate scaled section scores (for SAT-like 800 scale per section)
    const readingWritingScore = Math.round((200 + (readingWritingCorrect / (readingWritingTotal || 1)) * 600) / 10) * 10;
    const mathScore = Math.round((200 + (mathCorrect / (mathTotal || 1)) * 600) / 10) * 10;
    
    // Save score to local storage for backward compatibility
    localStorage.setItem('examScore', percentageScore);
    localStorage.setItem('examAnswered', correctAnswers);
    localStorage.setItem('examTotal', totalQuestions);
    localStorage.setItem('examResponses', JSON.stringify(allResponses));
    localStorage.setItem('examModules', JSON.stringify(Object.values(moduleMetadata)));
    
    // Create a timestamp for the current date
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
    
    // Create the summary object for the exam
    const examSummary = {
      examTitle: `SAT Practice Exam - ${dateStr}`,
      overallScore: percentageScore,
      scores: {
        readingWriting: readingWritingScore,
        math: mathScore
      },
      totalQuestions,
      correctAnswers,
      moduleData: Object.values(moduleMetadata),
      modules: Object.values(moduleMetadata).map(module => ({
        id: module.id || `module-${module.moduleNumber || 1}`,
        title: module.title,
        moduleNumber: module.moduleNumber,
        calculatorAllowed: module.calculatorAllowed
      }))
    };
    
    // If the user is logged in, save to Firebase
    if (currentUser && saveComprehensiveExamResult) {
      try {
        console.log('Saving exam result to Firestore with summary:', {
          totalQuestions,
          correctAnswers,
          percentageScore,
          readingWritingScore,
          mathScore
        });
        console.log('Sample responses being saved:', allResponses.slice(0, 3));
        const savedExam = await saveComprehensiveExamResult(examSummary, allResponses);
        console.log('Exam saved successfully with ID:', savedExam.id);
        
        // Redirect to results with the new exam ID
        navigate(`/exam/results/${savedExam.id}`, { 
          state: { examId: savedExam.id, fromExam: true } 
        });
        return;
      } catch (error) {
        console.error('Error saving exam result:', error);
        // Still navigate to results in case of error, but use the legacy route
        navigate('/exam/results');
        return;
      }
    } else {
      console.log('User not logged in or saveComprehensiveExamResult not available. Using local storage only.');
      navigate('/exam/results');
    }
  };
  
  // Show error message if there was an error
  if (loadError) {
    return <div className="error-message">{loadError}</div>;
  }

  // Handle intermission separately before any other checks
  if (moduleId === 'intermission') {
    console.log('Rendering intermission component');
    return (
      <Intermission 
        onProceed={handleIntermissionComplete}
        timeRemaining={intermissionTime}
        setTimeRemaining={setIntermissionTime}
      />
    );
  }

  // For module routes, render the appropriate module
  const currentModule = parseInt(moduleId);
  
  if (currentModule >= 1 && currentModule <= 4 && loadedModules.includes(currentModule)) {
    // Get module metadata
    const { title: moduleTitle, calculatorAllowed } = moduleMetadata[currentModule] || {
      title: `Module ${currentModule}`,
      calculatorAllowed: currentModule === 4
    };
    
    const questions = moduleQuestions[currentModule] || [];
    console.log(`Rendering module ${currentModule} with ${questions.length} questions from specific question file`);
    
    // Key prop forces re-mounting of component when module changes
    return (
      <ExamModule
        key={`module-${currentModule}`}
        moduleNumber={currentModule}
        moduleTitle={moduleTitle}
        questions={questions}
        userAnswers={moduleData[currentModule].answers}
        crossedOut={moduleData[currentModule].crossedOut}
        onModuleComplete={handleModuleComplete}
        calculatorAllowed={calculatorAllowed}
      />
    );
  }
  // Fallback for invalid routes
  return (
    <div className="error-message">
      <h2>Invalid module</h2>
      <p>Please return to the <a href="/exam/landing">exam landing page</a>.</p>
    </div>
  );
}

export default ExamController;
