import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

const connectDB = async (retries = 5) => {
    try {
        // Connection options
        const options = {
            serverSelectionTimeoutMS: 10000, // Increased timeout
            socketTimeoutMS: 45000,
            family: 4, // Use IPv4, skip trying IPv6
        };

        const conn = await mongoose.connect(process.env.MONGO_URI, options);

        logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
        logger.info(`📊 Database: ${conn.connection.name}`);

        // Connection event handlers
        mongoose.connection.on('error', (err) => {
            logger.error(`MongoDB connection error: ${err.message}`);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('✅ MongoDB reconnected successfully');
        });

        mongoose.connection.on('connected', () => {
            logger.info('🔗 MongoDB connection established');
        });

    } catch (error) {
        logger.error(`❌ MongoDB connection failed: ${error.message}`);
        
        // Provide helpful error messages
        if (error.message.includes('IP')) {
            logger.error('\n🔧 SOLUTION: Whitelist your IP address in MongoDB Atlas');
            logger.error('   1. Go to: https://cloud.mongodb.com');
            logger.error('   2. Navigate to: Network Access');
            logger.error('   3. Click: Add IP Address → Add Current IP Address');
            logger.error('   4. Wait 1-2 minutes for changes to apply\n');
        } else if (error.message.includes('authentication')) {
            logger.error('\n🔧 SOLUTION: Check your MongoDB credentials');
            logger.error('   - Verify username and password in .env file');
            logger.error('   - Ensure user has proper database permissions\n');
        } else if (error.message.includes('timeout')) {
            logger.error('\n🔧 SOLUTION: Connection timeout');
            logger.error('   - Check your internet connection');
            logger.error('   - Verify MongoDB Atlas cluster is running');
            logger.error('   - Try increasing serverSelectionTimeoutMS\n');
        }

        // Retry logic
        if (retries > 0) {
            logger.warn(`🔄 Retrying connection... (${retries} attempts remaining)`);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
            return connectDB(retries - 1);
        }

        logger.error('❌ Failed to connect to MongoDB after multiple attempts');
        logger.error('💡 Consider using local MongoDB for development:');
        logger.error('   MONGO_URI=mongodb://localhost:27017/clipcrafters\n');
        
        process.exit(1);
    }
};

export default connectDB;
