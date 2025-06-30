import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import EmployeeCoursesList from './components/EmployeeCoursesList';
import EmployeeQuizzesList from './components/EmployeeQuizzesList';
import EmployeeResourcesList from './components/EmployeeResourcesList';
import CourseManagement from './components/CourseManagement';
import CourseDetailsPage from './components/CourseDetailsPage';
import UserManagement from './components/UserManagement';
import EmployeeList from './components/EmployeeList';
import RessourceManagement from './components/RessourceManagement';
import Statistics from './components/Statistics';
import QuizManagement from './components/QuizManagement';
import QuestionsList from './components/QuestionsList';
import QuestionForm from './components/QuestionForm';
import AffectationsList from './components/AffectationsList';
import AffectationCreate from './components/AffectationCreate';
import AffectationEdit from './components/AffectationEdit';
import RessourcesList from './components/RessourcesList';
import EmployeeQuizDetails from './components/EmployeeQuizDetails';
import CourseCreationWorkflow from './components/CourseCreationWorkflow';
import EmployeeAffectationsTest from './components/EmployeeAffectationsTest';
import EmployeeDashboardTest from './components/EmployeeDashboardTest';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Importer la garde des rôles de façon dynamique pour éviter les problèmes de dépendances circulaires
  const { RoleGuard } = require('./utils/roleGuard');
  return <RoleGuard>{children}</RoleGuard>;
}

function PublicRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return children;
  } else {
    // Utiliser la fonction utilitaire pour déterminer la destination en fonction du rôle
    const { getHomePageForRole } = require('./utils/roleGuard');
    const redirectPath = user && user.role ? getHomePageForRole(user.role) : '/dashboard';
    return <Navigate to={redirectPath} />;
  }
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
              path="/employee-dashboard" 
              element={
                <ProtectedRoute>
                  <EmployeeDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employee-courses" 
              element={
                <ProtectedRoute>
                  <EmployeeCoursesList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employee-quizzes" 
              element={
                <ProtectedRoute>
                  <EmployeeQuizzesList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employee-resources" 
              element={
                <ProtectedRoute>
                  <EmployeeResourcesList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/test-affectations" 
              element={
                <ProtectedRoute>
                  <EmployeeAffectationsTest />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/test-dashboard" 
              element={
                <ProtectedRoute>
                  <EmployeeDashboardTest />
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
                <ProtectedRoute>                  <RessourceManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
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
            />            <Route 
              path="/affectations" 
              element={
                <ProtectedRoute>
                  <AffectationsList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/affectations/create" 
              element={
                <ProtectedRoute>
                  <AffectationCreate />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/affectations/:id/edit" 
              element={
                <ProtectedRoute>
                  <AffectationEdit />
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
            {/* Course Creation Workflow Routes */}
            <Route 
              path="/workflow" 
              element={
                <ProtectedRoute>
                  <CourseCreationWorkflow />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/workflow/course" 
              element={
                <ProtectedRoute>
                  <CourseCreationWorkflow />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/workflow/course/:courseId" 
              element={
                <ProtectedRoute>
                  <CourseCreationWorkflow />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/workflow/resource/:courseId" 
              element={
                <ProtectedRoute>
                  <CourseCreationWorkflow />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/workflow/quiz/:courseId" 
              element={
                <ProtectedRoute>
                  <CourseCreationWorkflow />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/workflow/question/:quizId" 
              element={
                <ProtectedRoute>
                  <CourseCreationWorkflow />
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
