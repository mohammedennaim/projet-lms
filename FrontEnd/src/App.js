import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import CourseManagement from './components/CourseManagement';
import CourseDetailsPage from './components/CourseDetailsPage';
import CourseAssignment from './components/CourseAssignment';
import UserManagement from './components/UserManagement';
import EmployeeList from './components/EmployeeList';
import RessourceManagement from './components/RessourceManagement';
import Statistics from './components/Statistics';
import QuizManagement from './components/QuizManagement';
import QuestionsList from './components/QuestionsList';
import QuestionForm from './components/QuestionForm';
import AffectationsList from './components/AffectationsList';
import RessourcesList from './components/RessourcesList';
import EmployeeQuizDetails from './components/EmployeeQuizDetails';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses" 
              element={
                <ProtectedRoute>
                  <CourseManagement />
                </ProtectedRoute>
              } 
            />            <Route 
              path="/users" 
              element={
                <ProtectedRoute>
                  <UserManagement />
                </ProtectedRoute>
              } 
            />            <Route 
              path="/employees" 
              element={
                <ProtectedRoute>
                  <EmployeeList />
                </ProtectedRoute>
              } 
            />            <Route 
              path="/ressources" 
              element={
                <ProtectedRoute>
                  <RessourceManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/assignments" 
              element={
                <ProtectedRoute>
                  <CourseAssignment />
                </ProtectedRoute>
              } 
            />            <Route 
              path="/statistics" 
              element={
                <ProtectedRoute>
                  <Statistics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quizzes" 
              element={
                <ProtectedRoute>
                  <QuizManagement />
                </ProtectedRoute>
              } 
            />            <Route 
              path="/questions" 
              element={
                <ProtectedRoute>
                  <QuestionsList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/questions/create" 
              element={
                <ProtectedRoute>
                  <QuestionForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/questions/:id/edit" 
              element={
                <ProtectedRoute>
                  <QuestionForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/affectations" 
              element={
                <ProtectedRoute>
                  <AffectationsList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ressources-list" 
              element={
                <ProtectedRoute>
                  <RessourcesList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quiz/:quizId/details" 
              element={
                <ProtectedRoute>
                  <EmployeeQuizDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/course/:courseId/details" 
              element={
                <ProtectedRoute>
                  <CourseDetailsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses/:id" 
              element={
                <ProtectedRoute>
                  <CourseDetailsPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
