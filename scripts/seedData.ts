import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAuHwW503pTdTG3yZ65FHnXugEbkGaGXus",
  authDomain: "hamid-9f53b.firebaseapp.com",
  projectId: "hamid-9f53b",
  storageBucket: "hamid-9f53b.firebasestorage.app",
  messagingSenderId: "606914981239",
  appId: "1:606914981239:web:f31bb5290eb6dd08c34572",
  measurementId: "G-B06WT1ZZMG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample product data
const sampleProducts = [
  {
    name: "Wireless Bluetooth Headphones",
    description: "High-quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
    price: 299.99,
    stock: 15,
    category: "Electronics",
    image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=wireless%20bluetooth%20headphones%20modern%20sleek%20design%20black%20and%20silver%20professional%20product%20photography&image_size=square_hd"
  },
  {
    name: "Organic Cotton T-Shirt",
    description: "Comfortable and sustainable organic cotton t-shirt. Available in multiple colors and sizes.",
    price: 29.99,
    stock: 50,
    category: "Clothing",
    image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=organic%20cotton%20t-shirt%20white%20minimalist%20style%20folded%20on%20white%20background%20product%20photography&image_size=square_hd"
  },
  {
    name: "Smart Fitness Watch",
    description: "Advanced fitness tracker with heart rate monitoring, GPS, and 7-day battery life. Track your workouts and health metrics.",
    price: 199.99,
    stock: 25,
    category: "Electronics",
    image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=smart%20fitness%20watch%20black%20modern%20design%20digital%20display%20sporty%20professional%20product%20photography&image_size=square_hd"
  },
  {
    name: "Artisan Coffee Beans",
    description: "Premium single-origin coffee beans, medium roast with notes of chocolate and caramel. Perfect for coffee enthusiasts.",
    price: 24.99,
    stock: 30,
    category: "Food & Beverage",
    image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=artisan%20coffee%20beans%20brown%20roasted%20coffee%20beans%20in%20burlap%20bag%20rustic%20product%20photography&image_size=square_hd"
  },
  {
    name: "Ergonomic Office Chair",
    description: "Comfortable ergonomic office chair with lumbar support and adjustable height. Perfect for long work sessions.",
    price: 449.99,
    stock: 8,
    category: "Furniture",
    image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=ergonomic%20office%20chair%20black%20mesh%20modern%20design%20professional%20office%20product%20photography&image_size=square_hd"
  },
  {
    name: "Wireless Phone Charger",
    description: "Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicator.",
    price: 39.99,
    stock: 40,
    category: "Electronics",
    image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=wireless%20phone%20charger%20black%20circular%20modern%20minimalist%20design%20product%20photography&image_size=square_hd"
  },
  {
    name: "Yoga Mat Premium",
    description: "High-quality non-slip yoga mat with extra cushioning. Perfect for yoga, pilates, and home workouts.",
    price: 79.99,
    stock: 20,
    category: "Sports & Fitness",
    image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20yoga%20mat%20purple%20rolled%20up%20exercise%20fitness%20product%20photography%20clean%20background&image_size=square_hd"
  },
  {
    name: "Stainless Steel Water Bottle",
    description: "Insulated stainless steel water bottle that keeps drinks cold for 24 hours or hot for 12 hours. BPA-free and eco-friendly.",
    price: 34.99,
    stock: 35,
    category: "Sports & Fitness",
    image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=stainless%20steel%20water%20bottle%20silver%20metallic%20insulated%20sport%20bottle%20product%20photography&image_size=square_hd"
  },
  {
    name: "LED Desk Lamp",
    description: "Adjustable LED desk lamp with multiple brightness levels and color temperatures. Perfect for reading and work.",
    price: 89.99,
    stock: 18,
    category: "Home & Garden",
    image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=LED%20desk%20lamp%20white%20modern%20adjustable%20minimalist%20design%20product%20photography&image_size=square_hd"
  },
  {
    name: "Bluetooth Portable Speaker",
    description: "Compact portable speaker with powerful sound and 12-hour battery life. Water-resistant design for outdoor use.",
    price: 79.99,
    stock: 22,
    category: "Electronics",
    image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=bluetooth%20portable%20speaker%20black%20compact%20modern%20design%20water%20resistant%20product%20photography&image_size=square_hd"
  }
];

// Function to seed products
async function seedProducts() {
  console.log('Starting to seed products...');
  
  try {
    for (const product of sampleProducts) {
      const docRef = await addDoc(collection(db, 'products'), {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Added product: ${product.name} (ID: ${docRef.id})`);
    }
    
    console.log('Successfully seeded all products!');
  } catch (error) {
    console.error('Error seeding products:', error);
  }
}

// Run the seeding
if (require.main === module) {
  seedProducts().then(() => {
    console.log('Seeding completed');
    process.exit(0);
  }).catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
}

export { seedProducts, sampleProducts };
