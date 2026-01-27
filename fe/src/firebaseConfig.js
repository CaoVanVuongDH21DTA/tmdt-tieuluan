import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Dán thông tin cấu hình Firebase của bạn ở đây
const firebaseConfig = {
  apiKey: "AIzaSyD1Dx_S4zth9XsMBMk3kh0s8NY5oDRvkr0",
  authDomain: "tieuluan-laptopstore-2025.firebaseapp.com",
  projectId: "tieuluan-laptopstore-2025",
  storageBucket: "tieuluan-laptopstore-2025.firebasestorage.app",
  messagingSenderId: "69231605037",
  appId: "1:69231605037:web:fbaabed506f3dce9ee0fa4",
  measurementId: "G-HY9EDFGPDZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// Hàm đăng nhập bằng Google
export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  const idToken = await user.getIdToken(); 
  return { user, idToken };
};
