import express from 'express';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, profilePic } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide username, email, and password'
            });
        }

        // Check if user already exists
        const userExists = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: userExists.email === email
                    ? 'Email already registered'
                    : 'Username already taken'
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            profilePic: profilePic || undefined
        });

        // Save user to database
        await user.save();

        // Generate JWT token
        const token = user.generateAuthToken();

        // Send response (excluding password)
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: userResponse
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: error.message
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, username, password } = req.body;

        // Check if email/username and password are provided
        if ((!email && !username) || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email/username and password'
            });
        }

        // Find user by email or username
        const user = await User.findOne({
            $or: [{ email }, { username }]
        }).select('+password');

        // Check if user exists
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = user.generateAuthToken();

        // Prepare user response (excluding password)
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: userResponse
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: error.message
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private (requires auth)
router.get('/me', authMiddleware, async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   PUT /api/auth/update
// @desc    Update user profile
// @access  Private
router.put('/update', authMiddleware, async (req, res) => {
    try {
        const updates = req.body;
        const allowedUpdates = ['username', 'email', 'profilePic', 'password'];

        // Filter only allowed updates
        const filteredUpdates = Object.keys(updates).reduce((acc, key) => {
            if (allowedUpdates.includes(key)) {
                acc[key] = updates[key];
            }
            return acc;
        }, {});

        // Find and update user
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: filteredUpdates },
            {
                new: true,
                runValidators: true
            }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user
        });

    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during update',
            error: error.message
        });
    }
});

export default router;
