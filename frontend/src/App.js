// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentProfilePage from './pages/StudentProfilePage';
import ScholarshipPage from './pages/ScholarshipPage';
import MatchingPage from './pages/MatchingPage';
import CareerForecasterPage from './pages/CareerForecasterPage';
import AuthCallback from './pages/AuthCallback';
import ReportPage from './pages/ReportPage';
import StudentVuePage from './pages/StudentVuePage';
import CompareCollegesPage from './pages/CompareCollegesPage';
import ProfilePage from './pages/ProfilePage';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Main />
      </AuthProvider>
    </ErrorBoundary>
  );
}

const Main = () => {
  const { user, profile, setProfile, isProfileComplete, loading } = useAuth();
  const [view, setView] = useState('dashboard');
  const [selectedCollegeId, setSelectedCollegeId] = useState(null);

  useEffect(() => {
    // Handle OAuth callback route
    if (window.location.pathname === '/auth/callback') {
      setView('authCallback');
      return;
    }
    
    // Handle other direct URL routes
    const path = window.location.pathname;
    if (path === '/dashboard') setView('dashboard');
    else if (path === '/scholarships') setView('scholarships');
    else if (path === '/matching') setView('matching');
    else if (path === '/forecaster') setView('forecaster');
    else if (path === '/compare') setView('compare');
    else if (path === '/studentvue') setView('studentVue');
    else if (path === '/profile') setView('profile');
    else if (path === '/report') setView('report');
  }, []);
	
  // ✅ NEW: Use setProfile so it's not "unused"
  useEffect(() => {
    if (user && user.profile) {
    setProfile(user.profile);
    console.log("🔹 Profile loaded into state:", user.profile);
    }
  }, [user, setProfile]);

	
  const handleSelectCollege = (unitId) => {
    setSelectedCollegeId(unitId);
    setView('profile');
  };

  const handleGenerateReport = () => {
    setView('report');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <LoginPage />;
  }
  
  if (!isProfileComplete && view !== 'studentProfile' && view !== 'authCallback') {
    return (
      <Layout activeView="studentProfile" setView={setView}>
        <StudentProfilePage />
      </Layout>
    );
  }

  const renderView = () => {
    switch (view) {
      case 'authCallback': return <AuthCallback setView={setView} />;
      case 'studentProfile': return <StudentProfilePage />;
      case 'scholarships': return <ScholarshipPage studentProfile={profile} setView={setView} />;
      case 'matching': return <MatchingPage />;
      case 'forecaster': return <CareerForecasterPage />;
      case 'compare': return <CompareCollegesPage studentProfile={profile} setView={setView} />;
      case 'studentVue': return <StudentVuePage />;
      case 'report': return <ReportPage collegeId={selectedCollegeId} onBack={() => setView('profile')} />;
      case 'profile': return <ProfilePage collegeId={selectedCollegeId} onBack={() => setView('dashboard')} onGenerateReport={handleGenerateReport} />;
      default: return <DashboardPage setView={setView} onSelectCollege={handleSelectCollege} studentProfile={profile} />;
    }
  };

  return (
    <Layout activeView={view} setView={setView}>
      {renderView()}
    </Layout>
  );
};

export default App;