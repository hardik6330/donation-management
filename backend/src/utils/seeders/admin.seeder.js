import { User, Role } from '../../models/index.js';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_MOBILE } from '../../config/env.js';

export const seedAdmin = async () => {
  try {
    const adminEmail = ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = ADMIN_PASSWORD || 'Admin@123';
    const adminMobile = ADMIN_MOBILE || '9876543210';

    const adminExists = await User.findOne({ where: { email: adminEmail } });
    if (!adminExists) {
      let adminRole = await Role.findOne({ 
        where: { 
          name: { [Op.or]: ['Admin', 'Super Admin'] } 
        } 
      });

      if (!adminRole) {
        console.log('Admin role not found during admin seeding, check roles seeder.');
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
      console.log(`Initial Admin created successfully with role: ${adminRole.name}`);
    } else {
      console.log('Admin already exists, skipping creation');
    }
  } catch (error) {
    console.error('Error seeding admin:', error.message);
  }
};
