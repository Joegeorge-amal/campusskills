@echo off
echo Starting CampusSkills Frontend...
cd c:\internship\campusskills\frontend
set VITE_API_URL=http://localhost:8080/api/v1
call npm run dev
