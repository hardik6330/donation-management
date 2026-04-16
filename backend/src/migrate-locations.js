import { sequelize } from './config/db.js';

const migrate = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Step 1: Expand ENUM to include new values
    await sequelize.query(`ALTER TABLE Locations MODIFY COLUMN \`type\` ENUM('city', 'taluka', 'village', 'country', 'state') NOT NULL`);
    console.log('Step 1: ENUM expanded');

    // Step 2: Migrate data (city->country, village->city, taluka->state) - ORDER MATTERS
    await sequelize.query(`UPDATE Locations SET \`type\` = 'country' WHERE \`type\` = 'city'`);
    await sequelize.query(`UPDATE Locations SET \`type\` = 'city' WHERE \`type\` = 'village'`);
    await sequelize.query(`UPDATE Locations SET \`type\` = 'state' WHERE \`type\` = 'taluka'`);
    console.log('Step 2: Data migrated (city->country, taluka->state, village->city)');

    // Step 3: Shrink ENUM to only new values
    await sequelize.query(`ALTER TABLE Locations MODIFY COLUMN \`type\` ENUM('country', 'state', 'city') NOT NULL`);
    console.log('Step 3: ENUM finalized');

    // Step 4: Rename User columns
    const [userColumns] = await sequelize.query(`SHOW COLUMNS FROM Users`);
    const columnNames = userColumns.map(c => c.Field);

    if (columnNames.includes('village') && !columnNames.includes('city')) {
      await sequelize.query(`ALTER TABLE Users CHANGE COLUMN \`village\` \`city\` VARCHAR(255) DEFAULT NULL`);
      console.log('Step 4a: Renamed Users.village -> Users.city');
    }

    if (columnNames.includes('district') && !columnNames.includes('state')) {
      await sequelize.query(`ALTER TABLE Users CHANGE COLUMN \`district\` \`state\` VARCHAR(255) DEFAULT NULL`);
      console.log('Step 4b: Renamed Users.district -> Users.state');
    }

    if (!columnNames.includes('country')) {
      await sequelize.query(`ALTER TABLE Users ADD COLUMN \`country\` VARCHAR(255) DEFAULT NULL AFTER \`state\``);
      console.log('Step 4c: Added Users.country column');
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
};

migrate();
