import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import './ScheduleForm.css'; // Import the CSS file

const ScheduleForm = ({ onGenerateSchedule }) => {
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedCourses, setSelectedCourses] = useState([]);
  const navigate = useNavigate();

  // Fetch departments
  useEffect(() => {
    axios.get('https://schedule.atilim.edu.tr/public/departments')
      .then(response => setDepartments(response.data))
      .catch(error => console.error('Error fetching departments:', error));
  }, []);

  // Fetch courses when department is selected
  useEffect(() => {
    if (selectedDepartment) {
      axios.get('https://schedule.atilim.edu.tr/public/courses')
        .then(response => setCourses(response.data))
        .catch(error => console.error('Error fetching courses:', error));
    }
  }, [selectedDepartment]);

  const handleGenerateSchedule = () => {
    const payload = {
      courseIds: selectedCourses.map(course => course.value),
      department: selectedDepartment.value
    };

    axios.post('https://schedule.atilim.edu.tr/schedule/generateSchedule', payload)
      .then(response => {
        console.log('Generated schedule:', response.data);
        onGenerateSchedule(response.data);
        navigate('/schedule'); // Navigate to the schedule page
      })
      .catch(error => console.error('Error generating schedule:', error));
  };

  const departmentOptions = Object.keys(departments).map(deptKey => ({
    value: deptKey,
    label: departments[deptKey]
  }));

  const courseOptions = courses.map(course => ({
    value: course.id,
    label: course.id
  }));

  return (
    <div className="schedule-form-container">
      <h1 className="schedule-form-title">Schedule Generator <br /> By Ali Al-Fatlawi <br /> For Atilim University</h1>
      <div className="schedule-form-group">
        <label className="schedule-form-label">Select Department:</label>
        <Select
          options={departmentOptions}
          value={selectedDepartment}
          onChange={setSelectedDepartment}
          placeholder="Choose your department"
        />
      </div>

      <div className="schedule-form-group">
        <label className="schedule-form-label">Select Courses:</label>
        <Select
          options={courseOptions}
          value={selectedCourses}
          onChange={setSelectedCourses}
          isMulti
          placeholder="Select your courses"
        />
      </div>

      <button
        onClick={handleGenerateSchedule}
        className="schedule-form-button"
      >
        Generate Schedule
      </button>
    </div>
  );
};

export default ScheduleForm;
