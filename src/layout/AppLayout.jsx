import Navbar from "../components/navbar/Navbar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />
      <div className="pt-16 pb-16 md:pb-0">
        <Outlet />
      </div>
    </div>
  );
}
