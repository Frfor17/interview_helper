import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "../pages/Main.js";

// import NotFound from "../pages/NotFound";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Main />} />
            {/* <Route path="/" element={<Main />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/hardware-and-desktop-management" element={<HardwareAndDesktopManagement />} />
            <Route path="/managed-services" element={<ManagedServices />} />
            <Route path="/mobile-asset-management" element={<MobileAssetManagement />} />
            <Route path="/networking" element={<Networking />} />
            <Route path="/security-and-data-protection" element={<SecurityAndDataProtection />} />
            <Route path="/servers" element={<Servers />} />
            <Route path="/help" element={<Help />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/website-terms-of-use" element={<TermsOfUse />} />
            <Route path="/calculator" element={<Calculator />} /> */}
            {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
    );
};

export default AppRoutes;