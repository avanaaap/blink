import { createBrowserRouter } from "react-router-dom";
import { APP_ROUTES } from "../lib/routes";
import { LandingPage } from "../pages/LandingPage";
import { LoginPage } from "../pages/LoginPage";
import { SignupPage } from "../pages/SignupPage";
import { PreferencesPage } from "../pages/PreferencesPage";
import { MatchPage } from "../pages/MatchPage";
import { ChatPage } from "../pages/ChatPage";
import { VoiceCallPage } from "../pages/VoiceCallPage";
import { VideoCallPage } from "../pages/VideoCallPage";
import { RatingPage } from "../pages/RatingPage";
import { ProfilePage } from "../pages/ProfilePage";
import { MyProfilePage } from "../pages/MyProfilePage";
import { ConnectionPage } from "../pages/ConnectionPage";
import { SettingsPage } from "../pages/SettingsPage";

export const router = createBrowserRouter([
  { path: APP_ROUTES.landing, Component: LandingPage },
  { path: APP_ROUTES.login, Component: LoginPage },
  { path: APP_ROUTES.signup, Component: SignupPage },
  { path: APP_ROUTES.preferences, Component: PreferencesPage },
  { path: APP_ROUTES.match, Component: MatchPage },
  { path: "/dashboard", Component: MatchPage },
  { path: APP_ROUTES.chat, Component: ChatPage },
  { path: APP_ROUTES.voiceCall, Component: VoiceCallPage },
  { path: APP_ROUTES.videoCall, Component: VideoCallPage },
  { path: APP_ROUTES.rating, Component: RatingPage },
  { path: APP_ROUTES.myProfile, Component: MyProfilePage },
  { path: APP_ROUTES.profile, Component: ProfilePage },
  { path: APP_ROUTES.reveal, Component: ProfilePage },
  { path: APP_ROUTES.settings, Component: SettingsPage },
  { path: APP_ROUTES.connection, Component: ConnectionPage },
  { path: "*", Component: LandingPage },
]);
