# AI-Powered Parametric Insurance Platform for Gig Workers

An **AI-based parametric insurance platform** designed to protect gig delivery workers (Zomato, Swiggy, Amazon, etc.) from **income loss caused by external disruptions** such as heavy rain, floods, or curfews.

---

## 1. Problem Statement

Gig delivery workers depend on daily earnings. External disruptions like **extreme weather, floods, or sudden curfews** prevent them from working, causing immediate financial distress. Currently, standard insurance lacks the speed and automation to provide the "instant relief" these workers need for short-term disruptions.

---

## 2. Our Solution

We have built a high-tech **Parametric Insurance Platform** that replaces manual claims with **AI-driven automation**. The system uses real-time data to trigger payouts instantly when disaster strikes, ensuring workers are never left without a safety net.

---

## 3. Key Accomplishments & Features

### 🛡️ Smart Insurance Plans
- **Dynamic Pricing**: AI-calculated weekly premiums starting as low as ₹10.
- **Weekly Cycle**: Aligned with gig worker payout cycles (7-day policies).
- **One-Plan-Per-Week Rule**: Strictly enforced logic to prevent duplicate subscriptions and ensure sustainable coverage.

### 🌩️ AI Parametric Triggers
- **Real-Time Monitoring**: Automatically detects extreme weather or curfews in a user's specific district.
- **Proactive Alerts**: Notifies users when they are eligible for a claim based on detected disasters.
- **Auto-Filing**: AI can proactively file claims for users when triggers are met.

### 💰 Automated Claim System
- **Transparent History**: Detailed logs of all past claims, including **Purchased Date**, **Coverage Amount**, and **Claimed-On** timestamps.
- **Status Tracking**: Clear visibility into **Active**, **Claimed**, and **Expired** policies.
- **One-Payout-Per-Week**: A fair-use policy that permits one successful insurance payout every 7 days.

### 🤖 AI Core (Integrated)
- **Fraud Detection Engine**: Analyzes claim requests for GPS spoofing and suspicious patterns, assigning a risk score.
- **Dynamic Risk Assessment**: Adjusts plan recommendations and premiums based on the user's location and historical disruption data.

### 🏢 Partner Integration
- **Platform Specific Branding**: The UI dynamically adapts its theme (colors, logos, banners) based on the user's gig platform (e.g., Zomato Red, Swiggy Orange, Amazon Blue).
- **Verified Gigs**: Integration logic to ensure only active partners can subscribe.

### 👮 Admin Control Center
- **Wallet Management**: Admins manage a central "Insurance Fund" wallet.
- **Claim Oversight**: Tools to review, approve, or reject manually filed claims.
- **User Management**: full control over user accounts and support queries.

---

## 4. Technical Stack

### **Frontend**
- **React.js**: Modern, responsive UI with dynamic theme switching.
- **React Icons**: For a premium, intuitive interface.
- **CSS3 Variables**: Used for the platform-specific "Glassmorphism" design.

### **Backend**
- **Java / Spring Boot**: High-performance, scalable API handled via REST.
- **Spring Security (JWT)**: Secure, token-based authentication.
- **MySQL**: Relational database for robust transaction and subscription management.

### **AI Microservice**
- **Python / Flask**: Specialized engine for fraud detection and parametric monitoring.

---

## 5. System Workflow

1. **Register**: Worker joins and selects their gig platform (Blinkit, Amazon, etc.).
2. **Subscribe**: Worker selects a weekly plan (₹20 - ₹60) using a mock UPI/Card gateway.
3. **Monitor**: The AI engine monitors weather and local conditions 24/7.
4. **Trigger**: If a parametric condition is met (e.g., Rain > 60mm), the user is alerted.
5. **Claim**: User clicks "Claim" and receives **instant wallet credit** from the Admin Insurance Fund.
6. **Cycle**: The policy expires after 7 days or upon claim, and the user can renew for the next week.

---

## 6. Data Models (Backend)

The system is built on a robust relational schema using **JPA/Hibernate** for persistent storage.

### 👤 User
The core entity representing the gig worker.
- **Location**: Stores `state`, `district`, and `mandal` for geography-based parametric triggers.
- **Finance**: Tracks `walletBalance` for claim payouts.
- **Platform**: Identifies the gig partner (Zomato, Swiggy, etc.) for dynamic branding.

### 📜 Plan
Defines the insurance products available for subscription.
- **Fields**: `name`, `weeklyPremium`, `coverageAmount` (max payout), `riskLevel`, and `trialDays`.
- **Features**: List of benefits displayed in the UI.

### 🎫 Subscription
Maps a User to a specific Plan for a 7-day policy period.
- **Statuses**: `TRIAL`, `PENDING`, `ACTIVE`, `EXPIRED`, `CANCELLED`.
- **Lifecycle**: Automatically tracks `startDate`, `nextPaymentDate`, and `endDate`.

### 💳 Payment
Logs all financial transactions (subscriptions & trials).
- **Methods**: `UPI`, `CARD`, `WALLET`, `FREE_TRIAL`.
- **Traces**: Stores `gatewayReference` and `claimedAt` timestamps for audit trails.
- **Claim Status**: `isClaimed` flag marks if this specific payment period resulted in a payout.

### ⚠️ ClaimRequest
Handles disaster-specific parametric claims (e.g., Floods, Rain).
- **Situations**: `FLOOD`, `RAIN`, `CURFEW`, `POLLUTION`.
- **Approval**: Tracks `status` (`PENDING`, `APPROVED`, `REJECTED`) and prevents duplicate claims via `isClaimed`.

### 💼 Partner
Powers the multi-tenant branding engine.
- **Aesthetics**: Stores `logoUrl`, `dashboardBannerUrl`, and `borderColor`.
- **Logic**: Used to dynamically restyle the entire frontend dashboard based on the worker's gig partner.

### 🛡️ Admin
Represents the system administrator and the **Insurance Fund**.
- **Wallet**: `walletBalance` acts as the central fund that collects premiums and pays out claims.
- **Credentials**: Secured with Bcrypt for administrative control.

### 💬 Query & Notification
- **Query**: Tracks support tickets raised by users and the corresponding admin responses.
- **Notification**: Real-time alerts for claim status, parametric triggers, and payment confirmations.

---

## 7. Admin Portal & Credentials

The system includes a dedicated administrative interface for platform management.

- **Admin Email**: `Gigadmin@gmail.com`
- **Admin Password**: `gigadmin@123`
- **Access**: Log in through the standard login page; the system automatically redirects to the Admin Dashboard based on your role.
- **Capabilities**: Fund management, user auditing, manual claim approvals, and partner styling configuration.

---

## 8. Parametric Trigger Conditions

Claims are triggered based on the following environmental and social parameters:

| Disruption | Condition | Action |
| :--- | :--- | :--- |
| **Heavy Rain** | Precipitation > 60mm | Automatic payout alert |
| **Flood** | Localized flood alert issued | Auto-claim triggered |
| **Pollution** | AQI > 400 (Severe) | Health hazard compensation |
| **Curfew** | Police zone lockdown | Income loss protection |

---

## 9. AI Integration Specifics

Our AI microservice (Python/Flask) performs three critical roles:

1.  **Risk Score Engine**: Generates a risk profile (0-100) for each worker based on their historical delivery patterns and local weather forecasts.
2.  **Fraud Detection**: Before any claim is processed, the AI checks for **GPS Spoofing** and **Duplicate Activity**. High-risk claims are flagged for manual admin review.
3.  **Dynamic Premium Scaling**: Instead of fixed prices, AI can suggest adjusted premiums (e.g., ₹38 instead of ₹40) based on real-time environmental risk in the worker's district.

---

## 10. How to Run

### **Prerequisites**
- Java 17+
- Node.js 18+
- MySQL 8.0+
- Python 3.9+

### **Backend Setup**
1. Configure `backend/src/main/resources/application.properties` with your MySQL credentials.
2. Run the Spring Boot application: `./mvnw spring-boot:run`

### **Frontend Setup**
1. Navigate to `frontend` folder.
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

### **AI Setup**
1. Navigate to `ai-model` folder.
2. Install requirements: `pip install -r requirements.txt`
3. Start the engine: `python main.py`

---

## 11. Repository Structure

```text
ai-gig-insurance-platform/
├── backend/            # Spring Boot (Java) API
│   ├── src/main/java/  # Java Source Code (Models, Controllers, Services)
│   └── src/main/resources/ # Configuration & Properties
├── frontend/           # React.js SPA
│   ├── src/pages/      # Dashboard, Claims, Plans, Payment pages
│   └── src/api.js      # API interaction layer
├── ai-model/           # Python (Flask) Risk & Fraud Engine
├── docs/               # Technical designs & wireframes
└── assets/             # Branding & screenshots
```

---

## 12. Current Project Status
- ✅ **Phase 1 (Core)**: Authentication, Dashboard, and Plan Selection are fully operational.
- ✅ **Phase 2 (Automation)**: Parametric logic, Wallet system, and Claim automation are integrated.
- ✅ **Phase 3 (AI & Security)**: Fraud detection and status-length database fixes are complete.
- 🚀 **Next Steps**: Real-world API integration for weather data and production-ready payment gateways.

---
*Created with ❤️ for the Gig Economy.*