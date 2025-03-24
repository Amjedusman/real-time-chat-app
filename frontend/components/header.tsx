import axios from "@/lib/axiosInstance";
import { useRouter } from "next/navigation";
import TextIcon from "@/components/icons/TextIcon";
import ProfileModal from "@/components/profileModal";
import SuspiciousUserAlert from "@/components/SuspiciousUserAlert";


const Header = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
      router.push("/login");
    } catch (error) {
      if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 404)) {
        router.push("/login");
        return;
      }
      console.error("Logout error:", error);
    }
  };

  const handleBlock = () => {
    // Add your block user logic here
    console.log("User blocked");
  };

  const handleIgnore = () => {
    // Add your ignore logic here
    console.log("Alert ignored");
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-gray-900 text-white">
      <div className="flex items-center gap-2">
        <TextIcon className="h-6 w-6" />
        <h1 className="text-lg font-semibold text-white">Chat App</h1>
      </div>
      <div className="flex items-center gap-6 text-white">
        {/* <SuspiciousUserAlert onBlock={handleBlock} onIgnore={handleIgnore} /> */}
        <ProfileModal />
        <button onClick={handleLogout}>Log out</button>
      </div>
    </header>
  );
};

export default Header;
