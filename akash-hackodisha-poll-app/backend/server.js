const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection string - uses environment variable or default
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hackodisha-poll';

// Security middleware
app.use(helmet());

// Rate limiting - prevent spam
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:8080'],
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB Schema Definition
const pollSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 200
    },
    options: [{
        text: {
            type: String,
            required: true,
            trim: true,
            maxLength: 100
        },
        votes: {
            type: Number,
            default: 0,
            min: 0
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create Poll model
const Poll = mongoose.model('Poll', pollSchema);

// Validation rules
const createPollValidation = [
    body('title')
        .isLength({ min: 5, max: 200 })
        .withMessage('Title must be between 5 and 200 characters')
        .trim()
        .escape(),
    body('options')
        .isArray({ min: 2, max: 10 })
        .withMessage('Must provide between 2 and 10 options'),
    body('options.*')
        .isLength({ min: 1, max: 100 })
        .withMessage('Each option must be between 1 and 100 characters')
        .trim()
        .escape()
];

const voteValidation = [
    body('optionIndex')
        .isInt({ min: 0 })
        .withMessage('Option index must be a non-negative integer')
];

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// Routes

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Get all polls
app.get('/api/polls', async (req, res) => {
    try {
        const polls = await Poll.find({})
            .sort({ createdAt: -1 })
            .limit(50); // Limit to 50 most recent polls
        
        res.json(polls);
    } catch (error) {
        console.error('Error fetching polls:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch polls',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Get specific poll by ID
app.get('/api/polls/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid poll ID'
            });
        }
        
        const poll = await Poll.findById(id);
        
        if (!poll) {
            return res.status(404).json({
                success: false,
                message: 'Poll not found'
            });
        }
        
        res.json(poll);
    } catch (error) {
        console.error('Error fetching poll:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch poll',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Create new poll
app.post('/api/polls', createPollValidation, handleValidationErrors, async (req, res) => {
    try {
        const { title, options } = req.body;
        
        // Create options array with vote count initialized to 0
        const pollOptions = options.map(optionText => ({
            text: optionText,
            votes: 0
        }));
        
        const newPoll = new Poll({
            title,
            options: pollOptions
        });
        
        const savedPoll = await newPoll.save();
        
        res.status(201).json({
            success: true,
            message: 'Poll created successfully',
            poll: savedPoll
        });
        
    } catch (error) {
        console.error('Error creating poll:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create poll',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Vote on a poll
app.post('/api/polls/:id/vote', voteValidation, handleValidationErrors, async (req, res) => {
    try {
        const { id } = req.params;
        const { optionIndex } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid poll ID'
            });
        }
        
        const poll = await Poll.findById(id);
        
        if (!poll) {
            return res.status(404).json({
                success: false,
                message: 'Poll not found'
            });
        }
        
        if (optionIndex >= poll.options.length) {
            return res.status(400).json({
                success: false,
                message: 'Invalid option index'
            });
        }
        
        // Increment vote count for the selected option
        poll.options[optionIndex].votes += 1;
        poll.updatedAt = new Date();
        
        const updatedPoll = await poll.save();
        
        res.json({
            success: true,
            message: 'Vote recorded successfully',
            poll: updatedPoll
        });
        
    } catch (error) {
        console.error('Error recording vote:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record vote',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Delete poll (admin endpoint)
app.delete('/api/polls/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid poll ID'
            });
        }
        
        const deletedPoll = await Poll.findByIdAndDelete(id);
        
        if (!deletedPoll) {
            return res.status(404).json({
                success: false,
                message: 'Poll not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Poll deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting poll:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete poll',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Database connection and server startup
async function startServer() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ Connected to MongoDB');
        
        // Start the server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 Poll API available at http://localhost:${PORT}/api/polls`);
            console.log(`🏥 Health check at http://localhost:${PORT}/health`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    await mongoose.connection.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    await mongoose.connection.close();
    process.exit(0);
});

// Start the server
startServer();
