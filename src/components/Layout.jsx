import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar at the top */}
      <Navbar />

      {/* Sidebar & Content Wrapper */}
      <div className="flex w-full h-full overflow-hidden">
        {/* Sidebar Below Navbar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-2 sm:p-4 pb-20 sm:pb-4 min-w-0">
            <div className="mx-auto w-full">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
