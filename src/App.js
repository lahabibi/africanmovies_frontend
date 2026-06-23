import { BrowserRouter, Route, Routes } from "react-router-dom";
import AllMovies from "./pages/AllMovies";
import AuthPage from "./pages/AuthPage";
import Genres from "./pages/Genres";
import Home from "./pages/Home";
import Languages from "./pages/Languages";
import Library from "./pages/Library";
import MovieDetails from "./pages/MovieDetails";
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
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/genres" element={<Genres />} />
        <Route path="/genres/:genreSlug" element={<Genres />} />
        <Route path="/languages" element={<Languages />} />
        <Route path="/languages/:languageSlug" element={<Languages />} />
        <Route path="/library" element={<Library />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/account-settings"
          element={<PlaceholderPage title="Account Settings" />}
        />
        <Route
          path="/payment-details"
          element={<PaymentDetails />}
        />
        <Route path="/process-payment" element={<PaymentCallback />} />
        <Route path="/process-token-payment" element={<PaymentCallback />} />
        <Route path="/payment-processing" element={<PaymentProcessing />} />
        <Route
          path="/favorites"
          element={<SavedMovies collectionType="favorites" />}
        />
        <Route
          path="/watchlist"
          element={<SavedMovies collectionType="watchlist" />}
        />
        <Route path="/devices" element={<PlaceholderPage title="Devices" />} />
        <Route
          path="/purchase-history"
          element={<PurchaseHistory />}
        />
        <Route
          path="/parental-controls"
          element={<PlaceholderPage title="Parental Controls" />}
        />
        <Route path="/playback/:movieId" element={<Playback />} />
        <Route
          path="/subtitles-audio"
          element={<PlaceholderPage title="Subtitles & Audio" />}
        />
        <Route
          path="/notifications"
          element={<PlaceholderPage title="Notifications" />}
        />

        <Route
          path="/support"
          element={<PlaceholderPage title="Help & Support" />}
        />
        <Route
          path="/contact-us"
          element={<PlaceholderPage title="Contact Us" />}
        />
        <Route path="/search" element={<Search />} />
        <Route path="/signin" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/movies" element={<AllMovies />} />
        <Route path="/movies/:slug" element={<MovieDetails />} />
        <Route path="*" element={<PlaceholderPage title="Page Not Found" />} />
        </Routes>
      </WatchFlowProvider>
    </BrowserRouter>
  );
}

export default App;
