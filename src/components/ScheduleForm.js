import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import './ScheduleForm.css';

const ScheduleForm = ({ onGenerateSchedule }) => {
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios.get('https://schedule.atilim.edu.tr/public/departments')
      .then(response => setDepartments(response.data))
      .catch(error => setErrorMessage('Failed to load departments.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      setLoading(true);
      axios.get(`https://schedule.atilim.edu.tr/public/courses?department=${selectedDepartment.value}`)
        .then(response => setCourses(response.data))
        .catch(error => setErrorMessage('Failed to load courses.'))
        .finally(() => setLoading(false));
    }
  }, [selectedDepartment]);

  const handleGenerateSchedule = () => {
    setLoading(true);
    const payload = {
      courseIds: selectedCourses.map(course => course.value),
      department: selectedDepartment?.value
    };

    axios.post('https://schedule.atilim.edu.tr/schedule/generateScheduleWithDepartment', payload)
      .then(response => {
        if (response.data.length > 0) {
          onGenerateSchedule(response.data);
          navigate('/schedule');
        } else {
          alert('Time conflict detected. Searching other department sections...');
          handleGenerateScheduleWithoutDepartment();
        }
      })
      .catch(error => setErrorMessage('Error generating schedule with department.'))
      .finally(() => setLoading(false));
  };

  const handleGenerateScheduleWithoutDepartment = () => {
    const payload = {
      courseIds: selectedCourses.map(course => course.value),
    };

    axios.post('https://schedule.atilim.edu.tr/schedule/generateScheduleWithoutDepartment', payload)
      .then(response => {
        if (response.data.length > 0) {
          onGenerateSchedule(response.data);
          navigate('/schedule');
        } else {
          alert('No available schedules found even in other departments.');
        }
      })
      .catch(error => setErrorMessage('Error generating schedule without department.'))
      .finally(() => setLoading(false));
  };

  const departmentOptions = Object.keys(departments).map(deptKey => ({
    value: deptKey,
    label: departments[deptKey]
  }));

  const courseOptions = courses.map(course => ({
    value: course.id,
    label: `${course.id} - ${course.name}`
  }));

  const handleClearSelections = () => {
    setSelectedDepartment('');
    setSelectedCourses([]);
  };

  return (
    <div className="schedule-form-container">
      <div className="form-card">
        <h1 className="schedule-form-title">Schedule Generator</h1>
        <p className="subtitle">For Atılım University</p>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        
        <div className="schedule-form-group">
          <label>Select Department:</label>
          <Select
            options={departmentOptions}
            value={selectedDepartment}
            onChange={setSelectedDepartment}
            placeholder="Choose your department"
            className="select-input"
            isClearable
          />
        </div>

        <div className="schedule-form-group">
          <label>Select Courses:</label>
          <Select
            options={courseOptions}
            value={selectedCourses}
            onChange={setSelectedCourses}
            isMulti
            placeholder="Select your courses"
            className="select-input"
          />
        </div>

        <div className="schedule-form-actions">
          <button 
            onClick={handleGenerateSchedule} 
            disabled={loading || selectedCourses.length === 0}
            className="primary-button"
          >
            {loading ? 'Generating...' : 'Generate Schedule'}
          </button>
          <button 
            onClick={handleClearSelections} 
            disabled={loading}
            className="secondary-button"
          >
            Clear Selections
          </button>
        </div>

        {/* Adding a footer section with your name and LinkedIn link */}
        <div className="footer">
          <p>Created by <strong>Ali Al-Fatlawi</strong></p>
          <p>
            <a href="https://www.linkedin.com/in/alfatlawi/" target="_blank" rel="noopener noreferrer">
              Connect with me on LinkedIn
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScheduleForm;
