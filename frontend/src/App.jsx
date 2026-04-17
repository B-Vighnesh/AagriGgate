import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Account from './components/Account';
import Market from './components/Market';
import MarketAnalytics from './components/MarketAnalytics';
import Weather from './components/Weather';
import Login from './components/Login';
import Logout from './components/Logout';
import Trade from './components/Trade';
import Register from './components/Register';
import ViewCrop from './components/ViewCrop';
import AddCrop from './components/AddCrop';
import ViewDetails from './components/ViewDetails';
import DeleteCrop from './components/DeleteCrop';
import UpdateCrop from './components/UpdateCrop';
import ContactUs from './components/ContactUs';
import UpdateAccount from './components/UpdateAccount';
import ViewAllCrop from './components/ViewAllCrop';
import ForgotPassword from './components/ForgotPassword';
import ApproachFarmer from './components/ApproachFarmer';
import ViewApproach from './components/ViewApproach';
import ViewApproachByFarmerAndCrop from './components/ViewApproachByFarmerAndCrop';
import DeleteApproach from './components/DeleteApproach';
import ViewApproachForUser from './components/ViewApproachForUser';
import Settings from './components/Settings';
import Enquiry from './components/Enquiry';
import Error from './components/Error';
import Chat from './components/Chat';
import Notifications from './components/Notifications';
import NotificationPreferencesPage from './components/NotificationPreferencesPage';
import ValidateToken from './components/ValidateToken';
import BuyerDetails from './components/BuyerDetails';
import Favorites from './components/Favorites';
import Cart from './components/Cart';
import News from './pages/News';
import './index.css';

function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const frame = window.requestAnimationFrame(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
      return () => window.cancelAnimationFrame(frame);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    return undefined;
  }, [location.pathname, location.hash]);

  return null;
}

function AppRoutes() {
  const location = useLocation();
  const isChatRoute = location.pathname.startsWith('/chat');

  return (
    <div className={`app-shell ${isChatRoute ? 'app-shell--chat' : ''}`.trim()}>
      <ScrollManager />
      <Navbar />
      <main
        className={`app-main app-main--transition ${isChatRoute ? 'app-main--chat' : ''}`.trim()}
        key={`${location.pathname}${location.hash}`}
      >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/account" element={<Account />} />
            <Route path="/market" element={<Market />} />
            <Route path="/market/analytics" element={<MarketAnalytics />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/trade" element={<Trade />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/register" element={<Register />} />
            <Route path="/add-crop" element={<AddCrop />} />
            <Route path="/view-crop" element={<ViewCrop />} />
            <Route path="/view-details/:cropId" element={<ViewDetails />} />
            <Route path="/delete-crop/:cropId" element={<DeleteCrop />} />
            <Route path="/update-crop/:cropId" element={<UpdateCrop />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/view-all-crops" element={<ViewAllCrop />} />
            <Route path="/update-account" element={<UpdateAccount />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/approach-farmer" element={<ApproachFarmer />} />
            <Route path="/view-approach" element={<ViewApproach />} />
            <Route path="/view-approaches-user" element={<ViewApproachForUser />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/view-buyer/:buyerId" element={<BuyerDetails />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/news" element={<News />} />
            <Route path="/delete-approach/:approachId" element={<DeleteApproach />} />
            <Route path="/view-approaches/farmer/:farmerId/crop/:cropId" element={<ViewApproachByFarmerAndCrop />} />
            <Route path="/enquiry" element={<Enquiry />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/notification-preferences" element={<NotificationPreferencesPage />} />
            <Route path="/chat/:conversationId?" element={<Chat />} />
            <Route path="/validate-token" element={<ValidateToken />} />
            <Route path="/404" element={<Error />} />
            <Route path="*" element={<Error />} />
          </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
