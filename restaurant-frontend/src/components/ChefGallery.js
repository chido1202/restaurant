import React from "react";
import "../styles/chefGallery.css";
import image1 from "../assets/image 1.jpg";
import image2 from "../assets/image 2.jpg";
import image4 from "../assets/image 4.jpg";
import image8 from "../assets/image8.jpg";
import chef1 from "../assets/chef1.jpg";
import chef2 from "../assets/chef2.jpg";
import chef3 from "../assets/chef3.jpg";
import chef4 from "../assets/chef4.jpg";

// Danh sách đầu bếp
const chefs = [
  { name: "Antonio Delgado", role: "Head Chef", img: chef1 },
  { name: "Elena Laurent", role: "Pastry Chef", img: chef2 },
  { name: "Liam Carter", role: "Sous Chef", img: chef3 },
  { name: "Daniel Moreau", role: "Station Chef", img: chef4 },
];

// Danh sách hình ảnh Gallery
const galleryImages = [
  image2,
  image4,
  image1,
  image8,
  
];

const ChefGallery = () => {
  return (
    <div className="chef-gallery-container">
      {/* OUR CHEFS */}
      <section className="our-chefs">
        <h2>Our Chefs</h2>
        
        <div className="chefs-list">
          {chefs.map((chef, index) => (
            <div className="chef-card" key={index}>
              <img src={chef.img} alt={chef.name} />
              <h3>{chef.name}</h3>
              <p>{chef.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* GALLERY */}
      <section className="gallery">
        <h2>Gallery</h2>
        
        <div className="gallery-grid">
          {galleryImages.map((img, index) => (
            <div className="gallery-item" key={index}>
              <img src={img} alt={`Gallery ${index + 1}`} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ChefGallery;
