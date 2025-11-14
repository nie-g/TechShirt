import React from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

const pricingPlans = [
  {
    name: "Basic ",
    price: "- for orders of 15 shirts below",
    features: [
      "Unlimited orders",
      "Premium designs",
      
    ],
  },
  {
    name: "Promo ",
    price: "for orders of more than 15 shirts",
    features: [
      "Unlimited orders",
      "Premium designs",
      "No designer fee",
      "The first 2 revisions are free",
    ],
  },
];

const PricingPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="font-sans text-gray-800 bg-gradient-to-r from-white to-teal-50"
    >
      <Navbar />

      {/* Intro Section */}
      <section className="px-6 py-20 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900">Pricing Plans</h1>
        <p className="mt-4 text-lg text-gray-600">
          Choose a plan that fits your t-shirt design needs. Whether you're just starting or want extra features, TechShirt has you covered.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="grid grid-cols-1 gap-12 px-6 pb-20 md:grid-cols-2 max-w-7xl mx-auto">
        {pricingPlans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="flex flex-col items-center text-center bg-white p-8 rounded-xl shadow-lg"
          >
            <h3 className="text-xl font-semibold text-teal-600">{plan.name}</h3>
            <p className="mt-4 text-3xl font-bold text-gray-900">{plan.price}</p>
            <ul className="mt-6 space-y-2 text-gray-700 text-sm">
              {plan.features.map((feature, i) => (
                <li key={i} className="before:content-['✔'] before:text-teal-500 before:mr-2">
                  {feature}
                </li>
              ))}
            </ul>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 px-6 py-3 font-semibold text-white bg-teal-500 rounded-lg hover:bg-teal-600"
            >
              <a href="/signup">Choose Plan</a>
            </motion.button>
          </motion.div>
        ))}
      </section>

      {/* Call to Action */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="py-16 text-center text-white bg-teal-500"
      >
        <h2 className="text-3xl font-bold">Get Started Today</h2>
        <p className="mt-2">
          Join TechShirt and start creating your custom t-shirt designs with ease.
        </p>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 mt-6 font-semibold text-teal-500 bg-white rounded-lg"
        >
          <a href="/signup">Sign Up Now</a>
        </motion.button>
      </motion.section>

      {/* Footer */}
      <footer className="w-full px-6 py-10 text-gray-400 bg-gray-900">
        <div className="grid max-w-6xl grid-cols-1 gap-6 mx-auto md:grid-cols-3">
          <div>
            <h3 className="text-lg font-bold text-white">TechShirt</h3>
            <p>Where creativity meets collaboration. Build t-shirts, build connections.</p>
          </div>
          <div>
            <h4 className="font-bold text-white">Explore</h4>
            <a href="/features" className="block mt-2">Features</a>
            <a href="/how-it-works" className="block mt-2">How It Works</a>
            <a href="/pricing" className="block mt-2">Pricing</a>
          </div>
          <div>
            <h4 className="font-bold text-white">Company</h4>
            <a href="/about" className="block mt-2">About Us</a>
            <a href="/contact" className="block mt-2">Contact</a>
            <a href="/careers" className="block mt-2">Careers</a>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

export default PricingPage;
