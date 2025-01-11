import type { JwtPayload } from 'jsonwebtoken';

export {};

declare global {
  namespace Express {
    export interface Request {
      user?: JwtPayload & {
        userId: string;
      };
    }
  }
}
