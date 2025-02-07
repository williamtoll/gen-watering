
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CalendarPage from "./components/Calendar/CalendarPage";
import DeviceControlPage from "./components/DeviceControl/DeviceControlPage";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/device-control" element={<DeviceControlPage />} />

      </Routes>
    </Router>
  );
}
