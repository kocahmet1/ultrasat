import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getTierInfo, MEMBERSHIP_TIERS } from '../../utils/membershipUtils';
import { MembershipBadge } from '../membership';
import './MembershipManagement.css';

const MembershipManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'), limit(100));
      const snapshot = await getDocs(q);
      
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserMembership = async (userId, newTier, durationMonths = 12) => {
    try {
      setUpdating(userId);
      
      const userRef = doc(db, 'users', userId);
      const updateData = {
        membershipTier: newTier,
        membershipStartDate: new Date().toISOString()
      };
      
      if (newTier !== 'free' && durationMonths) {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + durationMonths);
        updateData.membershipEndDate = endDate.toISOString();
      } else if (newTier === 'free') {
        updateData.membershipEndDate = null;
      }
      
      await updateDoc(userRef, updateData);
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, ...updateData }
            : user
        )
      );
      
      alert(`Successfully updated membership to ${getTierInfo(newTier).displayName}`);
    } catch (error) {
      console.error('Error updating membership:', error);
      alert('Failed to update membership');
    } finally {
      setUpdating(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.membershipTier === filter;
    const matchesSearch = !searchTerm || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const membershipStats = {
    total: users.length,
    free: users.filter(u => u.membershipTier === 'free' || !u.membershipTier).length,
    plus: users.filter(u => u.membershipTier === 'plus').length,
    max: users.filter(u => u.membershipTier === 'max').length
  };

  if (loading) {
    return (
      <div className="membership-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="membership-management">
      <div className="membership-management-header">
        <h1>Membership Management</h1>
        <p>Manage user memberships and view subscription statistics</p>
      </div>

      <div className="membership-stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{membershipStats.total}</p>
        </div>
        <div className="stat-card">
          <h3>Free Users</h3>
          <p className="stat-number">{membershipStats.free}</p>
        </div>
        <div className="stat-card">
          <h3>Plus Users</h3>
          <p className="stat-number">{membershipStats.plus}</p>
        </div>
        <div className="stat-card">
          <h3>Max Users</h3>
          <p className="stat-number">{membershipStats.max}</p>
        </div>
      </div>

      <div className="membership-filters">
        <div className="filter-group">
          <label>Filter by tier:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Users</option>
            <option value="free">Free</option>
            <option value="plus">Plus</option>
            <option value="max">Max</option>
          </select>
        </div>
        
        <div className="search-group">
          <label>Search users:</label>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Current Tier</th>
              <th>Member Since</th>
              <th>Expires</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => {
              const tier = user.membershipTier || 'free';
              const tierInfo = getTierInfo(tier);
              const memberSince = user.membershipStartDate 
                ? new Date(user.membershipStartDate).toLocaleDateString()
                : new Date(user.createdAt).toLocaleDateString();
              const expires = user.membershipEndDate 
                ? new Date(user.membershipEndDate).toLocaleDateString()
                : 'Never';

              return (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <strong>{user.name || 'Unknown'}</strong>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <MembershipBadge tier={tier} size="small" />
                  </td>
                  <td>{memberSince}</td>
                  <td>{expires}</td>
                  <td>
                    <div className="user-actions">
                      {tier !== 'free' && (
                        <button
                          className="action-btn downgrade"
                          onClick={() => updateUserMembership(user.id, 'free')}
                          disabled={updating === user.id}
                        >
                          {updating === user.id ? 'Updating...' : 'Set Free'}
                        </button>
                      )}
                      {tier !== 'plus' && (
                        <button
                          className="action-btn upgrade"
                          onClick={() => updateUserMembership(user.id, 'plus')}
                          disabled={updating === user.id}
                        >
                          {updating === user.id ? 'Updating...' : 'Set Plus'}
                        </button>
                      )}
                      {tier !== 'max' && (
                        <button
                          className="action-btn upgrade"
                          onClick={() => updateUserMembership(user.id, 'max')}
                          disabled={updating === user.id}
                        >
                          {updating === user.id ? 'Updating...' : 'Set Max'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="no-users">
          <p>No users found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default MembershipManagement;
