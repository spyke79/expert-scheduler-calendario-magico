
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import SchoolsPage from "./pages/schools/SchoolsPage";
import ExpertsPage from "./pages/experts/ExpertsPage";
import ExpertCalendar from "./pages/experts/ExpertCalendar";
import CoursesPage from "./pages/courses/CoursesPage";
import CourseCalendarPage from "./pages/courses/CourseCalendarPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/schools" element={<SchoolsPage />} />
          <Route path="/experts" element={<ExpertsPage />} />
          <Route path="/expert-dashboard" element={<ExpertCalendar />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id/calendar" element={<CourseCalendarPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
