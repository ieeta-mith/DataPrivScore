
<div align="center">

  <img src="images/logo.png" alt="DataPrivScore Logo" width="240" height="auto" />
  

  **A lightweight tool for calculating data privacy risk through a transparent, quantitative scoring model.**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
  [![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

  [Report Bug](https://github.com/ieeta-mith/DataPrivScore/issues) • [Request Feature](https://github.com/ieeta-mith/DataPrivScore/issues)

</div>

---

## 📖 Overview

**DataPrivScore** solves the ambiguity of data privacy by converting complex risk factors into a clear, numerical score. Designed for developers, data officers, and compliance teams, this tool provides a standardized way to evaluate datasets or systems against privacy benchmarks.

Unlike opaque "black box" assessments, DataPrivScore utilizes a transparent scoring algorithm, allowing users to understand exactly which factors—such as data sensitivity, retention policies, or encryption standards—are impacting their privacy posture.

## ✨ Key Features

* **Quantitative Scoring:** Instantly calculates a risk score (0-100) based on input parameters.
* **Transparent Model:** Complete visibility into how the score is derived; no hidden weights.
* **Real-time Visualization:** Interactive gauges and charts to visualize risk levels.
* **Modern Tech Stack:** Built with React, TypeScript, and Vite for high performance and type safety.
* **Docker Ready:** Includes containerization support for easy deployment.

## 🛠️ Tech Stack

* **Frontend:** [React](https://react.dev/)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Styling:** CSS / Tailwind
* **Containerization:** Docker

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

* Node.js (v18 or higher)
* npm or yarn
* Docker (optional, for containerized run)

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/ieeta-mith/DataPrivScore.git](https://github.com/ieeta-mith/DataPrivScore.git)
    cd DataPrivScore
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```

4.  **Open in browser**
    Navigate to `http://localhost:5173` (or the port shown in your terminal).

### 🐳 Docker Usage

To run DataPrivScore using Docker:

```bash
# Build the image
docker build -t dataprivscore .

# Run the container
docker run -p 3000:3000 dataprivscore
```


## 📊 How It Works

The **DataPrivScore** model evaluates risk based on three primary dimensions:
1.  **Sensitivity:** The classification of data (e.g., Public, Internal, PII, SPII).
2.  **Exposure:** Accessibility levels and encryption standards.
3.  **Retention:** Data lifecycle and deletion policies.

The algorithm aggregates these weights to produce a final **Privacy Health Score**.


## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request


## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📧 Contact

Project Link: [https://github.com/ieeta-mith/DataPrivScore](https://github.com/ieeta-mith/DataPrivScore)

---
<div align="center">
  <sub>Built with ❤️ by the DataPrivScore Team</sub>
</div>
