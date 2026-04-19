import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Communities from "./pages/Communities";
import CommunityPage from "./pages/CommunityPage";
import Messages from "./pages/Messages";
import FindBuddies from "./pages/FindBuddies";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import ConnectionRequests from "./pages/ConnectionRequests";
import ProtectedRoute from "./components/ProtectedRoute";
import FindYourMatch from  "./pages/FindYourMatch";
import OnboardingFlow from "./components/onboarding/OnboardingFlow";
// import IdeaHub from "./pages/startup/IdeaHub";
import IdeaDetail from "./pages/startup/IdeaDetail";
import PostIdea from "./pages/startup/PostIdea";
import MentorConnect from "./pages/startup/MentorConnect";
import MentorProfile from "./pages/startup/MentorProfile";
import Funding from "./pages/startup/Funding";
import IdeaHub from "./pages/startup/IdeaHub";
import UserProfile from "./pages/UserProfile";
import NotificationsPage from "./pages/NotificationsPage";


const queryClient = new QueryClient();

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const token        = localStorage.getItem("token");
  const onboardingDone = localStorage.getItem("onboardingDone") === "true";

  // No token means ProtectedRoute already redirects to /login,
  // but we guard here too just in case.
  if (!token) return <Navigate to="/login" replace />;

  // Logged in but onboarding not done → send them to fill interests
  if (!onboardingDone) return <Navigate to="/onboarding" replace />;

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          {/* Protected Routes: Sirf login ke baad dikhenge */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
 <Route
  path="/profile/:id"
  element={<UserProfile />}
/>
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route path="/messages/:userId" element={<Messages />} />
          <Route
            path="/communities"
            element={
              <ProtectedRoute>
                <Communities />
              </ProtectedRoute>
            }
          />
          <Route path="/community/:id" element={<CommunityPage />} />
          <Route
            path="/find-buddies"
            element={
              <ProtectedRoute>
                <FindBuddies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/find-match"
            element={
              <ProtectedRoute>
                <FindYourMatch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/connection-requests"
            element={
              <ProtectedRoute>
                <ConnectionRequests />
              </ProtectedRoute>
            }
          />
          <Route path="/startup/idea/:id" element={<IdeaDetail />} />
          <Route path="/startup/post-idea" element={<PostIdea />} />
          <Route path="/startup/mentors" element={<MentorConnect />} />
          <Route path="/startup/ideas" element={<IdeaHub />} />
          <Route path="/startup/mentor/:id" element={<MentorProfile />} />
          <Route path="/startup/funding" element={<Funding />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingFlow />
              </ProtectedRoute>
            }
          />

          {/* Public Routes: Har koi dekh sakta hai */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
