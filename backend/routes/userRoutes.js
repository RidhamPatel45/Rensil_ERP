import express from 'express';
import { login, getUsers, getUserById, createUser, updateUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);

export default router;
