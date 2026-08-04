export type JwtPayload = {
  sub: string;
  email: string;
};

export type AuthUserView = {
  id: string;
  email: string;
  name: string;
  mfaEnabled: boolean;
  isSuperAdmin: boolean;
  organizations: Array<{
    id: string;
    name: string;
    slug: string;
    role: string;
    appRole: string;
  }>;
};

export type AuthTokenResponse = {
  accessToken: string;
  expiresIn: string;
  user: AuthUserView;
  mfaRequired?: false;
};

export type AuthMfaChallengeResponse = {
  mfaRequired: true;
  mfaChallengeToken: string;
};
