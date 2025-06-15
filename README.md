
# PharmaFlow
This project aims to enhance the efficiency and accuracy of hospital pharmacy operations by implementing a comprehensive system that integrates inventory management, prescription processing, and medication dispensing.

## Features
This system streamlines **hospital pharmacy operations** with automation and real-time tracking to improve medication delivery and patient care.

### 🔹 Authentication & User Management
- Secure **user sign-in and authentication** via Firebase Auth.
- **Role-based access control** for hospital admin, receptionist, doctors, nurses, pharmacy staff, and patients.
- **Multi-app authentication support** for multiple Firebase instances.

### 🔹 Digital Prescription Processing
- **Doctors enter prescriptions digitally**, removing the need for handwritten notes.
- **Prescriptions are instantly sent to the pharmacy**, eliminating manual handovers.
- **Pharmacy staff receive real-time alerts** and prepare medications promptly.
- **Patients are notified** once their medicines are ready for pickup.
- **Emergency patients receive bedside delivery** as a priority service.

### 🔹 Pharmacy Notification & Workflow Automation
- **Automated prescription updates** ensure pharmacy staff stay informed.
- **Emergency medication alerts** allow faster response for critical patients.
- **Peak-Hour Nurse Assistance:**  
  - When the **pharmacy is overloaded during peak hours**, notifications are sent to all nurses within the hospital.
  - Nurses can **voluntarily accept** the request and assist pharmacy staff with preparation or delivery.
  - The system **tracks nurse contributions**, allowing for incentives or recognition.

## Technologies Used
This project leverages **modern web technologies** to provide a secure and scalable solution.

### 🔹 Backend
- **Node.js** – Handles API requests and server-side logic.
- **Express.js** – Lightweight framework for efficient routing and middleware.

### 🔹 Frontend
- **React.js** – Dynamic user interface with fast rendering.
- **Redux** – State management for seamless data flow.

### 🔹 Database & Authentication
- **MongoDB** – NoSQL database for flexible and scalable data storage.
- **Firebase Auth** – Secure authentication for user roles.
- **JWT (JSON Web Tokens)** – Token-based security for authentication.

### 🔹 Deployment & Scalability
- **Docker** – Containerized deployment for consistency across environments.
- **Kubernetes** – Orchestrated scaling and management of services.

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/jayantpatel06/streamlined-hospital-pharmacy-operations.git
    ```
2. Navigate to the project directory:
   ```bash
   cd streamlined-hospital-pharmacy-operations/app
   ```
3. Install dependencies:
   ```bash
    npm install
    ```
4. Set up environment variables in a `.env` file:
    ```plaintext
    PORT=3000
    MONGODB_URI=mongodb://localhost:27017/pharmacy
    JWT_SECRET=your_jwt_secret
    ```
5. Start the application:
    ```bash
    npm start
    ```
## Usage
- Access the application via `http://localhost:3000`.
- Use the provided admin credentials to log in and manage pharmacy operations.  <br>

The following are the credentials of the registered hospitals:
i. To login as a hospitalA: (adminStaff) <br>
   Username: hospadmin@hospitala.com <br>
   Password: hospadmin@hospitala.com <br>
ii. To login as a hospitalC: (adminStaff) <br>
   Username: hospadmin@hospitalc.com <br>
   Password: hospadmin@hospitalc.com <br>

For detailed guidance on using the system, including hospital registration, staff management, patient operations, and pharmacy workflows, refer to the **[User Guide]** available on the top of Login Page.

## Folder Structure
The project is organized into the following directories to maintain scalability and efficiency:
```
app/
│
├── public/                # Static assets (e.g., icons, images) accessible directly by the browser
│
├── src/                   # Website source code and logic
│   ├── components/        # Reusable UI components
│   ├── config/            # Configuration files (e.g., Firebase setup)
│   │   └── firebase.js
│   ├── context/           # Context API providers (e.g., authentication)
│   │   └── AuthContext.jsx
│   ├── utils/             # Utility functions and default data
│   ├── App.jsx            # Main React component
│   ├── App.css            # Styles for the App component
│   ├── main.jsx           # JavaScript entry point (renders App to the DOM)
│   └── index.css          # Global CSS styles
│
├── package.json           # Project metadata, scripts, and dependencies
├── .gitignore             # Specifies files to exclude from Git tracking
├── index.html             # Main HTML file (entry point of the website)
└── README.md              # Project documentation

```

## Contributing
We welcome contributions to this project! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit them:
   ```bash
    git commit -m "Add your feature description"
    ```
4. Push your changes to your fork:
    ```bash
    git push origin feature/your-feature-name
    ``` 
5. Create a pull request to the main repository.
