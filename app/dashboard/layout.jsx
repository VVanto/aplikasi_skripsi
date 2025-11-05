import AlertProvider from "../ui/dashboard/alert/AlertProvider";
import Footer from "../ui/dashboard/footer/footer";
import Navbar from "../ui/dashboard/navbar/navbar";
import Sidebar from "../ui/dashboard/sidebar/sidebar";

const Layout = ({ children }) => {
  return (
    <AlertProvider>
      <div className="flex">
        <div className="flex-1 bg-olive p-5">
          <Sidebar />
        </div>
        <div className="grow-[4] p-5">
          <Navbar />
          {children}
          <Footer />
        </div>
      </div>
    </AlertProvider>
  );
};

export default Layout;
