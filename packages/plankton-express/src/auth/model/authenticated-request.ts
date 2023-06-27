import type { Request } from 'express';
import type Authentication from './authentication';

// JWT middleware sets the `auth` with token claims on the Request
type AuthenticatedRequest = Request & {
  auth?: Authentication;
};

export default AuthenticatedRequest;
