import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/userRepository';

const userRepository = new UserRepository();

export class AuthService {
  async authenticate(username: string, password: string) {
    const user = await userRepository.findByUsername(username);
    if (!user || !user.is_active) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role_id: user.role_id, branch_id: user.branch_id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as any }
    );

    await userRepository.updateLastLogin(user.id);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role_id: user.role_id,
        branch_id: user.branch_id
      }
    };
  }
}
