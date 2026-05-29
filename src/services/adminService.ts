import { Product } from '../models/product';


// 1. CREATE (Seed a new meal)

export const seedNewMeal = async (numberId: number, name: string, price: number) => {
  const existingMeal = await Product.findOne({ numberId });
  
  if (existingMeal) {
    throw new Error(`Menu option ${numberId} is already assigned to ${existingMeal.name}`);
  }

  const newMeal = await Product.create({ numberId, name, price });
  return newMeal;
};


// 2. READ (Fetch the entire menu for the admin dashboard)

export const getAllMeals = async () => {
  // Sorts them numerically so the admin sees them in order
  const meals = await Product.find().sort({ numberId: 1 });
  return meals;
};

// 3. UPDATE (Modify an existing meal's name or price)

export const updateMeal = async (numberId: number, name?: string, price?: number) => {
  // We build an update object dynamically so we only overwrite what the admin actually sent
  const updateData: { name?: string; price?: number } = {};
  if (name) updateData.name = name;
  if (price) updateData.price = price;

  const updatedMeal = await Product.findOneAndUpdate(
    { numberId },
    { $set: updateData },
    { new: true } // This flag tells Mongoose to return the NEW updated document, not the old one
  );

  if (!updatedMeal) {
    throw new Error(`No meal found with menu option ${numberId}`);
  }

  return updatedMeal;
};


// 4. DELETE (Remove a meal completely)
export const deleteMeal = async (numberId: number) => {
  const deletedMeal = await Product.findOneAndDelete({ numberId });
  
  if (!deletedMeal) {
    throw new Error(`No meal found with menu option ${numberId}`);
  }

  return deletedMeal;
};