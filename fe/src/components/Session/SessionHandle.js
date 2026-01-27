import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isTokenValid, getToken, logOut } from "../../utils/jwt-helper";
import { clearUserInfo } from "../../store/features/user";
import { useDispatch } from "react-redux";

const SessionHandle = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const dispatch = useDispatch();
  
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const checkSession = () => {
      const currentToken = getToken();

      if (currentToken && !isTokenValid()) {
        setShowModal(prev => prev || true);
      }
    };

    const intervalId = setInterval(checkSession, 5000);

    return () => clearInterval(intervalId);
  }, []);


  const handleClose = () => {
    dispatch(clearUserInfo());
    logOut(); 
    setShowModal(false);
    navigate("/"); 
  };

  if (!showModal) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>Phiên đăng nhập hết hạn</h3>
        <p style={styles.text}>Vui lòng đăng nhập lại để tiếp tục.</p>
        <div style={styles.buttonContainer}>
          <button onClick={handleClose} style={styles.button}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 99999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modal: {
    backgroundColor: '#fff', padding: '25px', borderRadius: '8px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)', textAlign: 'center', width: '350px'
  },
  title: { color: '#d32f2f', marginBottom: '10px', fontSize: '1.2rem', fontWeight: 'bold' },
  text: { marginBottom: '20px', color: '#333' },
  buttonContainer: { display: 'flex', justifyContent: 'center' },
  button: {
    padding: '8px 24px', backgroundColor: '#1976d2', color: '#fff',
    border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem'
  }
};

export default SessionHandle;