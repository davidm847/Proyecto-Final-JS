const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { idParamValidation, updateUserValidation } = require('../middleware/validation');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  deactivateUser,
  activateUser,
  getUserStats
} = require('../controllers/userController');

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', auth, authorize('admin'), getAllUsers);

// @route   GET /api/users/stats
// @desc    Get user statistics (admin only)
// @access  Private/Admin
router.get('/stats', auth, authorize('admin'), getUserStats);

// @route   GET /api/users/:id
// @desc    Get user by ID (admin only)
// @access  Private/Admin
router.get('/:id', auth, authorize('admin'), idParamValidation, getUserById);

// @route   PUT /api/users/:id
// @desc    Update user (admin only)
// @access  Private/Admin
router.put('/:id', auth, authorize('admin'), idParamValidation, updateUserValidation, updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private/Admin
router.delete('/:id', auth, authorize('admin'), idParamValidation, deleteUser);

// @route   PUT /api/users/:id/deactivate
// @desc    Deactivate user (admin only)
// @access  Private/Admin
router.put('/:id/deactivate', auth, authorize('admin'), idParamValidation, deactivateUser);

// @route   PUT /api/users/:id/activate
// @desc    Activate user (admin only)
// @access  Private/Admin
router.put('/:id/activate', auth, authorize('admin'), idParamValidation, activateUser);

module.exports = router;
