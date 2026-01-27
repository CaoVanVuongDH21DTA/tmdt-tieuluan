import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import Shop from "./Shop";
import ShopApplicationWrapper from "./layouts/ShopApplicationWrapper";
import ProductListPage from "./pages/ProductListPage/ProductListPage";
import ProductDetails from "./pages/ProductDetailPage/ProductDetails";
import { loadProductBySlug } from "./routes/loader";
import AuthenticationWrapper from "./layouts/AuthenticationWrapper";
import Cart from "./pages/Cart/Cart";
import NotFound from "./pages/NotFound/NotFound";
import Spinner from "./components/Spinner/Spinner";
import OrderTracking from "./pages/OrderTracking/OrderTracking";
import Showroom from "./pages/Showroom/Showroom";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import PublicRoute from "./components/ProtectedRoute/PublicRoute";
import RequireCart from "./components/ProtectedRoute/RequireCart";

// =========================================================================
// LAZY IMPORTS: USER & AUTH PAGES
// =========================================================================

// Auth
const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword"));

// Account & Profile
const Account = lazy(() => import("./pages/Account/Account"));
const Profile = lazy(() => import("./pages/Account/Profile"));
const Orders = lazy(() => import("./pages/Account/Orders"));
const Settings = lazy(() => import("./pages/Account/Settings"));
const Wishlist = lazy(() => import("./pages/Account/Wishlist"));
const DiscountUser = lazy(() => import("./pages/Account/Discount"))

// Checkout & Payment
const Checkout = lazy(() => import("./pages/Checkout/Checkout"));
const OrderReturn = lazy(() => import("./pages/Orders/OrderReturn"))

// =========================================================================
// LAZY IMPORTS: ADMIN PAGES (CMS/Dashboard)
// =========================================================================
const AdminPanel = lazy(() => import("./pages/AdminPanel/AdminPanel"));
const Dashboard = lazy(() => import("./pages/AdminPanel/pageAdmin/Dashboard"));
const Analytics = lazy(() => import("./pages/AdminPanel/pageAdmin/Analytics"));
const User = lazy(() => import("./pages/AdminPanel/pageAdmin/User"));
const Product = lazy(() => import("./pages/AdminPanel/pageAdmin/Product"));
const Order = lazy(() => import("./pages/AdminPanel/pageAdmin/Order"));
const DiscountAdmin = lazy(() => import("./pages/AdminPanel/pageAdmin/Discount"));
const FlashSale = lazy(() => import("./pages/AdminPanel/FlashSale"));


// =========================================================================
// ROUTER CONFIGURATION
// =========================================================================
export const router = createBrowserRouter([
  {
    path: "/",
    element: <ShopApplicationWrapper />,
    errorElement: <NotFound />,
    children: [
      { path: "/", element: <Shop /> },
      { path: "/products", element: <ProductListPage /> },
      { path: "/product/:slug", loader: loadProductBySlug, element: <ProductDetails /> },
      { path: "/cart-items", element: <Cart /> },
      { path: "/order-tracking", element: <OrderTracking /> },
      { path: "/showroom", element: <Showroom /> },

      {
        path: "/order-return", 
        element: (
            <ProtectedRoute>
                <Suspense fallback={<Spinner />}>
                    <OrderReturn />
                </Suspense>
            </ProtectedRoute>
        ),
      },
      {
        path: "/vnpay-return", 
        element: (
            <ProtectedRoute>
                <Suspense fallback={<Spinner />}>
                    <OrderReturn />
                </Suspense>
            </ProtectedRoute>
        ),
      },

      // account + protected
      {
        path: "/account-details",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<Spinner />}>
              <Account />
            </Suspense>
          </ProtectedRoute>
        ),
        children: [
          {
            path: "profile",
            element: (
              <ProtectedRoute>
                <Suspense fallback={<Spinner />}>
                  <Profile />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: "orders",
            element: (
              <ProtectedRoute>
                <Suspense fallback={<Spinner />}>
                  <Orders />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: "settings",
            element: (
              <ProtectedRoute>
                <Suspense fallback={<Spinner />}>
                  <Settings />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: "wishlist",
            element: (
              <ProtectedRoute>
                <Suspense fallback={<Spinner />}>
                  <Wishlist />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: "discount",
            element: (
              <ProtectedRoute>
                <Suspense fallback={<Spinner />}>
                  <DiscountUser />
                </Suspense>
              </ProtectedRoute>
            ),
          },
        ],
      },

      // checkout
      {
        path: "/checkout",
        element: (
          <ProtectedRoute>
            <RequireCart>
              <Suspense fallback={<Spinner />}>
                <Checkout />
              </Suspense>
            </RequireCart>
          </ProtectedRoute>
        ),
      },
    ],
  },

  // auth pages
  {
    path: "/auth/",
    element: <AuthenticationWrapper />,
    children: [
      {
        path: "login",
        element: (
          <PublicRoute>
            <Suspense fallback={<Spinner />}>
              <Login />
            </Suspense>
          </PublicRoute>
        ),
      },
      {
        path: "register",
        element: (
          <PublicRoute>
            <Suspense fallback={<Spinner />}>
              <Register />
            </Suspense>
          </PublicRoute>
        ),
      },
      {
        path: "forgot-password",
        element: (
          <PublicRoute>
            <Suspense fallback={<Spinner />}>
              <ForgotPassword />
            </Suspense>
          </PublicRoute>
        ),
      },
    ],
  },

  // admin pages (chỉ cho ADMIN role)
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Spinner />}>
          <AdminPanel />
        </Suspense>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Spinner />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: "users",
        element: (
          <Suspense fallback={<Spinner />}>
            <User />
          </Suspense>
        ),
      },
      {
        path: "products",
        element: (
          <Suspense fallback={<Spinner />}>
            <Product />
          </Suspense>
        ),
      },
      {
        path: "discounts",
        element: (
          <Suspense fallback={<Spinner />}>
            <DiscountAdmin />
          </Suspense>
        ),
      },
      {
        path: "orders",
        element: (
          <Suspense fallback={<Spinner />}>
            <Order />
          </Suspense>
        ),
      },
      {
        path: "analytics",
        element: (
          <Suspense fallback={<Spinner />}>
            <Analytics />
          </Suspense>
        ),
      },
      {
        path: "flashsales",
        element: (
          <Suspense fallback={<Spinner />}>
            <FlashSale />
          </Suspense>
        ),
      },
    ],
  },

  // not found
  { path: "*", element: <NotFound /> },
]);