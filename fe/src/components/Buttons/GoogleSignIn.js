import { useCallback } from 'react'
import { useDispatch } from 'react-redux'; 
import { useNavigate } from 'react-router-dom'; 
import GoogleLogo from '../../assets/img/Google.png'
import { loginGoogleAPI } from '../../api/auth/authentication';
import { fetchUserDetails } from '../../api/user/userInfo';
import { loginWithGoogle } from '../../firebaseConfig';
import { saveToken } from '../../utils/jwt-helper';
import { showCustomToast } from '../../components/Toaster/ShowCustomToast';
import { syncLocalHistoryToDB } from '../../api/apiRecommend';
import { loadUserInfo } from "../../store/features/user"; 

const GoogleSignIn = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleLogin = useCallback(async () => {
    try {
      const { user: firebaseUser, idToken } = await loginWithGoogle();
      
      const response = await loginGoogleAPI(idToken);

      if (response?.token) {
        saveToken(response.token);
        const userDetails = await fetchUserDetails();
        
        dispatch(loadUserInfo(userDetails));
        await syncLocalHistoryToDB(userDetails.id);

        showCustomToast(`Chào mừng, ${userDetails.email || userDetails.firstName}`, "success");
        
        navigate("/");
      } else {
        showCustomToast("Đã xảy ra lỗi khi xác thực Google!", "error");
      }
    } catch (error) {
      console.error(error);
      showCustomToast("Đăng nhập Google thất bại!", "error");
    }
  }, [dispatch, navigate]);


  return (
    <button onClick={handleGoogleLogin} className='flex justify-center items-center border w-full rounded border-gray-600 h-[48px] hover:bg-slate-50 transition-colors'>
        <img src={GoogleLogo} alt='google-icon' className="w-6 h-6"/>
        <p className='px-2 text-gray-500 font-medium'>Đăng nhập với Google</p>
    </button>
  )
}

export default GoogleSignIn