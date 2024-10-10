import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Admin from "../Screens/Admin/Admin";
import Organization from "../Screens/Admin/Organization";
import Patients from "../Screens/Admin/Patients";
import Providers from "../Screens/Admin/Providers";
import Roles from "../Screens/Admin/Roles";
import Users from "../Screens/Admin/Users";
import Dashboard from "../Screens/Dashboard";
import Patient from "../Screens/Patients";
import PatientDetails from "../Screens/PatientDetails";
import Calendar from "../Screens/Calendar";
import UserProfile from "../Screens/UserProfile";
import { useSelector } from "react-redux";
import EmailTemplates from "../Screens/Admin/EmailTemplates";
import MasterQuestion from "../Screens/Admin/MasterQuestion";
import SmsTemplates from "../Screens/Admin/SmsTemplates";
import SystemParams from "../Screens/Admin/SystemParams";
import SuperAdmin from "../Screens/Admin/SuperAdmin";
import UserLogs from "../Screens/Admin/UserLogs";
import NotFound from "../Components/NotFound";
import Requests from "../Screens/Admin/Requests";
import CmsTemplates from "../Screens/Admin/CmsTemplates";
import Sports from "../Screens/Admin/Sports";
import Reports from "../Screens/Admin/Report";

function NavigationStack() {
  const { userType, userData } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  useEffect(() => {
    if (
      window.location.pathname === "/login" ||
      window.location.pathname === "/forgot-password" ||
      window.location.pathname === "/reset-password"
    ) {
      navigate("/");
    }
  }, []);
  return (
    <Routes>
      {userType === "super_admin" ? (
        <>
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/organization" element={<Organization />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/roles" element={<Roles />} />
          <Route path="/admin/providers" element={<Providers />} />
          <Route path="/admin/patients" element={<Patients />} />
          <Route path="/admin/email-templates" element={<EmailTemplates />} />
          <Route path="/admin/master-question" element={<MasterQuestion />} />
          <Route path="/admin/sms-templates" element={<SmsTemplates />} />
          <Route path="/admin/cms-templates" element={<CmsTemplates />} />
          <Route path="/admin/super-admin" element={<SuperAdmin />} />
          <Route path="/admin/system-params" element={<SystemParams />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/admin/user-logs" element={<UserLogs />} />
          <Route path="/admin/sports" element={<Sports />} />
          <Route path="/admin/sports" element={<Sports />} />
          <Route exact path={"/"} element={<Navigate to={"/admin"} />} />
        </>
      ) : (
        <>
          <Route exact path={"/"} element={<Navigate to={"/home"} />} />
          <Route path="/home" element={<Dashboard />} />
          <Route path="/patient" element={<Patient />} />
          <Route path="/patient/details" element={<PatientDetails />} />
          <Route path="/calendar" element={<Calendar />} />

          {userData?.personal_info?.is_provider === 0 &&
          userType === "proctor" ? null : (
            <Route path="/admin" element={<Admin />} />
          )}
          {userType !== "proctor" && (
            <Route path="/admin/reports" element={<Reports />} />
          )}
          {userType === "org_admin" && (
            <>
              <Route path="/admin/organization" element={<Organization />} />
              <Route
                path="/admin/email-templates"
                element={<EmailTemplates />}
              />
              <Route path="/admin/sms-templates" element={<SmsTemplates />} />
            </>
          )}

          {(userType === "ops_admin" || userType === "org_admin") && (
            <>
              <Route path="/admin/users" element={<Users />} />
              <Route path="/admin/user-logs" element={<UserLogs />} />
            </>
          )}
          {userType === "org_admin" && (
            <Route path="/admin/roles" element={<Roles />} />
          )}
          {(userType !== "assistant" ||
            userData?.personal_info?.is_provider === 1) && (
            <Route path="/admin/providers" element={<Providers />} />
          )}

          <Route path="/admin/patients" element={<Patients />} />
          <Route path="/profile" element={<UserProfile />} />
          {/* {userData?.personal_info?.is_provider === 1 && ( */}
          <Route path="/admin/requests" element={<Requests />} />
          <Route path="/admin/sports" element={<Sports />} />
          {/* )} */}
        </>
      )}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default NavigationStack;
