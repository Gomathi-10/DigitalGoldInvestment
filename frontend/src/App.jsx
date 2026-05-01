import { useState } from "react";
import "./App.css";
import Home from "./pages/Home/Home";
import Login from "./components/Navbar/Login";
import Navbar from "./components/Navbar/Navbar";
import Dashboard from "./pages/Dashboard/Dashboard";
import TransactionHistory from "./pages/TransactionHistory/TransactionHistory";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import KYC from "./pages/KYC/KYC";

import { Toaster } from "sonner";
import { Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/Navbar/ProtectedRoutes";

import Invest from "./pages/Invest/Invest";
import BuyCoins from "./pages/BuyCoins/BuyCoins";
import Withdraw from "./pages/Withdraw/Withdraw";
import Profile from "./pages/Profile/Profile";
import TermsAndConditions from "./pages/TermsAndConditions/TermsAndConditions";
import Resources from "./pages/Resources/Resources";
import Contact from "./pages/Contact/Contact";

function App() {
  const location = useLocation();

  // Check if we are on a dashboard/app page to hide the landing navbar
  const isAppPage = ['/dashboard', '/admin', '/kyc', '/transaction-history', '/invest', '/buy-coins', '/profile', '/withdraw', '/terms-and-conditions', '/resources', '/contact'].includes(location.pathname);


  return (
    <div className="app-container">

      {/* Show Navbar only if not on an app page */}
      {!isAppPage && <Navbar />}


      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transaction-history" element={<TransactionHistory />} />
          <Route path="/kyc" element={<KYC />} />
          <Route path="/invest" element={<Invest />} />
          <Route path="/buy-coins" element={<BuyCoins />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/contact" element={<Contact />} />


        </Route>
      </Routes>

      <Toaster />
    </div>
  );
}

export default App;
