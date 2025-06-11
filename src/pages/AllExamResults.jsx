import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { db as firestore } from '../firebase/config'; 
import { useAuth } from '../contexts/AuthContext'; 
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import styles from '../styles/AllExamResults.module.css';

const AllExamResults = () => {
    const [examHistory, setExamHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth(); 

    useEffect(() => {
        console.log('[AllExamResults] currentUser:', currentUser);
        if (!currentUser) {
            setLoading(false);
            console.log('[AllExamResults] No current user, aborting fetch.');
            return;
        }

        const fetchExamHistory = async () => {
            setLoading(true);
            setError(null);
            console.log(`[AllExamResults] Fetching exam history for user: ${currentUser.uid}`);
            try {
                const examsCollectionRef = collection(firestore, `users/${currentUser.uid}/practiceExams`);
                console.log('[AllExamResults] Firestore collection path:', examsCollectionRef.path);
                const q = query(examsCollectionRef, orderBy('completedAt', 'desc'));

                const querySnapshot = await getDocs(q);
                console.log('[AllExamResults] Query snapshot received. Empty:', querySnapshot.empty, 'Size:', querySnapshot.size);
                
                const history = [];
                querySnapshot.forEach((doc) => {
                    console.log('[AllExamResults] Document ID:', doc.id, 'Data:', doc.data());
                    history.push({ id: doc.id, ...doc.data() });
                });
                setExamHistory(history);
                console.log('[AllExamResults] Fetched examHistory:', history);
            } catch (err) {
                console.error("[AllExamResults] Error fetching exam history:", err);
                setError("Failed to load exam history. Please try again later.");
                setExamHistory([]);
            } finally {
                setLoading(false);
            }
        };

        fetchExamHistory();
    }, [currentUser]);

    if (loading) {
        return <div className={styles.loading}>Loading exam history...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }
    
    if (!currentUser) {
        return <div className={styles.container}><p className={styles.noResults}>Please log in to view your exam history.</p></div>;
    }

    if (examHistory.length === 0) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title}>All Exam Results</h1>
                <p className={styles.noResults}>You haven't completed any exams yet.</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>All Exam Results</h1>
            <ul className={styles.examList}>
                {examHistory.map((exam) => (
                    <li key={exam.id} className={styles.examItem}>
                        <Link to={`/exam/results/${exam.id}`} className={styles.examLink}>
                            <div className={styles.examInfo}>
                                <span className={styles.examName}>
                                    {exam.examTitle || `Practice Exam ${exam.id.substring(0,6)}...`} 
                                </span>
                                <span className={styles.examDate}>
                                    Date: {exam.completedAt?.toDate ? new Date(exam.completedAt.toDate()).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                            <div className={styles.examScore}>
                                Score: {exam.overallScore !== undefined ? `${exam.overallScore}%` : (exam.scores?.overall !== undefined ? `${exam.scores.overall}%` : 'N/A')}
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AllExamResults;
