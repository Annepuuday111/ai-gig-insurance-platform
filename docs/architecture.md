# Architecture Overview

The system flows from the delivery worker’s application to the final payment settlement as follows:

```
Delivery Worker App
        ↓
Frontend (React)
        ↓
Backend API (Node.js)
        ↓
AI Risk Prediction Engine
        ↓
Parametric Trigger System
        ↓
Claim Automation Engine
        ↓
Payment Gateway (Mock UPI)
```

Each layer handles a specific responsibility:
- **Frontend (React):** UI for workers and agents.
- **Backend API (Node.js):** Exposes REST endpoints, handles authentication, and orchestrates services.
- **AI Risk Prediction Engine:** Uses weather, traffic, pollution, and historical data to assess risk and calculate premiums.
- **Parametric Trigger System:** Evaluates predefined conditions (e.g., heavy rain > 60 mm) to automatically trigger claims.
- **Claim Automation Engine:** Generates claim records and initiates payout workflows.
- **Payment Gateway (Mock UPI):** Simulates instant payouts to workers.

This architecture enables a fully automated, AI‑driven insurance experience for gig workers.
