<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Architecture-Microservices-blueviolet?style=for-the-badge" alt="Architecture" />
  <img src="https://img.shields.io/badge/Framework-Spring_Boot_3-6db33f?style=for-the-badge" alt="Framework" />
  <br/><br/>
  
  <h1 style="color: #1a365d;">🛡️ GigShield: AI-Powered Gig Economy Insurance Ecosystem 🛡️</h1>
  
  <p style="color: #2d3748; font-size: 1.25em;"><b>Empowering India's Delivery Partners Through Automated Parametric Finance & Advanced Risk Processing</b></p>
</div>

---

## 🎯 Main Purpose of the Project

**GigShield** is an advanced, automated backend infrastructure specifically engineered to protect India's gig workers (Zomato and Swiggy delivery partners) against uncontrollable income loss caused by environmental and administrative disruptions. 

It uses **AI-driven parametric models** to automatically monitor weather patterns, dynamically compute localized premiums, evaluate fraud risks, and directly disperse financial relief to delivery partners when working conditions become unsafe or impossible — **all entirely autonomously without the worker needing to file a single manual claim.**

---

## 🛠️ Tools & Technologies Used

We assembled this application with enterprise-grade scaling and fault-tolerance in mind.

| Component | Technology / Tool utilized | Core Responsibility |
| :--- | :--- | :--- |
| 🟨 **Backend API** | <span style="color:#007396"><b>Java 17, Spring Boot 3</b></span> | High-performance RESTful API orchestrating all primary computational logic and UI connections. |
| 🛡️ **Security Gateway** | <span style="color:#6cb52d"><b>Spring Security, JWT</b></span> | Stateless, highly-secure encrypted token infrastructure bypassing classic session hijack risks. |
| 💾 **Data Persistence** | <span style="color:#00758F"><b>MySQL 8, Hibernate (JPA)</b></span> | Relational DB maintaining strict transactional integrity for all payment ledgers. |
| 🐍 **AI & Fraud Engine** | <span style="color:#3776AB"><b>Python 3.11, FastAPI, Scikit-learn</b></span> | Machine learning cluster executing advanced anomaly detection and pricing algorithms based on GPS/weather behavior. |
| ☁️ **Environmental Data** | <span style="color:#f26522"><b>OpenWeatherMap API</b></span> | Real-time meteorological data collection triggering automated claims when bounds are breached. |

---

## 🏗️ The Models: Roles, Functions & Architecture

Our database schema is highly interrelated and strictly constrained to prevent race conditions during money movements.

### 👤 1. `User` Model
* **Core Role:** The central ledger capturing the gig worker's identity, geographic location, and live funds.
* **How It Works:** Tracks vital markers like `platform` (Zomato/Swiggy), specific boundaries (`district`, `mandal`), and acts as the vault holding the user's `walletBalance`. It actively facilitates OTP challenge checks for 2FA.

### 👑 2. `Admin` Model
* **Core Role:** High-clearance supervisor entity ensuring policy stabilization.
* **How It Works:** Admins bypass standard security gates to tweak the system. They adjust parametric threshold limits (e.g., maximum temperature bands) and approve/reject claims that the Python AI flagged as mathematically suspicious. 

### 🛡️ 3. `Plan` Model
* **Core Role:** Blueprint mapping out risk vs. coverage tiers (Starter, Smart, Pro, Max).
* **How It Works:** Holds standard properties like `weeklyPremium` and `coverageAmount`. It acts as the seed which the AI Risk engine manipulates to produce a localized user premium variant.

### 📜 4. `Subscription` Model
* **Core Role:** The active risk-contract securely tying a `User` to a `Plan` for a specific 7-day window.
* **How It Works:** Mitigates platform abuse by enforcing strict chronological validity limits (`startDate` and `endDate`). If a disaster hits naturally, the server strictly references only these active binding contracts.

### 🚨 5. `ClaimRequest` Model
* **Core Role:** Forensic record documenting exactly when and how the system reacted to a disaster.
* **How It Works:** Auto-instantiated during a threshold breach. It embeds the exact reason code (e.g. `RAINFALL_EXCEEDED`), maps the generated `fraudScore`, and determines the payout queue status (`APPROVED` or `FLAGGED`).

### 💸 6. `Payment` Model
* **Core Role:** The immutable financial tracking block representing money in motion.
* **How It Works:** Safely regulates all `CREDIT` and `DEBIT` directives utilizing database level pessimistic locks to protect parallel dual-entry ledger accounting avoiding phantom additions and deductions.

### 🔔 7. `Notification` Model
* **Core Role:** Asynchronous external communication router.
* **How It Works:** Immediately pushes messages advising users of completed transactions or urgent subscription renewals.

---

## 🔄 The Comprehensive Working Flow

This backend operates actively rather than reactively through rigorous background task loops. 

1. **User Onboarding & Micro-Pricing:**
   * Delivery partner opens an account selecting their home district. 
   * The Risk microservice contacts the AI Engine: *"What is the risk severity rating for Chennai during this week?"* 
   * AI interpolates multi-year flood models generating a localized `Risk Multiplier`. The Java API calculates the premium; the User purchases a `Subscription`.

2. **The 24/7 AI Watchdog (Auto-Claim Initialization):**
   * A Spring `@Scheduled` worker job automatically initializes every 60 minutes.
   * It gathers arrays of active subscriptions globally and streams bulk API requests to `OpenWeatherMap`.
   * It logically assesses: *"Did the Rain volume reported in Bengaluru just exceed our 65mm critical line?"* 

3. **Fraud Anomaly Check:**
   * Whenever bounds are broken, the Java Engine instantaneously generates a pending `ClaimRequest`.
   * It pushes the footprint to the Python FastAPI logic which assesses velocity logic, GPS telemetry overlap, and user behavioral claim history.
   * A Risk Score (0-100) is returned. 

4. **Instant Liquidity Generation:**
   * If the rating confirms high-fidelity precision (Fraud Score < 20), a transaction block opens.
   * A `Payment` moves the money strictly to the specific User's `walletBalance`.
   * A `Notification` hits resolving the process: *"Disruption registered. Your GigShield wallet has been credited with ₹1,200."*

---

## 🔐 Comprehensive Deep-Layer Security

We architected an enterprise-level, multi-staged security environment natively immune to conventional interception threats.

* 🛡️ **JWT Stateless Context Framework:**
  The server carries completely *zero state*. Cryptographically signed JSON Web Tokens process authentication payload data reducing server cluster memory waste and nullifying dangerous CSRF (Session-hijacking) hacks entirely.
* 🛡️ **`JwtAuthenticationFilter` Barrier Firewall:**
  Our core file `SecurityConfig.java` guarantees every single incoming REST payload runs a gauntlet before invoking logic variables. The filter ensures tokens hold signature structural validity before injecting credentials into the actual thread memory pool.
* 🛡️ **Military-Grade Hashing Logic:**
  All user identification relies on `BCryptPasswordEncoder`. Cleartext passwords and system inputs undergo intense iterative hashing to completely obscure traces in the database.
* 🛡️ **OTP Cryptographic Injection:**
  Extremely sensitive modifications are barricaded via temporal logic checks where users must complete an OTP check bound by a strict database column timestamp (`otpExpiry`).
* 🛡️ **Role-Based Access Control Filtering (RBAC):**
  Internal mappings differentiate standard UI worker flows dynamically versus Administrative routes. Only bearer tokens injecting the `ROLE_ADMIN` context unlock core administrative tools (`.hasRole("ADMIN")`).
* 🛡️ **Cors Web Fortification:**
  We rigidly enforce wildcard restrictions blocking `Access-Control-Allow-Origin: *` to authenticated streams.

---

## 📂 Complete Project Structure & Modification Guide

If you are a developer looking to understand the codebase or need to modify the internal logic, here is an explicit map of the project structure indicating **exactly where you need to go to make changes**:

```text
ai-gig-insurance-platform/
│
├── 🟨 backend/                       # ➔ Java Spring Boot Core API
│   ├── pom.xml                       # Dependency management (Java)
│   └── src/main/
│       ├── java/com/example/aiinsurance/
│       │   ├── controller/           # API routes (Change here to add new REST endpoints)
│       │   ├── model/                # Database entities (Change here to add new columns to User/Plan)
│       │   ├── repository/           # Database queries (JPA interfaces)
│       │   ├── security/             # Security filters (Modify JwtAuthenticationFilter or SecurityConfig here)
│       │   └── service/              # ➔ Core Business Logic (Modify AutoClaimService scheduler here!)
│       │
│       └── resources/
│           └── application.properties # ➔ 🚨 CRITICAL CHANGE REQUIRED: Update your local MySQL credentials here!
│
├── 🐍 ai-model/                      # ➔ Python AI & Fraud Detection API
│   ├── requirements.txt              # Dependency management (Python)
│   ├── main.py                       # FastAPI entry point (Change to add new Python AI endpoints)
│   └── logic/                        # Scikit-learn Risk Models & Fraud API integrations
│       # ➔ Setup required: You must inject the OWM_API_KEY environment variable to use the weather models.
│
├── 💻 frontend/                      # ➔ React UI Dashboard
│   ├── package.json
│   └── src/
│       ├── components/               # React UI elements
│       └── utils/api.js              # ➔ Setup required: Change Axios base URLs here to point to Prod if deploying.
│
└── 📄 README.md                      # Architecture documentation (You are here!)
```

### 📍 Where exactly do I go to change things?
* **To change Database Credentials:** ➔ Go straight to `backend/src/main/resources/application.properties` and replace the username/password.
* **To add/modify a Model (like adding a 'License Plate' to User):** ➔ Change `backend/src/main/java/com/example/aiinsurance/model/User.java`.
* **To modify the auto-claim scheduler frequency:** ➔ Adjust the `@Scheduled` tag inside `backend/src/main/java/com/example/aiinsurance/service/AutoClaimService.java`.
* **To tighten or loosen CORS Security:** ➔ Go to `backend/src/main/java/com/example/aiinsurance/security/SecurityConfig.java`.

---

## 💻 Instructions to Run & Launch Project (Pin-by-Pin)

For Users and Reviewers configuring the GigShield Backend instance for deployment or development: Follow these steps accurately.

### ⚙️ Step 1. Base Requirements Installation
Before setting up, ensure your workstation holds the fundamental interpreters.
- [Java Development Kit 17+](https://adoptium.net/temurin/releases/) installed.
- [Python 3.11+](https://www.python.org/downloads/) installed.
- [MySQL Server 8.0+](https://dev.mysql.com/downloads/) installed and operating on port `3306`.

### 🗄️ Step 2. Database Provisioning & Authentication Fixes
**Important Variables to change:** You must allocate the proper structural DB prior to booting the program. 

Open your local MySQL CLI (or client like DBeaver/Workbench):
```sql
CREATE DATABASE gigshield;
```

**Navigate to:** `GigShield/backend/src/main/resources/application.properties`
Modify the connection details rigorously mapping your personal local DB parameters:
```properties
## !! CHANGE THESE STRINGS !! ##
spring.datasource.url=jdbc:mysql://localhost:3306/gigshield
spring.datasource.username=YOUR_ACTUAL_MYSQL_USERNAME_HERE
spring.datasource.password=YOUR_ACTUAL_MYSQL_PASSWORD_HERE
```

### 🚀 Step 3. The Ultimate One-Click Startup (`start.sh` / `start.bat`)

You don't need to manually start each service sequentially! We have provided an autonomous orchestration script that handles everything. 

**⚠️ Wait! Before running the script, you must verify your environment:**
1. Open up a terminal and check that these commands return valid versions:
   * `java -version` ➔ (Must be Java 17+)
   * `mvn -v` ➔ (Maven must be accessible in your system PATH)
   * `npm -v` ➔ (Node Package Manager must be installed for the React Frontend)
   * `python --version` or `python3 --version` ➔ (Python must be accessible for the AI Engine)
2. Ensure you have accurately changed the Database Credentials in `application.properties` (as outlined in Step 2).
3. *(Mac/Linux only)* Make sure you grant the script executable permissions: 
   ```bash
   chmod +x start.sh
   ```

**Now, run the orchestration script!**
```bash
# On macOS / Linux terminal
./start.sh

# On Windows (Command Prompt / PowerShell)
start.bat
```

**What exactly happens when you run this script?**
Instead of manually typing build commands, the script does the heavy lifting synchronously:
1. 🧹 **Port Lock Cleanup:** It aggressively searches for and kills any frozen background processes blocking ports `4000`, `8000`, and `5173` to prevent startup collisions.
2. 🤖 **AI Engine Virtualization:** It navigates to `ai-model/`, automatically generates an isolated Python Virtual Environment (`venv`), auto-installs `scikit-learn` & `FastAPI` dependencies quietly, and launches the AI server on **Port 8000**.
3. 🖥️ **Java Spring Compilation:** It enters `backend/`, suppresses messy maven logs, executes a `mvn clean install` to build the `.jar`, generates your MySQL relational tables automatically, and binds the REST API to **Port 4000**.
4. 🌐 **React UI Spinning:** It jumps into `frontend/`, executes a silent `npm install` for node modules, and boots the interactive user GUI to **Port 5173**.
5. ⏳ **Live Health Monitoring:** It continuously pings the health endpoints of all three active services. Once it detects HTTP 200 OK statuses across the board, it outputs the master success checklist!

### 🤝 Step 4. Integration Verification
If successfully orchestrated by the automation script, you can visit the active hubs immediately:
- **Frontend Dashboard:** ➔ `http://localhost:5173`
- **Backend API Layer:** ➔ `http://localhost:4000/api/plans` 
- **AI Fraud Visualizer (Swagger):** ➔ `http://localhost:8000/docs`

> 🛑 **How to Stop?** To shut down the entire GigShield platform, simply press **`Ctrl+C`** exclusively within the terminal running the script. It will intercept the shutdown signal and gracefully terminate all three processes (Java, Python, Node) simultaneously without leaving hanging ports!