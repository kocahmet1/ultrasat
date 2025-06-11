import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import '../styles/AdminTokenUsageStats.css';

// Chart components - using a simple div-based visualization for now
// Could be replaced with a chart library like Chart.js if needed
const BarChart = ({ data, maxValue, title }) => {
  return (
    <div className="simple-chart">
      <h4>{title}</h4>
      <div className="chart-container">
        {data.map((item, index) => (
          <div key={index} className="chart-item">
            <div className="chart-bar-container">
              <div 
                className="chart-bar" 
                style={{ 
                  height: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color || '#0d6efd'
                }}
              />
            </div>
            <div className="chart-label">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminTokenUsageStats = () => {
  const [tokenUsage, setTokenUsage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalTokens, setTotalTokens] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [operationStats, setOperationStats] = useState([]);
  const [timeStats, setTimeStats] = useState([]);

  useEffect(() => {
    const fetchTokenUsage = async () => {
      try {
        setLoading(true);
        
        // Get the last 100 token usage records, ordered by timestamp
        const tokenQuery = query(
          collection(db, 'tokenUsage'),
          orderBy('timestamp', 'desc'),
          limit(100)
        );
        
        const usageSnapshot = await getDocs(tokenQuery);
        const usageData = usageSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        }));
        
        setTokenUsage(usageData);
        
        // Calculate totals and averages
        const total = usageData.reduce((sum, item) => sum + (item.totalTokens || 0), 0);
        const cost = usageData.reduce((sum, item) => sum + (item.totalCost || 0), 0);
        setTotalTokens(total);
        setTotalCost(cost);
        
        // Group by operation type
        const opGroups = {};
        usageData.forEach(item => {
          const op = item.operation || 'Unknown';
          if (!opGroups[op]) {
            opGroups[op] = {
              count: 0,
              tokens: 0,
              cost: 0
            };
          }
          opGroups[op].count += 1;
          opGroups[op].tokens += (item.totalTokens || 0);
          opGroups[op].cost += (item.totalCost || 0);
        });
        
        // Convert to array for chart
        const opStats = Object.keys(opGroups).map(op => ({
          operation: op,
          count: opGroups[op].count,
          tokens: opGroups[op].tokens,
          cost: opGroups[op].cost,
          color: getColorForOperation(op)
        }));
        
        setOperationStats(opStats);
        
        // Group by day for time series
        const timeGroups = {};
        usageData.forEach(item => {
          const day = item.timestamp.toISOString().split('T')[0];
          if (!timeGroups[day]) {
            timeGroups[day] = {
              tokens: 0,
              cost: 0
            };
          }
          timeGroups[day].tokens += (item.totalTokens || 0);
          timeGroups[day].cost += (item.totalCost || 0);
        });
        
        // Convert to array and sort by date
        const timeData = Object.keys(timeGroups)
          .map(day => ({
            day,
            tokens: timeGroups[day].tokens,
            cost: timeGroups[day].cost
          }))
          .sort((a, b) => new Date(a.day) - new Date(b.day));
        
        setTimeStats(timeData);
        
      } catch (err) {
        console.error('Error fetching token usage:', err);
        setError('Failed to load token usage data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTokenUsage();
  }, []);
  
  // Helper function to get a consistent color for each operation type
  const getColorForOperation = (operation) => {
    const colors = {
      'GenerateLesson': '#0d6efd',    // blue
      'SkillIdentification': '#6f42c1', // purple
      'SkillLesson': '#fd7e14',       // orange
      'SkillQuestions': '#20c997',    // teal
      'GenerateSkillQuiz': '#dc3545'  // red
    };
    
    return colors[operation] || '#6c757d'; // gray default
  };
  
  // Format dates for display
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return <div className="loading-container">Loading token usage data...</div>;
  }
  
  if (error) {
    return <div className="error-container">{error}</div>;
  }
  
  // Prepare chart data
  const operationTokenData = operationStats.map(stat => ({
    label: stat.operation,
    value: stat.tokens,
    color: stat.color
  }));
  
  const operationCostData = operationStats.map(stat => ({
    label: stat.operation,
    value: stat.cost,
    color: stat.color
  }));
  
  const timeTokenData = timeStats.slice(-7).map(day => ({
    label: formatDate(day.day),
    value: day.tokens,
    color: '#0d6efd'
  }));
  
  // Find the max value for chart scaling
  const maxTokens = Math.max(...operationTokenData.map(d => d.value));
  const maxCost = Math.max(...operationCostData.map(d => d.value));
  const maxDayTokens = Math.max(...timeTokenData.map(d => d.value));
  
  return (
    <div className="token-usage-stats">
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Tokens</h3>
          <div className="card-value">{totalTokens.toLocaleString()}</div>
          <div className="card-subtitle">Last 100 AI operations</div>
        </div>
        
        <div className="summary-card">
          <h3>Estimated Cost</h3>
          <div className="card-value">${totalCost.toFixed(2)}</div>
          <div className="card-subtitle">Last 100 AI operations</div>
        </div>
        
        <div className="summary-card">
          <h3>Average Cost</h3>
          <div className="card-value">${(totalCost / (tokenUsage.length || 1)).toFixed(4)}</div>
          <div className="card-subtitle">Per operation</div>
        </div>
      </div>
      
      <div className="charts-container">
        <div className="chart-row">
          <BarChart 
            data={operationTokenData} 
            maxValue={maxTokens}
            title="Tokens by Operation Type"
          />
          
          <BarChart 
            data={operationCostData} 
            maxValue={maxCost}
            title="Cost by Operation Type"
          />
        </div>
        
        <div className="chart-row">
          <BarChart 
            data={timeTokenData} 
            maxValue={maxDayTokens}
            title="Token Usage (Last 7 Days)"
          />
        </div>
      </div>
      
      <div className="recent-operations">
        <h3>Recent AI Operations</h3>
        <table className="operations-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Operation</th>
              <th>Prompt Tokens</th>
              <th>Response Tokens</th>
              <th>Total Tokens</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            {tokenUsage.slice(0, 10).map((item, index) => (
              <tr key={index}>
                <td>{item.timestamp.toLocaleString()}</td>
                <td>{item.operation || 'Unknown'}</td>
                <td>{item.promptTokens?.toLocaleString() || 0}</td>
                <td>{item.responseTokens?.toLocaleString() || 0}</td>
                <td>{item.totalTokens?.toLocaleString() || 0}</td>
                <td>${item.totalCost?.toFixed(4) || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTokenUsageStats;
