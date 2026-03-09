# Architecture Overview

The system is composed of the following layers, flowing from the worker’s device to the payment settlement:

```
Worker Mobile/Web App
        ↓
Frontend (React)
        ↓
Backend API (Node.js)
        ↓
AI Risk Engine
        ↓
Parametric Trigger Engine
        ↓
Claim Automation
        ↓
Payment Gateway (Mock)
```

Each arrow represents a request/response flow where data moves from the UI to the backend services, through the AI‑driven risk assessment and trigger evaluation, culminating in an automated claim and mock payment.
