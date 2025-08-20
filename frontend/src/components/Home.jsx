import React, { useEffect,useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import '../assets/Home.css';
import { useNavigate } from 'react-router-dom';
import ValidateToken from './ValidateToken';
const Home = () => {
  const navigate = useNavigate();
  const handleNewUser = () => navigate('/register');
  
  const farmerId=localStorage.getItem('farmerId')

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');


  return (
    <div className="home-container">
      <ValidateToken farmerId={farmerId} token={token} role={role} />

      <h1>Welcome to AgriGate</h1>
      <p>Connecting farmers directly with buyers for fair trade and better prices.</p>
     
      <Carousel showArrows={true} autoPlay={true} infiniteLoop={true} showThumbs={false}>
        <div>
          <img src="/images/slide1.jpg" alt="slide1" />
        </div>
        <div>
          <img src="/images/slide2.jpg" alt="slide2" />
        </div>
      </Carousel>

      {/* About the App Section */}
      <section className="about-section">
        <h2>What we do?</h2>
        <p>
          At Farmers' Direct Market, we recognize the challenges faced by farmers, including fluctuating prices, market access, and competition with larger agricultural operations. Our platform empowers small and medium-sized farmers by providing them with the tools and resources they need to thrive in a competitive landscape. By facilitating direct transactions, we help farmers retain a larger share of their sales, ensuring their hard work is rewarded. Our commitment to sustainability goes beyond fair pricing; we actively promote environmentally friendly practices by encouraging the sale of locally sourced and organic products, benefiting both consumer health and the planet. Farmers' Direct Market is more than just a platform; it’s a community that fosters collaboration and knowledge sharing. We offer resources such as workshops, webinars, and forums where farmers can exchange ideas, learn best practices, and support one another. Our user-friendly interface makes it easy for both farmers and consumers to navigate the marketplace, with features like product listings, customer reviews, and secure payment options prioritizing a seamless transaction experience. As we grow, our vision remains steadfast: to build a world where farmers can thrive, consumers can access quality produce, and communities can unite to support sustainable agriculture. Join us on this journey towards a fairer and more equitable food system, where everyone benefits from the farm-to-table experience.
        </p>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Features of Our App</h2>
        <div className="features-grid">
          <div className="feature">
            <div className="feature-icon">🌾</div>
            <h3>Direct Market Access</h3>
            <p>
              Farmers can list their crops and set their own prices. Buyers can browse available crops, view pricing and details, and directly contact farmers to arrange for purchases.
            </p>
          </div>
          <div className="feature">
            <div className="feature-icon">☀️</div>
            <h3>Weather Updates</h3>
            <p>
              Get real-time weather information for your region. Weather data helps farmers make informed decisions on when to plant, harvest, and protect their crops from adverse conditions.
            </p>
          </div>
          <div className="feature">
            <div className="feature-icon">📊</div>
            <h3>Market Insights</h3>
            <p>
              Stay informed about market trends, average prices, and demand for different crops. Market insights empower farmers to price their crops competitively and know what to grow based on demand.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section" id="htw">
        <h2>How It Works</h2>
        <ol>
          <li><strong>Register:</strong> Farmers and buyers create an account to get started.</li>
          <li><strong>List Crops:</strong> Farmers can list their crops with details like crop type, quantity, price, and region.</li>
          <li><strong>Browse & Buy:</strong> Buyers browse the listings, compare prices, and contact farmers directly.</li>
          <li><strong>Direct Communication:</strong> The app allows for direct negotiation and communication between farmers and buyers, creating a transparent and efficient marketplace.</li>
          <li><strong>Weather Information:</strong> Farmers and buyers can access real-time weather updates to make informed decisions about crop availability and timing.</li>
          <li><strong>Market Information:</strong> The app provides the latest market trends and pricing data to help farmers and buyers make strategic choices.</li>
        </ol>
      </section>

     

      {/* FAQs Section */}
      <section className="faqs-section" id="faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq">
          <h3>Q: How do I register on the platform?</h3>
          <p>A: You can register by clicking on the "Sign Up" button in Account section and filling in the required details.</p>
        </div>
        <div className="faq">
          <h3>Q: Are there any fees to use the platform?</h3>
          <p>A: No, Farmers' Direct Market is completely free for both farmers and buyers.</p>
        </div>
        <div className="faq">
          <h3>Q: How can I contact support?</h3>
          <p>A: You can reach out to our support team via the contact form on our website or email us at webappfarmer@gmail.com.</p>
        </div>
      </section>

      {/* Call to Action Section */}
     
<section className="terms-section" id="ts">
  <h2>Terms of Service</h2>
  <p>
    By using AgriGate, our direct market access platform for farmers, you agree to comply with our terms and conditions. These include:
  </p>
  <ul>
    <li>Providing accurate information during registration.</li>
    <li>Using the platform only for lawful and intended purposes.</li>
    <li>Acknowledging that AgriGate facilitates connections but does not guarantee the quality of goods or transactions.</li>
  </ul>
  <p>
    For the full Terms of Service, contact us or refer to the detailed documentation in your account dashboard.
  </p>
  <a href="/#cs">Contact Us</a>
</section>

<section className="privacy-section" id="pp">
  <h2>Privacy Policy</h2>
  <p>
    Your privacy matters to us. At AgriGate, we collect and use your information only to enhance your experience and ensure smooth transactions. This includes:
  </p>
  <ul>
    <li>Personal details like name and contact information for account setup.</li>
    <li>Usage data to improve platform features and functionality.</li>
  </ul>
  <p>
    We never sell your data and only share it when necessary to provide our services. For detailed information, feel free to reach out.
  </p>
  <a href="/#cs">Contact Us</a>
</section>

{!farmerId && (
  <section className="cta-section" onClick={handleNewUser}>
    <h2>JOIN US TODAY!</h2>
    <p>
      Be a part of the Farmers' Direct Market community. Sign up now to start trading directly with farmers and support sustainable agriculture!
    </p>
    <button className="cta-button" onClick={handleNewUser}>Sign Up Now</button>
  </section>
)}
      {/* Contact Section */}
      <section className="contact-section" id="cs">
        <h2>Contact Us</h2>
        <p>
          Have questions or need help? Our team is here to support you. Reach out to us for any assistance or inquiries about using the app.
        </p>
        <a href="mailto:webappfarmer@gmail.com"> Email: webappfarmer@gmail.com</a>
      </section>
    </div>
  );
};

export default Home;
