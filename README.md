## Browser Attack Behavior Simulator (ABE Bypass Visualizer):

# Overview
This project is a full-stack web application that simulates modern browser-based cyberattacks and analyzes their behavior. It focuses on demonstrating how advanced malware can bypass traditional security mechanisms by exploiting runtime behavior rather than stored data.
The system allows users to run simulated attack scenarios, visualize attack steps, and understand how suspicious activities can be detected using behavior-based analysis.

# Problem Statement
Modern malware techniques, such as those used by advanced information stealers, rely on stealthy behaviors like memory access and debugger attachment instead of traditional exploits. These techniques are difficult to detect and understand using conventional security tools.
This project addresses the lack of visibility into such attacks by providing a platform to simulate and analyze them in a safe and educational
environment.

# Tech Stack
Frontend: React.js

Backend:Node.js with Express

Database:Google Cloud Firestore

# How It Works
1)User logs into the system

2)Creates a new simulation

3)The system runs a predefined attack scenario

4)Each step of the attack is logged and displayed

5)The detection engine analyzes behavior

6)A risk score and suggestions are generated

## Run Locally
1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
