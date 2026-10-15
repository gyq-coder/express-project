import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, storedHash: string) {
  return bcrypt.compare(password, storedHash);
}
export { hashPassword, verifyPassword };
