import { Route, Routes } from "react-router-dom";
import LoginPage from "./presentation/pages/LoginPage";
import ForgotPassword from "./presentation/pages/ForgotPassword";
import ResetPassword from "./presentation/pages/ResetPassword";
import Verify2FA from "./presentation/pages/Verify2FA";
import Configure2FA from "./presentation/pages/Configure2FA";

const AuthRoutes = () => (
  <Routes>
    <Route path="login" element={<LoginPage />} />
    <Route path="forgot-password" element={<ForgotPassword />} />
    <Route path="reset-password/:userId/:token" element={<ResetPassword />} />
    <Route path="verify-2fa" element={<Verify2FA />} />
    <Route path="configure-2fa" element={<Configure2FA />} />
  </Routes>
);

export default AuthRoutes;