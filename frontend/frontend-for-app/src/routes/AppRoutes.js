import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "../pages/Main.js";

// import NotFound from "../pages/NotFound";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Main />} />
            {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
    );
};

export default AppRoutes;