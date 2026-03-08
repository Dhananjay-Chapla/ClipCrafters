import mongoose from 'mongoose';
import 'dotenv/config';
import User from '../models/User.js';
import Project from '../models/Project.js';
import { logger } from '../utils/logger.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/clipcrafters';

// Your email
const YOUR_EMAIL = '23bce048@nirmauni.ac.in';

// Projects to add to your account
const projectsToAdd = [
  {
    title: 'AI Video Marketing Campaign',
    description: 'Create engaging marketing videos using AI-generated visuals and narration for Q1 product launch',
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
];

const addProjectsToUser = async () => {
  try {
    // Connect to MongoDB
    logger.info('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    logger.info('✅ Connected to MongoDB');

    // Find your user account
    logger.info(`🔍 Looking for user: ${YOUR_EMAIL}`);
    const user = await User.findOne({ email: YOUR_EMAIL });

    if (!user) {
      logger.error(`❌ User not found: ${YOUR_EMAIL}`);
      logger.error('Please make sure you have registered with this email first!');
      process.exit(1);
    }

    logger.info(`✅ Found user: ${user.name} (${user.email})`);

    // Delete existing projects for this user (to avoid duplicates)
    logger.info('🗑️  Removing existing projects for this user...');
    const deletedProjects = await Project.deleteMany({ owner: user._id });
    logger.info(`   Deleted ${deletedProjects.deletedCount} existing projects`);

    // Clear user's projects array
    user.projects = [];
    await user.save();

    // Create new projects
    logger.info('📁 Creating projects for your account...');
    let projectCount = 0;

    for (const projectData of projectsToAdd) {
      const project = new Project({
        ...projectData,
        owner: user._id,
        collaborators: [],
      });

      await project.save();
      
      // Add project to user's projects array
      user.projects.push(project._id);
      
      logger.info(`   ✓ Created: ${project.title} [${project.status}]`);
      projectCount++;
    }

    // Save user with updated projects array
    await user.save();

    // Calculate statistics
    const completed = projectsToAdd.filter(p => p.status === 'completed').length;
    const processing = projectsToAdd.filter(p => p.status === 'processing').length;
    const draft = projectsToAdd.filter(p => p.status === 'draft').length;

    // Display summary
    logger.info('\n📊 Projects Added Successfully!');
    logger.info(`   User: ${user.name} (${user.email})`);
    logger.info(`   Total Projects: ${projectCount}`);
    logger.info(`   Completed: ${completed}`);
    logger.info(`   In Progress: ${processing}`);
    logger.info(`   Drafts: ${draft}`);
    logger.info('\n🎉 Done! Your dashboard should now show proper data.');
    logger.info('\n💡 Next Steps:');
    logger.info('   1. Refresh your browser (Ctrl+R or Cmd+R)');
    logger.info('   2. Check your dashboard - you should see the projects!');
    logger.info(`   3. Login with: ${YOUR_EMAIL} and your current password`);

    process.exit(0);
  } catch (error) {
    logger.error('❌ Failed to add projects:', error);
    process.exit(1);
  }
};

// Run the script
addProjectsToUser();
