const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/hostel_food_analysis', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// WeeklyMenu schema
const weeklyMenuSchema = new mongoose.Schema({
  weekStartDate: { type: Date, required: true },
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
}, { timestamps: true });

const WeeklyMenu = mongoose.model('WeeklyMenu', weeklyMenuSchema);

// Sample menu data
const sampleMenu = {
  weekStartDate: new Date("2025-10-06T00:00:00.000Z"), // This week's Monday
  days: {
    monday: {
      morning: {
        items: [
          { name: "Idli", description: "Steamed rice cakes", category: "main" },
          { name: "Sambar", description: "Lentil curry", category: "side" },
          { name: "Coconut Chutney", description: "Fresh coconut chutney", category: "side" },
          { name: "Tea/Coffee", description: "Hot beverages", category: "beverage" }
        ],
        special: "Fresh coconut chutney made daily"
      },
      afternoon: {
        items: [
          { name: "Rice", description: "Steamed white rice", category: "main" },
          { name: "Dal", description: "Yellow lentil curry", category: "main" },
          { name: "Mixed Vegetable Curry", description: "Seasonal vegetables", category: "main" },
          { name: "Pickle", description: "Mango pickle", category: "side" },
          { name: "Papad", description: "Crispy lentil wafer", category: "side" }
        ],
        special: "Farm fresh vegetables"
      },
      evening: {
        items: [
          { name: "Vada Pav", description: "Potato fritter in bread", category: "main" },
          { name: "Green Chutney", description: "Mint and coriander chutney", category: "side" },
          { name: "Tea", description: "Indian spiced tea", category: "beverage" }
        ],
        special: "Mumbai street food special"
      },
      night: {
        items: [
          { name: "Chapati", description: "Wheat flatbread", category: "main" },
          { name: "Paneer Curry", description: "Cottage cheese curry", category: "main" },
          { name: "Dal Rice", description: "Lentils with rice", category: "main" },
          { name: "Curd", description: "Fresh yogurt", category: "side" }
        ],
        special: "Fresh paneer made in-house"
      }
    },
    tuesday: {
      morning: {
        items: [
          { name: "Dosa", description: "Crispy rice crepe", category: "main" },
          { name: "Potato Curry", description: "Spiced potato filling", category: "side" },
          { name: "Tomato Chutney", description: "Tangy tomato chutney", category: "side" },
          { name: "Filter Coffee", description: "South Indian coffee", category: "beverage" }
        ],
        special: "Crispy dosa made to order"
      },
      afternoon: {
        items: [
          { name: "Biryani", description: "Fragrant spiced rice", category: "main" },
          { name: "Chicken Curry", description: "Spicy chicken curry", category: "main" },
          { name: "Raita", description: "Yogurt salad", category: "side" },
          { name: "Pickle", description: "Mixed vegetable pickle", category: "side" },
          { name: "Boiled Egg", description: "Hard boiled egg", category: "side" }
        ],
        special: "Special Tuesday biryani"
      },
      evening: {
        items: [
          { name: "Pani Puri", description: "Crispy shells with spiced water", category: "main" },
          { name: "Bhel Puri", description: "Puffed rice snack", category: "main" },
          { name: "Sweet Chutney", description: "Tamarind date chutney", category: "side" },
          { name: "Masala Chai", description: "Spiced milk tea", category: "beverage" }
        ],
        special: "Street food evening"
      },
      night: {
        items: [
          { name: "Roti", description: "Whole wheat bread", category: "main" },
          { name: "Rajma", description: "Kidney bean curry", category: "main" },
          { name: "Jeera Rice", description: "Cumin flavored rice", category: "main" },
          { name: "Lassi", description: "Yogurt drink", category: "beverage" }
        ],
        special: "Punjab special rajma"
      }
    },
    wednesday: {
      morning: {
        items: [
          { name: "Upma", description: "Semolina breakfast", category: "main" },
          { name: "Coconut Chutney", description: "Fresh coconut chutney", category: "side" },
          { name: "Pickle", description: "Lemon pickle", category: "side" },
          { name: "Tea", description: "Indian tea", category: "beverage" }
        ],
        special: "Healthy semolina breakfast"
      },
      afternoon: {
        items: [
          { name: "Curd Rice", description: "Yogurt rice", category: "main" },
          { name: "Sambar", description: "Lentil vegetable curry", category: "main" },
          { name: "Vegetable Curry", description: "Mixed vegetable curry", category: "main" },
          { name: "Papad", description: "Roasted papad", category: "side" },
          { name: "Pickle", description: "Mango pickle", category: "side" }
        ],
        special: "Cool and soothing curd rice"
      },
      evening: {
        items: [
          { name: "Samosa", description: "Fried pastry with filling", category: "main" },
          { name: "Mint Chutney", description: "Fresh mint chutney", category: "side" },
          { name: "Tamarind Chutney", description: "Sweet and sour chutney", category: "side" },
          { name: "Tea", description: "Ginger tea", category: "beverage" }
        ],
        special: "Crispy fresh samosas"
      },
      night: {
        items: [
          { name: "Paratha", description: "Stuffed flatbread", category: "main" },
          { name: "Aloo Gobi", description: "Potato cauliflower curry", category: "main" },
          { name: "Dal", description: "Yellow lentil curry", category: "main" },
          { name: "Pickle", description: "Mixed pickle", category: "side" }
        ],
        special: "Stuffed paratha varieties"
      }
    },
    thursday: {
      morning: {
        items: [
          { name: "Poha", description: "Flattened rice breakfast", category: "main" },
          { name: "Peanuts", description: "Roasted peanuts", category: "side" },
          { name: "Lemon", description: "Fresh lemon", category: "side" },
          { name: "Tea/Coffee", description: "Hot beverages", category: "beverage" }
        ],
        special: "Light and nutritious poha"
      },
      afternoon: {
        items: [
          { name: "Pulao", description: "Spiced rice", category: "main" },
          { name: "Mixed Dal", description: "Mixed lentil curry", category: "main" },
          { name: "Cabbage Curry", description: "Spiced cabbage", category: "main" },
          { name: "Papad", description: "Fried papad", category: "side" },
          { name: "Curd", description: "Fresh yogurt", category: "side" }
        ],
        special: "Aromatic vegetable pulao"
      },
      evening: {
        items: [
          { name: "Bread Pakora", description: "Fried bread fritters", category: "main" },
          { name: "Green Chutney", description: "Coriander chutney", category: "side" },
          { name: "Ketchup", description: "Tomato ketchup", category: "side" },
          { name: "Masala Tea", description: "Spiced tea", category: "beverage" }
        ],
        special: "Hot and crispy pakoras"
      },
      night: {
        items: [
          { name: "Rice", description: "Steamed rice", category: "main" },
          { name: "Fish Curry", description: "Bengali style fish curry", category: "main" },
          { name: "Dal", description: "Moong dal", category: "main" },
          { name: "Pickle", description: "Fish pickle", category: "side" }
        ],
        special: "Bengali fish curry special"
      }
    },
    friday: {
      morning: {
        items: [
          { name: "Uttapam", description: "Thick rice pancake", category: "main" },
          { name: "Sambar", description: "Lentil curry", category: "side" },
          { name: "Coconut Chutney", description: "Fresh coconut chutney", category: "side" },
          { name: "Coffee", description: "Filter coffee", category: "beverage" }
        ],
        special: "Vegetable uttapam varieties"
      },
      afternoon: {
        items: [
          { name: "Fried Rice", description: "Chinese style fried rice", category: "main" },
          { name: "Manchurian", description: "Vegetable manchurian", category: "main" },
          { name: "Sweet Corn Soup", description: "Chinese soup", category: "main" },
          { name: "Pickle", description: "Chinese pickle", category: "side" },
          { name: "Papad", description: "Masala papad", category: "side" }
        ],
        special: "Chinese cuisine day"
      },
      evening: {
        items: [
          { name: "Pav Bhaji", description: "Spiced vegetable curry with bread", category: "main" },
          { name: "Onions", description: "Sliced onions", category: "side" },
          { name: "Lemon", description: "Fresh lemon", category: "side" },
          { name: "Buttermilk", description: "Spiced buttermilk", category: "beverage" }
        ],
        special: "Mumbai famous pav bhaji"
      },
      night: {
        items: [
          { name: "Chapati", description: "Wheat bread", category: "main" },
          { name: "Mutton Curry", description: "Spicy mutton curry", category: "main" },
          { name: "Rice", description: "Jeera rice", category: "main" },
          { name: "Salad", description: "Fresh vegetable salad", category: "side" }
        ],
        special: "Friday special mutton curry"
      }
    },
    saturday: {
      morning: {
        items: [
          { name: "Aloo Paratha", description: "Potato stuffed bread", category: "main" },
          { name: "Curd", description: "Fresh yogurt", category: "side" },
          { name: "Pickle", description: "Mango pickle", category: "side" },
          { name: "Lassi", description: "Sweet yogurt drink", category: "beverage" }
        ],
        special: "Saturday special parathas"
      },
      afternoon: {
        items: [
          { name: "South Indian Meals", description: "Traditional south Indian thali", category: "main" },
          { name: "Rice", description: "Steamed rice", category: "main" },
          { name: "Sambar", description: "Lentil curry", category: "main" },
          { name: "Rasam", description: "Spiced tomato soup", category: "main" },
          { name: "Multiple Curries", description: "Various vegetable curries", category: "main" }
        ],
        special: "Authentic south Indian thali"
      },
      evening: {
        items: [
          { name: "Dhokla", description: "Steamed gram flour cake", category: "main" },
          { name: "Green Chutney", description: "Mint coriander chutney", category: "side" },
          { name: "Sweet Chutney", description: "Tamarind chutney", category: "side" },
          { name: "Tea", description: "Cardamom tea", category: "beverage" }
        ],
        special: "Gujarati dhokla special"
      },
      night: {
        items: [
          { name: "Biriyani", description: "Hyderabadi style biryani", category: "main" },
          { name: "Chicken", description: "Spiced chicken pieces", category: "main" },
          { name: "Raita", description: "Cucumber raita", category: "side" },
          { name: "Pickle", description: "Biriyani pickle", category: "side" }
        ],
        special: "Weekend special Hyderabadi biryani"
      }
    },
    sunday: {
      morning: {
        items: [
          { name: "Puri Bhaji", description: "Fried bread with potato curry", category: "main" },
          { name: "Halwa", description: "Sweet semolina pudding", category: "main" },
          { name: "Pickle", description: "Mixed pickle", category: "side" },
          { name: "Milk Tea", description: "Special milk tea", category: "beverage" }
        ],
        special: "Sunday special breakfast with halwa"
      },
      afternoon: {
        items: [
          { name: "Special Thali", description: "Sunday special complete meal", category: "main" },
          { name: "Rice", description: "Basmati rice", category: "main" },
          { name: "Dal Makhani", description: "Creamy black lentils", category: "main" },
          { name: "Paneer Butter Masala", description: "Rich cottage cheese curry", category: "main" },
          { name: "Gulab Jamun", description: "Sweet dumplings", category: "dessert" }
        ],
        special: "Sunday special thali with dessert"
      },
      evening: {
        items: [
          { name: "Chaat", description: "Mixed street food", category: "main" },
          { name: "Dahi Puri", description: "Yogurt filled puri", category: "main" },
          { name: "Sev Puri", description: "Crispy snack", category: "main" },
          { name: "Cold Drink", description: "Flavored drinks", category: "beverage" }
        ],
        special: "Sunday chaat festival"
      },
      night: {
        items: [
          { name: "Naan", description: "Leavened bread", category: "main" },
          { name: "Butter Chicken", description: "Creamy chicken curry", category: "main" },
          { name: "Dal Tadka", description: "Tempered lentils", category: "main" },
          { name: "Ice Cream", description: "Vanilla ice cream", category: "dessert" }
        ],
        special: "Sunday dinner with ice cream"
      }
    }
  }
};

// Insert the menu
async function insertMenu() {
  try {
    // Check if menu already exists for this week
    const existingMenu = await WeeklyMenu.findOne({
      weekStartDate: sampleMenu.weekStartDate
    });

    if (existingMenu) {
      console.log('Menu for this week already exists!');
      console.log('Existing menu ID:', existingMenu._id);
      return;
    }

    // Insert new menu
    const newMenu = new WeeklyMenu(sampleMenu);
    const result = await newMenu.save();
    
    console.log('✅ Sample menu inserted successfully!');
    console.log('Menu ID:', result._id);
    console.log('Week start date:', result.weekStartDate);
    console.log('Days available:', Object.keys(result.days));
    
    // Show today's menu as example
    const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
    if (result.days[today]) {
      console.log(`\n📅 Today's (${today}) menu:`);
      Object.keys(result.days[today]).forEach(meal => {
        console.log(`\n${meal.toUpperCase()}:`);
        result.days[today][meal].items.forEach(item => {
          console.log(`  - ${item.name}: ${item.description}`);
        });
        if (result.days[today][meal].special) {
          console.log(`  🌟 Special: ${result.days[today][meal].special}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error inserting menu:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the insertion
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  insertMenu();
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});
