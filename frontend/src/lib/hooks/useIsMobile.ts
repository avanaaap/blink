import { useState, useEffect } from "react";

function detectMobile(): boolean {
  if (typeof window === "undefined") return false;

  // Check user agent for common mobile identifiers
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod|Android|webOS|BlackBerry|Opera Mini|IEMobile/i.test(ua)) {
    return true;
  }

  // Fallback: coarse pointer (touch) indicates mobile
  if (window.matchMedia?.("(pointer: coarse)").matches) {
    return true;
  }

  return false;
}

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(detectMobile);

  useEffect(() => {
    setIsMobile(detectMobile());
  }, []);

  return isMobile;
}
