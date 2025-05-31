import argon2 from 'argon2';

export const hashPassword = async (plain: string) =>
  argon2.hash(plain, {
    type: argon2.argon2id,
    memoryCost: 64 * 1024,
    timeCost: 3,
    parallelism: 1
  });

export const verifyPassword = (hash: string, plain: string) =>
  argon2.verify(hash, plain);
