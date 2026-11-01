# ShopMind AI — Complete Project Knowledge Base


# 1. Project Overview

## Project Name
**ShopMind AI**

## Project Category
AI-powered shopping assistant and intelligent product recommendation platform.

## Project Description

ShopMind AI is an AI-powered shopping assistant designed to make online shopping easier, smarter, and more personalized.

Users can describe what they want using natural language instead of searching through products manually or knowing exact technical specifications.

For example:

- "Recommend a phone with a great camera and battery life under ₹40,000."
- "Best gaming laptop under ₹60,000."
- "Suggest headphones for travelling under ₹2,000."
- "I need a laptop for machine learning and programming."
- "Compare the best smartphones for photography."

ShopMind AI interprets the user's requirements, retrieves relevant product listings from external shopping sources, evaluates suitable options, and presents personalized recommendations.

The application aims to behave like an intelligent shopping assistant rather than a traditional e-commerce product catalogue.

Its main objective is to help users make better purchasing decisions by combining AI reasoning, real product information, filtering, ranking, and product comparisons.

## Core Philosophy

ShopMind AI should:

1. Understand what the user actually wants.
2. Retrieve relevant real-world product listings.
3. Identify the most suitable products.
4. Explain why certain products are recommended.
5. Highlight important specifications and compromises.
6. Respect the user's budget.
7. Help users compare alternatives.
8. Provide a simple and intuitive shopping experience.

**Important principle:** AI-generated explanations and actual product information must remain separate. Product names, prices, specifications, merchants, and product links must come from retrieved product data rather than invented AI responses.

---

# 2. Main Project Objectives

The application is intended to provide the following capabilities.

### 2.1 Natural-Language Shopping Search

Users should be able to enter shopping requirements in ordinary conversational language.

The system should understand:

- Product category.
- Budget.
- Preferred brands.
- Required specifications.
- Intended usage.
- Important features.
- User preferences.
- Constraints and priorities.

### 2.2 Intelligent Product Discovery

Retrieve real product listings using the shopping-search integration.

The application should not rely on a static hardcoded product catalogue for live shopping recommendations.

### 2.3 Personalized Product Recommendations

Evaluate available products and generate a shortlist of the five most suitable recommendations.

### 2.4 AI Shopping Guidance

Provide explanations that help users understand:

- What specifications matter.
- Which features are important.
- What compromises exist.
- Why a product is recommended.
- Which product offers the best overall suitability.

### 2.5 Explore More Products

After presenting the Top 5 recommendations, allow users to explore additional relevant products.

### 2.6 Product Comparison

Allow users to compare suitable products based on available product information.

### 2.7 Product Details

Provide access to additional product information and external seller/product pages.

---

# 3. Technology Stack

The project uses the following technologies.

| Component | Technology | Purpose |
|---|---|---|
| Frontend | React | User interface |
| Build Tool | Vite | Frontend development and production builds |
| Frontend Language | TypeScript | Application logic and type safety |
| Backend | Python | Backend application logic |
| Backend Framework | FastAPI | REST API and application services |
| ASGI Server | Uvicorn | Running FastAPI |
| AI Gateway | OpenRouter | Access to language models |
| Shopping Search | SerpApi | Google Shopping/product retrieval |
| Version Control | Git | Source control |
| Repository Hosting | GitHub | Code hosting |
| Frontend Deployment | Vercel | Hosting the React application |
| Backend Deployment | Render | Hosting the FastAPI application |

The project has separate frontend and backend directories.

Typical structure:

```text
ShopMind-AI/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── assets/
│   │   └── ...
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   ├── services/
│   │   ├── core/
│   │   └── ...
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
│
├── about_ShopMind_AI.md
└── README.md
```

This is a conceptual structure. Always inspect the actual repository before assuming that every folder or filename exists.

---

# 4. System Architecture

ShopMind AI uses a frontend/backend architecture.

## Frontend

React + Vite + TypeScript.

Responsibilities:

- Search interface.
- Natural-language query input.
- Product categories.
- Product cards.
- AI shopping guidance.
- Recommendation sections.
- Product details.
- Product comparison.
- Explore More Products.
- Responsive user experience.

## Backend

Python + FastAPI.

Responsibilities:

- API endpoints.
- Query processing.
- AI-provider integration.
- Product-search orchestration.
- Product normalization.
- Budget filtering.
- Category filtering.
- Product deduplication.
- Product ranking.
- Recommendation generation.
- Product comparison.
- Error handling.

## AI Layer

OpenRouter.

Responsibilities:

- Understand user requirements.
- Interpret natural-language queries.
- Generate personalized shopping guidance.
- Explain decision criteria.
- Describe market trade-offs.
- Generate recommendation explanations.

## Product Retrieval Layer

SerpApi.

Responsibilities:

- Retrieve real Google Shopping listings.
- Retrieve product titles.
- Retrieve prices.
- Retrieve merchant information.
- Retrieve product URLs.
- Retrieve available product information and metadata.

## Overall Architecture

```text
                 USER
                   |
                   v
           REACT FRONTEND
             (Vite + TS)
                   |
                   v
             FASTAPI API
                   |
          +--------+--------+
          |                 |
          v                 v
       OPENROUTER         SERPAPI
       AI REASONING      SHOPPING DATA
          |                 |
          v                 v
    QUERY UNDERSTANDING  PRODUCT LISTINGS
          |                 |
          +--------+--------+
                   |
                   v
          BACKEND DECISION ENGINE
                   |
          +--------+--------+
          |        |        |
          v        v        v
       FILTER   NORMALIZE  DEDUPLICATE
          |        |        |
          +--------+--------+
                   |
                   v
             PRODUCT RANKING
                   |
                   v
          TOP 5 RECOMMENDATIONS
                   |
                   v
           FRONTEND RESULTS
                   |
          +--------+--------+
          |                 |
          v                 v
      PRODUCT DETAILS   EXPLORE MORE
          |
          v
       COMPARISON
```

The exact implementation must be verified against the existing source code.

---

# 5. OpenRouter AI Integration

OpenRouter is the AI gateway used by ShopMind AI.

It provides access to language models through an API.

The backend should communicate with OpenRouter using the API key stored in its private environment configuration.

Expected backend environment variables:

```env
OPENROUTER_API_KEY=your_private_api_key
OPENROUTER_MODEL=your_configured_model_id
```

The model must remain configurable.

Do not hardcode API keys or model-specific assumptions into frontend code.

## OpenRouter Responsibilities

The language model should help with:

1. Understanding natural-language shopping queries.
2. Extracting user requirements.
3. Interpreting product preferences.
4. Generating AI Shopping Guidance.
5. Explaining relevant decision criteria.
6. Describing market trade-offs.
7. Generating contextual shopping recommendations.

## Important AI Reliability Requirement

The application must distinguish between:

- Successful OpenRouter-generated analysis.
- Deterministic fallback analysis.

Previously, the configured free model:

`meta-llama/llama-3.3-70b-instruct:free`

returned:

`HTTP 429 — free-models-per-day`

The backend then activated deterministic fallback analysis.

This means a successful application API response does not necessarily mean that OpenRouter worked.

The frontend should display an accurate source indicator.

For example:

- `Powered by OpenRouter` — only when actual OpenRouter-generated content was successfully used.
- `Market Evaluation` — when deterministic fallback analysis was used.

Never display a false AI-success indicator.

## AI Response Requirements

AI-generated sections should be:

- Contextual to the user's query.
- Concise and useful.
- Distinct from one another.
- Free from repetitive paragraphs.
- Based on actual available product information when discussing specific products.

The model must not invent product listings, prices, product URLs, specifications, or availability.

---

# 6. SerpApi Integration

SerpApi is used to retrieve external shopping listings.

The backend communicates with SerpApi using:

```env
SERPAPI_API_KEY=your_private_api_key
```

The API key must remain on the backend.

Never expose it through:

- React components.
- Browser JavaScript.
- Vite public environment variables.
- GitHub commits.
- Public configuration files.

## Retrieved Product Information

Depending on provider availability, the system may receive:

- Product title.
- Price.
- Merchant.
- Product image.
- Product URL.
- Product rating.
- Review count.
- Product description.
- Specifications.
- Shopping listing metadata.

Only display fields that are actually available and sufficiently reliable.

Do not fabricate missing product information.

## Product Retrieval Rules

1. Retrieve products relevant to the user's query.
2. Respect the requested product category.
3. Apply budget restrictions.
4. Normalize product information.
5. Remove duplicate listings when appropriate.
6. Identify unsuitable product variants.
7. Rank eligible products.
8. Preserve real product links.

---

# 7. Product Filtering and Ranking

This is one of the most important parts of ShopMind AI.

The system must not simply display the first five products returned by SerpApi.

It must evaluate the available candidates.

## Hard Filtering

Hard constraints should be enforced before final ranking.

Examples:

- Product category must match the query.
- Product price must respect the requested maximum budget.
- Required specifications must be verified.
- Clearly unsuitable product conditions should be excluded.
- Irrelevant product types should be removed.

## Category-Specific Examples

### Smartphones

Consider:

- Main camera quality.
- Optical Image Stabilization.
- Camera sensor information.
- Battery capacity.
- Charging speed.
- Processor.
- Display.
- Software support.
- Price.

Do not assume a higher megapixel count automatically means a better camera.

### Gaming Laptops

Consider:

- Dedicated GPU.
- Exact GPU model.
- GPU VRAM.
- Processor.
- RAM.
- Storage.
- Display refresh rate.
- Cooling system.
- Upgradeability.
- Price.
- Listing condition.

A laptop with integrated graphics should not be presented as a dedicated-GPU gaming laptop.

### Headphones

Consider:

- Over-ear/on-ear/in-ear design.
- Wired or wireless connectivity.
- Active Noise Cancellation.
- Passive noise isolation.
- Battery life.
- Comfort.
- Portability.
- Microphone quality.
- Price.

## Ranking

After hard filtering, rank products according to how well they match the user's priorities.

The recommendation system should consider:

- Feature match.
- Specification quality.
- Budget suitability.
- Product condition.
- Listing reliability.
- Value for money.

The exact scoring implementation should be discovered from the existing backend code before modification.

## Important Rules

- Do not recommend refurbished products when the user explicitly requires new products.
- Do not mix unrelated categories.
- Avoid repeated product variants dominating the shortlist.
- Do not recommend products outside the budget.
- Do not assume unknown specifications.
- Clearly identify unknown or unverified information.
- Never let AI-generated text override backend hard constraints.

---

# 8. Main Application Features

The frontend should provide the following experiences.

## 8.1 Homepage

The homepage should introduce ShopMind AI clearly.

It should communicate:

- What ShopMind AI does.
- How users can interact with it.
- Why AI-assisted shopping is useful.
- How to begin searching.

The homepage should provide a clear and prominent search experience.

The interface should feel like a modern AI product rather than a conventional e-commerce store.

## 8.2 Natural-Language Search

Users should be able to enter queries naturally.

Example:

"Find me a smartphone under ₹35,000 with a good camera, strong battery and clean software."

The search experience should be simple and intuitive.

## 8.3 AI Shopping Guidance

Display personalized shopping guidance based on the user's request.

This should not be generic text repeated across every search.

The response should change according to:

- Category.
- Budget.
- User priorities.
- Available product listings.
- Actual model-generated analysis, when available.

## 8.4 Top 5 Recommendations

Display the five most suitable eligible products.

Each recommendation should communicate:

- Product name.
- Product image.
- Actual price.
- Merchant.
- Relevant specifications.
- Why it is recommended.
- Important limitations, if known.
- Product link.

Do not display invented ratings or specifications.

## 8.5 Explore More Products

After the initial shortlist, provide additional relevant products.

This section should help users discover more options without overwhelming the primary recommendation experience.

## 8.6 Product Details

Users should be able to inspect products and access their available details.

## 8.7 Product Comparison

Allow users to compare products based on available information.

The comparison must be based on actual product data, not fabricated specifications.

## 8.8 Agent Chat

The backend has an agent streaming endpoint reported as:

`/api/agent/chat/stream`

Inspect the existing implementation before deciding how this feature should appear in the frontend.

---

# 9. AI Shopping Analysis Sections

The shopping results experience is intended to contain distinct analytical sections.

## AI Shopping Guidance

A concise answer to the user's request.

Example:

"For a camera-focused smartphone under ₹40,000, prioritize a stabilized main camera, a capable image-processing pipeline, and a battery that supports full-day use."

## Market Landscape

Describe the broader market segment.

Example:

"Phones in this segment offer a mix of upper-midrange processors, different camera configurations, and varying software-support commitments."

## Key Decision Criteria

Identify the most important specifications for the query.

Examples:

- Camera sensor and OIS.
- Battery capacity.
- Processor efficiency.
- Display quality.

## Market Trade-offs

Explain compromises between features.

Example:

"Some devices prioritize camera processing and software support, while others focus on charging speed and battery capacity."

## Final Verdict

Present a reasoned top recommendation and runner-up.

Use actual retrieved listing information.

## Budget Verdict

Explain whether the shortlisted products respect the requested budget.

All six sections must have distinct purposes.

Avoid repeated or generic content.

---

# 10. Backend API Architecture

The backend is implemented using FastAPI.

The previously reported production API base URL was:

`https://shopmind-ai-backend-1mlr.onrender.com/api`

Previously reported endpoint paths:

| Feature | Endpoint |
|---|---|
| Product search | `/api/products/search` |
| AI shopping decision | `/api/products/decision` |
| Product list | `/api/products` |
| External product details | `/api/products/external/{id}` |
| Catalog product details | `/api/products/{id}` |
| Product comparison | `/api/products/compare` |
| Agent streaming chat | `/api/agent/chat/stream` |
| Health check | `/api/health` |

These paths must be checked against the current backend source and OpenAPI schema.

The backend previously used routers registered under an `/api` prefix and later introduced additional route registration for compatibility.

Do not unnecessarily duplicate routers or create conflicting routes.

Inspect the current implementation before making routing changes.

---

# 11. Frontend and Backend Communication

The frontend communicates with the backend through an API service layer.

The previously reported frontend file was:

`frontend/src/services/api.ts`

A production backend URL was configured using:

```env
VITE_API_BASE_URL=https://shopmind-ai-backend-1mlr.onrender.com/api
```

The exact environment variable and URL normalization logic must be confirmed against the current source code.

The frontend must not use localhost in production.

Production requests must reach the deployed Render backend.

## CORS

The backend must allow the deployed Vercel origin:

`https://shop-mind-ai-two.vercel.app`

Previously reported CORS configuration included support for Vercel deployments.

Inspect the current implementation before modifying it.

---

# 12. Deployment Architecture

ShopMind AI has been deployed using separate frontend and backend hosting.

## Frontend — Vercel

Live website:

https://shop-mind-ai-two.vercel.app/

Frontend technology:

- React.
- Vite.
- TypeScript.

Typical deployment configuration:

```text
Root Directory: frontend
Framework: Vite
Build Command: npm run build
Output Directory: dist
```

## Backend — Render

Previously reported backend URL:

https://shopmind-ai-backend-1mlr.onrender.com

Typical deployment configuration:

```text
Root Directory: backend
Language: Python 3
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## Automatic Deployment

GitHub is connected to the hosting services.

The intended workflow:

1. Modify code locally.
2. Test changes.
3. Commit changes.
4. Push to GitHub.
5. Render and/or Vercel deploy the relevant updates.

Do not assume a deployment succeeded simply because code was pushed.

Always inspect deployment status and logs.

---

# 13. Environment Variables and Security

Expected backend variables:

```env
OPENROUTER_API_KEY=
OPENROUTER_MODEL=
SERPAPI_API_KEY=
```

Potential frontend variable:

```env
VITE_API_BASE_URL=
```

Important:

- OpenRouter keys belong on the backend.
- SerpApi keys belong on the backend.
- Do not expose private API keys in Vite variables.
- Do not commit `.env` files.
- Keep `.env.example` files limited to placeholder values.
- Do not print secrets in logs.
- Do not expose provider authorization headers to the browser.

Production secrets should be configured in Render.

---

# 14. Known Development History and Issues

The following issues were encountered during development.

## OpenRouter Rate Limits

OpenRouter previously returned:

`HTTP 429 — free-models-per-day`

The backend activated deterministic fallback analysis.

This caused the UI to display Market Evaluation instead of Powered by OpenRouter.

The model configuration and live provider connectivity should be verified independently.

## Duplicate Analysis Text

The frontend previously displayed similar text in:

- AI Shopping Guidance.
- Summary paragraph.

A fix was reported involving:

- Frontend duplicate-summary detection.
- Improved OpenRouter prompts.
- Backend summary normalization.
- Improved deterministic fallback text.

## Production Route Mismatch

The first production deployment experienced:

- Incorrect API paths.
- Missing `/api` prefix.
- CORS errors.
- Failed product searches.

A fix was reported involving:

- Frontend API URL normalization.
- Backend route registration.
- CORS configuration.
- Vercel reverse proxy configuration.

## Product Recommendation Quality

Earlier testing identified questionable recommendations, including unsuitable laptop configurations and repeated smartphone listings.

Product relevance, filtering, and ranking must therefore remain high priorities.

## Historical Test Results

Previously reported test results:

- 73 tests passed in an earlier test run.
- 90 tests passed after production route/CORS changes.
- Frontend TypeScript and Vite production build passed.

These are historical reports. Run the current test suite before making claims about current stability.

---

# 15. Frontend Design and User Experience Requirements

This section is especially important when rebuilding or improving the frontend.

The frontend should look and feel like a polished, modern AI-powered shopping assistant.

## Overall Design Direction

Aim for a design quality comparable to modern AI applications such as:

- ChatGPT.
- Gemini.
- Claude.
- Microsoft Copilot.

This is a design-quality reference, not a request to copy their exact interfaces.

The website should feel:

- Premium.
- Modern.
- Minimal.
- Intelligent.
- Professional.
- Responsive.
- Easy to navigate.
- Visually consistent.

## Design Principles

1. Strong visual hierarchy.
2. Clear typography.
3. Consistent spacing.
4. Professional color palette.
5. Subtle animations.
6. Smooth page transitions where appropriate.
7. Excellent product-card layouts.
8. Clean search interactions.
9. Clear loading and error states.
10. Responsive desktop and mobile layouts.

## Desktop Experience

Desktop should be the primary design focus, while maintaining excellent mobile responsiveness.

Use available screen space intelligently.

Avoid unnecessarily oversized cards, excessive empty space, and cluttered sections.

## Mobile Experience

Ensure:

- Responsive navigation.
- Properly sized search inputs.
- Product cards that adapt to smaller screens.
- Readable text.
- Appropriate spacing.
- Touch-friendly controls.
- No horizontal overflow.

## Animations

Use subtle professional animations where useful.

Examples:

- Smooth page transitions.
- Search interaction animations.
- Product-card hover effects.
- Loading skeletons.
- Section reveal animations.
- Subtle button interactions.

Avoid excessive animations that reduce performance or distract from shopping.

## Product Cards

Product cards should clearly display:

- Product image.
- Product title.
- Price.
- Merchant.
- Important specifications.
- Recommendation rationale.
- Relevant badges.
- Product action.

Use consistent card dimensions and visual hierarchy.

Do not invent ratings, discounts, availability, or product features.

## Results Page

The results page should be especially well designed.

The user should immediately understand:

1. What the system recommends.
2. Why those products are recommended.
3. What the important differences are.
4. Which product fits the user's budget.
5. Where to explore additional products.

The Top 5 recommendations should receive stronger visual emphasis than the broader product catalogue.

---

# 16. Critical Development Instructions for Claude Code

When working on ShopMind AI, follow these instructions.

## First: Understand the Existing Repository

Before modifying anything:

1. Read this `about_ShopMind_AI.md` file.
2. Inspect the actual project directory structure.
3. Inspect the existing frontend pages.
4. Inspect the backend API implementation.
5. Inspect the API service layer.
6. Inspect existing components and styling.
7. Inspect current routes and data structures.
8. Understand how the frontend communicates with the backend.

Do not assume the current code matches every historical description in this document.

## Preserve Existing Functionality

Do not unnecessarily rewrite:

- OpenRouter integration.
- SerpApi integration.
- Product retrieval.
- Product filtering.
- Product ranking.
- API endpoints.
- Backend decision engine.
- Product details.
- Product comparison.
- Agent functionality.

If the task is frontend recreation, prioritize the frontend.

Do not modify the backend unless explicitly required or a verified frontend integration issue requires it.

## Use Real Backend Data

The frontend must use actual backend API responses.

Do not:

- Hardcode fake product listings.
- Invent product prices.
- Invent product specifications.
- Replace API calls with static mock data.
- Simulate successful AI analysis.
- Display fabricated ratings.

Mock data may only be used temporarily for isolated UI development and must not replace real production data.

## Maintain API Compatibility

Before changing frontend API calls, inspect the backend routes and response schemas.

Do not rename or modify endpoints without understanding their existing dependencies.

## Error Handling

The interface should handle:

- Backend unavailable.
- Search failures.
- Empty product results.
- OpenRouter rate limits.
- SerpApi failures.
- Invalid product information.
- Network errors.
- Loading states.

Provide useful error messages instead of silently failing.

## Code Quality

- Use reusable React components.
- Maintain TypeScript types.
- Avoid unnecessary dependencies.
- Keep code organized.
- Avoid duplicated components and styles.
- Maintain accessibility.
- Preserve existing working features.
- Test production builds.

---

# 17. Frontend Recreation Goal

When asked to recreate the frontend, treat it as a complete frontend experience rather than simply changing colors or modifying individual components.

The intended result should be a cohesive website with:

1. A polished homepage.
2. A clear AI shopping search experience.
3. A professional product results page.
4. Distinct AI shopping analysis sections.
5. An attractive Top 5 recommendation layout.
6. An Explore More Products section.
7. Product detail interactions.
8. Product comparison experience.
9. Responsive navigation.
10. Consistent design across all pages.

Before implementing, inspect the existing application and determine which pages and features already exist.

Do not create unnecessary duplicate pages or routes.

The final experience should feel like one integrated AI shopping product.

---

# 18. Development Priorities

Follow this order when improving ShopMind AI.

### Priority 1 — Understand and preserve the application

Inspect the repository and existing architecture.

Identify working features and API contracts.

### Priority 2 — Frontend recreation and refinement

Build a cohesive, polished frontend while preserving the existing backend functionality.

### Priority 3 — API integration verification

Ensure every frontend page uses the correct live backend endpoints and response schemas.

### Priority 4 — Product and AI experience validation

Test actual product searches and AI-generated analysis.

Verify that product recommendations respect user requirements.

### Priority 5 — Production readiness

Only after the frontend, features, and integrations are complete, perform the final production-readiness work.

Do not begin production hardening prematurely if the frontend recreation and integration work are still incomplete.

---

# 19. Final Project Summary

ShopMind AI is an AI-powered shopping assistant built with React, Vite, TypeScript, Python, and FastAPI.

It combines OpenRouter for natural-language AI reasoning with SerpApi for retrieving real shopping listings.

The backend processes the user's requirements, retrieves product information, applies category and budget constraints, normalizes and deduplicates listings, and ranks suitable products.

The frontend presents personalized shopping guidance, the Top 5 recommendations, product details, comparisons, and additional products to explore.

The application is deployed using Vercel for the frontend and Render for the backend, with GitHub supporting source control and automatic deployments.

The long-term goal is to make ShopMind AI a reliable, intelligent, professional, and user-friendly shopping assistant that helps people make informed purchasing decisions.

---

# 20. Instruction to Claude Code

**You are working on ShopMind AI. This document is the project's background and knowledge reference.**

Before starting any major task:

- Read this document.
- Inspect the actual repository.
- Understand the current implementation.
- Identify the relevant files.
- Preserve working functionality.
- Follow the existing API contracts.
- Use real product data.
- Never expose API secrets.
- Do not invent product facts.
- Avoid unnecessary backend changes during frontend work.

When recreating the frontend, prioritize a premium, polished, responsive AI shopping experience while maintaining full compatibility with the existing FastAPI backend and shopping pipeline.

**The objective is not merely to make ShopMind AI look attractive. The objective is to create an excellent interface for a genuinely functioning AI shopping assistant.**