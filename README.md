# Mini Store - React + Firebase E-commerce Application

A complete e-commerce application built with React (Vite + TypeScript) and Firebase, featuring anonymous shopping, admin management, and comprehensive order tracking.

## 🚀 Features

### Customer Features
- **Anonymous Shopping**: Browse and order without authentication
- **Product Catalog**: Browse products with categories, images, and detailed descriptions
- **Shopping Cart**: Persistent cart with localStorage
- **Checkout Process**: Simple and secure checkout form
- **Order Tracking**: Order confirmation and status updates

### Admin Features
- **Authentication**: Secure admin login with Firebase Auth
- **Order Management**: View, filter, and update order status
- **Product Management**: CRUD operations for products with image support
- **Dashboard**: Statistics and overview of store performance
- **Real-time Updates**: Live order status changes

### Technical Features
- **Modern Stack**: React 18, TypeScript, Vite, Tailwind CSS
- **Firebase Integration**: Firestore, Authentication, Storage, Cloud Functions
- **Responsive Design**: Mobile-first, fully responsive UI
- **Performance**: Optimized with code splitting and lazy loading
- **Security**: Firebase security rules for data protection
- **Testing**: Comprehensive unit tests with Vitest and React Testing Library

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Firebase (Firestore, Auth, Storage, Cloud Functions)
- **State Management**: React Context (Cart), Zustand (optional)
- **Forms**: React Hook Form with validation
- **Testing**: Vitest, React Testing Library, @testing-library/jest-dom
- **Deployment**: Firebase Hosting

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Firebase account and project

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/mini-store.git
cd mini-store
```

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 3. Firebase Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable the following services:
   - **Authentication**: Email/Password provider
   - **Firestore Database**: Create in production mode
   - **Storage**: Create bucket
   - **Cloud Functions**: Enable if using functions

#### Get Firebase Configuration
1. Go to Project Settings → General → Your apps → Web app
2. Register your app and copy the configuration
3. Create `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 4. Deploy Firebase Rules

#### Firestore Rules
```bash
firebase deploy --only firestore:rules
```

#### Storage Rules
```bash
firebase deploy --only storage
```

#### Cloud Functions (Optional)
```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

### 5. Create Admin User

#### Method 1: Using Firebase Console
1. Go to Firebase Console → Authentication
2. Create a new user with email/password
3. Note the user's UID

#### Method 2: Using the Script
```bash
cd scripts
npm install
# Update the script with your Firebase config and admin UID
npm run create-admin
```

#### Add Admin to Database
Create a document in Firestore:
- Collection: `admins`
- Document ID: Use the user's UID from above
- Fields: `{ uid: "user-uid", email: "admin@example.com", name: "Admin Name" }`

### 6. Seed Sample Data (Optional)
```bash
cd scripts
# Update the script with your Firebase config
npm run seed
```

### 7. Development
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Run Tests with UI
```bash
npm run test:ui
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

### Deploy Everything
```bash
firebase deploy
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx       # Navigation header
│   ├── ProductCard.tsx # Product display card
│   ├── ProductGrid.tsx # Product grid layout
│   └── ...
├── contexts/           # React Context providers
│   └── CartContext.tsx # Shopping cart state
├── pages/              # Page components
│   ├── Home.tsx        # Product catalog
│   ├── CartPage.tsx    # Shopping cart
│   ├── CheckoutPage.tsx # Order checkout
│   ├── AdminLogin.tsx  # Admin authentication
│   ├── AdminOrdersPage.tsx # Order management
│   └── AdminProductsPage.tsx # Product management
├── services/           # Firebase service functions
│   ├── auth.ts        # Authentication service
│   ├── products.ts    # Product CRUD operations
│   └── orders.ts      # Order management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
└── firebase/           # Firebase configuration

functions/              # Firebase Cloud Functions
├── src/
│   └── index.ts       # Cloud Functions logic
└── package.json

scripts/                # Setup and utility scripts
├── seedData.ts        # Sample data seeding
├── createAdmin.ts     # Admin user creation
└── package.json
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Firebase Configuration
Update the following files with your project settings:
- `src/firebase/config.ts` - Firebase initialization
- `firestore.rules` - Database security rules
- `storage.rules` - Storage security rules
- `.firebaserc` - Firebase project ID

## 📊 Admin Dashboard

### Accessing Admin Panel
1. Navigate to `/admin/login`
2. Login with admin credentials
3. Access admin dashboard at `/admin/orders` or `/admin/products`

### Admin Features
- **Order Management**: View all orders, filter by status, update order status
- **Product Management**: Add, edit, delete products with images
- **Statistics**: Overview of orders, products, and revenue
- **Real-time Updates**: Live order status changes

## 🔒 Security

### Firebase Security Rules
- **Products**: Public read, admin write
- **Orders**: Anonymous create, user-specific read, admin full access
- **Admin**: Admin-only access
- **Storage**: Public read for images, admin write

### Best Practices
- All sensitive operations are server-side
- Firebase rules protect data access
- Admin authentication required for management
- Input validation on forms

## 🧪 Testing Strategy

### Unit Tests
- Component rendering and interactions
- Context state management
- Utility functions
- Service functions (with mocks)

### Integration Tests
- Firebase service integration
- Form validation
- Cart functionality
- Admin authentication

### Test Coverage
- Critical business logic
- User interactions
- Error handling
- Edge cases

## 🐛 Troubleshooting

### Common Issues

#### Firebase Configuration Errors
- Ensure all environment variables are set correctly
- Check Firebase console for enabled services
- Verify security rules are deployed

#### Admin Login Issues
- Ensure admin user exists in Firestore `admins` collection
- Check user UID matches the document ID
- Verify Firebase Auth email/password is enabled

#### Build Errors
- Run `npm run check` for TypeScript errors
- Check for missing dependencies
- Ensure all imports are correct

#### Deployment Issues
- Check Firebase CLI is authenticated: `firebase login`
- Verify project ID in `.firebaserc`
- Ensure billing is enabled for Cloud Functions

### Getting Help
- Check the [Firebase Documentation](https://firebase.google.com/docs)
- Review [React Documentation](https://reactjs.org/docs)
- Open an issue in this repository

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Commit your changes: `git commit -am 'Add new feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) for the amazing framework
- [Firebase](https://firebase.google.com/) for the powerful backend services
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS
- [Vite](https://vitejs.dev/) for the fast build tool
- [Lucide React](https://lucide.dev/) for the beautiful icons

## 📞 Support

For support, email support@ministore.com or join our Slack channel.

---

**Happy coding! 🚀**