# Lifomation Project README

![Lifomation Logo](path_to_logo_image) <!-- Replace with the path to your logo image -->

[![GitHub issues](https://img.shields.io/github/issues/your_username/lifomation)](https://github.com/your_username/lifomation/issues)
[![GitHub forks](https://img.shields.io/github/forks/your_username/lifomation)](https://github.com/your_username/lifomation/network)
[![GitHub stars](https://img.shields.io/github/stars/your_username/lifomation)](https://github.com/your_username/lifomation/stargazers)
[![GitHub license](https://img.shields.io/github/license/your_username/lifomation)](https://github.com/your_username/lifomation/blob/main/LICENSE)

## Table of Contents

1. [Project Title](#project-title)
2. [Project Description](#project-description)
3. [Technologies Used](#technologies-used)
4. [Challenges and Future Features](#challenges-and-future-features)
5. [Installation](#installation)
6. [Usage](#usage)
7. [Credits](#credits)
8. [License](#license)
9. [Contributing](#contributing)
10. [Testing](#testing)

---

## Project Title

**Lifomation**

## Project Description

Lifomation is an advanced web application designed to securely store and manage essential documents, including health records, government IDs, tax forms, and other personal documents. Our platform integrates state-of-the-art technologies such as Optical Character Recognition (OCR) for text extraction and a sophisticated search engine that supports natural language queries. This enables users to quickly and easily locate their documents. Security and privacy are our top priorities, with features that allow for conditional access controls, ensuring that users can share documents selectively and securely.

### What Lifomation Does

- **Document Storage:** Secure and organized storage for all your important documents.
- **OCR Integration:** Converts images of documents into searchable and editable text.
- **Advanced Search:** Allows users to find documents using intuitive, natural language queries.
- **Conditional Sharing:** Users can share documents with specific individuals under controlled conditions.
- **Real-time Updates:** Changes made by users are reflected immediately across the platform.

### **Technologies**

- **Frontend Framework:** Angular for a modern, type-safe user interface.
- **Frontend UI Library:** Primeng for styling
- **Backend API:** Express.js for building a RESTful API.
- **Database:** PostgreSQL for reliable and scalable data storage.
- **ORM:** Sequelize for efficient database interaction.
- **Deployment:** Docker and Docker Compose for seamless deployment on a Virtual Machine, ensuring consistency and reproducibility. Deployment files will be committed to GitHub along with CI files for automated image building.
- **Public Accessibility:** The application will be fully accessible to the public without any additional steps or requirements.
- **Third-party API:** Integration with OpenAI's GPT API for natural language processing and document analysis.
- **OAuth 2.0:** Implementation of OAuth 2.0 for secure user authentication and authorization.

### **Additional Requirements**

- **Webhook Integration:** A webhook will be utilized to trigger specific actions within the application based on external events where someone requests access to a document. For example, a doctor requesting access to your health records. 
- **Real-time Updates:** The application will incorporate real-time features, such as instant notifications for document access requests, approvals/denials, shared document updates, system alerts, and presence indicators, to reflect changes made by other users without requiring manual page refreshes.
- **OCR Integration:** Lifomation leverages advanced Optical Character Recognition (OCR) technology to automatically convert scanned images or photos of documents into searchable and editable text. This process typically takes up to 10 seconds per document, depending on the document's size, complexity, and image quality.
- **Elastic Search:** Elastic Search enables users to quickly access documents through non-specifc/generalized search queries allowing for a seamless search experience.

### **Tech Stack**

- **Frontend:** Angular, TypeScript
- **Backend:** Express.js, Sequelize ORM
- **Database:** PostgreSQL
- **API:** Elastic Search, GPT
- **Virtual Machine:** Docker
- **Security:** Auth0
- **Additional:** Webhook integration, real-time updates



### Challenges and Future Features
 **Alpha Version Milestone**

- **Frontend:** Basic UI components for document upload, viewing, and search.
- **Backend:** API endpoints for document management and authentication.
- **Database:** Initial database schema and data models.
- **Uplaod:** Set up database to ensure documents, and image uploading.
- **Figma:** Create initial design
- **Login/Signup:** Authenticate and create Users

 **Beta Version Milestone**

- **Search Functionality:** Implementation of a robust search engine.
- **Conditional Access Controls:** Development of access control mechanisms.
- **Deployment:** Initial deployment on a Virtual Machine using Docker.
- **OCR Integration:** Basic OCR functionality for text extraction.

 **Final Version Milestone**

- **Refinement:** Polish UI/UX, optimize performance, and conduct thorough testing.
- **Documentation:** Create comprehensive documentation for the project.
- **Deployment:** Final deployment and configuration.



## Installation

To run Lifomation locally, follow these steps:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your_username/lifomation.git
   cd lifomation
   ```

2. **Set Up Docker:**
   Ensure you have Docker and Docker Compose installed on your machine. If not, you can download and install them from [Docker's official site](https://docs.docker.com/get-docker/).

3. **Build and Start the Containers:**
   ```bash
   docker-compose up --build
   ```

4. **Access the Application:**
   Open your browser and navigate to `http://localhost:3000` to view the application.

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

![Lifomation Screenshot](path_to_screenshot) <!-- Replace with the path to your screenshot -->

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
- [OpenAI](https://www.openai.com/)

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/your_username/lifomation/blob/main/LICENSE) file for details.

## Contributing

We welcome contributions from the community! To contribute to Lifomation:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes and commit them.
4. Push to your branch.
5. Open a Pull Request.

Please read our [Contributing Guide](CONTRIBUTING.md) for more details on our code of conduct and the process for submitting pull requests.

## Testing

To ensure Lifomation runs smoothly, we have included a suite of automated tests. To run these tests:

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Tests:**
   ```bash
   npm test
   ```

These tests cover various aspects of the application, including unit tests for backend functionalities and integration tests for the full application workflow.

---

Thank you for using Lifomation! If you encounter any issues or have suggestions for improvements, please open an issue on our [GitHub repository](https://github.com/your_username/lifomation/issues).

---

*Keep your documents safe and accessible with Lifomation.*
