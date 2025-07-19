import * as argon from 'argon2';
import crypto from 'crypto';
export class Util {
  static async hash(str: string): Promise<string> {
    const hash = await argon.hash(str);
    return hash;
  }

  static async match(hash: string, str: string): Promise<boolean> {
    const match = await argon.verify(hash, str);
    return match;
  }

  static generateToken() {
    return crypto.randomBytes(64).toString('hex');
  }
}
