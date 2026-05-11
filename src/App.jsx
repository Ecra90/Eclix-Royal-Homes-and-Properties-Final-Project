import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import Book from "./pages/Book";
import { Login, Register } from "./pages/Auth";
import { Dashboard, Favourites, About, Contact, Interiors } from "./pages/Pages";
import AddProperty from "./components/AddProperty";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:id/book" element={<Book />} />
          <Route path="/properties" element={<Listings />} />
          <Route path="/interiors" element={<Interiors />} />
          <Route path="/favourites" element={<Favourites />} />
          <Route path="/addproperty" element={<AddProperty />} />

          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}
