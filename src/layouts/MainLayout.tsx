import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const MainLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#FFFCF7] to-[#FFF9EF]">
      <Header />

      <main className="flex-grow overflow-x-hidden pb-16 pt-20 md:pt-24">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
