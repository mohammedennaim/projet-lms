import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CourseList from '../components/CourseList';
import CourseForm from '../components/CourseForm';

// Mock des services
jest.mock('../services/courseService', () => ({
  courseService: {
    getAllCourses: jest.fn(() => Promise.resolve({
      'hydra:member': [
        {
          id: 1,
          title: 'Test Course',
          description: 'Test Description',
          createdAt: '2025-06-11T10:00:00Z',
          updatedAt: '2025-06-11T10:00:00Z',
          employees: []
        }
      ]
    }))
  }
}));

const MockWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Course Components', () => {
  test('CourseList renders correctly', async () => {
    render(
      <MockWrapper>
        <CourseList />
      </MockWrapper>
    );

    expect(screen.getByText('Liste des Cours')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Rechercher un cours...')).toBeInTheDocument();
  });

  test('CourseForm renders correctly', () => {
    render(
      <MockWrapper>
        <CourseForm />
      </MockWrapper>
    );

    expect(screen.getByText('Nouveau cours')).toBeInTheDocument();
    expect(screen.getByLabelText('Titre du cours *')).toBeInTheDocument();
    expect(screen.getByLabelText('Description *')).toBeInTheDocument();
  });
});
