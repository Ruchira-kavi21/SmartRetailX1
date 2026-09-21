# SmartRetailX

SmartRetailX is a cloud-native distributed retail platform developed using a microservices architecture. The system provides separate services for authentication, product management, order processing, and inventory management.

The application uses React for the frontend and Node.js for the backend services. The services are containerized using Docker and deployed on AWS ECS Fargate. Amazon ECR is used for container image storage, Amazon RDS MySQL provides managed database storage, Amazon S3 hosts the frontend, and an Application Load Balancer provides a common entry point with path-based routing.

## Key Features

- User registration and login
- JWT-based authentication
- Bcrypt password hashing
- Customer and Admin role-based access control
- Product management
- Product details
- Order creation and tracking
- Inventory management
- Stock reservation
- Admin user management
- RESTful APIs
- Swagger/OpenAPI documentation
- Docker containerization
- AWS ECS Fargate deployment
- Amazon ECR container registry
- Amazon RDS MySQL
- Amazon S3 frontend hosting
- Application Load Balancer path-based routing
- CloudWatch logging
- k6 performance and scalability testing

## Architecture

The backend consists of four independent microservices:

| Service | Port | Responsibility |
|---|---:|---|
| Auth Service | 5001 | Registration, login and authentication |
| Product Service | 5002 | Product catalogue management |
| Order Service | 5003 | Order creation and tracking |
| Inventory Service | 5004 | Stock and reservation management |

The services are accessed through an Application Load Balancer using path-based routing.

## Technology Stack

**Frontend:** React, Vite, Tailwind CSS  
**Backend:** Node.js, Express.js  
**Database:** MySQL, Prisma ORM  
**Authentication:** JWT, bcrypt  
**Containerization:** Docker, Docker Compose  
**Cloud:** AWS ECS Fargate, ECR, RDS, S3, ALB, CloudWatch  
**Testing:** k6  
**API Documentation:** Swagger / OpenAPI
