
import { Router } from 'express';
import TaskHandler from '../handlers/task.handler'; // Import the TaskHandler instance

const router = Router();

// POST /tasks - Endpoint to create a new task
router.post('/', TaskHandler.createTask);

// GET /tasks - Endpoint to get all tasks
router.get('/', TaskHandler.getAllTasks);

// GET /tasks/:id - Endpoint to get a single task by ID
router.get('/:id', TaskHandler.getTaskById);


// PATCH /tasks/:id - Endpoint to update an existing task by ID
router.patch('/:id', TaskHandler.updateTask); 


router.get('/available', TaskHandler.getAvailableTasks);

router.get('/recent/:receiverId', TaskHandler.getRecentTasks);

export default router;
