import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    requestId?: string;
    user?: {
      userId: string;
      email: string;
    };
    organizationId?: string;
    membershipRole?: string;
    appRole?: string;
    isSuperAdmin?: boolean;
  }
}
