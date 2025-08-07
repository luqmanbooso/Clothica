# Clothica Admin Panel

A comprehensive, modern admin dashboard for managing the Clothica eCommerce platform. Built with React, Node.js, and MongoDB.

## 🚀 Features

### ✅ Core Features Implemented

#### 1. **Authentication & Authorization**
- ✅ JWT-based authentication
- ✅ Role-based access control (admin vs user)
- ✅ Protected admin routes
- ✅ Secure middleware implementation

#### 2. **Dashboard Overview**
- ✅ Real-time KPI cards (Users, Products, Orders, Revenue)
- ✅ Interactive charts with Recharts
- ✅ Revenue trends visualization
- ✅ Recent orders with status tracking
- ✅ Quick action buttons

#### 3. **Product Management**
- ✅ Full CRUD operations for products
- ✅ Advanced search and filtering
- ✅ Pagination support
- ✅ Product status management (active/inactive)
- ✅ Image upload support
- ✅ Category assignment
- ✅ Price and discount management

#### 4. **Order Management**
- ✅ Complete order lifecycle management
- ✅ Status updates (pending → processing → shipped → delivered)
- ✅ Order details modal with full information
- ✅ Customer information display
- ✅ Payment status tracking
- ✅ Shipping address management

#### 5. **User Management**
- ✅ User listing with search and filters
- ✅ User status management (active/inactive)
- ✅ Role management (admin/customer)
- ✅ Detailed user profiles
- ✅ Account statistics

#### 6. **Category Management**
- ✅ Create, edit, delete categories
- ✅ Category status management
- ✅ SEO metadata support
- ✅ Display order control
- ✅ Product count tracking

### 🔄 Additional Features (Ready for Implementation)

#### 7. **Inventory Management**
- ✅ Stock tracking in product management
- ✅ Low-stock alerts (backend ready)
- ✅ Inventory updates

#### 8. **Analytics & Reporting**
- ✅ Revenue charts
- ✅ Order status distribution
- ✅ User growth tracking
- ✅ Product performance metrics

#### 9. **UI/UX Features**
- ✅ Responsive design
- ✅ Modern UI with Tailwind CSS
- ✅ Loading states and error handling
- ✅ Toast notifications
- ✅ Confirmation modals
- ✅ Mobile-friendly navigation

## 🛠 Technical Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Chart library for analytics
- **React Icons** - Icon library
- **React Hot Toast** - Toast notifications
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## 📁 Project Structure

```
clothica/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── Admin/     # Admin components
│   │   ├── pages/
│   │   │   └── Admin/     # Admin pages
│   │   └── contexts/      # React contexts
├── server/                 # Node.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── scripts/           # Database scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
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
Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/clothica
JWT_SECRET=your-secret-key-here
PORT=5000
```

4. **Database Setup**
```bash
# Create admin user
npm run create-admin

# Create sample products (optional)
npm run create-products
```

5. **Start the application**
```bash
# Development mode (both frontend and backend)
npm run dev

# Or start separately:
npm run server    # Backend only
npm run client    # Frontend only
```

## 🔐 Admin Access

### Default Admin Credentials
- **Email**: admin@clothica.com
- **Password**: admin123

### Creating Admin Users
```bash
npm run create-admin
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Admin Dashboard
- `GET /api/admin/dashboard` - Dashboard analytics

### Product Management
- `GET /api/admin/products` - List products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product

### Order Management
- `GET /api/admin/orders` - List orders
- `PUT /api/admin/orders/:id/status` - Update order status

### User Management
- `GET /api/admin/users` - List users
- `PUT /api/admin/users/:id/status` - Update user status

### Category Management
- `GET /api/admin/categories` - List categories
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/:id` - Update category
- `DELETE /api/admin/categories/:id` - Delete category

## 🎨 UI Components

### Admin Layout
- Responsive navigation
- Mobile-friendly design
- Breadcrumb navigation
- User profile dropdown

### Data Tables
- Sortable columns
- Pagination
- Search functionality
- Bulk actions

### Modals & Forms
- Product creation/editing
- Order details
- User management
- Category management

### Charts & Analytics
- Revenue trends
- Order status distribution
- User growth
- Product performance

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Role-based Access** - Admin-only routes
- **Input Validation** - Server-side validation
- **Password Hashing** - bcrypt encryption
- **CORS Protection** - Cross-origin security
- **Helmet.js** - Security headers

## 📱 Responsive Design

The admin panel is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
```

### Backend (Heroku/Railway)
```bash
# Set environment variables
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-secret-key
PORT=5000
```

## 🔧 Customization

### Adding New Features
1. Create new models in `server/models/`
2. Add routes in `server/routes/admin.js`
3. Create React components in `client/src/pages/Admin/`
4. Update navigation in `client/src/components/Admin/AdminNav.js`

### Styling
- Uses Tailwind CSS for consistent styling
- Custom CSS classes in `client/src/index.css`
- Component-specific styles in respective files

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`

2. **JWT Token Issues**
   - Verify JWT_SECRET in environment
   - Check token expiration

3. **CORS Errors**
   - Verify proxy settings in `client/package.json`
   - Check CORS configuration in server

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check for dependency conflicts

## 📈 Performance Optimization

- **Lazy Loading** - Components loaded on demand
- **Pagination** - Large datasets handled efficiently
- **Image Optimization** - Compressed product images
- **Caching** - API response caching
- **Bundle Splitting** - Code splitting for faster loads

## 🔄 Future Enhancements

### Planned Features
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] Bulk import/export
- [ ] Advanced reporting
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Real-time notifications
- [ ] Advanced search filters
- [ ] Export to PDF/Excel
- [ ] API rate limiting

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for Clothica eCommerce Platform**
