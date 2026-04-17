import { BrowserRouter, Routes, Route } from "react-router-dom";
import Listings from "./pages/Listings";
import Show from "./pages/Show";
import NewListing from "./pages/NewListing";
import EditListing from "./pages/EditListing";
import Navbar from "./components/Navbar";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Listings />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/listings/new" element={<NewListing />} />
        <Route path="/listings/:id" element={<Show />} />
        <Route path="/listings/:id/edit" element={<EditListing />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
