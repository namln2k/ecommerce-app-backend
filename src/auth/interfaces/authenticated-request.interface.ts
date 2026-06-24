import { Request } from 'express';
import { UserRole } from '../../users/user.entity';

export interface JwtUser {
  email: string;
  role: UserRole;
  sub: string;
}

export interface AuthenticatedRequest extends Request {
  user: JwtUser;
}
