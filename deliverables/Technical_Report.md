# SmartRetailX Technical Report

## 1. Executive Summary
This document provides a technical overview of the cloud infrastructure deployed for the SmartRetailX Global Commerce Platform. The migration addresses the organization's need to shift from a monolithic e-commerce application to a highly scalable, decoupled microservices architecture on Amazon Web Services (AWS) to handle seasonal traffic spikes and facilitate global expansion.

## 2. Infrastructure Architecture Overview

The deployed infrastructure relies on the following key AWS services:
- **VPC (Virtual Private Cloud)**: A custom VPC (`smartretailx-vpc`) spanning two Availability Zones (ap-southeast-1a, ap-southeast-1b) in the Singapore region to ensure high availability.
- **Application Load Balancer (ALB)**: A single internet-facing ALB that routes incoming HTTP requests to specific backend microservices based on URL path patterns (e.g., `/api/v1/auth*` to the Auth service).
- **Amazon ECS (Fargate)**: The backend microservices run as Docker containers on serverless ECS Fargate infrastructure, removing the need to provision or manage EC2 instances.
- **Amazon RDS (MySQL)**: A managed relational database instance (`smartretailx-mysql-new`) deployed in a private subnet, serving all microservices securely.
- **Amazon S3**: The React frontend SPA is hosted as a static website in an S3 bucket configured for public read access.

## 3. Network and Security Design
The deployment implements strong network isolation and least privilege security principles:
- **Subnet Configuration**: The VPC utilizes Public Subnets for the ALB and S3 interaction, while the ECS Tasks and RDS Database reside securely in Private Subnets.
- **Security Groups**:
  - `smartretailx-alb-sg-new`: Allows incoming HTTP/HTTPS traffic from the internet.
  - `smartretailx-ecs-sg-new`: Allows incoming traffic on ports 5001-5004 strictly from the ALB Security Group.
  - `smartretailx-rds-sg-new`: Allows MySQL traffic (port 3306) strictly from the ECS Security Group.
- **Database Security**: The RDS instance is marked as `PubliclyAccessible: false`, meaning it cannot be reached from the internet, mitigating the risk of direct attacks. 

## 4. Microservices Deployment and Routing
The backend architecture is broken down into four distinct Node.js/Express services, managed independently via ECS Task Definitions:

| Service Name       | Target Group Port | ALB Path Pattern      |
|--------------------|-------------------|-----------------------|
| Auth Service       | 5001              | `/api/v1/auth*`       |
| Product Service    | 5002              | `/api/v1/products*`   |
| Order Service      | 5003              | `/api/v1/orders*`     |
| Inventory Service  | 5004              | `/api/v1/inventory*`  |

**Database Initialization**: Since the RDS instance is private, Prisma database schema synchronization (`npx prisma db push`) was executed directly inside the VPC via one-off ECS Fargate tasks, initializing the schema for all four databases (`auth_db`, `product_db`, `order_db`, `inventory_db`) securely.

## 5. Frontend Deployment
The frontend is built using React (Vite) and configured to point to the unified Application Load Balancer DNS endpoint via environment variables (`VITE_AUTH_API_URL`, etc.). 
- The compiled `dist/` artifacts are uploaded to a public S3 bucket (`smartretailx-frontend-134014260827`).
- **Note on CloudFront**: An attempt to deploy an Amazon CloudFront distribution for edge caching resulted in an `AccessDenied` error due to the AWS Account status (pending verification for new CloudFront resources). The application was therefore made directly available via the S3 static website hosting endpoint to ensure immediate accessibility.

## 6. Testing and Validation
Post-deployment verification confirmed the functionality of the system:
- **ALB Health Checks**: The `/health` endpoints for all four services returned HTTP 200, confirming ECS task stability.
- **API Functionality**: The `POST /api/v1/auth/register` endpoint successfully registered a test user and returned the expected JSON response, confirming that the Fargate tasks can communicate seamlessly with the private RDS database.
- **Frontend Functionality**: The S3 website successfully rendered the React UI.

## 7. Future Recommendations
1. **Secrets Management**: Hardcoded database credentials inside the ECS task definitions should be migrated to AWS Secrets Manager.
2. **CloudFront**: Once the AWS account is verified, a CloudFront distribution should be placed in front of the S3 bucket to provide SSL/TLS (HTTPS) support and global edge caching.
3. **CI/CD**: Implement automated pipelines (e.g., AWS CodePipeline or GitHub Actions) to automate Docker builds, ECR pushes, and ECS rolling updates.
4. **Auto-Scaling**: Configure ECS Service Auto-Scaling policies based on CPU/Memory utilization to handle the requested "seasonal traffic spikes" dynamically.
