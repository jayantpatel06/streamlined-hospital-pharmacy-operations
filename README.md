
# PharmaFlow
This project aims to enhance the efficiency and accuracy of hospital pharmacy operations by implementing a comprehensive system that integrates inventory management, prescription processing, and medication dispensing.
## Features
- **Inventory Management**: Real-time tracking of medication stock levels, expiration dates, and reorder alerts.
- **Prescription Processing**: Automated prescription verification, drug interaction checks, and dosage calculations.
- **Medication Dispensing**: Streamlined dispensing process with barcode scanning for accuracy and reduced errors.
- **Reporting and Analytics**: Detailed reports on medication usage, inventory turnover, and operational efficiency.
## Technologies Used
- **Backend**: Node.js, Express.js
- **Frontend**: React.js, Redux
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Docker, Kubernetes
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

i. To login as a hospitalA: (adminStaff) <br>
   Username: hospadmin@hospitala.com <br>
   Password: hospadmin@hospitala.com <br>
ii. To login as a hospitalC: (adminStaff) <br>
   Username: hospadmin@hospitalc.com <br>
   Password: hospadmin@hospitalc.com <br>
  
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
