# Incident Management Application

This Angular application provides an interface for managing incidents and change requests.

## Development Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
```bash
npm install
```

### Running the Application
To start the development server with CORS proxy configuration:
```bash
ng serve
```

The application will be available at `http://localhost:4200/`.

### API Proxy Configuration
This application uses Angular's built-in proxy support to avoid CORS issues when connecting to the backend API.

The proxy configuration is defined in `proxy.conf.json` and automatically redirects all `/api` requests to the backend server.

## Features

### Incident Management
- View list of incidents
- Create new incidents
- Update existing incidents
- View incident details
- Add comments to incidents

### Change Request Management
- View list of change requests
- Create new change requests
- Update existing change requests
- View change request details

## Environment Configuration
- Development environment: `src/environments/environment.ts`
- Production environment: `src/environments/environment.prod.ts`

## Building for Production
To build the application for production:

```bash
ng build --configuration=production
```

The build artifacts will be stored in the `dist/` directory.
# incident
