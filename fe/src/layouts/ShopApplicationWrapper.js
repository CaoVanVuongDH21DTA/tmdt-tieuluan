import Navigation from '../components/Navigation/Navigation'
import { Outlet } from 'react-router-dom'
import Spinner from '../components/Spinner/Spinner'
import { useSelector } from 'react-redux'
import Footer from '../components/Footer/Footer'
import SessionHandle from '../components/Session/SessionHandle'

const ShopApplicationWrapper = () => {

  const isLoading = useSelector((state)=> state?.commonState?.loading);
  return (
    <div>
        <SessionHandle/>
        <Navigation />
        <Outlet />
        {isLoading && <Spinner />}
        <Footer/>
    </div>
  )
}

export default ShopApplicationWrapper