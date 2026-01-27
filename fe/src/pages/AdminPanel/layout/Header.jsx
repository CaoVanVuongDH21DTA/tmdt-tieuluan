import { useSelector } from "react-redux";
import { Menu as MenuIcon } from "@mui/icons-material";
import { selectUserInfo } from "../../../store/features/user";
import { useState, useEffect } from "react";

const Header = ({ setSidebarOpen }) => {
  const userInfo = useSelector(selectUserInfo);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [userInfo?.avatarUrl]);

  const getAvatarInitial = () => {
    if (userInfo?.firstName) return userInfo.firstName.charAt(0).toUpperCase();
    if (userInfo?.lastName) return userInfo.lastName.charAt(0).toUpperCase();
    return "U";
  };

  const UserAvatar = ({ size = "w-8 h-8", textSize = "text-sm", border = "border-2" }) => (
    <div
      className={`${size} rounded-full ${border} border-white shadow-sm overflow-hidden flex items-center justify-center transition-colors flex-shrink-0 ${
        !userInfo?.avatarUrl || imgError ? "bg-primary" : "bg-gray-100"
      }`}
    >
      {userInfo?.avatarUrl && !imgError ? (
        <img
          src={userInfo.avatarUrl}
          alt="User Avatar"
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className={`${textSize} font-bold text-white select-none`}>
          {getAvatarInitial()}
        </span>
      )}
    </div>
  );

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between h-16 px-6">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <MenuIcon fontSize="medium" />
        </button>

        <div className="flex-1 flex justify-end">
          <div className="flex items-center space-x-3">
            <UserAvatar size="w-10 h-10" textSize="text-xl" border="border-2" />
            <span className="text-gray-700 font-bold uppercase">
              {userInfo?.firstName} {userInfo?.lastName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
