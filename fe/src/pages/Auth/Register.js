import { useCallback, useState } from "react";
import GoogleSignIn from "../../components/Buttons/GoogleSignIn";
import { Link } from "react-router-dom";
import { setLoading } from "../../store/features/common";
import { useDispatch, useSelector } from "react-redux";
import { registerAPI } from "../../api/auth/authentication";
import VerifyCode from "./VerifyCode";
import { showCustomToast } from "../../components/Toaster/ShowCustomToast";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const InputField = ({ label, name, type = "text", value, onChange, placeholder, error, showPasswordToggle, showPassword, onTogglePassword, disabled }) => (
  <div className="w-full mb-2">
    <label className="text-xs font-semibold text-gray-700 block mb-1">
      {label} <span className="text-red-500">*</span>
    </label>
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`h-[40px] w-full border rounded-lg px-3 text-sm outline-none transition-all
          ${error ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-black"}`}
      />
      {showPasswordToggle && (
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
          onClick={onTogglePassword}
          tabIndex={-1}
        >
          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
        </button>
      )}
    </div>
    {error && <p className="text-red-500 text-[10px] mt-0.5 italic">{error}</p>}
  </div>
);

const Register = () => {
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    provider: "local",
    enabled: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.commonState.loading);
  const [enableVerify, setEnableVerify] = useState(false);

  // --- FIX VALIDATE FORM ---
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Regex cho 9 số còn lại (đầu 3,5,7,8,9)
    const phoneBodyRegex = /^(3|5|7|8|9)([0-9]{8})$/; 

    if (!values.firstName.trim()) newErrors.firstName = "Họ trống";
    if (!values.lastName.trim()) newErrors.lastName = "Tên trống";
    
    if (!values.email.trim()) newErrors.email = "Email trống";
    else if (!emailRegex.test(values.email)) newErrors.email = "Email sai định dạng";

    if (!values.password) newErrors.password = "Mật khẩu trống";
    else if (values.password.length < 6) newErrors.password = "Tối thiểu 6 ký tự";

    if (values.confirmPassword !== values.password) newErrors.confirmPassword = "Mật khẩu không khớp";

    // Validate SĐT: Phải đủ 9 số
    if (!values.phoneNumber) {
        newErrors.phoneNumber = "SĐT trống";
    } else if (values.phoneNumber.length !== 9) {
        newErrors.phoneNumber = "Phải nhập đủ 9 số";
    } else if (!phoneBodyRegex.test(values.phoneNumber)) {
        newErrors.phoneNumber = "SĐT không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!validateForm()) return;
      
      dispatch(setLoading(true));
      
      const { confirmPassword, phoneNumber, ...otherPayload } = values;
      const payload = {
          ...otherPayload,
          phoneNumber: "0" + phoneNumber
      };

      registerAPI(payload)
        .then((res) => {
          if (res?.code === 200) {
            setEnableVerify(true);
            showCustomToast(res?.message);
          } else {
            showCustomToast(res?.message || "Đăng ký thất bại!", "error");
          }
        })
        .catch((err) => {
          showCustomToast(err?.response?.data?.message || "Email đã được đăng ký", "error");
        })
        .finally(() => {
          dispatch(setLoading(false));
        });
    },
    [dispatch, values]
  );

  const handleOnChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // --- FIX LOGIC NHẬP SĐT ---
    if (name === "phoneNumber") {
       // Chỉ lấy số
       let numericValue = value.replace(/[^0-9]/g, "");
       
       // Nếu nhập số 0 ở đầu -> xoá đi (vì đã hiển thị +84)
       if (numericValue.startsWith("0")) {
           numericValue = numericValue.substring(1);
       }
       
       // Giới hạn 9 số
       if (numericValue.length > 9) return;
       
       setValues((prev) => ({ ...prev, [name]: numericValue }));
    } else {
       setValues((prev) => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }, [errors]);

  return (
    <div className="w-full h-full flex flex-col px-4 sm:px-0">
      {!enableVerify ? (
        <>
          {/* Header cố định */}
          <div className="flex-none">
            <h1 className="text-2xl font-bold mb-2">Đăng Ký</h1>
            <GoogleSignIn />
            
            <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-2 text-gray-400 text-xs uppercase">hoặc qua email</span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>
          </div>

          {/* Form Area: Cuộn nội bộ (Scroll inside) */}
          <div className="flex-1 overflow-y-auto custom-scroll pr-1 -mr-1 min-h-0">
            <form onSubmit={onSubmit} autoComplete="off">
              {/* Họ & Tên cùng hàng */}
              <div className="flex flex-row gap-3">
                <InputField 
                    label="Họ" name="firstName" placeholder="Nguyễn" 
                    value={values.firstName} onChange={handleOnChange} error={errors.firstName} disabled={loading}
                />
                <InputField 
                    label="Tên" name="lastName" placeholder="Văn A" 
                    value={values.lastName} onChange={handleOnChange} error={errors.lastName} disabled={loading}
                />
              </div>

              <InputField 
                label="Email" name="email" type="email" placeholder="nguyenvana@gmail.com" 
                value={values.email} onChange={handleOnChange} error={errors.email} disabled={loading}
              />

              {/* SĐT */}
              <div className="flex flex-row gap-3">
                  
                  {/* --- FIX UI SĐT: Custom Input --- */}
                  <div className="w-full mb-2">
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      SĐT <span className="text-red-500">*</span>
                    </label>
                    <div className={`flex h-[40px] w-full border rounded-lg overflow-hidden transition-all
                        ${errors.phoneNumber ? "border-red-500" : "border-gray-300 focus-within:border-black"}`}>
                        
                        {/* Phần hiển thị +84 cố định */}
                        <div className="bg-gray-100 flex items-center justify-center px-2 border-r border-gray-300">
                             <span className="text-sm font-semibold text-gray-600">+84</span>
                        </div>
                        
                        {/* Phần nhập 9 số còn lại */}
                        <input 
                            type="tel"
                            name="phoneNumber"
                            value={values.phoneNumber}
                            onChange={handleOnChange}
                            placeholder="912 345 678"
                            disabled={loading}
                            className="flex-1 px-3 text-sm outline-none w-full"
                        />
                    </div>
                    {errors.phoneNumber && <p className="text-red-500 text-[10px] mt-0.5 italic">{errors.phoneNumber}</p>}
                  </div>
              </div>

              {/* Mật khẩu cùng hàng */}
              <div className="flex flex-row gap-3">
                <InputField 
                    label="Mật khẩu" name="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Ít nhất 6 ký tự" 
                    value={values.password} onChange={handleOnChange} error={errors.password} disabled={loading}
                    showPasswordToggle={true} showPassword={showPassword} onTogglePassword={() => setShowPassword(!showPassword)}
                />
                <InputField 
                    label="Nhập lại mật khẩu" name="confirmPassword" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Xác nhận mật khẩu" 
                    value={values.confirmPassword} onChange={handleOnChange} error={errors.confirmPassword} disabled={loading}
                    showPasswordToggle={true} showPassword={showPassword} onTogglePassword={() => setShowPassword(!showPassword)}
                />
              </div>
            </form>
          </div>

          {/* Footer cố định ở dưới */}
          <div className="flex-none pt-2 pb-1">
             <button
                onClick={onSubmit}
                disabled={loading}
                className={`w-full rounded-lg h-[40px] text-sm text-white font-semibold transition-all shadow-md mb-2
                  ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800 active:scale-[0.98]"}`}
              >
                {loading ? "Đang xử lý..." : "Đăng ký ngay"}
              </button>
              
            <div className="text-center">
              <Link to={"/auth/login"} className="text-xs text-gray-600 hover:text-black hover:underline transition-all">
                Đã có tài khoản? <span className="font-bold">Đăng nhập</span>
              </Link>
            </div>
          </div>
        </>
      ) : (
        <VerifyCode email={values?.email} />
      )}
    </div>
  );
};

export default Register;