# DSO101 Assignment 

**Github repo link** : https://github.com/Tshewangdorji7257/TshewangDorji_02230312_DSO101_A1

## Continuous Integration and Continuous Deployment

**Student Name:** Tshewang Dorji 

**Student Number:** 02230312

**Module:** DSO101 – Continuous Integration and Continuous Deployment

**Assignment:** To-Do List Web Application Deployment

---  

# 1. Introduction

In this assignment, I developed and deployed a **simple To-Do List web application** using a containerized architecture with Docker. The application consists of three main components:

* **Frontend (FE):** User interface to manage tasks
* **Backend (BE):** API for CRUD operations
* **Database (DB):** Storage of tasks using SQLite

The main objective of this assignment was to understand how **Docker, Docker Hub, and Render** can be used to deploy and automate the build and deployment of a web application.

The assignment was completed in two parts:

* **Part A:** Building Docker images and deploying them on Docker Hub and Render
* **Part B:** Automating deployment using a Git repository and `render.yaml`

---

# 2. Technology Stack

The technologies used in this project are:

| Component        | Technology        |
| ---------------- | ----------------- |
| Frontend         | React             |
| Backend          | Node.js + Express |
| Database         | SQLite            |
| Containerization | Docker            |
| Image Registry   | Docker Hub        |
| Deployment       | Render            |
| Version Control  | GitHub            |

SQLite was used as the database because it is lightweight and easy to configure for small applications.

---

# 3. Application Architecture

The application follows a **three-tier architecture**:

```
Frontend (React)
        |
        | HTTP API Requests
        |
Backend (Node.js + Express)
        |
        | Database Queries
        |
Database (SQLite)
```

The frontend communicates with the backend through REST APIs, and the backend performs database operations on the SQLite database.

---

# 4. Environment Variables

Environment variables were used to configure environment-specific values such as server ports and API endpoints.

## Backend `.env`

```
PORT=5000
DB_PATH=./data/todos.db

```

These variables configure the backend server and database settings.

## Frontend `.env`

```
VITE_API_URL=http://localhost:5000
```

This variable defines the backend API endpoint used by the frontend.

The `.env` files were **added to `.gitignore`** to ensure sensitive configuration data was not committed to the repository.

---

# 5. Part A – Docker Image Build and Deployment

## 5.1 Dockerizing the Backend

I created a **Dockerfile** for the backend service.

### Backend Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV PORT=5000
ENV DB_PATH=/var/data/todos.db

EXPOSE 5000

CMD ["node", "src/server.js"]

```

This Dockerfile performs the following tasks:

1. Uses Node.js 18 Alpine as the base image
2. Sets the working directory
3. Installs dependencies
4. Copies the application files
5. Exposes port 5000
6. Starts the backend server

---

## 5.2 Building the Backend Image

I built the backend Docker image using the following command:

```
docker build -t tshewang7/backend-todo:02230312 .
```
![alt text](<Asset/Screenshot 2026-03-13 183806.png>)

---

## 5.3 Pushing the Image to Docker Hub

After building the image, I pushed it to Docker Hub:

```
docker push tshewang7/backend-todo:02230312
```
![alt text](<Asset/Screenshot 2026-03-13 183816.png>)


This allowed the image to be publicly available for deployment.

---

## 5.4 Deploying Backend on Render

To deploy the backend service:

1. I logged into Render.
2. Created a **New Web Service**.
3. Selected **Deploy from Existing Image**.
4. Entered the Docker Hub image:

```
tshewang7/backend-todo:02230312
```

### Environment Variables on Render

```
PORT=5000
DB_HOST=sqlite
```

Render then pulled the Docker image and deployed the backend service.
![alt text](Asset/image-1.png)
![alt text](<Asset/Screenshot 2026-03-13 184058.png>)
![alt text](Asset/image.png)

---

## 5.5 Dockerizing the Frontend

A Dockerfile was also created for the frontend application.

### Frontend Dockerfile

```dockerfile
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build


FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

ENV PORT=3000
EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]

```

---

## 5.6 Building and Pushing Frontend Image

```
docker build -t tshewang7/frontend-todo:02230312 .
docker push tshewang7/frontend-todo:02230312
```
![alt text](<Asset/Screenshot 2026-03-13 183856.png>)
![alt text](<Asset/Screenshot 2026-03-13 183928.png>)
---

## 5.7 Deploying Frontend on Render

The frontend service was deployed similarly by creating another **Render Web Service** using the Docker image.

Environment variable used:

```
VITE_API_URL=https://backend-todo-02230312.onrender.com

```

This allows the frontend to communicate with the deployed backend API.
![alt text](Asset/image-2.png)
![alt text](<Asset/Screenshot 2026-03-13 184206.png>)
![alt text](<Asset/Screenshot 2026-03-13 185341.png>)
![alt text](Asset/image-3.png)

## Docker
![alt text](<Asset/Screenshot 2026-03-13 184306.png>)
![alt text](<Asset/Screenshot 2026-03-15 091338.png>)

---

# 6. Database Configuration

For this project, I used **SQLite** as the database.

SQLite is a lightweight database that stores data locally in a file rather than running as a separate server. This makes it suitable for small applications and easy deployment.

The backend interacts with SQLite through SQL queries to perform CRUD operations:

* Create task
* Read tasks
* Update task
* Delete task

The database file is automatically created when the backend server starts.

---

# 7. Part B – Automated Deployment using Render Blueprint

To automate deployment, I configured a **Render Blueprint** using a `render.yaml` file.

This configuration allows Render to:

* Pull the GitHub repository
* Build Docker images
* Deploy services automatically when new commits are pushed

---

## Repository Structure

```
todo-app
│
├── frontend
│   ├── Dockerfile
│   └── .env.production
│
├── backend
│   ├── Dockerfile
│   └── .env.production
│
└── render.yaml
```

---

## render.yaml Configuration

The `render.yaml` file defines the multi-service deployment configuration for both frontend and backend services:

```yaml
services:
  - type: web
    name: be-todo
    env: docker
    plan: free
    dockerfilePath: ./backend/Dockerfile
    autoDeploy: true
    envVars:
      - key: PORT
        value: 5000
      - key: DB_PATH
        value: /tmp/todos.db

  - type: web
    name: fe-todo
    env: docker
    plan: free
    dockerfilePath: ./frontend/Dockerfile
    autoDeploy: true
    envVars:
      - key: PORT
        value: 3000
      - key: VITE_API_URL
        value: https://be-todo.onrender.com
      - key: REACT_APP_API_URL
        value: https://be-todo.onrender.com
```

### Key Configuration Details:

- **type: web** - Specifies this is a web service
- **env: docker** - Uses Docker for deployment
- **autoDeploy: true** - Enables automatic deployment on Git commits
- **dockerfilePath** - Path to the Dockerfile for each service
- **envVars** - Environment variables passed to the service at runtime

### Important Notes:

1. **Backend Service (`be-todo`)**:
   - Listens on port 5000
   - Uses temporary storage for SQLite database at `/tmp/todos.db`

2. **Frontend Service (`fe-todo`)**:
   - Listens on port 3000
   - **VITE_API_URL** must point to the backend service URL (https://be-todo.onrender.com)
   - This environment variable is used during the Docker build process to configure the API endpoint

---

## Steps to Deploy Using Render Blueprint

### Step 1: Connect GitHub Repository to Render

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** and select **"Blueprint"**

![Step 1: Create New Blueprint](Asset/step1-blueprint.png)

3. Select **"Connect a repository"** and authorize your GitHub account
4. Select the repository containing your code

### Step 2: Configure Blueprint

1. Render automatically detects the `render.yaml` file
2. Review the services configuration
3. Update any environment variables if needed (e.g., API_URL)

![Step 2: Blueprint Configuration](Asset/step2-config.png)

### Step 3: Deploy

1. Click **"Deploy"** to start the deployment process
2. Render will:
   - Clone the repository
   - Build Docker images for each service
   - Deploy both frontend and backend services

![Step 3: Deployment in Progress](Asset/step3-deploying.png)

### Step 4: Verify Deployment

1. Once deployment completes, you'll see the service URLs:
   - Backend: `https://be-todo.onrender.com`
   - Frontend: `https://fe-todo.onrender.com`

2. Click the frontend URL to access the application

![Step 4: Deployment Complete](Asset/step4-success.png)

---

## Automatic Deployment on Git Push

With `autoDeploy: true` configured:

1. **Trigger**: When you push a new commit to GitHub
   ```bash
   git add .
   git commit -m "Update application"
   git push origin main
   ```

2. **Process**: Render automatically:
   - Detects the new commit
   - Builds new Docker images
   - Redeploys the services

3. **Result**: Your application is updated without any manual intervention

---

## Troubleshooting Common Issues

### Issue 1: Frontend cannot connect to backend

**Solution**: Ensure `VITE_API_URL` environment variable in render.yaml points to the correct backend service URL (e.g., `https://be-todo.onrender.com`)

### Issue 2: Build fails with npm errors

**Solution**:
- Check that `package.json` dependencies are up to date
- Verify Docker image Node.js version compatibility
- Ensure `package-lock.json` is committed to the repository

### Issue 3: Environment variables not loading

**Solution**:
- For frontend: Environment variables must be passed at **build time** (configured in `render.yaml`)
- For backend: Environment variables are applied at **runtime**
- Restart services if manual changes are made

---

# 8. Continuous Integration and Continuous Deployment (CI/CD)

This project demonstrates a complete **CI/CD pipeline** using GitHub and Render:

## CI/CD Workflow

```
Developer commits code
         ↓
Git push to GitHub
         ↓
Render webhook triggered
         ↓
Clone repository
         ↓
Build Docker images
         ↓
Deploy services
         ↓
Application updated
```

## How It Works:

1. **Source Control**: Code is pushed to GitHub repository
2. **Trigger**: Render receives a webhook notification of the new commit
3. **Build**: Docker images are built based on Dockerfiles and render.yaml
4. **Deploy**: Services are deployed with updated code
5. **Automatic**: No manual intervention required

## Benefits:

- **Automation**: Eliminates manual deployment steps
- **Speed**: Changes are deployed within minutes
- **Reliability**: Consistent deployment process
- **Feedback**: Immediate feedback if builds fail
- **Scalability**: Easy to manage multiple services

---

# 9. Challenges Faced

During the development and deployment process, I encountered several challenges:

1. **Docker configuration errors** while building images.
2. **Environment variable configuration issues** between frontend and backend.
3. Deployment errors related to incorrect API URLs.
4. Ensuring the frontend correctly connects to the deployed backend service.

These issues were resolved through debugging Docker logs and verifying environment configurations.

---

# 10. Conclusion

This assignment helped me gain practical experience with modern DevOps tools and deployment workflows. I learned how to:

* Containerize applications using Docker
* Push images to Docker Hub
* Deploy services on Render
* Use environment variables for configuration
* Automate builds and deployments using GitHub and Render

The project demonstrated how CI/CD pipelines can streamline application deployment and improve development efficiency.

---


## Refferences 

- Docker docs: https://docs.docker.com/
- Build/push image: https://docs.docker.com/get-started/introduction/build-and-push-first-image/
- Render image deploy: https://render.com/docs/deploying-an-image
- Render env vars: https://render.com/docs/configure-environment-variables
- Render blueprint spec: https://render.com/docs/blueprint-spec
