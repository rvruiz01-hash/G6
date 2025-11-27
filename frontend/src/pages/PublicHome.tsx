// src/pages/PublicHome.tsx

import React, { useState, useEffect } from "react";
import "../styles/Home.css";
import "../styles/Nav.css";
import Nav from "../components/Nav.jsx";
import Enlace from "../components/Enlace.jsx";

// ✅ RUTAS CORREGIDAS
const carouselImages = [
  "../../public/images/carousel/technology.avif",
  "../../public/images/carousel/camera.webp",
  "../../public/images/carousel/cameraPc.png",
  "../../public/images/carousel/guard.webp",
  "../../public/images/carousel/eye.jpg",
];

export default function PublicHome() {
  const [navClass, setNavClass] = useState("nav nav__home");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setNavClass("nav nav__home nav--scrolled");
      } else {
        setNavClass("nav nav__home");
      }
    };
    window.addEventListener("scroll", handleScroll);

    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % carouselImages.length
      );
    }, 5000); // Cambia de imagen cada 5 segundos

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(interval);
    };
  }, []);

  const goToNextImage = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex + 1) % carouselImages.length
    );
  };

  const goToPrevImage = () => {
    setCurrentImageIndex(
      (prevIndex) =>
        (prevIndex - 1 + carouselImages.length) % carouselImages.length
    );
  };

  return (
    <div className="home-container">
      <Nav ClaseNav={navClass}>
        <Enlace
          url="/consultar-asistencia"
          claseLink="enlace enlace--animation-left"
          texto="Consultar Asistencia"
        />
        <Enlace
          url="/postulate"
          claseLink="enlace enlace--animation-left"
          texto="Postúlate"
        />
        <Enlace
          url="/activar-cuenta"
          claseLink="enlace enlace--animation-left"
          texto="Activar Cuenta"
        />
        <Enlace
          url="/login"
          claseLink="enlace enlace--animation-left"
          texto="Login"
        />
      </Nav>

      {/* Sección Principal (Hero) */}
      <main className="hero-section">
        <div className="hero-content">
          <h1>Soluciones de Seguridad de Vanguardia</h1>
          <p>
            Protege lo que más importa con nuestros sistemas de seguridad
            privada, impulsados por la última tecnología.
          </p>
          <a href="/servicios" className="cta-button">
            Descubre nuestras soluciones
          </a>
        </div>
      </main>

      {/* Sección de Características */}
      <section className="features-section">
        <div className="feature-item">
          <div className="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
          </div>
          <h3>Monitoreo 24/7</h3>
          <p>
            Vigilancia constante para una tranquilidad total, sin
            interrupciones.
          </p>
        </div>
        <div className="feature-item">
          <div className="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V5h10v14z" />
            </svg>
          </div>
          <h3>Sistemas Inteligentes</h3>
          <p>
            Tecnología con inteligencia artificial para detección proactiva de
            amenazas.
          </p>
        </div>
        <div className="feature-item">
          <div className="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 12c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1s-1 .45-1 1v6c0 .55.45 1 1 1zm0 8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm6-6c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1s1-.45 1-1v-6c0-.55-.45-1-1-1z" />
            </svg>
          </div>
          <h3>Respuesta Rápida</h3>
          <p>
            Equipos de élite listos para actuar en segundos en cualquier
            emergencia.
          </p>
        </div>
      </section>

      {/* Sección del Carrusel de Imágenes */}
      <section className="carousel-section">
        <h2>Galería de Nuestras Soluciones</h2>
        <div className="carousel-container">
          <button className="carousel-nav-btn prev" onClick={goToPrevImage}>
            &lt;
          </button>
          <img
            src={carouselImages[currentImageIndex]}
            alt="Security Solution"
            className="carousel-image"
          />
          <button className="carousel-nav-btn next" onClick={goToNextImage}>
            &gt;
          </button>
        </div>
      </section>

      {/* Sección de Contacto (Pie de Página) */}
      <footer className="footer-section">
        <div className="social-links">
          <a
            href="https://www.instagram.com/g6"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="../../public/images/brand/instagram.svg"
              alt="Instagram Logo"
              className="social-icon"
            />
          </a>
          <a
            href="https://www.facebook.com/g6"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="../../public/images/brand/facebook.svg"
              alt="Facebook Logo"
              className="social-icon"
            />
          </a>
          <a
            href="https://www.tiktok.com/@g6"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="../../public/images/brand/tik-tok.svg"
              alt=" TikTok Logo"
              className="social-icon"
            />
          </a>
          <a href="https://x.com/g6" target="_blank" rel="noopener noreferrer">
            <img
              src="../../public/images/brand/twitter-alt.svg"
              alt="Twitter Logo"
              className="social-icon"
            />
          </a>
          <a
            href="https://www.linkedin.com/company/g6"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="../../public/images/brand/linkedin.svg"
              alt="linkedin Logo"
              className="social-icon"
            />
          </a>
          <a
            href="https://www.pinterest.com/g6"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="../../public/images/brand/pinterest.svg"
              alt="pinterest Logo"
              className="social-icon"
            />
          </a>
          <a
            href="https://www.youtube.com/g6"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="../../public/images/brand/youtube.svg"
              alt="youtube Logo"
              className="social-icon"
            />
          </a>
        </div>
        <div className="whatsapp-links">
          <a
            href="https://wa.me/5215512345678?text=Hola,%20me%20interesan%20los%20servicios%20de%20ventas."
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-button"
          >
            <svg
              className="whatsapp-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.33 4.96l-.9 3.28 3.38-.88c1.47.81 3.16 1.25 4.9 1.25 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm3.17 14.54l-.19-.11c-1.12-.66-2.56-1.51-3.15-1.73-.59-.22-1.02-.34-1.45.34-.43.68-.69 1.15-.92 1.38-.23.23-.46.26-.85.12s-1.44-.53-1.75-1.09c-.31-.56-.34-1.09-.13-1.3.21-.21.46-.46.68-.7-.22-.22-.43-.5-.65-.77-.22-.27-.58-.87-.8-1.25-.22-.38-.22-.31-.5-.58s-1.25-1.52-1.25-2.81c0-1.12.56-1.68 1.12-2.24.56-.56 1.12-.89 1.45-.89.33 0 .61.05.85.28s.77.7.92 1.02c.15.32.22.84.05 1.02s-.65 1.05-.88 1.25c-.23.2-.38.41-.31.62.07.21.37.58.53.77s.35.38.56.59.43.46.68.65.65.53 1.3.47c.65-.06 1.54-.48 2.37-1.26.83-.78 1.3-1.56 1.47-1.8.17-.24.22-.44.15-.69-.07-.25-.3-.5-.61-.74-.31-.24-.62-.59-.8-.83-.18-.24-.44-.65-.41-.95s.31-.69.46-.88c.15-.19.65-.5.95-.5.3 0 .58.07.82.07s.57.1.8.31c.23.2.45.41.68.62.23.2.46.43.65.68.19.25.3.46.46.68.16.22.25.43.34.68s.16.59.16.94c0 .35-.06.69-.34 1.02s-.61.59-1.22 1.3z" />
            </svg>
            Contacto de Ventas
          </a>
          <a
            href="https://wa.me/5215598765432?text=Hola,%20me%20interesa%20contratación%20directa."
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-button"
          >
            <svg
              className="whatsapp-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.33 4.96l-.9 3.28 3.38-.88c1.47.81 3.16 1.25 4.9 1.25 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm3.17 14.54l-.19-.11c-1.12-.66-2.56-1.51-3.15-1.73-.59-.22-1.02-.34-1.45.34-.43.68-.69 1.15-.92 1.38-.23.23-.46.26-.85.12s-1.44-.53-1.75-1.09c-.31-.56-.34-1.09-.13-1.3.21-.21.46-.46.68-.7-.22-.22-.43-.5-.65-.77-.22-.27-.58-.87-.8-1.25-.22-.38-.22-.31-.5-.58s-1.25-1.52-1.25-2.81c0-1.12.56-1.68 1.12-2.24.56-.56 1.12-.89 1.45-.89.33 0 .61.05.85.28s.77.7.92 1.02c.15.32.22.84.05 1.02s-.65 1.05-.88 1.25c-.23.2-.38.41-.31.62.07.21.37.58.53.77s.35.38.56.59.43.46.68.65.65.53 1.3.47c.65-.06 1.54-.48 2.37-1.26.83-.78 1.3-1.56 1.47-1.8.17-.24.22-.44.15-.69-.07-.25-.3-.5-.61-.74-.31-.24-.62-.59-.8-.83-.18-.24-.44-.65-.41-.95s.31-.69.46-.88c.15-.19.65-.5.95-.5.3 0 .58.07.82.07s.57.1.8.31c.23.2.45.41.68.62.23.2.46.43.65.68.19.25.3.46.46.68.16.22.25.43.34.68s.16.59.16.94c0 .35-.06.69-.34 1.02s-.61.59-1.22 1.3z" />
            </svg>
            Contratación
          </a>
        </div>
      </footer>
    </div>
  );
}
