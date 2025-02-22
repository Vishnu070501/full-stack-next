import jwt, { JwtPayload } from 'jsonwebtoken';

interface SignOption {
  expiresIn?: number | string;
}

const DEFAULT_SIGN_OPTION: SignOption = {
  expiresIn: '1h',
};

export function signJwtPayload(
  payload: JwtPayload,
  options: SignOption = DEFAULT_SIGN_OPTION
) {
  const secret_key = process.env.JWT_SECRET;
  if (!secret_key) {
    console.error('JWT_SECRET is not defined');
    return null;
  }
  try {
    const token = jwt.sign(payload, secret_key, options as jwt.SignOptions);
    return token;
  } catch (error) {
    console.error('Error signing JWT:', error);
    return null;
  }
}

export function verifyJwt(token: string) {
    try {
      const secret_key = process.env.JWT_SECRET;
      if (!secret_key) {
        console.error('JWT_SECRET is not defined');
        return null;
      }
  
      const decoded = jwt.verify(token, secret_key) as jwt.JwtPayload;
      return decoded; // This will contain the userId and other data
    } catch (error) {
      console.error('JWT verification failed:', error);
      return null;
    }
  }