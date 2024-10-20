# Lifomation README

Site is live at: https://lifomation.tech/

Watch the Youtube Demo at: https://www.youtube.com/watch?v=ypKxYnUK4Bs

<img src="https://ssl.gstatic.com/docs/doclist/images/empty_state_my_drive_v2.svg" alt="Lifomation Logo" width="200" height="100">


[![GitHub issues](https://img.shields.io/github/issues/yashankxy/lifomation)](https://github.com/yashankxy/lifomation/issues)
[![GitHub forks](https://img.shields.io/github/forks/yashankxy/lifomation)](https://github.com/yashankxy/lifomation/network)
[![GitHub stars](https://img.shields.io/github/stars/yashankxy/lifomation)](https://github.com/yashankxy/lifomation/stargazers)
[![GitHub license](https://img.shields.io/github/license/yashankxy/lifomation)](https://github.com/yashankxy/lifomation/blob/main/LICENSE)

## Table of Contents

1. [Project Title](#project-title)
2. [Project Description](#project-description)
3. [Technologies Used](#technologies-used)
4. [Challenges and Future Features](#challenges-and-future-features)
5. [Installation](#installation)
6. [Usage](#usage)
7. [Credits](#credits)

---

## Project Title

**Lifomation**

## Project Description

Lifomation is an advanced web application designed to securely store and manage essential documents, including health records, government IDs, tax forms, and other personal documents. Our platform integrates state-of-the-art technologies such as Optical Character Recognition (OCR) for text extraction and a sophisticated search engine that supports lightning fast queries. This enables users to quickly and easily locate their documents. Security and privacy are our top priorities, with features that allow for conditional access controls, ensuring that users can share documents selectively and securely.

### What Lifomation Does

- **Document Storage:** Secure and organized storage for all your important documents.
- **OCR Integration:** Converts images of documents into searchable and editable text.
- **Advanced Search:** Allows users to find documents using lightning fast queries.
- **Conditional Sharing:** Users can share documents with specific individuals under controlled conditions.
- **Real-time Updates:** Changes made by users are reflected immediately across the platform.

### **Technologies**

- **Frontend Framework:** Angular for a modern, type-safe user interface.
- **Frontend UI Library:** Primeng for styling
- **Backend API:** Express.js for building a RESTful API.
- **Database:** PostgreSQL for reliable and scalable data storage.
- **ORM:** TypeORM for efficient database interaction.
- **Deployment:** Docker and Docker Compose for seamless deployment on a Virtual Machine, ensuring consistency and reproducibility. Deployment files will be committed to GitHub along with CI files for automated image building.
- **Public Accessibility:** The application will be fully accessible to the public without any additional steps or requirements.
- **Third-party API:** Integration with Gemini AI API for natural language processing and document analysis.
- **OAuth 2.0:** Implementation of OAuth 2.0 for secure user authentication and authorization using Auth0.

### **Additional Requirements**
- **Real-time Updates:** The application will incorporate real-time features, such as instant notifications and changes for uploading, deleting, sharing and editing documents to reflect changes made by other users without requiring manual page refreshes.
- **OCR Integration (Long Running Task):** Lifomation leverages advanced Optical Character Recognition (OCR) using Tesseract technology to automatically convert scanned images or photos of documents into searchable and editable text. This process typically takes up to 10 seconds per document, depending on the document's size, complexity, and image quality.

### **Tech Stack**

- **Frontend:** Angular, TypeScript
- **Backend:** Express.js, Type ORM
- **Database:** PostgreSQL
- **API:** Gemini, MeiliSearch
- **Virtual Machine:** Docker, GCP
- **Security:** Auth0
- **Additional:** Real-time updates and Long-running task

 **Beta Version Milestone**

- **Search Functionality:** Implementation of a robust search engine.
- **Conditional Access Controls:** Development of access control mechanisms.
- **Deployment:** Initial deployment on a Virtual Machine using Docker.
- **OCR Integration:** Basic OCR functionality for text extraction.

 **Final Version Milestone**

- **Refinement:** Polish UI/UX, optimize performance, and conduct thorough testing.
- **Documentation:** Create comprehensive documentation for the project.
- **Deployment:** Final deployment and configuration.


## Walrus in Lifomation: Decentralized Storage for Sensitive Information
Walrus is a powerful solution integrated into Lifomation for decentralized storage, specifically designed to handle sensitive information securely. The process involves encrypting files before they are stored, ensuring that data remains private and protected from unauthorized access.

### How It Works
Encryption: Before uploading any file, Lifomation encrypts it using robust encryption algorithms. This means that even if the data is intercepted during transmission or accessed from storage, it remains unreadable without the correct decryption key.

Decentralized Storage: After encryption, the files are stored in a decentralized manner using Walrus. This distribution across multiple nodes enhances security and redundancy, reducing the risk of data loss or corruption.

Benefits of Using Walrus for Decentralized Storage
Enhanced Security: By encrypting files before storage, Lifomation ensures that sensitive information is safeguarded against unauthorized access. Even if the data is compromised, the encryption renders it useless without the corresponding key.

Data Privacy: Decentralized storage means no single entity controls the data. This minimizes the risk of data breaches that can occur in centralized systems, where a single point of failure can lead to massive data leaks.

Redundancy and Reliability: Storing files across multiple nodes enhances data durability. If one node goes down, the data can still be accessed from other nodes, ensuring high availability.

Lower Costs: Decentralized storage often reduces costs associated with traditional centralized data storage solutions. Users pay only for the storage they use without needing to invest in expensive infrastructure.

Censorship Resistance: By distributing data across a network of nodes, decentralized storage solutions like Walrus are less susceptible to censorship and control by any single authority. This ensures that users can retain access to their data regardless of external pressures.

User Control: With Lifomation and Walrus, users have more control over their data. They can manage their encryption keys and decide who can access their information, promoting a more user-centric approach to data management.


## Installation

To run Lifomation locally, follow these steps:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your_username/lifomation.git
   cd lifomation
   ```

2. **Set Up Docker:**
   Ensure you have Docker and Docker Compose installed on your machine. If not, you can download and install them from [Docker's official site](https://docs.docker.com/get-docker/).

3. **Build and Start the Containers and Run Server:**
   ```bash
   cd server
   docker-compose up -d
   npm install
   node app.ts
   ```

   4. **Build and Start the Containers and Run Server:**
   ```bash
   cd client
   npm install
   ng serve or npm run start
   ```

4. **Access the Application:**
   Open your browser and navigate to `http://localhost:4200` to view the application.

## Usage

### Uploading and Managing Documents

1. **Login/Sign Up:**
   - Go to the login page.
   - Sign up with your email or log in using OAuth 2.0 providers (e.g., Google, Facebook).

2. **Upload Documents:**
   - Navigate to the upload section.
   - Drag and drop your documents or select them from your file system.

3. **View and Search Documents:**
   - Use the search bar to find documents using keywords or natural language queries.
   - Click on a document to view its details and extracted text.

4. **Share Documents:**
   - Select a document and choose the share option.
   - Specify the email address of the person you want to share the document with and set access permissions.


## Credits

Lifomation was developed by:

- **Yashank Bhola** - [GitHub](https://github.com/yashankbhola) | [LinkedIn](https://www.linkedin.com/in/yashankbhola/)
- **Adam Badar** - [GitHub](https://github.com/adambadar) | [LinkedIn](https://www.linkedin.com/in/adambadar/)
- **Dhruv Patel** - [GitHub](https://github.com/dhruvpatel) | [LinkedIn](https://www.linkedin.com/in/dhruvpatel/)

Special thanks to the creators of the following tools and technologies:

- [Angular](https://angular.io/)
- [Express.js](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/)
- [Gemini](https://gemini.google.com/app)


## Learn More

For additional information and updates, please visit our Notion page: [Lifomation](https://yashankxy.notion.site/Lifomation-f3fff6a1973d4b35aa7f4a23f72f2b9b?pvs=4)
---

*Keep your documents safe and accessible with Lifomation.*
