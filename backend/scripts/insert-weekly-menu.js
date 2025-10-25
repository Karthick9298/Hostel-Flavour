import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Weekly Menu Schema
const weeklyMenuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  days: {
    monday: {
      morning: {
        items: [{
          name: String,
          description: String,
          category: String
        }],
        special: String
      },
      afternoon: {
        items: [{
          name: String,
          description: String,
          category: String
        }],
        special: String
      },
      evening: {
        items: [{
          name: String,
          description: String,
          category: String
        }],
        special: String
      },
      night: {
        items: [{
          name: String,
          description: String,
          category: String
        }],
        special: String
      }
    },
    tuesday: {
      morning: {
        items: [{
          name: String,
          description: String,
          category: String
        }],
        special: String
      },
      afternoon: {
        items: [{
          name: String,
          description: String,
          category: String
        }],
        special: String
      },
      evening: {
        items: [{
          name: String,
          description: String,
          category: String
        }],
        special: String
      },
      night: {
        items: [{
          name: String,
          description: String,
          category: String
        }],
        special: String
      }
    },
    wednesday: {
      morning: {
        items: [{
          name: String,
          description: String,
          category: String
        }],
        special: String
      },
      afternoon: {
        items: [{
          name: String,
          description: String,
          category: String
        }],
        special: String
      },
      evening: {
        items: [{
          name: String,
          description: String,
          category: String
        }],
        special: String
      },
      night: {
        items: [{
          name: String,
          description: String,
          category: String
        }],
        special: String
      }
    },
    thursday: {
      morning: {
        items: [{
          name: String,
          description: String,
          category: String
        }],
        special: String
      },
      afternoon: {
        items: [{
          name: String,
          description: String,
          category: String
        }],
        special: String
      },
      evening: {
        items: [{
          name: String,
          description: String,
          category: String
        }],
        special: String
      },
      night: {
        items: [{
          name: String,
          description: String,
          category: String
        }],
        special: String
      }
    },
    friday: {
      morning: {
        items: [{
          name: String,
          description: String,
          category: String
        }],
        special: String
      },
      afternoon: {
        items: [{
          name: String,
          description: String,
          category: String
        }],
        special: String
      },
      evening: {
        items: [{
          name: String,
          description: String,
          category: String
        }],
        special: String
      },
      night: {
        items: [{
          name: String,
          description: String,
          category: String
        }],
        special: String
      }
    },
    saturday: {
      morning: {
        items: [{
          name: String,
          description: String,
          category: String
        }],
        special: String
      },
      afternoon: {
        items: [{
          name: String,
          description: String,
          category: String
        }],
        special: String
      },
      evening: {
        items: [{
          name: String,
          description: String,
          category: String
        }],
        special: String
      },
      night: {
        items: [{
          name: String,
          description: String,
          category: String
        }],
        special: String
      }
    },
    sunday: {
      morning: {
        items: [{
          name: String,
          description: String,
          category: String
        }],
        special: String
      },
      afternoon: {
        items: [{
          name: String,
          description: String,
          category: String
        }],
        special: String
      },
      evening: {
        items: [{
          name: String,
          description: String,
          category: String
        }],
        special: String
      },
      night: {
        items: [{
          name: String,
          description: String,
          category: String
        }],
        special: String
      }
    }
  }
}, { collection: 'weeklymenus' });

const WeeklyMenu = mongoose.model('WeeklyMenu', weeklyMenuSchema);

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MongoDB URI not found in environment variables');
    }
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Weekly menu data
const weeklyMenuData = {
  name: 'Standard Weekly Menu',
  isActive: true,
  days: {
    monday: {
      morning: {
        items: [
          { name: 'Idli', description: 'Steamed rice cakes', category: 'main' },
          { name: 'Sambar', description: 'Lentil curry', category: 'side' },
          { name: 'Coconut Chutney', description: 'Fresh coconut chutney', category: 'side' },
          { name: 'Tea/Coffee', description: 'Hot beverages', category: 'beverage' }
        ],
        special: 'Fresh coconut chutney made daily'
      },
      afternoon: {
        items: [
          { name: 'Rice', description: 'Steamed white rice', category: 'main' },
          { name: 'Dal', description: 'Yellow lentil curry', category: 'main' },
          { name: 'Mixed Vegetable Curry', description: 'Seasonal vegetables', category: 'main' },
          { name: 'Pickle', description: 'Mango pickle', category: 'side' },
          { name: 'Papad', description: 'Crispy lentil wafer', category: 'side' }
        ],
        special: 'Farm fresh vegetables'
      },
      evening: {
        items: [
          { name: 'Vada Pav', description: 'Potato fritter in bread', category: 'main' },
          { name: 'Green Chutney', description: 'Mint and coriander chutney', category: 'side' },
          { name: 'Tea', description: 'Indian spiced tea', category: 'beverage' }
        ],
        special: 'Mumbai street food special'
      },
      night: {
        items: [
          { name: 'Chapati', description: 'Wheat flatbread', category: 'main' },
          { name: 'Paneer Curry', description: 'Cottage cheese curry', category: 'main' },
          { name: 'Dal Rice', description: 'Lentils with rice', category: 'main' },
          { name: 'Curd', description: 'Fresh yogurt', category: 'side' }
        ],
        special: 'Fresh paneer made in-house'
      }
    },
    tuesday: {
      morning: {
        items: [
          { name: 'Dosa', description: 'Crispy rice pancake', category: 'main' },
          { name: 'Sambar', description: 'Lentil curry', category: 'side' },
          { name: 'Tomato Chutney', description: 'Spicy tomato chutney', category: 'side' },
          { name: 'Filter Coffee', description: 'South Indian coffee', category: 'beverage' }
        ],
        special: 'Authentic filter coffee'
      },
      afternoon: {
        items: [
          { name: 'Biryani', description: 'Fragrant rice dish', category: 'main' },
          { name: 'Raita', description: 'Yogurt with vegetables', category: 'side' },
          { name: 'Pickle', description: 'Mixed vegetable pickle', category: 'side' },
          { name: 'Papad', description: 'Roasted papad', category: 'side' }
        ],
        special: 'Special vegetable biryani'
      },
      evening: {
        items: [
          { name: 'Samosa', description: 'Fried pastry with filling', category: 'main' },
          { name: 'Tamarind Chutney', description: 'Sweet and sour chutney', category: 'side' },
          { name: 'Masala Chai', description: 'Spiced tea', category: 'beverage' }
        ],
        special: 'Crispy golden samosas'
      },
      night: {
        items: [
          { name: 'Roti', description: 'Whole wheat bread', category: 'main' },
          { name: 'Aloo Gobi', description: 'Potato and cauliflower curry', category: 'main' },
          { name: 'Dal Tadka', description: 'Tempered lentils', category: 'main' },
          { name: 'Salad', description: 'Fresh vegetable salad', category: 'side' }
        ],
        special: 'Organic vegetables used'
      }
    },
    wednesday: {
      morning: {
        items: [
          { name: 'Upma', description: 'Semolina breakfast', category: 'main' },
          { name: 'Coconut Chutney', description: 'Fresh coconut chutney', category: 'side' },
          { name: 'Pickle', description: 'Lemon pickle', category: 'side' },
          { name: 'Tea/Coffee', description: 'Hot beverages', category: 'beverage' }
        ],
        special: 'Roasted cashews in upma'
      },
      afternoon: {
        items: [
          { name: 'Pulao', description: 'Spiced rice', category: 'main' },
          { name: 'Paneer Makhani', description: 'Creamy paneer curry', category: 'main' },
          { name: 'Dal', description: 'Mixed lentils', category: 'main' },
          { name: 'Papad', description: 'Fried papad', category: 'side' }
        ],
        special: 'Rich and creamy paneer makhani'
      },
      evening: {
        items: [
          { name: 'Bhel Puri', description: 'Puffed rice snack', category: 'main' },
          { name: 'Mint Chutney', description: 'Fresh mint chutney', category: 'side' },
          { name: 'Lemon Tea', description: 'Refreshing lemon tea', category: 'beverage' }
        ],
        special: 'Fresh bhel puri made to order'
      },
      night: {
        items: [
          { name: 'Chapati', description: 'Soft wheat bread', category: 'main' },
          { name: 'Mixed Dal', description: 'Three lentil curry', category: 'main' },
          { name: 'Bhindi Masala', description: 'Spiced okra', category: 'main' },
          { name: 'Rice', description: 'Steamed rice', category: 'side' }
        ],
        special: 'Special three-dal preparation'
      }
    },
    thursday: {
      morning: {
        items: [
          { name: 'Poha', description: 'Flattened rice', category: 'main' },
          { name: 'Sev', description: 'Crispy noodles', category: 'side' },
          { name: 'Lemon', description: 'Fresh lemon wedges', category: 'side' },
          { name: 'Tea', description: 'Indian tea', category: 'beverage' }
        ],
        special: 'Authentic Maharashtrian poha'
      },
      afternoon: {
        items: [
          { name: 'Curd Rice', description: 'Rice with yogurt', category: 'main' },
          { name: 'Rasam', description: 'Tangy soup', category: 'main' },
          { name: 'Vegetable Fry', description: 'Stir-fried vegetables', category: 'side' },
          { name: 'Pickle', description: 'Gongura pickle', category: 'side' }
        ],
        special: 'Cooling curd rice for hot weather'
      },
      evening: {
        items: [
          { name: 'Pav Bhaji', description: 'Vegetable curry with bread', category: 'main' },
          { name: 'Onions', description: 'Sliced onions', category: 'side' },
          { name: 'Butter', description: 'Fresh butter', category: 'side' },
          { name: 'Buttermilk', description: 'Spiced buttermilk', category: 'beverage' }
        ],
        special: 'Mumbai style pav bhaji'
      },
      night: {
        items: [
          { name: 'Paratha', description: 'Stuffed flatbread', category: 'main' },
          { name: 'Aloo Matar', description: 'Potato and peas curry', category: 'main' },
          { name: 'Dal', description: 'Yellow lentils', category: 'main' },
          { name: 'Pickle', description: 'Mixed pickle', category: 'side' }
        ],
        special: 'Stuffed parathas with fresh filling'
      }
    },
    friday: {
      morning: {
        items: [
          { name: 'Rava Dosa', description: 'Crispy semolina crepe', category: 'main' },
          { name: 'Sambar', description: 'Vegetable lentil curry', category: 'side' },
          { name: 'Coconut Chutney', description: 'Fresh coconut chutney', category: 'side' },
          { name: 'South Indian Coffee', description: 'Filter coffee', category: 'beverage' }
        ],
        special: 'Extra crispy rava dosa'
      },
      afternoon: {
        items: [
          { name: 'Special Rice', description: 'Flavored rice', category: 'main' },
          { name: 'Fish Curry', description: 'Traditional fish curry', category: 'main' },
          { name: 'Dal', description: 'Moong dal', category: 'main' },
          { name: 'Papad', description: 'Roasted papad', category: 'side' }
        ],
        special: 'Friday fish curry special'
      },
      evening: {
        items: [
          { name: 'Masala Dosa', description: 'Spiced potato dosa', category: 'main' },
          { name: 'Sambar', description: 'Lentil curry', category: 'side' },
          { name: 'Chutney', description: 'Coconut chutney', category: 'side' },
          { name: 'Coffee', description: 'Hot coffee', category: 'beverage' }
        ],
        special: 'Large masala dosa'
      },
      night: {
        items: [
          { name: 'Biryani', description: 'Friday special biryani', category: 'main' },
          { name: 'Raita', description: 'Cucumber raita', category: 'side' },
          { name: 'Boiled Egg', description: 'Hard boiled egg', category: 'side' },
          { name: 'Pickle', description: 'Biryani pickle', category: 'side' }
        ],
        special: 'Special Friday biryani with egg'
      }
    },
    saturday: {
      morning: {
        items: [
          { name: 'Pesarattu', description: 'Green gram pancake', category: 'main' },
          { name: 'Upma', description: 'Semolina porridge', category: 'side' },
          { name: 'Ginger Chutney', description: 'Spicy ginger chutney', category: 'side' },
          { name: 'Tea', description: 'Morning tea', category: 'beverage' }
        ],
        special: 'Andhra style pesarattu'
      },
      afternoon: {
        items: [
          { name: 'Pulihora', description: 'Tamarind rice', category: 'main' },
          { name: 'Vegetable Curry', description: 'Mixed vegetable curry', category: 'main' },
          { name: 'Dal', description: 'Toor dal', category: 'main' },
          { name: 'Papad', description: 'Crispy papad', category: 'side' }
        ],
        special: 'Traditional pulihora'
      },
      evening: {
        items: [
          { name: 'Panipuri', description: 'Water balls', category: 'main' },
          { name: 'Flavored Water', description: 'Spiced water', category: 'side' },
          { name: 'Sev', description: 'Fine noodles', category: 'side' },
          { name: 'Lassi', description: 'Sweet yogurt drink', category: 'beverage' }
        ],
        special: 'Fresh panipuri station'
      },
      night: {
        items: [
          { name: 'Naan', description: 'Leavened bread', category: 'main' },
          { name: 'Paneer Butter Masala', description: 'Rich paneer curry', category: 'main' },
          { name: 'Dal Makhani', description: 'Creamy black lentils', category: 'main' },
          { name: 'Salad', description: 'Garden salad', category: 'side' }
        ],
        special: 'Restaurant style dal makhani'
      }
    },
    sunday: {
      morning: {
        items: [
          { name: 'Puri Bhaji', description: 'Fried bread with curry', category: 'main' },
          { name: 'Halwa', description: 'Sweet semolina pudding', category: 'dessert' },
          { name: 'Pickle', description: 'Mango pickle', category: 'side' },
          { name: 'Special Tea', description: 'Sunday special tea', category: 'beverage' }
        ],
        special: 'Sunday special with halwa'
      },
      afternoon: {
        items: [
          { name: 'Ghee Rice', description: 'Clarified butter rice', category: 'main' },
          { name: 'Special Curry', description: 'Sunday special curry', category: 'main' },
          { name: 'Dal', description: 'Mixed dal', category: 'main' },
          { name: 'Sweet', description: 'Traditional sweet', category: 'dessert' },
          { name: 'Papad', description: 'Roasted papad', category: 'side' }
        ],
        special: 'Sunday feast with traditional sweet'
      },
      evening: {
        items: [
          { name: 'Chat Items', description: 'Assorted chat', category: 'main' },
          { name: 'Chutneys', description: 'Various chutneys', category: 'side' },
          { name: 'Cold Drinks', description: 'Refreshing drinks', category: 'beverage' }
        ],
        special: 'Sunday evening chat counter'
      },
      night: {
        items: [
          { name: 'Special Thali', description: 'Complete meal platter', category: 'main' },
          { name: 'Multiple Curries', description: '3 different curries', category: 'main' },
          { name: 'Rice & Rotis', description: 'Rice and bread', category: 'main' },
          { name: 'Sweet Dish', description: 'Sunday sweet', category: 'dessert' }
        ],
        special: 'Sunday grand thali with dessert'
      }
    }
  }
};

// Main function to insert weekly menu
const insertWeeklyMenu = async () => {
  console.log('🍽️  INSERTING WEEKLY MENU INTO DATABASE');
  console.log('========================================');
  
  try {
    // Connect to database
    await connectDB();
    
    // Check if menu already exists
    console.log('🔍 Checking for existing menu...');
    const existingMenu = await WeeklyMenu.findOne({ name: 'Standard Weekly Menu' });
    
    if (existingMenu) {
      console.log('⚠️  Menu already exists!');
      console.log('   Deleting old menu and inserting fresh data...');
      await WeeklyMenu.deleteOne({ _id: existingMenu._id });
      console.log('   ✅ Old menu deleted');
    }
    
    // Insert new menu
    console.log('📝 Inserting new weekly menu...');
    const menu = new WeeklyMenu(weeklyMenuData);
    await menu.save();
    
    console.log('✅ Weekly menu inserted successfully!');
    console.log(`   Menu ID: ${menu._id}`);
    console.log(`   Menu Name: ${menu.name}`);
    console.log(`   Active: ${menu.isActive}`);
    
    // Display summary
    console.log('\n📊 MENU SUMMARY:');
    console.log('================');
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const meals = ['morning', 'afternoon', 'evening', 'night'];
    
    let totalItems = 0;
    days.forEach(day => {
      console.log(`\n📅 ${day.toUpperCase()}:`);
      meals.forEach(meal => {
        const itemCount = menu.days[day][meal].items.length;
        totalItems += itemCount;
        console.log(`   ${meal}: ${itemCount} items - ${menu.days[day][meal].special}`);
      });
    });
    
    console.log(`\n📊 Total menu items across all days: ${totalItems}`);
    console.log('🎉 Weekly menu setup complete!');
    
  } catch (error) {
    console.error('\n💥 MENU INSERTION FAILED:');
    console.error(`❌ Error: ${error.message}`);
    console.error('📝 Stack:', error.stack);
  } finally {
    console.log('\n🔌 Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('✅ Database disconnected successfully');
    console.log('👋 Script execution completed');
    process.exit(0);
  }
};

// Handle script interruption
process.on('SIGINT', async () => {
  console.log('\n⚠️  Script interrupted by user');
  console.log('🔌 Cleaning up...');
  await mongoose.disconnect();
  process.exit(0);
});

// Run the menu insertion
insertWeeklyMenu().catch(error => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
