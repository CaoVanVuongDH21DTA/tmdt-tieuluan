import { useCallback, useState } from 'react'
import GoogleSignIn from '../../components/Buttons/GoogleSignIn'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '../../store/features/common'
import { loginAPI } from '../../api/auth/authentication';
import { fetchUserDetails } from '../../api/user/userInfo';
import { saveToken } from '../../utils/jwt-helper';
import { showCustomToast } from '../../components/Toaster/ShowCustomToast';
import { loadUserInfo } from "../../store/features/user";
import { syncLocalHistoryToDB } from "../../api/apiRecommend";
import { Visibility, VisibilityOff } from "@mui/icons-material"; 

const Login = () => {
  const [values, setValues] = useState({ userName: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const loading = useSelector((state) => state.commonState.loading);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = useCallback(async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    try {
      const res = await loginAPI(values);
      if (res?.token) {
        saveToken(res?.token);
        const userRes = await fetchUserDetails();
        dispatch(loadUserInfo(userRes));
        
        const role = userRes?.authorityList?.some(a => a.roleCode === "ADMIN") ? "ADMIN" : "USER";
        if (role === "USER") {
           await syncLocalHistoryToDB(userRes.id); 
           navigate("/");
        } else {
           navigate("/admin");
        }
        showCustomToast("Chào mừng trở lại!", "success");
      } else {
        showCustomToast("Đăng nhập thất bại!", "error");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message
                    || err.response?.data         
                    || "Sai tài khoản hoặc mật khẩu"; 

      if (err.response?.status === 401) {
          showCustomToast(errorMsg, "error"); 
      } else {
          showCustomToast("Đã có lỗi xảy ra, vui lòng thử lại!", "error");
      }
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, navigate, values]);

  const handleOnChange = (e) => setValues(prev => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <div className='w-full'>
      <div className="mb-8">
        <h1 className='text-3xl font-bold text-gray-900'>Đăng nhập</h1>
        <p className='text-gray-500 mt-2'>Chào mừng bạn quay trở lại 👋</p>
      </div>

      <GoogleSignIn />
      
      <div className="relative flex py-6 items-center">
         <div className="flex-grow border-t border-gray-200"></div>
         <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">hoặc đăng nhập bằng email</span>
         <div className="flex-grow border-t border-gray-200"></div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            type="email" 
            name='userName' 
            value={values?.userName} 
            onChange={handleOnChange} 
            placeholder="name@example.com" 
            className='w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all' 
            required 
          />
        </div>

        <div>
           <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
              <Link to="/auth/forgot-password" class="text-xs font-medium text-gray-600 hover:text-black underline decoration-1" tabIndex={-1}>Quên mật khẩu?</Link>
           </div>
           <div className="relative">
             <input 
                type={showPassword ? "text" : "password"} 
                name='password' 
                value={values?.password} 
                onChange={handleOnChange} 
                placeholder="••••••••" 
                className='w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all' 
                required 
              />
               <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
               </button>
           </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full h-12 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition-all active:scale-[0.98] ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>

      <p className='mt-8 text-center text-sm text-gray-600'>
        Chưa có tài khoản? <Link to="/auth/register" className='font-bold text-black hover:underline'>Đăng ký</Link>
      </p>
    </div>
  )
}
export default Login