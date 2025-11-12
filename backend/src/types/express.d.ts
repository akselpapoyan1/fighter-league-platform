interface UserPayload {
  id: number;
  walletAddress: string;
  nationality: string | null;
  is_military: boolean;
}

declare global {
  namespace Express {
    export interface Request {
      user?: UserPayload;
    }
  }
}
