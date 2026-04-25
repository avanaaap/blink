import { createBrowserRouter } from "react-router-dom";
import App from "./App";

/**
 * Application routes.
 * Add page components here as the app grows.
 *
 * Example:
 *   import Home from "./pages/Home";
 *   { index: true, element: <Home /> }
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // Add child routes here
    ],
  },
]);
