import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import User from '../models/User.js';
import Project from '../models/Project.js';
import { logger } from '../utils/logger.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/clipcrafters';

// Dummy users data
const dummyUsers = [
  {
    name: 'Student User',
    email: '23bce048@nirmauni.ac.in',
    password: 'Password123!',
    role: 'user',
    phone: '+919876543210',
    avatar: {
      url: 'https://ui-avatars.com/api/?name=Student+User&background=6366f1&color=fff',
    },
  },
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'Password123!',
    role: 'user',
    phone: '+1234567890',
    avatar: {
      url: 'https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff',
    },
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: 'Password123!',
    role: 'user',
    phone: '+1234567891',
    avatar: {
      url: 'https://ui-avatars.com/api/?name=Jane+Smith&background=8b5cf6&color=fff',
    },
  },
  {
    name: 'Admin User',
    email: 'admin@clipcrafters.com',
    password: 'Admin123!',
    role: 'admin',
    phone: '+1234567892',
    avatar: {
      url: 'https://ui-avatars.com/api/?name=Admin+User&background=ec4899&color=fff',
    },
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    password: 'Password123!',
    role: 'user',
    phone: '+1234567893',
    avatar: {
      url: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=10b981&color=fff',
    },
  },
  {
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    password: 'Password123!',
    role: 'user',
    phone: '+1234567894',
    avatar: {
      url: 'https://ui-avatars.com/api/?name=Michael+Brown&background=f59e0b&color=fff',
    },
  },
];

// Dummy projects data (will be created with user references)
const dummyProjectsTemplate = [
  {
    title: 'AI Video Marketing Campaign',
    description: 'Create engaging marketing videos using AI-generated visuals and narration for our Q1 product launch',
    status: 'completed',
    sourceType: 'text',
    sourceFile: 'marketing_brief.pdf',
  },
  {
    title: 'Educational Science Explainer',
    description: 'Generate educational videos explaining complex scientific concepts like photosynthesis and cellular respiration',
    status: 'processing',
    sourceType: 'lecture-notes',
    sourceFile: 'biology_notes.docx',
  },
  {
    title: 'Product Demo Video',
    description: 'Showcase product features with AI-generated visuals and professional voiceover for our SaaS platform',
    status: 'draft',
    sourceType: 'report',
    sourceFile: 'product_specs.pdf',
  },
  {
    title: 'Social Media Content Series',
    description: 'Generate short-form videos optimized for Instagram, TikTok, and YouTube Shorts',
    status: 'completed',
    sourceType: 'text',
    sourceFile: 'social_content_plan.txt',
  },
  {
    title: 'Tutorial Video Series',
    description: 'Create step-by-step tutorial videos with AI narration for our software documentation',
    status: 'processing',
    sourceType: 'report',
    sourceFile: 'user_manual.pdf',
  },
  {
    title: 'Brand Story Video',
    description: 'Tell your brand story with cinematic AI-generated visuals and emotional storytelling',
    status: 'draft',
    sourceType: 'text',
    sourceFile: 'brand_story.txt',
  },
  {
    title: 'Research Paper Summary',
    description: 'Convert academic research papers into engaging video summaries for wider audience reach',
    status: 'completed',
    sourceType: 'research-paper',
    sourceFile: 'research_paper.pdf',
  },
  {
    title: 'Corporate Training Module',
    description: 'Develop interactive training videos for employee onboarding and skill development',
    status: 'processing',
    sourceType: 'lecture-notes',
    sourceFile: 'training_materials.docx',
  },
  {
    title: 'Event Highlights Reel',
    description: 'Create dynamic highlight reels from event footage with AI-enhanced editing',
    status: 'completed',
    sourceType: 'text',
    sourceFile: 'event_script.txt',
  },
  {
    title: 'Customer Testimonial Video',
    description: 'Transform customer feedback into compelling testimonial videos with professional production',
    status: 'draft',
    sourceType: 'text',
    sourceFile: 'testimonials.txt',
  },
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    logger.info('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    logger.info('✅ Connected to MongoDB');

    // Clear existing data
    logger.info('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Project.deleteMany({});
    logger.info('✅ Existing data cleared');

    // Create users
    logger.info('👥 Creating dummy users...');
    const createdUsers = [];
    
    for (const userData of dummyUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      logger.info(`   ✓ Created user: ${user.name} (${user.email})`);
    }

    // Create projects for each user
    logger.info('📁 Creating dummy projects...');
    let projectCount = 0;

    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      const numProjects = Math.floor(Math.random() * 3) + 2; // 2-4 projects per user

      for (let j = 0; j < numProjects && projectCount < dummyProjectsTemplate.length; j++) {
        const projectTemplate = dummyProjectsTemplate[projectCount];
        
        const project = new Project({
          ...projectTemplate,
          owner: user._id,
          collaborators: [],
        });

        await project.save();
        
        // Add project to user's projects array
        user.projects.push(project._id);
        await user.save();

        logger.info(`   ✓ Created project: ${project.title} (Owner: ${user.name})`);
        projectCount++;
      }
    }

    // Display summary
    logger.info('\n📊 Seeding Summary:');
    logger.info(`   Users created: ${createdUsers.length}`);
    logger.info(`   Projects created: ${projectCount}`);
    logger.info('\n🎉 Database seeding completed successfully!');
    logger.info('\n📝 Test Credentials:');
    logger.info('   Student: 23bce048@nirmauni.ac.in / Password123!');
    logger.info('   User: john.doe@example.com / Password123!');
    logger.info('   User: jane.smith@example.com / Password123!');
    logger.info('   Admin: admin@clipcrafters.com / Admin123!');
    logger.info('   User: sarah.johnson@example.com / Password123!');
    logger.info('   User: michael.brown@example.com / Password123!');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
