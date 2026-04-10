# Placement Admin Panel

A modern React-based admin dashboard for managing the college placement system. This admin panel integrates with the placement backend APIs to manage students and companies.

## Features

- **Dashboard**: Overview with statistics and recent activity
- **Students Management**: View, activate/deactivate, and delete student accounts
- **Companies Management**: View, approve/reject, and delete company accounts
- **Modern UI**: Built with Tailwind CSS and Lucide React icons
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Authentication**: Secure admin login system

## Prerequisites

- Node.js 14+ installed
- Placement backend running on http://localhost:8080
- Git for version control

## Installation

1. Navigate to the project directory:
```bash
cd placement-adminpanel
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open in your default browser at http://localhost:3000

## Available Scripts

- `npm start` - Run the app in development mode
- `npm build` - Build the app for production
- `npm test` - Launch the test runner
- `npm run eject` - Eject from Create React App (one-way operation)

## Backend Integration

The admin panel is configured to connect to the placement backend running on `http://localhost:8080`. Make sure the backend is running before starting the frontend.

### API Endpoints Used

- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/students` - Get all students
- `PUT /api/admin/students/{id}/status` - Toggle student status
- `DELETE /api/admin/students/{id}` - Delete student
- `GET /api/admin/companies` - Get all companies
- `PUT /api/admin/companies/{id}/status` - Toggle company status
- `DELETE /api/admin/companies/{id}` - Delete company

## Authentication

### Demo Credentials
- **Email**: admin@placement.com
- **Password**: admin123

The authentication system uses JWT tokens stored in localStorage. In a production environment, you should integrate this with your actual authentication backend.

## Project Structure

```
placement-adminpanel/
├── public/
│   └── index.html
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.js       # Main layout with sidebar
│   │   └── ProtectedRoute.js # Route protection wrapper
│   ├── context/            # React context
│   │   └── AuthContext.js  # Authentication context
│   ├── pages/              # Page components
│   │   ├── Dashboard.js    # Dashboard overview
│   │   ├── Students.js     # Students management
│   │   ├── Companies.js    # Companies management
│   │   └── Login.js        # Login page
│   ├── services/           # API services
│   │   └── api.js         # Axios configuration and API calls
│   ├── App.js             # Main app component
│   ├── index.css          # Global styles with Tailwind
│   └── index.js           # App entry point
├── package.json
├── tailwind.config.js
└── README.md
```

## Technologies Used

- **React 18** - UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Lucide React** - Icon library
- **Date-fns** - Date manipulation utilities

## Configuration

### Environment Variables

Create a `.env` file in the root directory to configure environment variables:

```
REACT_APP_API_URL=http://localhost:8080/api
```

### Proxy Configuration

The app is configured to proxy API requests to the backend server in development mode via the `proxy` field in `package.json`.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
