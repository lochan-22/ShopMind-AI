# 🛍️ ShopMind AI
### Your Intelligent AI-Powered Shopping Assistant

ShopMind AI is an intelligent shopping assistant designed to simplify online product discovery and decision-making. It combines AI-powered analysis with live product search to help users discover relevant products, evaluate available options, compare features, and make informed purchasing decisions based on their needs and budget.

🌐 **Live Website:** https://shop-mind-ai-two.vercel.app/

💻 **GitHub Repository:** https://github.com/lochan-22/ShopMind-AI

---

## ✨ Key Features

- **Natural Language Product Search:** Search for products using everyday language instead of complicated filters.
- **AI-Powered Shopping Guidance:** Get contextual recommendations and explanations based on your requirements.
- **Live Product Discovery:** Retrieve product listings and offers through Google Shopping search results using SerpApi.
- **Personalized Recommendations:** Identify suitable products based on user preferences, requirements, and budget.
- **Top 5 Recommendations:** Explore a curated shortlist of relevant products.
- **Product Exploration:** Discover additional products beyond the initial recommendations.
- **Budget-Aware Filtering:** Filter and evaluate products according to specified price limits.
- **Product Comparison:** Examine available product options and their relevant features.
- **Interactive User Interface:** A responsive interface designed for desktop and mobile devices.

## 🧠 How It Works

ShopMind AI combines AI reasoning, live product retrieval, and backend decision logic.

1. **User Query:** The user enters a product request in natural language.
2. **AI Understanding:** OpenRouter processes the shopping intent and helps generate contextual shopping guidance.
3. **Product Retrieval:** SerpApi retrieves relevant product listings from Google Shopping.
4. **Product Processing:** The backend normalizes, filters, and evaluates retrieved products against the user's requirements.
5. **Recommendation Generation:** The system identifies suitable products and generates a shortlist of recommendations.
6. **Shopping Guidance:** Users receive product suggestions, relevant explanations, and additional products to explore.

## 🏗️ System Architecture

```text
                 USER
                   |
                   v
          REACT FRONTEND
                   |
                   v
             FASTAPI BACKEND
                   |
          +--------+--------+
          |                 |
          v                 v
     OPENROUTER           SERPAPI
     AI ANALYSIS       PRODUCT SEARCH
          |                 |
          v                 v
     SHOPPING GUIDANCE   LIVE LISTINGS
          |                 |
          +--------+--------+
                   |
                   v
          PRODUCT PROCESSING
          FILTERING & RANKING
                   |
                   v
          RECOMMENDATION ENGINE
                   |
                   v
          TOP 5 RECOMMENDATIONS
                   |
                   v
              USER RESULTS
```

## 🛠️ Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | CSS |
| Backend | Python, FastAPI |
| AI Integration | OpenRouter API |
| Product Search | SerpApi, Google Shopping |
| API Communication | REST API |
| Frontend Deployment | Vercel |
| Backend Deployment | Render |
| Version Control | Git, GitHub |

## 📂 Project Structure

```text
ShopMind-AI/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── .env.example
│   ├── package.json
│   ├── vercel.json
│   └── ...
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── services/
│   │   └── main.py
│   ├── tests/
│   ├── .env.example
│   └── requirements.txt
│
├── .gitignore
└── README.md
```

*The structure above is illustrative. Refer to the actual repository for the complete directory structure.*

## ⚙️ Installation and Setup

### Prerequisites

- Python 3.10 or later (use the version supported by the project dependencies).
- Node.js and npm.
- Git.
- OpenRouter API key.
- SerpApi API key.

### 1. Clone the Repository

```bash
git clone https://github.com/lochan-22/ShopMind-AI.git
cd ShopMind-AI
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```powershell
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure environment variables using the provided `.env.example` as a reference. Create a local `.env` file and enter your own API credentials.

Example configuration (use the exact variable names supported by the application):

```env
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=your_model_id
SERPAPI_API_KEY=your_serpapi_api_key
```

Start the backend:

```bash
uvicorn app.main:app --reload --port 8000
```

Backend API documentation:

```text
http://127.0.0.1:8000/docs
```

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Configure the frontend environment variable according to the API configuration in the source code:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Start the development server:

```bash
npm run dev
```

The frontend will typically be available at:

```text
http://localhost:5173
```

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `OPENROUTER_API_KEY` | API key for OpenRouter |
| `OPENROUTER_MODEL` | Selected OpenRouter model |
| `SERPAPI_API_KEY` | API key for SerpApi |
| `VITE_API_BASE_URL` | Backend API base URL used by the frontend |

**Security:** Never commit actual API keys, passwords, or private credentials to GitHub. Frontend variables prefixed with `VITE_` are exposed to the browser and must not contain secrets.

## 🚀 Deployment

ShopMind AI is deployed using:

- **Frontend:** Vercel
- **Backend:** Render

The frontend communicates with the deployed FastAPI backend through its configured API base URL.

## 🧪 Testing

The backend includes automated tests for core functionality, including:

- Shopping decision engine.
- Product analysis and filtering.
- Budget constraints.
- Product normalization and deduplication.
- API routes and CORS configuration.

Run the backend test suite:

```bash
pytest
```

Build the frontend:

```bash
npm run build
```

## 🔮 Future Enhancements

- Improved personalized recommendation algorithms.
- More advanced product comparison and evaluation.
- Expanded product categories and shopping sources.
- Enhanced conversational shopping experience.
- User preference management and shopping history.
- More comprehensive product quality and relevance evaluation.

## 🤝 Contributing

Contributions, suggestions, and feedback are welcome!

1. Fork the repository.
2. Create a new feature branch.
3. Implement your changes.
4. Test your changes.
5. Submit a pull request describing your contribution.

## 🔒 Security

If you discover a security vulnerability, please report it privately to the repository maintainer rather than publishing sensitive details in a public issue.

## 📄 License

No license has been selected yet. All rights are reserved by default until a license is added. Please check the repository's license before reusing or distributing its code.

---

<p align="center">
  **ShopMind AI — Making Smarter Shopping Decisions.**
</p>

<p align="center">
  Built with ❤️ using AI and modern web technologies.
</p>
