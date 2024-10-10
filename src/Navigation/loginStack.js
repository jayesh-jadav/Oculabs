import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Navigate,
  Route,
} from "react-router-dom";
import Login from "../Screens/Login";
import ForgotPassword from "../Screens/ForgotPassword";
import ResetPassword from "../Screens/ResetPassword";
import CMS from "../Screens/CMS";
import NotFound from "../Components/NotFound";

function LoginStack() {
  return (
    <Routes>
      <Route exact path={"/"} element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/2fa" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/privacy_policy" element={<CMS />} />
      <Route path="/terms_condition" element={<CMS />} />
      <Route path="/page-not-found" element={<NotFound />} />
      <Route path="*" element={<Navigate to={"/"} />} />
    </Routes>
  );
}

export default LoginStack;
