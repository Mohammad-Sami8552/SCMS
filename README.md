Supply Chain Management System (SCMS) & Notification Engine
Welcome to the unified workspace for the SCMS Dashboard and its auxiliary Real-Time Notification Engine. This project uses a modular microservice architecture where the primary SCMS platform connects alongside a reactive, event-driven Spring Boot notification microservice. An internal link layout bridges the frontend, and an automated orchestration script boots the entire cluster instantly.

⚡ System Dependencies & Prerequisites
Make sure the following runtimes are installed globally on your machine before running the launch sequence:

Node.js (v18+ recommended)

Java Development Kit (JDK) (v17 or higher)

Apache Maven (If not using the bundled mvnw wrapper script)

PostgreSQL Server (v14+ running on default port 5432)

🗄️ Database Schema & Seeding Configuration
Open pgAdmin (or your preferred SQL client) and connect to your local PostgreSQL server.

Initialize an empty database named project.

Open a Query Tool instance pointing to your project database, paste the script below, and hit execute (F5):

SQL
CREATE SCHEMA IF NOT EXISTS config;
CREATE SCHEMA IF NOT EXISTS masters;

-- Primary User Registry Layout Matrix
CREATE TABLE IF NOT EXISTS config.user_mapping (
    userid SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    pwd VARCHAR(100) NOT NULL,
    otp VARCHAR(6) DEFAULT '123456',
    emp_name VARCHAR(100) NOT NULL,
    emp_designation VARCHAR(100),
    emp_contact_no VARCHAR(15),
    isblocked INT DEFAULT 0
);

-- Store Registry Details Table
CREATE TABLE IF NOT EXISTS masters.mas_store_details (
    store_id SERIAL PRIMARY KEY,
    store_code VARCHAR(50) NOT NULL UNIQUE,
    store_name VARCHAR(100) NOT NULL,
    store_type VARCHAR(20) DEFAULT 'BLOCK',
    officer_incharger_name VARCHAR(100),
    officer_incharger_mobile_no VARCHAR(15),
    officer_incharger_email VARCHAR(100)
);

-- Employee Profile Table
CREATE TABLE IF NOT EXISTS masters.mas_employee (
    emp_code SERIAL PRIMARY KEY,
    emp_name VARCHAR(100) NOT NULL,
    emp_designation VARCHAR(100),
    emp_contact_no VARCHAR(15),
    emp_emailid VARCHAR(100),
    store_code VARCHAR(50) REFERENCES masters.mas_store_details(store_code) ON DELETE SET NULL
);

-- Material Master Ledger Table
CREATE TABLE IF NOT EXISTS masters.mas_material (
    material_id INT PRIMARY KEY,
    material_code VARCHAR(50) NOT NULL UNIQUE,
    material_description TEXT NOT NULL,
    bis_code VARCHAR(50),
    hsn_code VARCHAR(50)
);

-- Approved Vendor Suppliers Table
CREATE TABLE IF NOT EXISTS masters.mas_supplier (
    supplier_id INT PRIMARY KEY,
    supplier_name VARCHAR(100) NOT NULL,
    supplier_description TEXT,
    supplier_address TEXT,
    supplier_contact_no VARCHAR(15),
    supplier_email VARCHAR(100)
);

-- Industrial Manufacturers Table
CREATE TABLE IF NOT EXISTS masters.mas_manufacturer (
    mnf_id INT PRIMARY KEY,
    mnf_name VARCHAR(100) NOT NULL,
    address TEXT,
    web_site VARCHAR(100)
);

-- Seed Standard Administrative Authentication Access Records
INSERT INTO config.user_mapping (username, pwd, otp, emp_name, emp_designation, emp_contact_no, isblocked)
VALUES ('Himanish', 'TRP_RD_2301', '123456', 'Himanish Saha', 'Administrator', '7970980068', 0)
ON CONFLICT (username) DO UPDATE SET emp_contact_no = '7970980068', otp = '123456', isblocked = 0;

-- Seed Basic Operational Store Masters
INSERT INTO masters.mas_store_details (store_code, store_name, store_type, officer_incharger_name, officer_incharger_mobile_no, officer_incharger_email)
VALUES 
('STR-001', 'RD Division Main Store', 'DIVISION', 'Amit Kumar', '9876543210', 'amit.rd@scms.gov'),
('STR-002', 'Block Sector Alpha Unit', 'BLOCK', 'Priya Sharma', '8765432109', 'priya.b@scms.gov')
ON CONFLICT (store_code) DO NOTHING;
🚀 Instant Deployment & Cluster Boot Sequence
You don't need to manually change directories or launch three separate terminal windows to run this app.

Go to your root directory folder space where run_all.bat is located.

Double-click the orchestration file:

run_all.bat

3. Windows will instantly spin up three distinct command windows tracking runtime executions across your sub-modules. **Keep these terminal windows open while testing.**

---

## 📡 Port Allocations & Microservice Endpoints

| Microservice | Technology Stack | Hosting Endpoint Path | Functional Scope |
| :--- | :--- | :--- | :--- |
| **SCMS Frontend Client** | React, Vite Engine | `http://localhost:3000` | Primary Dashboard Panel Interface |
| **SCMS Node API Engine** | Express, Node.js Server | `http://localhost:8080` | Client Data Mapping & JWT Session Validations |
| **Notification Engine** | Spring Boot, WebSockets | `http://localhost:8081` | Asynchronous Real-Time Pushed Alerts |
| **Database Server** | PostgreSQL Engine | `localhost:5432` | Data Persistence Storage & Listen/Notify Channels |

---

## 🔒 Verification & Sandboxed Login Testing Procedure

To verify everything is configured correctly, follow this simple workflow test:

1. Open your browser and head to: `http://localhost:3000`.
2. Toggle the radio button to **OTP Based Authentication Mode**.
3. Type in the default administrator username: **`Himanish`**.
4. Click **Get OTP** (ignore any placeholder alerts).
5. Input the sandboxed bypass validation passcode string: **`123456`**.
6. Match your input cleanly with the active alphanumeric **CAPTCHA string** code shown in the dark box, and click **Sign In**.
7. Once inside the main dashboard view, click the built-in **Notification Telemetry** link helper but
