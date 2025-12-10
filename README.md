# E-commerce Frontend

React + TypeScript frontend with Material-UI, i18n, and Elasticsearch search integration.

## Features

- **Product Catalog**: Browse products with advanced filtering
- **Search**: Elasticsearch-powered search with Vietnamese support
  - Real-time search with debouncing
  - Autocomplete suggestions
  - Typo tolerance and fuzzy matching
- **Shopping Cart**: Add/remove items, update quantities
- **Checkout**: Stripe payment integration
- **User Auth**: Login/Register with JWT
- **Admin Panel**: Product management, order tracking
- **Internationalization**: Vietnamese (vi) and English (en)
- **Responsive Design**: Mobile-first with Material-UI

## Tech Stack

- **Framework**: React 18 + TypeScript
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router v6
- **State Management**: React Context API
- **HTTP Client**: Fetch API
- **i18n**: react-i18next
- **Styling**: CSS + MUI theme
- **Build Tool**: Create React App

## Setup

### Prerequisites

- Node.js 16+
- npm or yarn
- Backend API running (see ecommerce-backend repo)

### Installation

1. **Clone repository**
```bash
git clone <your-frontend-repo>
cd ecommerce-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Update backend URL:
```bash
REACT_APP_BACKEND_URL=http://localhost:8000
```

For production:
```bash
REACT_APP_BACKEND_URL=https://your-backend-api.com
```

4. **Start development server**
```bash
npm start
```

App will open at `http://localhost:3000`

## Available Scripts

### Development
```bash
npm start          # Start dev server with hot reload
npm test           # Run tests
npm run build      # Build for production
```

### Production Build
```bash
npm run build
```

Creates optimized bundle in `build/` directory.

## Project Structure

```
ecommerce-frontend/
├── public/
│   ├── index.html
│   ├── logo.svg
│   └── favicon.ico
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── ui/
│   │   │   ├── cards/
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   └── admin/
│   ├── pages/          # Page components
│   │   ├── Home.tsx
│   │   ├── product/
│   │   │   ├── Products.tsx
│   │   │   └── ProductDetail.tsx
│   │   ├── Cart.tsx
│   │   ├── Checkout.tsx
│   │   └── admin/
│   ├── services/       # API services
│   │   ├── Product.ts
│   │   ├── Search.ts   # Elasticsearch search
│   │   ├── Auth.ts
│   │   └── Cart.ts
│   ├── context/        # React Context
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   ├── i18n/           # Internationalization
│   │   ├── i18n.ts
│   │   └── locales/
│   │       ├── en.json
│   │       └── vi.json
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   ├── constants.ts    # Constants (API URL, etc.)
│   ├── App.tsx
│   └── index.tsx
├── nginx/              # Nginx config for Docker
├── Dockerfile
├── package.json
└── .env.example
```

## Key Features Implementation

### Elasticsearch Search Integration

**Search Service** (`src/services/Search.ts`):
```typescript
// Search products with filters
const results = await searchProducts({
  q: "vitamin",
  product_type: "Vitamins & Minerals",
  min_price: 10,
  max_price: 50,
  on_sale: true,
  sort: "price_asc"
});

// Autocomplete suggestions
const suggestions = await getAutocompleteSuggestions("vit");
```

**Products Page** (`src/pages/product/Products.tsx`):
- Real-time search with 500ms debounce
- Automatic fallback to regular API if ES unavailable
- Search indicator chip showing active query
- Filters: category, price range, sale status

### Internationalization

Switch between Vietnamese and English:

```typescript
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation();

// Use translations
<h1>{t('home.welcome')}</h1>

// Change language
i18n.changeLanguage('vi');
```

### Authentication

Protected routes with JWT:

```typescript
import { useAuth } from './context/AuthContext';

const { user, login, logout } = useAuth();

// Login
await login(email, password);

// Check if admin
if (user?.role === 'admin') {
  // Show admin panel
}
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_BACKEND_URL` | Backend API base URL | `http://localhost:8000` |

## Deployment

### Vercel (Recommended)

1. **Connect GitHub repository**
2. **Configure build settings**:
   - Framework: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
3. **Add environment variable**:
   - `REACT_APP_BACKEND_URL`: Your production backend URL
4. **Deploy**

### Netlify

1. **Connect repository**
2. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `build`
3. **Environment variables**: Add `REACT_APP_BACKEND_URL`
4. **Deploy**

### Docker

```bash
# Build image
docker build -t ecommerce-frontend .

# Run container
docker run -p 80:80 ecommerce-frontend
```

Nginx will serve the production build.

### Manual Deployment

```bash
# Build
npm run build

# Upload build/ folder to your web server
# Configure web server to serve index.html for all routes
```

## API Integration

Frontend connects to backend API defined in `src/constants.ts`:

```typescript
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
```

### Main API Endpoints Used

- `GET /products` - List products
- `GET /search/products?q={query}` - Search with Elasticsearch
- `POST /register` - User registration
- `POST /login` - User login
- `GET /cart` - Get cart items
- `POST /orders` - Create order
- `POST /create-checkout-session` - Stripe checkout

## Troubleshooting

### CORS Issues

If you see CORS errors, ensure backend is configured to allow your frontend origin:

Backend `.env`:
```bash
CORS_ORIGINS=http://localhost:3000,https://your-frontend-domain.com
```

### Search Not Working

1. Check backend Elasticsearch is configured
2. Verify `REACT_APP_BACKEND_URL` points to correct backend
3. Check browser console for API errors
4. Search should fallback to regular API if ES unavailable

### Build Errors

Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Features Roadmap

- [x] Product catalog with filters
- [x] Elasticsearch search integration
- [x] Shopping cart
- [x] User authentication
- [x] Admin panel
- [x] i18n (Vietnamese/English)
- [x] Stripe payment
- [ ] Product reviews
- [ ] Wishlist
- [ ] Order tracking
- [ ] Email notifications

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT
