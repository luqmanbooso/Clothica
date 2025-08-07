# Clothica - Modern E-commerce Clothing Store

A full-stack MERN e-commerce application built with React, Node.js, Express, MongoDB, and Tailwind CSS. Features a modern, responsive design with advanced functionality for both customers and administrators.

## 🚀 Features

### Customer Features
- **Product Browsing**: Browse products by category, brand, price range
- **Advanced Search**: Search products by name, description, brand
- **Product Details**: Detailed product pages with images, reviews, ratings
- **Shopping Cart**: Add/remove items, update quantities
- **Wishlist**: Save favorite products for later
- **User Authentication**: Register, login, profile management
- **Order Management**: Place orders, track order status
- **Responsive Design**: Mobile-first design with modern UI

### Admin Features
- **Dashboard**: Overview of sales, orders, users
- **Product Management**: Add, edit, delete products
- **Order Management**: Update order status, track shipments
- **User Management**: View and manage user accounts
- **Analytics**: Sales reports and insights

### Technical Features
- **JWT Authentication**: Secure user authentication
- **Image Upload**: Product image management
- **Real-time Updates**: Live cart and wishlist updates
- **Payment Integration**: Multiple payment methods
- **Search & Filtering**: Advanced product search
- **Responsive Design**: Works on all devices

## 🛠️ Tech Stack

### Frontend
- **React 18**: Modern React with hooks
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **React Icons**: Beautiful icons
- **React Hot Toast**: Toast notifications

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB ODM
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing
- **Multer**: File upload handling
- **Express Validator**: Input validation

## 📁 Project Structure

```
clothica/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── index.js           # Server entry point
├── package.json           # Root package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd clothica
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Environment Setup**
   ```bash
   # Copy environment example
   cp env.example .env
   
   # Edit .env file with your configuration
   MONGODB_URI=mongodb://localhost:27017/clothica
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   ```

4. **Start the development servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start them separately
   npm run server    # Backend only
   npm run client    # Frontend only
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🎨 Color Palette

The application uses a carefully chosen color palette:

- **Primary**: Orange (#f2751f) - Main brand color
- **Secondary**: Slate (#64748b) - Text and UI elements
- **Accent**: Pink (#d946ef) - Highlights and CTAs
- **Success**: Green (#22c55e) - Success states
- **Warning**: Yellow (#f59e0b) - Warning states
- **Error**: Red (#ef4444) - Error states

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔧 Available Scripts

### Root Directory
- `npm run dev` - Start both frontend and backend
- `npm run server` - Start backend only
- `npm run client` - Start frontend only
- `npm run build` - Build frontend for production
- `npm run install-all` - Install all dependencies

### Client Directory
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 🗄️ Database Schema

### User Model
- Basic info (name, email, password)
- Role (user/admin)
- Addresses
- Wishlist
- Profile settings

### Product Model
- Product details (name, description, price)
- Categories and subcategories
- Images and colors
- Sizes and stock
- Reviews and ratings
- Discount and featured status

### Order Model
- Order items and quantities
- Shipping address
- Payment information
- Order status tracking
- Total calculations

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:
- Tokens are stored in localStorage
- Automatic token refresh
- Protected routes for authenticated users
- Admin-only routes for administrators

## 🛒 Shopping Features

### Cart Management
- Persistent cart (localStorage)
- Add/remove items
- Update quantities
- Price calculations
- Checkout process

### Wishlist
- Save favorite products
- Sync with server for authenticated users
- Local storage for guests

## 📊 Admin Dashboard

### Features
- Sales overview
- Order management
- Product management
- User management
- Analytics and reports

## 🚀 Deployment

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy to platforms like Vercel, Netlify, or AWS S3

### Backend Deployment
1. Set up environment variables
2. Deploy to platforms like Heroku, Railway, or AWS EC2
3. Configure MongoDB connection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: hello@clothica.com

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first approach
- MongoDB for the flexible database
- All contributors and users

---

**Clothica** - Your premier destination for fashion-forward clothing. Discover the latest trends, quality materials, and exceptional style for every occasion. 