import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import WelcomeScreen from "./pages/WelcomeScreen";
import LoginScreen from "./pages/LoginScreen";
import SignupScreen from "./pages/SignupScreen";
import PreferencesScreen from "./pages/PreferencesScreen";
import DashboardScreen from "./pages/DashboardScreen";
import ChatScreen from "./pages/ChatScreen";
import VoiceCallScreen from "./pages/VoiceCallScreen";
import VideoCallScreen from "./pages/VideoCallScreen";
import RatingScreen from "./pages/RatingScreen";
import RevealScreen from "./pages/RevealScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <WelcomeScreen /> },
      { path: "login", element: <LoginScreen /> },
      { path: "signup", element: <SignupScreen /> },
      { path: "preferences", element: <PreferencesScreen /> },
      { path: "dashboard", element: <DashboardScreen /> },
      { path: "chat", element: <ChatScreen /> },
      { path: "voice-call", element: <VoiceCallScreen /> },
      { path: "video-call", element: <VideoCallScreen /> },
      { path: "rating", element: <RatingScreen /> },
      { path: "reveal", element: <RevealScreen /> },
    ],
  },
]);
