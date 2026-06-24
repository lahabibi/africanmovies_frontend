import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import DeviceSessionEnricher from "./components/auth/DeviceSessionEnricher";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import SessionInvalidationHandler from "./components/auth/SessionInvalidationHandler";
import AllMovies from "./pages/AllMovies";
import AuthPage from "./pages/AuthPage";
import Genres from "./pages/Genres";
import Home from "./pages/Home";
import Languages from "./pages/Languages";
import Library from "./pages/Library";
import MovieDetails from "./pages/MovieDetails";
import NotFound from "./pages/NotFound";
import OtpPage from "./pages/OtpPage";
import PaymentDetails from "./pages/PaymentDetails";
import PaymentCallback from "./pages/PaymentCallback";
import PaymentProcessing from "./pages/PaymentProcessing";
import Playback from "./pages/Playback";
import PlaceholderPage from "./pages/PlaceholderPage";
import Profile from "./pages/Profile";
import PurchaseHistory from "./pages/PurchaseHistory";
import SavedMovies from "./pages/SavedMovies";
import Search from "./pages/Search";
import WatchFlowProvider from "./providers/WatchFlowProvider";
import "./styles/app.css";

function App() {
  return (
    <BrowserRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <WatchFlowProvider>
        <DeviceSessionEnricher />
        <SessionInvalidationHandler />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/genres" element={<Genres />} />
          <Route path="/genres/:genreSlug" element={<Genres />} />
          <Route path="/languages" element={<Languages />} />
          <Route path="/languages/:languageSlug" element={<Languages />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/library" element={<Library />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/payment-details" element={<PaymentDetails />} />
            <Route
              path="/favorites"
              element={<SavedMovies collectionType="favorites" />}
            />
            <Route
              path="/watchlist"
              element={<SavedMovies collectionType="watchlist" />}
            />
            <Route
              path="/devices"
              element={<Navigate replace to="/profile#active-devices" />}
            />
            <Route path="/purchase-history" element={<PurchaseHistory />} />
          </Route>

          <Route path="/process-payment" element={<PaymentCallback />} />
          <Route
            path="/process-token-payment"
            element={<PaymentCallback />}
          />
          <Route
            path="/payment-processing"
            element={<PaymentProcessing />}
          />
          <Route path="/playback/:movieId" element={<Playback />} />
          <Route
            path="/support"
            element={<PlaceholderPage title="Help & Support" />}
          />
          <Route path="/search" element={<Search />} />
          <Route path="/signin" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/otp" element={<OtpPage />} />
          <Route path="/movies" element={<AllMovies />} />
          <Route path="/movies/:id" element={<MovieDetails />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </WatchFlowProvider>
    </BrowserRouter>
  );
}

export default App;
