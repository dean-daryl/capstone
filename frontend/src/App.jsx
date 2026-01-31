import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import MarketingPage from './views/MarketingPage';
import Dashboard from './views/Dashboard';
import Analytics from './views/Analytics';
import ActivityDetails from './components/recent-activity/ActivityDetails';

function App() {
  return (
    <ThemeProvider>
    <Router>
      <Routes>
        <Route  path="/" element={<MarketingPage />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Analytics />} />
          <Route path="activity/:id" element={<ActivityDetails />} />
        </Route>
      </Routes>
    </Router>
    </ThemeProvider>
  );
}

export default App;