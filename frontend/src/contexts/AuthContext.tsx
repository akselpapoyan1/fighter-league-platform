import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import apiClient from "@/api/apiClient";
import { jwtDecode } from "jwt-decode";

interface LoginResponse {
  token: string;
  user_type: string;
}

interface DecodedToken {
  id: number;
  email: string;
  user_type: string;
  iat: number;
  exp: number;
  name: string;
}

interface AuthUser {
  id: number;
  email: string;
  name: string;
  user_type: string;
}

interface AuthContextType {
  token: string | null;
  userType: string | null;
  currentUser: AuthUser | null;
  setToken: (token: string | null) => void;
  login: (walletAddress: string) => Promise<LoginResponse>;
  loginWithEmail: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
  isAuthLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      try {
        const decoded = jwtDecode<DecodedToken>(storedToken);

        setCurrentUser({
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          user_type: decoded.user_type,
        });

        setTokenState(storedToken);
        setUserType(decoded.user_type);
        apiClient.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${storedToken}`;
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("authToken");
        setCurrentUser(null);
      }
    }
    setIsAuthLoading(false);
  }, []);

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      try {
        const decoded = jwtDecode<DecodedToken>(newToken);

        const user: AuthUser = {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          user_type: decoded.user_type,
        };

        setCurrentUser(user);

        setUserType(decoded.user_type);
        localStorage.setItem("authToken", newToken);
        apiClient.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newToken}`;
      } catch (error) {
        console.error("Invalid token:", error);
        setCurrentUser(null);
      }
    } else {
      setUserType(null);
      localStorage.removeItem("authToken");
      delete apiClient.defaults.headers.common["Authorization"];
      setCurrentUser(null);
    }
  };

  const login = async (walletAddress: string): Promise<LoginResponse> => {
    try {
      const nonceRes = await apiClient.post("/auth/nonce", { walletAddress });
      const messageToSign = nonceRes.data.messageToSign;

      const signature = `signed_message_placeholder_for_${messageToSign}`;

      const loginRes = await apiClient.post<LoginResponse>("/auth/login", {
        walletAddress,
        signature,
      });

      const { token, user_type } = loginRes.data;

      if (token) {
        setToken(token);
        return { token, user_type };
      } else {
        throw new Error("No token received");
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const loginWithEmail = async (
    email: string,
    password: string
  ): Promise<LoginResponse> => {
    try {
      const loginRes = await apiClient.post<LoginResponse>(
        "/auth/login/email",
        {
          email,
          password,
        }
      );
      const { token, user_type } = loginRes.data;
      if (token) {
        setToken(token);
        return { token, user_type };
      } else {
        throw new Error("No token received");
      }
    } catch (error) {
      console.error("Email Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
  };

  console.log(currentUser);

  return (
    <AuthContext.Provider
      value={{
        token,
        userType,
        setToken,
        isAuthLoading,
        login,
        loginWithEmail,
        logout,
        currentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
