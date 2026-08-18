import React from "react";
import Hero from "../components/Hero";
import About from "../components/About";
import MenuPreview from "../components/MenuPreview";
import EventPreview from "../components/EventPreview";
import Footer from "../components/Footer";
import ChefGallery from "../components/ChefGallery";

const Home = () => {

  return (
    <>
      <Hero />
      <About />
      <MenuPreview />
      <ChefGallery />
      <EventPreview />
      <Footer />
    </>
  );
};

export default Home;
