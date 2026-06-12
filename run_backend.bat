@echo off
echo Starting CampusSkills Backend...
cd c:\internship\campusskills\backend
set FRONTEND_ORIGIN=http://localhost:3000
call mvn clean compile
call mvn "-Dexec.mainClass=com.campusskills.MainVerticle" exec:java
