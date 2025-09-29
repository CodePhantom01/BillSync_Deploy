import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import RegisterPage from './components/RegisterPage';
import GroupPage from './components/GroupPage';
import ExpenseDetailsPage from './components/ExpenseDetailsPage';
import CreateGroup from './components/CreateGroup';
import GroupsList from './components/GroupsList';
import JoinGroup from './components/JoinGroup';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  return token ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Register Page */}
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/group/:groupId"
            element={
              <ProtectedRoute>
                <GroupPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expense/:expenseId"
            element={
              <ProtectedRoute>
                <ExpenseDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/groups" 
            element={
              <ProtectedRoute>
                <GroupsList />
              </ProtectedRoute>
            }
          />
          <Route path="/groups/create" 
            element={
              <ProtectedRoute>
                <CreateGroup />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/join/:invitationId" 
            element={
              <ProtectedRoute>
                <JoinGroup />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
