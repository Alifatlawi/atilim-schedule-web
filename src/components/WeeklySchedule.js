import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // React Router to navigate
import './WeeklySchedule.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const courseColors = [
  'course-color-1', 
  'course-color-2', 
  'course-color-3', 
  'course-color-4',
  'course-color-5',
  'course-color-6',
  'course-color-7',
  'course-color-8'
];

const getCourseColorClass = (courseId) => {
  // Create a hash from the full courseId string
  let hash = 0;
  for (let i = 0; i < courseId.length; i++) {
    hash = courseId.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Ensure the hash is within the range of the courseColors array
  const index = Math.abs(hash) % courseColors.length;
  return courseColors[index];
};


const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const calculateRowSpan = (startTime, endTime) => {
  const minutesDiff = timeToMinutes(endTime) - timeToMinutes(startTime);
  const rowSpan = Math.ceil(minutesDiff / 60);
  return rowSpan;
};

const incrementTimeSlot = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  const newHours = hours + 1;
  return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const WeeklySchedule = ({ schedules }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Used to redirect user to the schedule form page

  useEffect(() => {
    if (!schedules || schedules.length === 0) {
      // If no schedules are available, redirect the user to the schedule generation page
      navigate('/'); // Adjust this path to your actual form page route
    }
  }, [schedules, navigate]);

  const dayTranslation = {
    'Pazartesi': 'Monday',
    'Salı': 'Tuesday',
    'Çarşamba': 'Wednesday',
    'Perşembe': 'Thursday',
    'Cuma': 'Friday'
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    '09:30', '10:30', '11:30', '12:30', '13:30',
    '14:30', '15:30', '16:30', '17:30'
  ];

  const getScheduleMap = (schedule) => {
    const scheduleMap = {};
    schedule.forEach((course) => {
      const { courseId, courseName, section } = course;
      const cleanedCourseName = courseName.replace(/^01\s?-\s?/, '');
      const courseColorClass = getCourseColorClass(courseId); 

      section.schedules.forEach((item) => {
        const translatedDay = dayTranslation[item.day] || item.day; 
        let currentTime = item.startTime;

        for (let i = 0; i < calculateRowSpan(item.startTime, item.endTime); i++) {
          const key = `${translatedDay}-${currentTime}`;

          if (!scheduleMap[key]) {
            scheduleMap[key] = (
              <td key={key} rowSpan={1} className={`schedule-item ${courseColorClass}`}>
                <div className="schedule-details">
                  <strong>{courseId} SEC: {section.id}</strong><br />
                  {cleanedCourseName}<br />
                  <strong>Classroom:</strong> {item.classroom}<br />
                </div>
              </td>
            );
          }
          currentTime = incrementTimeSlot(currentTime);
        }
      });
    });
    return scheduleMap;
  };

  const renderSchedule = (scheduleMap, day, timeSlot) => {
    const key = `${day}-${timeSlot}`;
    const scheduleEntry = scheduleMap[key];

    if (scheduleEntry) {
      return scheduleEntry;
    }
    return <td key={key} className="empty-cell"></td>;
  };

  const handlePrevious = () => {
    setLoading(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : schedules.length - 1));
      setLoading(false);
    }, 500);
  };

  const handleNext = () => {
    setLoading(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex < schedules.length - 1 ? prevIndex + 1 : 0));
      setLoading(false);
    }, 500);
  };

  const exportAsImage = async () => {
    const element = document.getElementById('schedule-table');
    const canvas = await html2canvas(element);
    const image = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = image;
    link.download = 'schedule.png';
    link.click();
  };

  const exportAsPDF = async () => {
    const element = document.getElementById('schedule-table');
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth - 20, imgHeight);
    pdf.save('schedule.pdf');
  };

  if (!schedules || schedules.length === 0) {
    // Returning null to prevent rendering if there are no schedules
    return null;
  }

  const scheduleMap = getScheduleMap(schedules[currentIndex]);

  return (
    <div className="weekly-schedule">
      <div className="schedule-navigation">
        <button onClick={handlePrevious} disabled={loading}>
          {loading ? 'Loading...' : 'Previous'}
        </button>
        <span>Schedule {currentIndex + 1} of {schedules.length}</span>
        <button onClick={handleNext} disabled={loading}>
          {loading ? 'Loading...' : 'Next'}
        </button>
      </div>

      <div className="export-buttons">
        <button onClick={exportAsImage}>Export as Image</button>
        <button onClick={exportAsPDF}>Export as PDF</button>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading schedule...</div>
      ) : (
        <table id="schedule-table">
          <thead>
            <tr>
              <th>Time</th>
              {days.map(day => (
                <th key={day}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(timeSlot => (
              <tr key={timeSlot}>
                <td>{timeSlot}</td>
                {days.map(day => renderSchedule(scheduleMap, day, timeSlot))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default WeeklySchedule;
