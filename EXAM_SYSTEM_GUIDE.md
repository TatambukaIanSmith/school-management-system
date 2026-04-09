# Exam Management System Guide

## Overview
The Exam Management System allows teachers to create, manage, and grade exams for students. The system is integrated with the School Registration System and uses role-based access control.

## Access Control
Only the following roles can access the exam management system:
- **Teachers** - Full access to create and manage exams
- **Counselors** - View-only access to exams
- **Administrators** - Full access to all exams

## Features

### 1. Create Exams
Teachers can create exams with the following details:
- Exam title and subject
- Target class (Senior 1-6)
- Duration in minutes
- Total marks
- Due date and time
- Instructions for students

### 2. Question Types
The system supports three types of questions:

#### Multiple Choice Questions (MCQ)
- Add up to 4 options (A, B, C, D)
- Select the correct answer
- Auto-grading supported

#### True/False Questions
- Two options: True or False
- Select the correct answer
- Auto-grading supported

#### Short Answer Questions
- Students type their answers
- Requires manual grading by teacher

### 3. Exam Management
- View all created exams
- See submission count for each exam
- Delete exams (with confirmation)
- Track due dates

### 4. Submissions & Grading
- View all student submissions
- See pending and graded submissions
- Grade submissions (interface coming soon)
- Track scores and completion

## How to Use

### Creating an Exam
1. Navigate to the Exams page from the dashboard or navigation menu
2. Click "Create New Exam" button
3. Fill in exam details (title, subject, class, duration, marks, due date)
4. Add instructions (optional)
5. Click "Add Question" to add questions
6. For each question:
   - Enter question text
   - Select question type (MCQ, True/False, or Short Answer)
   - Enter marks for the question
   - Add options and select correct answer (for MCQ and True/False)
7. Click "Save Exam" when done

### Viewing Exams
1. Go to "My Exams" tab
2. See all your created exams with:
   - Exam details (title, subject, class)
   - Duration and total marks
   - Number of questions
   - Submission count
   - Due date status

### Managing Submissions
1. Go to "Submissions" tab
2. View all student submissions for your exams
3. See pending and graded submissions
4. Click "Grade Now" to grade pending submissions

## Navigation
The Exams link appears in:
- Dashboard (for teachers, counselors, administrators)
- Students page navigation
- Dashboard quick actions (for teachers and counselors)

## Data Storage
All exam data is stored in browser localStorage:
- `srs_exams` - Stores all exam data
- `srs_submissions` - Stores student submissions

## Future Enhancements
- Student interface to take exams
- Timer functionality during exams
- Auto-grading for MCQ and True/False questions
- Manual grading interface for short answers
- Results viewing for students
- Exam analytics and statistics
- Export exam results to CSV
- Print exam papers
