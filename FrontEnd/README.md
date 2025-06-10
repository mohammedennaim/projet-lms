# LMS Frontend

A React frontend application for the Learning Management System with login and registration functionality.

## Features

- User Registration
- User Login
- Protected Dashboard
- Token-based Authentication
- Modern UI Design
- Responsive Layout

## API Endpoints

The frontend connects to the following Symfony backend endpoints:
- `POST http://localhost:8000/api/register` - User registration
- `POST http://localhost:8000/api/login` - User login

## Setup and Installation

1. Navigate to the frontend directory:
   ```bash
   cd FrontEnd
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

### Registration
1. Visit `http://localhost:3000/register`
2. Enter your email and password
3. Confirm your password
4. Click "Register"
5. Upon successful registration, you'll be redirected to the login page

### Login
1. Visit `http://localhost:3000/login`
2. Enter your registered email and password
3. Click "Login"
4. Upon successful login, you'll be redirected to the dashboard

### Dashboard
- Protected route that requires authentication
- Displays user information
- Provides logout functionality

## Project Structure

```
src/
├── components/
│   ├── Login.js          # Login form component
│   ├── Register.js       # Registration form component
│   └── Dashboard.js      # Protected dashboard component
├── context/
│   └── AuthContext.js    # Authentication context provider
├── services/
│   └── api.js            # API service and Axios configuration
├── App.js                # Main application component with routing
├── index.js              # Application entry point
└── index.css             # Global styles
```

## Authentication Flow

1. User registers or logs in
2. Backend returns JWT token and user data
3. Token is stored in localStorage
4. Token is included in all subsequent API requests
5. Protected routes check authentication status
6. Automatic redirect to login if not authenticated

## Backend Requirements

Make sure your Symfony backend is running on `http://localhost:8000` and has the following endpoints properly configured:

- `/api/register` - Accepts email and password, returns user data and token
- `/api/login` - Accepts email and password, returns user data and token

## Technologies Used

- React 18
- React Router DOM 6
- Axios for HTTP requests
- Context API for state management
- CSS3 with modern styling
