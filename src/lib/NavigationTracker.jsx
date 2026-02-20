import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * NavigationTracker - tracks page views. 
 * Previously used base44.appLogs; now a no-op placeholder.
 */
export default function NavigationTracker() {
  const location = useLocation();

  useEffect(() => {
    // Page navigation tracked - could be wired to analytics later
  }, [location]);

  return null;
}
