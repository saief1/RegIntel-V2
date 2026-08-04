export type JwtPayload = {
  sub: string;
  email: string;
};

export type AuthUserView = {
  id: string;
  email: string;
  name: string;
  mfaEnabled: boolean;
  organizations: Array<{
    id: string;
    name: string;
    slug: string;
    role: string;
  }>;
};

export type AuthTokenResponse = {
  accessToken: string;
  expiresIn: string;
  user: AuthUserView;
};
