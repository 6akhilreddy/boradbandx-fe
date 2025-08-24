import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar at the top */}
      <Navbar />

      {/* Sidebar & Content Wrapper */}
      <div className="flex">
        {/* Sidebar Below Navbar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 p-6">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
