import { PrismaClient } from '@prisma/client';
import { customAlphabet } from 'nanoid';

const prisma = new PrismaClient();
const nanoid = customAlphabet('123456789abcdefghijklmnpqrstuvwxyz', 8);

export async function generateUsername(): Promise<string> {
  while (true) {
    const username = `user_${nanoid()}`;
    const exists = await prisma.user.findUnique({
      where: { displayName: username },
    });
    
    if (!exists) {
      return username;
    }
  }
} 