import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LoginPage } from "../login";
import { HomePage } from "../home";

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
};
