import { useState, useEffect } from "react";

function detectMobile(): boolean {
  if (typeof window === "undefined") return false;

  // Check user agent for common mobile identifiers
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod|Android|webOS|BlackBerry|Opera Mini|IEMobile/i.test(ua)) {
    return true;
  }

  // iPadOS 13+ reports as Mac — detect via touch support + screen size
  if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) {
    return true;
  }

  // Fallback: coarse pointer (touch) indicates mobile/tablet
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
