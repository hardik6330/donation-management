import { User, Role } from '../../models/index.js';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_MOBILE } from '../../config/env.js';
import logger from '../logger.js';

export const seedAdmin = async () => {
  try {
    const adminEmail = ADMIN_EMAIL;
    const adminPassword = ADMIN_PASSWORD;
    const adminMobile = ADMIN_MOBILE;

    const adminExists = await User.unscoped().findOne({ where: { email: adminEmail } });
    if (!adminExists) {
      let adminRole = await Role.findOne({ 
        where: { 
          name: { [Op.or]: ['Admin', 'Super Admin'] } 
        } 
      });

      if (!adminRole) {
        logger.warn('Admin role not found during admin seeding, check roles seeder.');
        return;
      }

      const hashedPassword = bcrypt.hashSync(adminPassword, 10);
      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        mobileNumber: adminMobile,
        password: hashedPassword,
        isAdmin: true,
        roleId: adminRole.id,
        created_by: 'System',
      });
      logger.info(`Initial Admin created successfully with role: ${adminRole.name}`);
    } else {
      logger.info('Admin already exists, skipping creation');
    }
  } catch (error) {
    logger.error('Error seeding admin:', error.message);
  }
};
