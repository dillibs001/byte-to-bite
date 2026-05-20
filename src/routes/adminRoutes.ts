import { Router } from 'express';
import { addNewMeal, fetchMenu, editMeal, removeMeal } from '../controllers/adminController';
import { requireAdminAuth } from '../middleware/adminAuth';

const router = Router();

// 🛡️ SECURITY GATE: Everything below this line requires the X-Admin-API-Key header!
router.use(requireAdminAuth);

// 
// REST API ENDPOINTS
// 
// POST /api/admin/menu - Creates a new meal
router.post('/menu', addNewMeal);

// GET /api/admin/menu - Fetches the whole menu
router.get('/menu', fetchMenu);

// PUT /api/admin/menu/:numberId - Updates a specific meal (e.g., /api/admin/menu/3)
router.put('/menu/:numberId', editMeal);

// DELETE /api/admin/menu/:numberId - Deletes a specific meal (e.g., /api/admin/menu/5)
router.delete('/menu/:numberId', removeMeal);

export default router;