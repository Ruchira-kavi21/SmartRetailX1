# SmartRetailX Global Commerce Platform
## Cloud Infrastructure Deployment Presentation

---

### Slide 1: Executive Summary
**Objective:** Modernize and scale the SmartRetailX Global Commerce Platform on AWS.
**Challenges Addressed:**
- Seasonal traffic spikes and scaling limitations of the monolithic architecture.
- Demand for high availability across new global markets.
- Secure, decoupled management of online shopping, inventory, orders, and customer data.

**The Solution:**
A scalable, highly available microservices architecture deployed on AWS using ECS Fargate, ALB, RDS MySQL, and S3 for static frontend hosting.

---

### Slide 2: Proposed Architecture
**Microservices Transformation**
- **Auth Service:** Manages user authentication and JWT token issuance.
- **Product Service:** Handles product catalog and recommendations.
- **Order Service:** Manages real-time order processing.
- **Inventory Service:** Tracks logistics and warehouse data.

**AWS Components Used:**
- **Amazon ECS (Fargate):** Serverless compute for containers, ensuring automatic scaling.
- **Application Load Balancer (ALB):** Routes traffic to the correct microservice based on API paths.
- **Amazon RDS (MySQL):** Managed relational database with automated backups.
- **Amazon S3:** Hosts the compiled React single-page application (SPA).

---

### Slide 3: Networking and Security
**VPC Design (Virtual Private Cloud)**
- **Public Subnets:** Host the Application Load Balancer (ALB) and NAT Gateway.
- **Private Subnets:** Securely host the ECS microservices and RDS database.

**Security Measures:**
- **Security Groups:** 
  - ALB SG allows public HTTP traffic.
  - ECS SG only allows traffic originating from the ALB SG.
  - RDS SG only allows traffic originating from the ECS SG on port 3306.
- **IAM Policies:** Least privilege access implemented via `ecsTaskExecutionRole`.

---

### Slide 4: Deployment Pipeline & Workflow
1. **Containerization:** Dockerfiles defined for all Node.js microservices.
2. **Image Registry:** Built images pushed securely to Amazon Elastic Container Registry (ECR).
3. **Database Migrations:** Prisma `db push` used to initialize table schemas dynamically within ECS.
4. **Service Discovery:** ALB Path-based routing ensures `/api/v1/auth`, `/api/v1/products`, etc., are routed to the corresponding Fargate task.
5. **Frontend Delivery:** Vite React app built locally with ALB endpoints configured in `.env`, then synced to an S3 bucket configured for static web hosting.

---

### Slide 5: Future Enhancements & Scaling
- **Global Edge Caching:** Enable Amazon CloudFront (currently pending account verification) for global low-latency frontend delivery.
- **Secrets Management:** Migrate hardcoded database credentials to AWS Secrets Manager.
- **CI/CD Automation:** Implement AWS CodePipeline or GitHub Actions to automatically trigger ECR builds and ECS deployments on code commit.
- **Observability:** Set up CloudWatch Alarms based on the existing CloudWatch Log Groups for proactive monitoring.
