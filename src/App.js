import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ScheduleForm from './components/ScheduleForm';
import WeeklySchedule from './components/WeeklySchedule';

const App = () => {
  const [schedules, setSchedules] = useState([]);

  const handleScheduleGenerated = (generatedSchedules) => {
    setSchedules(generatedSchedules);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<ScheduleForm onGenerateSchedule={handleScheduleGenerated} />} />
        <Route path="/schedule" element={<WeeklySchedule schedules={schedules} />} />
      </Routes>
    </Router>
  );
};

export default App;
