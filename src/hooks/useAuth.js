import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const decoded = jwtDecode(token);

          // Check if token is expired
          if (decoded.exp * 1000 > Date.now()) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem("token"); // Remove expired token
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Invalid token:", error);
          localStorage.removeItem("token"); // Remove invalid token
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  return isAuthenticated;
};

export default useAuth;
