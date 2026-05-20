import { Request, Response } from 'express';
import { seedNewMeal, getAllMeals, updateMeal, deleteMeal } from '../services/adminService';


// 1. CREATE (POST)

export const addNewMeal = async (req: Request, res: Response) => {
  try {
    const { numberId, name, price } = req.body;

    if (!numberId || !name || !price) {
      return res.status(400).json({ error: 'Please provide numberId, name, and price.' });
    }

    const newMeal = await seedNewMeal(numberId, name, price);
    return res.status(201).json({ message: '✅ New meal added successfully!', meal: newMeal });

  } catch (error: any) {
    if (error.message.includes('already assigned')) {
      return res.status(409).json({ error: error.message }); // 409 = Conflict
    }
    console.error('Admin menu upload failed:', error);
    return res.status(500).json({ error: 'Failed to add meal to database' });
  }
};


// 2. READ (GET)

export const fetchMenu = async (req: Request, res: Response) => {
  try {
    const meals = await getAllMeals();
    return res.status(200).json({ menu: meals });
  } catch (error) {
    console.error('Failed to fetch menu:', error);
    return res.status(500).json({ error: 'Failed to fetch menu from database' });
  }
};


// 3. UPDATE (PUT)

export const editMeal = async (req: Request, res: Response) => {
  try {
    // We grab the numberId from the URL string (e.g., /api/admin/menu/3)
    const numberId = parseInt(req.params.numberId as string);
    const { name, price } = req.body;

    if (isNaN(numberId)) {
      return res.status(400).json({ error: 'Invalid meal number ID provided in the URL.' });
    }

    const updatedMeal = await updateMeal(numberId, name, price);
    return res.status(200).json({ message: '✅ Meal updated successfully!', meal: updatedMeal });

  } catch (error: any) {
    if (error.message.includes('No meal found')) {
      return res.status(404).json({ error: error.message }); // 404 = Not Found
    }
    console.error('Admin menu update failed:', error);
    return res.status(500).json({ error: 'Failed to update meal' });
  }
};


// 4. DELETE (DELETE)
export const removeMeal = async (req: Request, res: Response) => {
  try {
    const numberId = parseInt(req.params.numberId as string);

    if (isNaN(numberId)) {
      return res.status(400).json({ error: 'Invalid meal number ID provided in the URL.' });
    }

    const deletedMeal = await deleteMeal(numberId);
    return res.status(200).json({ message: '🗑️ Meal deleted successfully!', meal: deletedMeal });

  } catch (error: any) {
    if (error.message.includes('No meal found')) {
      return res.status(404).json({ error: error.message });
    }
    console.error('Admin menu deletion failed:', error);
    return res.status(500).json({ error: 'Failed to delete meal' });
  }
};