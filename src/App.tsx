import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import ReportIssue from "./pages/ReportIssue";
import IssuesList from "./pages/IssuesList";
import IssueDetail from "./pages/IssueDetail";
import MapView from "./pages/MapView";
import AdminDashboard from "./pages/AdminDashboard";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import AdminInfrastructure from "./pages/AdminInfrastructure";
import AdminSecurity from "./pages/AdminSecurity";
import CitizenSecurity from "./pages/CitizenSecurity";
import CitizenInfrastructure from "./pages/CitizenInfrastructure";
import AdminSmartResponse from "./pages/AdminSmartResponse";
import CitizenSmartResponse from "./pages/CitizenSmartResponse";
import AdminCapacityMonitor from "./pages/AdminCapacityMonitor";
import CitizenCapacityMonitor from "./pages/CitizenCapacityMonitor";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/report" element={<ReportIssue />} />
                      <Route path="/issues" element={<IssuesList />} />
                      <Route path="/issues/:id" element={<IssueDetail />} />
                      <Route
                        path="/map"
                        element={
                          <ProtectedRoute requiredRole="admin">
                            <MapView />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute requiredRole="admin">
                            <AdminDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/infrastructure"
                        element={
                          <ProtectedRoute requiredRole="admin">
                            <AdminInfrastructure />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/security"
                        element={
                          <ProtectedRoute requiredRole="admin">
                            <AdminSecurity />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/security"
                        element={
                          <ProtectedRoute requiredRole="citizen">
                            <CitizenSecurity />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/infrastructure"
                        element={
                          <ProtectedRoute requiredRole="citizen">
                            <CitizenInfrastructure />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/smart-response"
                        element={
                          <ProtectedRoute>
                            {/* Render based on role within the component if needed, or handle here */}
                            <SmartResponseRouter />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route
                        path="/capacity"
                        element={
                          <ProtectedRoute>
                            <CapacityRouter />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

const SmartResponseRouter = () => {
  const { user } = useAuth();
  return user?.role === 'admin' ? <AdminSmartResponse /> : <CitizenSmartResponse />;
};

const CapacityRouter = () => {
  const { user } = useAuth();
  return user?.role === 'admin' ? <AdminCapacityMonitor /> : <CitizenCapacityMonitor />;
};

export default App;
