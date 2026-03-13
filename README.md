# DSO101 Assignment 1 - CI/CD To-Do App

## Student submission format

Repository/folder naming format required by assignment:

`studentname_studentnumber_DSO101_A1`

---

## Tech stack used

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: SQLite (persistent file DB)

---

## Step 0 (Prerequisite): Local app with `.env`

### 1) Backend local setup

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

Backend runs on `PORT` from `.env` (default `5000`).

### 2) Frontend local setup

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Frontend reads API URL from `.env`:

- `VITE_API_URL=http://localhost:5000`
- (also supported: `REACT_APP_API_URL=http://localhost:5000`)
- In Docker/Render, the container writes `config.js` at startup so runtime env values are used without rebuilding.

### 3) `.env` handling

- `.env` files are ignored in `.gitignore` (`**/.env`).
- Use `.env.example` / `.env.production` templates for safe sharing.

---

## Part A: Build and push Docker images to Docker Hub

### Backend image

```bash
cd backend
docker build -t <yourdockerhub>/be-todo:<student_id> .
docker push <yourdockerhub>/be-todo:<student_id>
```

### Frontend image

```bash
cd frontend
docker build -t <yourdockerhub>/fe-todo:<student_id> .
docker push <yourdockerhub>/fe-todo:<student_id>
```

Use your student ID as the image tag (example: `02190108`).

### Deploy pre-built images on Render

1. Create backend web service from existing Docker Hub image.
2. Set backend env vars in Render dashboard:
   - `PORT=5000`
   - `DB_PATH=/var/data/todos.db`
   - Add a persistent disk mounted at `/var/data` (size `1 GB` is enough for this assignment)
   - Backend Docker image is already aligned with these defaults (`PORT=5000`, `DB_PATH=/var/data/todos.db`)
3. Create frontend web service from existing Docker Hub image.
4. Set frontend env vars:
   - `PORT=3000`
   - `VITE_API_URL=https://<your-backend-service>.onrender.com`
   - `REACT_APP_API_URL=https://<your-backend-service>.onrender.com`
   - (either one is fine; `VITE_API_URL` is preferred)

---

## Part B: Automated build + deployment from GitHub (Blueprint)

This repo includes a Render blueprint file:

- `render.yaml`

It defines two Docker services:

- `be-todo` (backend)
- `fe-todo` (frontend)

### Enable auto-deploy on commit

1. Push this repository to GitHub.
2. In Render, create **Blueprint** from your repo.
3. Render reads `render.yaml` and creates both services.
4. Every new commit to GitHub triggers rebuild/redeploy automatically.

---

## Files added/updated for assignment

- `backend/Dockerfile`
- `frontend/Dockerfile`
- `render.yaml`
- `backend/.env.production`
- `frontend/.env.production`
- `frontend/vite.config.js` (supports `REACT_APP_*` env prefix)
- `.gitignore` (ignore nested `.env` files)

---

## Submission checklist

- [ ] App runs locally using `.env` files.
- [ ] Backend and frontend images are pushed to Docker Hub with student ID tag.
- [ ] Render deployment is successful for both services.
- [ ] Auto-deploy is verified by pushing a new commit.
- [ ] README includes screenshots for each major step:
  - local run
  - docker build/push
  - render service config
  - successful deployment URLs
  - auto-redeploy after commit

---

## Useful links

- Docker docs: https://docs.docker.com/
- Build/push image: https://docs.docker.com/get-started/introduction/build-and-push-first-image/
- Render image deploy: https://render.com/docs/deploying-an-image
- Render env vars: https://render.com/docs/configure-environment-variables
- Render blueprint spec: https://render.com/docs/blueprint-spec
