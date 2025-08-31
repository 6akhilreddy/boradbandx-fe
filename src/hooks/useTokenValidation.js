import { useEffect, useRef } from "react";
import useUserStore from "../store/userStore";
import { validateAndHandleToken } from "../utils/tokenUtils";

const useTokenValidation = (checkInterval = 60000) => {
  // Check every minute by default
  const intervalRef = useRef(null);
  const { token, user } = useUserStore();

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Only set up validation if user is authenticated
    if (token && user) {
      // Validate token immediately
      validateAndHandleToken();

      // Set up periodic validation
      intervalRef.current = setInterval(() => {
        validateAndHandleToken();
      }, checkInterval);
    }

    // Cleanup on unmount or when token/user changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [token, user, checkInterval]);

  return null; // This hook doesn't return anything, it just handles validation
};

export default useTokenValidation;
