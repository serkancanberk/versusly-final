import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Clash from '../src/models/Clash.js';
import Argument from '../src/models/Argument.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/versusly');
    console.log('📦 Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Migration function
const migrateEmbeddedArguments = async () => {
  try {
    console.log('🚀 Starting argument migration...');
    
    // Get all clashes with embedded arguments
    const clashes = await Clash.find({ Clash_arguments: { $exists: true, $ne: [] } });
    console.log(`📊 Found ${clashes.length} clashes with embedded arguments`);

    let totalMigrated = 0;
    let totalSkipped = 0;
    let totalInvalid = 0;

    // Process each clash
    for (const clash of clashes) {
      console.log(`\n🔄 Processing clash: ${clash._id}`);
      
      // Skip if no arguments
      if (!clash.Clash_arguments?.length) {
        console.log('⏭️  No arguments to migrate');
        continue;
      }

      // Process each embedded argument
      for (const embeddedArg of clash.Clash_arguments) {
        try {
          // Skip arguments without user
          if (!embeddedArg.user) {
            console.log(`🚫 Skipping argument without user: "${embeddedArg.text?.slice(0, 50)}${embeddedArg.text?.length > 50 ? '...' : ''}"`);
            totalInvalid++;
            continue;
          }

          // Check if argument already exists (idempotency check)
          const existingArg = await Argument.findOne({
            text: embeddedArg.text,
            clash: clash._id,
            user: embeddedArg.user
          });

          if (existingArg) {
            console.log('⏭️  Argument already migrated, skipping:', embeddedArg._id);
            totalSkipped++;
            continue;
          }

          // Handle side field variations
          const side = typeof embeddedArg.side === 'object' && embeddedArg.side !== null
            ? embeddedArg.side.value
            : embeddedArg.side;

          // Create new argument document
          const newArgument = new Argument({
            text: embeddedArg.text,
            side: side,
            user: embeddedArg.user,
            clash: clash._id,
            createdAt: embeddedArg.createdAt || new Date()
          });

          await newArgument.save();
          console.log('✅ Migrated argument:', newArgument._id);
          totalMigrated++;
        } catch (error) {
          console.error('❌ Error migrating argument:', error);
          console.error('Argument details:', embeddedArg);
          totalSkipped++;
        }
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Total arguments migrated: ${totalMigrated}`);
    console.log(`⏭️  Total arguments skipped: ${totalSkipped}`);
    console.log(`🚫 Total invalid arguments: ${totalInvalid}`);
    console.log('🎉 Migration completed successfully');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  }
};

// Run the migration
const runMigration = async () => {
  try {
    await connectDB();
    await migrateEmbeddedArguments();
  } catch (error) {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  }
};

// Execute the migration
runMigration(); 