# RentCore

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/rentcore)

A comprehensive rental management system designed for handling both monthly and daily stays in properties such as apartments, hotels, and condos. Built with Node.js, TypeScript, Express, and PostgreSQL to provide a robust, scalable solution for property owners and managers.

## Features

- **Multi-Property Management**: Manage multiple branches, buildings, floors, and rooms
- **Tenant Management**: Handle tenant information, leases, and daily stays
- **Payment Processing**: Secure payment tracking with slip verification and QR code generation
- **Meter Reading**: Track utility meter readings and generate reports
- **Invoice Generation**: Automated invoice creation and PDF generation
- **Reporting**: Comprehensive reporting on payments, occupancy, and financials
- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Audit Logging**: Track all system changes and actions
- **Email Notifications**: Automated email sending for invoices and reminders
- **QR Code Support**: Generate payment QR codes and verify payment slips
- **File Upload**: Secure file upload to AWS S3
- **Rate Limiting**: Prevent abuse with configurable rate limits
- **API Documentation**: RESTful API endpoints for seamless integration

## Tech Stack

- **Backend**: Node.js, TypeScript, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: AWS S3
- **Email**: Nodemailer
- **PDF Generation**: PDFKit
- **QR Code**: QRCode.js, jsQR for verification
- **Image Processing**: JIMP
- **Validation**: Joi
- **Logging**: Winston
- **Testing**: Jest
- **Development**: ts-node-dev, ESLint, Prettier

## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL
- Docker (optional, for containerized deployment)
- AWS S3 account (for file uploads)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/rentcore.git
   cd rentcore
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` and fill in your configuration:
   ```bash
   cp .env.example .env
   ```

   Required environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `JWT_SECRET`: Secret key for JWT tokens
   - `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`: For S3 file uploads
   - `MAIL_*`: Email configuration for notifications

4. Set up the database:
   ```bash
   npm run migrate
   npm run seed
   ```

5. Build the project:
   ```bash
   npm run build
   ```

## Usage

### Development

Start the development server with hot reload:
```bash
npm run dev
```

### Production

Build and start the production server:
```bash
npm run build
npm start
```

### Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Database Operations

Migrate database schema:
```bash
npm run migrate
```

Seed the database with initial data:
```bash
npm run seed
```

### Docker

Build and run with Docker Compose:
```bash
docker-compose up --build
```

For development with Docker:
```bash
docker-compose -f docker-compose.dev.yml up --build
```

## API Endpoints

The API provides RESTful endpoints for all major operations. Key endpoints include:

- `POST /api/auth/login` - User authentication
- `GET /api/branches` - List branches
- `POST /api/tenants` - Create tenant
- `GET /api/leases` - List leases
- `POST /api/payments` - Process payment
- `GET /api/reports` - Generate reports
- `POST /api/meters` - Submit meter reading

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── database/        # Database initialization and migrations
├── middleware/      # Express middleware
├── repositories/    # Data access layer
├── routes/          # API routes
├── services/        # Business logic
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## Code Quality

- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier
- **Type Checking**: TypeScript compiler
- **Testing**: Jest with coverage reporting

Run all quality checks:
```bash
npm run lint
npm run format
npm run typecheck
npm run test
```

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions or support, please open an issue on GitHub or contact the development team.
