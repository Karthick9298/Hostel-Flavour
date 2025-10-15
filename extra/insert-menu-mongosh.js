// MongoDB script to insert sample weekly menu
// Run this in mongosh terminal with: load("insert-menu-mongosh.js")

// First, connect to your database
// use hostel_food_analysis

// Sample weekly menu data
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
          { name: "Dosa", description: "Crispy rice pancake", category: "main" },
          { name: "Sambar", description: "Lentil curry", category: "side" },
          { name: "Tomato Chutney", description: "Spicy tomato chutney", category: "side" },
          { name: "Filter Coffee", description: "South Indian coffee", category: "beverage" }
        ],
        special: "Authentic filter coffee"
      },
      afternoon: {
        items: [
          { name: "Biryani", description: "Fragrant rice dish", category: "main" },
          { name: "Raita", description: "Yogurt with vegetables", category: "side" },
          { name: "Pickle", description: "Mixed vegetable pickle", category: "side" },
          { name: "Papad", description: "Roasted papad", category: "side" }
        ],
        special: "Special vegetable biryani"
      },
      evening: {
        items: [
          { name: "Samosa", description: "Fried pastry with filling", category: "main" },
          { name: "Tamarind Chutney", description: "Sweet and sour chutney", category: "side" },
          { name: "Masala Chai", description: "Spiced tea", category: "beverage" }
        ],
        special: "Crispy golden samosas"
      },
      night: {
        items: [
          { name: "Roti", description: "Whole wheat bread", category: "main" },
          { name: "Aloo Gobi", description: "Potato and cauliflower curry", category: "main" },
          { name: "Dal Tadka", description: "Tempered lentils", category: "main" },
          { name: "Salad", description: "Fresh vegetable salad", category: "side" }
        ],
        special: "Organic vegetables used"
      }
    },
    wednesday: {
      morning: {
        items: [
          { name: "Upma", description: "Semolina breakfast", category: "main" },
          { name: "Coconut Chutney", description: "Fresh coconut chutney", category: "side" },
          { name: "Pickle", description: "Lemon pickle", category: "side" },
          { name: "Tea/Coffee", description: "Hot beverages", category: "beverage" }
        ],
        special: "Roasted cashews in upma"
      },
      afternoon: {
        items: [
          { name: "Pulao", description: "Spiced rice", category: "main" },
          { name: "Paneer Makhani", description: "Creamy paneer curry", category: "main" },
          { name: "Dal", description: "Mixed lentils", category: "main" },
          { name: "Papad", description: "Fried papad", category: "side" }
        ],
        special: "Rich and creamy paneer makhani"
      },
      evening: {
        items: [
          { name: "Bhel Puri", description: "Puffed rice snack", category: "main" },
          { name: "Mint Chutney", description: "Fresh mint chutney", category: "side" },
          { name: "Lemon Tea", description: "Refreshing lemon tea", category: "beverage" }
        ],
        special: "Fresh bhel puri made to order"
      },
      night: {
        items: [
          { name: "Chapati", description: "Soft wheat bread", category: "main" },
          { name: "Mixed Dal", description: "Three lentil curry", category: "main" },
          { name: "Bhindi Masala", description: "Spiced okra", category: "main" },
          { name: "Rice", description: "Steamed rice", category: "side" }
        ],
        special: "Special three-dal preparation"
      }
    },
    thursday: {
      morning: {
        items: [
          { name: "Poha", description: "Flattened rice", category: "main" },
          { name: "Sev", description: "Crispy noodles", category: "side" },
          { name: "Lemon", description: "Fresh lemon wedges", category: "side" },
          { name: "Tea", description: "Indian tea", category: "beverage" }
        ],
        special: "Authentic Maharashtrian poha"
      },
      afternoon: {
        items: [
          { name: "Curd Rice", description: "Rice with yogurt", category: "main" },
          { name: "Rasam", description: "Tangy soup", category: "main" },
          { name: "Vegetable Fry", description: "Stir-fried vegetables", category: "side" },
          { name: "Pickle", description: "Gongura pickle", category: "side" }
        ],
        special: "Cooling curd rice for hot weather"
      },
      evening: {
        items: [
          { name: "Pav Bhaji", description: "Vegetable curry with bread", category: "main" },
          { name: "Onions", description: "Sliced onions", category: "side" },
          { name: "Butter", description: "Fresh butter", category: "side" },
          { name: "Buttermilk", description: "Spiced buttermilk", category: "beverage" }
        ],
        special: "Mumbai style pav bhaji"
      },
      night: {
        items: [
          { name: "Paratha", description: "Stuffed flatbread", category: "main" },
          { name: "Aloo Matar", description: "Potato and peas curry", category: "main" },
          { name: "Dal", description: "Yellow lentils", category: "main" },
          { name: "Pickle", description: "Mixed pickle", category: "side" }
        ],
        special: "Stuffed parathas with fresh filling"
      }
    },
    friday: {
      morning: {
        items: [
          { name: "Rava Dosa", description: "Crispy semolina crepe", category: "main" },
          { name: "Sambar", description: "Vegetable lentil curry", category: "side" },
          { name: "Coconut Chutney", description: "Fresh coconut chutney", category: "side" },
          { name: "South Indian Coffee", description: "Filter coffee", category: "beverage" }
        ],
        special: "Extra crispy rava dosa"
      },
      afternoon: {
        items: [
          { name: "Special Rice", description: "Flavored rice", category: "main" },
          { name: "Fish Curry", description: "Traditional fish curry", category: "main" },
          { name: "Dal", description: "Moong dal", category: "main" },
          { name: "Papad", description: "Roasted papad", category: "side" }
        ],
        special: "Friday fish curry special"
      },
      evening: {
        items: [
          { name: "Masala Dosa", description: "Spiced potato dosa", category: "main" },
          { name: "Sambar", description: "Lentil curry", category: "side" },
          { name: "Chutney", description: "Coconut chutney", category: "side" },
          { name: "Coffee", description: "Hot coffee", category: "beverage" }
        ],
        special: "Large masala dosa"
      },
      night: {
        items: [
          { name: "Biryani", description: "Friday special biryani", category: "main" },
          { name: "Raita", description: "Cucumber raita", category: "side" },
          { name: "Boiled Egg", description: "Hard boiled egg", category: "side" },
          { name: "Pickle", description: "Biryani pickle", category: "side" }
        ],
        special: "Special Friday biryani with egg"
      }
    },
    saturday: {
      morning: {
        items: [
          { name: "Pesarattu", description: "Green gram pancake", category: "main" },
          { name: "Upma", description: "Semolina porridge", category: "side" },
          { name: "Ginger Chutney", description: "Spicy ginger chutney", category: "side" },
          { name: "Tea", description: "Morning tea", category: "beverage" }
        ],
        special: "Andhra style pesarattu"
      },
      afternoon: {
        items: [
          { name: "Pulihora", description: "Tamarind rice", category: "main" },
          { name: "Vegetable Curry", description: "Mixed vegetable curry", category: "main" },
          { name: "Dal", description: "Toor dal", category: "main" },
          { name: "Papad", description: "Crispy papad", category: "side" }
        ],
        special: "Traditional pulihora"
      },
      evening: {
        items: [
          { name: "Panipuri", description: "Water balls", category: "main" },
          { name: "Flavored Water", description: "Spiced water", category: "side" },
          { name: "Sev", description: "Fine noodles", category: "side" },
          { name: "Lassi", description: "Sweet yogurt drink", category: "beverage" }
        ],
        special: "Fresh panipuri station"
      },
      night: {
        items: [
          { name: "Naan", description: "Leavened bread", category: "main" },
          { name: "Paneer Butter Masala", description: "Rich paneer curry", category: "main" },
          { name: "Dal Makhani", description: "Creamy black lentils", category: "main" },
          { name: "Salad", description: "Garden salad", category: "side" }
        ],
        special: "Restaurant style dal makhani"
      }
    },
    sunday: {
      morning: {
        items: [
          { name: "Puri Bhaji", description: "Fried bread with curry", category: "main" },
          { name: "Halwa", description: "Sweet semolina pudding", category: "dessert" },
          { name: "Pickle", description: "Mango pickle", category: "side" },
          { name: "Special Tea", description: "Sunday special tea", category: "beverage" }
        ],
        special: "Sunday special with halwa"
      },
      afternoon: {
        items: [
          { name: "Ghee Rice", description: "Clarified butter rice", category: "main" },
          { name: "Special Curry", description: "Sunday special curry", category: "main" },
          { name: "Dal", description: "Mixed dal", category: "main" },
          { name: "Sweet", description: "Traditional sweet", category: "dessert" },
          { name: "Papad", description: "Roasted papad", category: "side" }
        ],
        special: "Sunday feast with traditional sweet"
      },
      evening: {
        items: [
          { name: "Chat Items", description: "Assorted chat", category: "main" },
          { name: "Chutneys", description: "Various chutneys", category: "side" },
          { name: "Cold Drinks", description: "Refreshing drinks", category: "beverage" }
        ],
        special: "Sunday evening chat counter"
      },
      night: {
        items: [
          { name: "Special Thali", description: "Complete meal platter", category: "main" },
          { name: "Multiple Curries", description: "3 different curries", category: "main" },
          { name: "Rice & Rotis", description: "Rice and bread", category: "main" },
          { name: "Sweet Dish", description: "Sunday sweet", category: "dessert" }
        ],
        special: "Sunday grand thali with dessert"
      }
    }
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

// Insert the menu into the weeklymenus collection
try {
  const result = db.weeklymenus.insertOne(sampleMenu);
  print("Menu inserted successfully!");
  print("Inserted ID:", result.insertedId);
  
  // Verify the insertion
  const insertedMenu = db.weeklymenus.findOne({_id: result.insertedId});
  print("Verification - Week start date:", insertedMenu.weekStartDate);
  print("Days available:", Object.keys(insertedMenu.days));
} catch (error) {
  print("Error inserting menu:", error);
}
