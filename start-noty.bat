@echo off
cd /d "C:\Users\redub\Desktop\Projects\DD Noty\noty"
start cmd /k npm run dev

timeout /t 3 > nul

start http://localhost:5173