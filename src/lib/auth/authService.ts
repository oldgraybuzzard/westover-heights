import { PrismaClient } from '@prisma/client';
import { hash, compare } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { generateUsername } from '../utils/usernameGenerator';

const prisma = new PrismaClient();

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: 'USER' | 'EXPERT' | 'ADMIN';
}

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET!;
  private static readonly SALT_ROUNDS = 12;

  static async register(email: string, password: string): Promise<AuthUser> {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const passwordHash = await hash(password, this.SALT_ROUNDS);
    const displayName = await generateUsername();

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
      },
    });

    return user;
  }

  static async login(email: string, password: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const token = sign(
      { 
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
      this.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return token;
  }

  static async validateToken(token: string): Promise<AuthUser> {
    try {
      const decoded = verify(token, this.JWT_SECRET) as AuthUser;
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
} 