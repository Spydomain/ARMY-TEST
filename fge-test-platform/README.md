# Military Vehicle Quiz Application

A comprehensive quiz application for testing knowledge of military vehicles and equipment.

## Features

- Multiple choice questions about military vehicles
- User authentication and authorization
- Score tracking and leaderboard
- Admin panel for managing questions
- Responsive design for all devices

## Prerequisites

- Node.js (v14 or higher)
- MySQL database
- npm or yarn

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/army-quiz.git
   cd army-quiz/fge-test-platform
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env` in the server directory
   - Update the database credentials and other settings

4. **Set up the database**
   - Create a new MySQL database
   - Update the `.env` file with your database credentials
   - Run database migrations (if any)

5. **Start the application**
   ```bash
   # Start the server (from the server directory)
   npm start
   
   # In a new terminal, start the client (from the client directory)
   cd client
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with hot-reload
- `npm test` - Run tests
- `npm run lint` - Run linter

## Security Considerations

- Never commit `.env` files with sensitive information
- Use strong passwords and keep them secure
- Enable HTTPS in production
- Keep dependencies up to date

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
