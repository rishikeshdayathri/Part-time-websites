import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import WhatsAppFloat from "./components/common/WhatsAppFloat";
import ScrollToTop from "./components/common/ScrollToTop";

import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Commodities from "./pages/Commodities";
import Markets from "./pages/Markets";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";

function App() {
  return (
    <div className="App min-h-screen bg-white text-slate-900 font-sans">
      <BrowserRouter>
        <ScrollToTop />
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/commodities" element={<Commodities />} />
          <Route path="/markets" element={<Markets />} />
          <Route path="/insights" element={<Blog />} />
          <Route path="/insights/:slug" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Home />} />
        </Routes>
        <Footer />
        <WhatsAppFloat />
        <Toaster position="top-right" richColors closeButton />
      </BrowserRouter>
    </div>
  );
}

export default App;
