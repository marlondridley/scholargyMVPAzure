const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
<<<<<<< HEAD

// Frozen function - StudentVue API doesn't work, using manual profile data
const getStudentVueData = (studentProfile) => {
  // Generate mock data based on student profile
  const gpa = studentProfile.gpa || 3.5;
  const gradeLevel = studentProfile.gradeLevel || '12th';
  
  const mockData = {
    gradebook: {
      Courses: {
        Course: [
          {
            '@Title': 'AP Calculus AB',
            '@Grade': `${Math.round((gpa * 20) + 75)}%`,
            '@Teacher': 'Mr. Davison',
            Assignments: {
              Assignment: [
                { '@Measure': 'Homework 5.1', '@Score': '10/10', '@Notes': 'Excellent work!' },
                { '@Measure': 'Quiz Chapter 5', '@Score': `${Math.round((gpa * 20) + 65)}/100`, '@Notes': 'Good understanding of concepts.' },
                { '@Measure': 'Project: Real World Calculus', '@Score': `${Math.round((gpa * 20) + 78)}/100`, '@Notes': 'Creative application of calculus.' },
                { '@Measure': 'Midterm Exam', '@Score': `${Math.round((gpa * 20) + 72)}/100`, '@Notes': 'Strong performance.' },
              ],
            },
          },
          {
            '@Title': 'English Literature',
            '@Grade': `${Math.round((gpa * 15) + 73)}%`,
            '@Teacher': 'Ms. Gable',
            Assignments: {
              Assignment: [
                { '@Measure': 'Essay: The Great Gatsby', '@Score': `${Math.round((gpa * 15) + 70)}/100`, '@Notes': 'Good analysis, but check for grammar.' },
                { '@Measure': 'Reading Quiz', '@Score': '9/10', '@Notes': 'Excellent comprehension.' },
                { '@Measure': 'Presentation', '@Score': `${Math.round((gpa * 15) + 77)}/100`, '@Notes': 'Very confident and well-researched.' },
              ],
            },
          },
        ],
      },
    },
    attendance: {
      Absences: {
        Absence: [
          { '@AbsenceDate': '2025-05-10', '@Reason': 'Excused' },
          { '@AbsenceDate': '2025-04-22', '@Reason': 'Unexcused' },
        ],
      },
    },
    profile: {
      gradeLevel,
      gpa,
      totalCredits: gradeLevel === '12th' ? 24 : 20,
      graduationYear: new Date().getFullYear() + (gradeLevel === '12th' ? 0 : 1)
    }
  };

  return mockData;
};

// POST handler at root: /
router.post(
  '/',
  [
    body('studentProfile').isObject().withMessage('Student profile is required.'),
=======
const { Client } = require('studentvue');

// Optional: mock fallback
const mockData = {
  gradebook: {
    Courses: {
      Course: [
        {
          '@Title': 'AP Calculus AB',
          '@Grade': '94.5%',
          '@Teacher': 'Mr. Davison',
          Assignments: {
            Assignment: [
              { '@Measure': 'Homework 5.1', '@Score': '10/10', '@Notes': 'Excellent work!' },
              { '@Measure': 'Quiz Chapter 5', '@Score': '85/100', '@Notes': 'Needs to review derivatives.' },
              { '@Measure': 'Project: Real World Calculus', '@Score': '98/100', '@Notes': '' },
              { '@Measure': 'Midterm Exam', '@Score': '92/100', '@Notes': 'Strong performance.' },
            ],
          },
        },
        {
          '@Title': 'English Literature',
          '@Grade': '88.0%',
          '@Teacher': 'Ms. Gable',
          Assignments: {
            Assignment: [
              { '@Measure': 'Essay: The Great Gatsby', '@Score': '85/100', '@Notes': 'Good analysis, but check for grammar.' },
              { '@Measure': 'Reading Quiz', '@Score': '9/10', '@Notes': '' },
              { '@Measure': 'Presentation', '@Score': '92/100', '@Notes': 'Very confident and well-researched.' },
            ],
          },
        },
      ],
    },
  },
  attendance: {
    Absences: {
      Absence: [
        { '@AbsenceDate': '2025-05-10', '@Reason': 'Excused' },
        { '@AbsenceDate': '2025-04-22', '@Reason': 'Unexcused' },
      ],
    },
  },
};

// POST handler at root: /studentvue
router.post(
  '/studentvue',
  [
    body('districtUrl').isURL().withMessage('Valid District URL is required.'),
    body('username').notEmpty().withMessage('Username is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
>>>>>>> 28fb6e1a057a4835d86bed9d4455af4134ba9cce
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

<<<<<<< HEAD
    const { studentProfile } = req.body;

    try {
      // Use frozen function to generate data based on student profile
      const data = getStudentVueData(studentProfile);

      res.json({
        success: true,
        data,
        note: 'Using profile-based mock data (StudentVue API disabled)'
      });

    } catch (error) {
      console.error('StudentVue data generation error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to generate student data' 
=======
    const { districtUrl, username, password } = req.body;

    try {
      // Try to use real StudentVue client
      const client = new Client(districtUrl, username, password);
      
      // Fetch student data
      const [gradebook, attendance] = await Promise.all([
        client.gradebook(),
        client.attendance()
      ]);

      res.json({
        success: true,
        data: {
          gradebook,
          attendance
        }
      });

    } catch (error) {
      console.error('StudentVue error:', error);
      
      // Fallback to mock data if real client fails
      res.json({
        success: true,
        data: mockData,
        note: 'Using mock data due to connection issues'
>>>>>>> 28fb6e1a057a4835d86bed9d4455af4134ba9cce
      });
    }
  }
);

module.exports = router;
