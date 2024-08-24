import React, { useState } from 'react';
import './WeeklySchedule.css';

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
    const index = courseId.charCodeAt(0) % courseColors.length; 
    return courseColors[index];
  };

const WeeklySchedule = ({ schedules }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const calculateRowSpan = (startTime, endTime) => {
    const minutesDiff = timeToMinutes(endTime) - timeToMinutes(startTime);
    const rowSpan = Math.ceil(minutesDiff / 60);
    console.log(`RowSpan for ${startTime} to ${endTime} is ${rowSpan}`);
    return rowSpan;
  };

  const getScheduleMap = (schedule) => {
    const scheduleMap = {};

    schedule.forEach((course) => {
        const { courseId, courseName, section } = course;
        const courseColorClass = getCourseColorClass(courseId); // Assign color based on course ID
        console.log(`Processing course: ${courseId}, Color: ${courseColorClass}`);

        section.schedules.forEach((item) => {
            const translatedDay = dayTranslation[item.day];
            let currentTime = item.startTime;

            for (let i = 0; i < calculateRowSpan(item.startTime, item.endTime); i++) {
                const key = `${translatedDay}-${currentTime}`;
                console.log(`Processing course: ${courseId}, Expected Day: ${translatedDay}, Start Time: ${currentTime}`);

                if (scheduleMap[key]) {
                    console.error(`Conflict detected: ${key} already contains a course!`);
                }

                scheduleMap[key] = (
                    <td key={key} rowSpan={1} className={`schedule-item ${courseColorClass}`}>
                        <div>
                            <strong>{courseId} ({section.id})</strong><br />
                            {courseName}<br />
                            {item.classroom}<br />
                            {item.startTime} - {item.endTime}
                        </div>
                    </td>
                );

                currentTime = incrementTimeSlot(currentTime);
            }
        });
    });

    console.log('Final schedule map:', scheduleMap);
    return scheduleMap;
};


// Helper function to increment time slot by one hour
const incrementTimeSlot = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const newHours = hours + 1;
    return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};


  const renderSchedule = (scheduleMap, day, timeSlot) => {
    const key = `${day}-${timeSlot}`;
    const scheduleEntry = scheduleMap[key];

    console.log(`Rendering ${key}:`, scheduleEntry);

    if (scheduleEntry && scheduleEntry.props && scheduleEntry.props.children) {
      return scheduleEntry;
    } else {
      console.warn(`No valid schedule found for ${key}`);
    }
    return <td key={key} className="empty-cell"></td>;
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : schedules.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex < schedules.length - 1 ? prevIndex + 1 : 0));
  };

  if (!schedules || schedules.length === 0) {
    return <div>No schedules available.</div>;
  }

  const scheduleMap = getScheduleMap(schedules[currentIndex]);

  // Log the final schedule map
  console.log('Final schedule map:', scheduleMap);

  return (
    <div className="weekly-schedule">
      <div className="schedule-navigation">
        <button onClick={handlePrevious}>Previous</button>
        <span>Schedule {currentIndex + 1} of {schedules.length}</span>
        <button onClick={handleNext}>Next</button>
      </div>
      <table>
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
    </div>
  );
};

export default WeeklySchedule;
