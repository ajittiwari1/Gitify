# 📈 Gitify: A GitHub Repo Analyzer

**Gitify** is a full-stack web application that provides a quick, comprehensive analysis of public GitHub repositories — **without requiring a local clone**.  
Whether you're a developer, project manager, or open-source enthusiast, Gitify helps you assess a project's **health, activity, and key insights** at a glance.

---

## 🚀 Features

### 🔹 AI-Powered Summaries
- Uses **Google Gemini API** to generate concise, human-readable summaries of the repository's purpose, features, and technologies.

### 🔹 Project Health Score
- Calculates a composite score based on:
  - ⭐ Stars
  - 🍴 Forks
  - 📅 Commit frequency
  - 👨‍💻 Contributor count  
- Provides a single number to represent a project's vitality.

### 🔹 Activity Metrics
- Interactive **line chart** showing commit activity over the past year.

### 🔹 Contributor Breakdown
- **Bar chart** showing top 20 contributors and their contribution counts.

### 🔹 Language Distribution
- **Pie chart** displaying programming languages used in the repository.

### 🔹 Live Progress Updates
- Uses **Server-Sent Events (SSE)** to provide real-time updates during analysis.

---

## 🛠️ Tech Stack

### **Frontend**
- React (Vite)
- Chart.js / Recharts for data visualization
- Tailwind CSS for styling

### **Backend**
- Node.js & Express
- GitHub REST API
- Google Gemini API
- Server-Sent Events (SSE)

---


---

## ⚙️ Getting Started

Follow these steps to run Gitify locally.

### **Prerequisites**
- Node.js (v18 or higher)
- A **Google Gemini API Key**  
  Get it from [Google AI Studio](https://aistudio.google.com/).

---

### 1️⃣ Clone the Repository
```bash
git clone [repository_url]
cd [repository_name]

---

## 🛠 Backend Setup

```bash
cd backend
npm install

Create a .env file in the backend directory:

GEMINI_API_KEY=YOUR_GEMINI_API_KEY
# ...and rest of the .env example code


Start the backend:
node index.js
# Or with live reload
npx nodemon index.js


💻 Frontend Setup

cd ../client
npm install
npm run dev


💡 Why Gitify is a Great Portfolio Project

Gitify showcases skills in:

Full-Stack Development

Backend: Node.js, Express

Frontend: React, Vite

API Integration: GitHub REST API, Google Gemini API

Real-Time Communication: Server-Sent Events (SSE)

Data Visualization: Charts and graphs from live API data

AI Integration: Summarizing complex repository data with LLMs

Clean Architecture: Modular, scalable, and maintainable codebase

🔮 Possible Future Enhancements

Deeper Code Analysis – Analyze code quality metrics (cyclomatic complexity, duplication, etc.).

Pull Request Insights – Average time to merge, close issues, and PR success rates.

User Profile Analysis – Analyze entire GitHub profiles (top repositories, contributions, top languages).

Export Reports – Allow downloading PDF reports of the repository analysis.