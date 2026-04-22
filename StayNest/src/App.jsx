import { BrowserRouter, Routes, Route } from "react-router-dom";
import Listings from "./pages/listings";
import Show from "./pages/show";
import NewListing from "./pages/NewListing";
import EditListing from "./pages/EditListing";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="app-shell">
        <Routes>
          <Route path="/" element={<Listings />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/new" element={<NewListing />} />
          <Route path="/listings/:id" element={<Show />} />
          <Route path="/listings/:id/edit" element={<EditListing />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
