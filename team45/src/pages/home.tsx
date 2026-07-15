import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import greater1 from '../assets/images/greater (1).jpeg';
import greater2 from '../assets/images/greater (2).jpeg';
import greater3 from '../assets/images/greater (3).jpeg';

const fadeUp = {
  hidden: { opacity: 0, y: 0 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9 } },
};
const fadeLeft = {
  hidden: { opacity: 0, x: -50 },
  show: { opacity: 1, x: 0, transition: { duration: 0.9 } },
};
const fadeRight = {
  hidden: { opacity: 0, x: 50 },
  show: { opacity: 1, x: 0, transition: { duration: 0.9 } },
};

const Hero = () => {
  const images = [
    "https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=600&auto=format&fit=crop&q=60",
    "https://plus.unsplash.com/premium_photo-1733317290607-6479869d275c?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1744870416768-25139537d856?w=600&auto=format&fit=crop&q=60",
  ];

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-yellow-50 overflow-hidden">
      <motion.div
        className="absolute top-10 left-10 w-32 h-32 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70"
        animate={{ y: [0, 30, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-40 h-40 bg-yellow-200 rotate-45 mix-blend-multiply filter blur-3xl opacity-70"
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 9, repeat: Infinity }}
      />

      <div className="relative z-10 grid md:grid-cols-2 gap-8 px-8 md:px-20 items-center w-full">
        <motion.div
          variants={fadeLeft}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="flex flex-col gap-6"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 leading-tight">
            Connect, <span className="text-green-600">Share, Nourish</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-md">
            Join our platform to connect donors, receivers, and volunteers for seamless food sharing.
          </p>
          <div>
            <Link
              to="/register"
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg transition inline-block"
            >
              Get Started
            </Link>
          </div>
        </motion.div>

        <motion.div
          variants={fadeRight}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-tl-[100px] rounded-br-[100px] shadow-2xl"
        >
          {images.map((src, i) => (
            <motion.img
              key={i}
              src={src}
              alt="Food donation"
              className="absolute w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 8, repeat: Infinity, delay: i * 3 }}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const Welcome = () => (
  <motion.section
    variants={fadeUp}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.2 }}
    className="py-20 bg-white relative"
  >
    <div className="max-w-5xl mx-auto text-center px-6">
      <h2 className="text-4xl font-bold text-gray-800 mb-6">Welcome to RescueProduce</h2>
      <p className="text-lg text-gray-600">
        We are a centralized platform connecting food donors, receivers, and volunteers to share surplus food and support communities.
      </p>
    </div>
  </motion.section>
);

const Mission = () => (
  <section className="py-20 bg-gradient-to-r from-green-100 to-yellow-100">
    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center px-6">
      <motion.div
        variants={fadeLeft}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <img
          src="https://plus.unsplash.com/premium_photo-1683134044077-c8af4c752c5f?w=600&auto=format&fit=crop&q=60"
          alt="Food distribution"
          className="rounded-3xl shadow-lg"
        />
      </motion.div>
      <motion.div
        variants={fadeRight}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="flex flex-col gap-6"
      >
        <h2 className="text-4xl font-bold text-gray-800">Our Mission in Action</h2>
        <p className="text-lg text-gray-700">
          We empower donors, receivers, and volunteers to collaborate seamlessly, ensuring surplus food reaches those in need while fostering community connections.
        </p>
      </motion.div>
    </div>
  </section>
);

const HowItWorks = () => (
  <section className="relative py-20 bg-white overflow-hidden">
    <motion.div
      className="absolute -top-10 -left-10 w-40 h-40 bg-green-200 rounded-tr-[80px] rounded-bl-[80px] opacity-40"
      animate={{ y: [0, 20, 0] }}
      transition={{ duration: 6, repeat: Infinity }}
    />
    <motion.div
      className="absolute bottom-0 right-0 w-48 h-48 bg-yellow-200 rotate-12 rounded-3xl opacity-30"
      animate={{ x: [0, -30, 0] }}
      transition={{ duration: 8, repeat: Infinity }}
    />

    <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
      <h2 className="text-4xl font-bold text-gray-800 mb-12">How It Works</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            title: "Donate",
            desc: "Food donors list surplus produce on our platform.",
            img: "https://img.icons8.com/fluency/96/food-donor.png",
          },
          {
            title: "Coordinate",
            desc: "Volunteers organize and manage food distribution.",
            img: "https://img.icons8.com/fluency/96/delivery-scooter.png",
          },
          {
            title: "Receive",
            desc: "Communities access nutritious food through our network.",
            img: "https://img.icons8.com/fluency/96/meal.png",
          },
        ].map((step, i) => (
          <motion.div
            key={i}
            whileInView={{ y: [50, 0], opacity: [0, 1] }}
            transition={{ duration: 0.8, delay: i * 0.3 }}
            viewport={{ once: true }}
            className="bg-white rounded-[2rem] shadow-lg p-8 flex flex-col items-center gap-4 border border-gray-100 relative"
          >
            <motion.div
              className="absolute -top-6 right-6 w-12 h-12 bg-green-100 rounded-full opacity-60"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <img src={step.img} alt={step.title} className="w-20 h-20" />
            <h3 className="text-2xl font-semibold text-gray-800">{step.title}</h3>
            <p className="text-gray-600">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const AboutUs = () => (
  <section className="py-20 bg-gradient-to-tr from-yellow-50 to-green-50">
    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center px-6">
      <motion.div
        variants={fadeLeft}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <h2 className="text-4xl font-bold text-gray-800 mb-6">About Us</h2>
        <p className="text-lg text-gray-700 mb-4">
          RescueProduce is a centralized platform dedicated to connecting food donors, receivers, and volunteers to share surplus food and strengthen communities.
        </p>
      </motion.div>
<motion.div
        variants={fadeRight}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="grid grid-cols-2 gap-4"
      >
        <img
          src="https://plus.unsplash.com/premium_photo-1683134059041-3604e05950e4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Zm9vZCUyMGRvbmF0aW9tfGVufDB8fDB8fHww?w=400"
          alt="Food volunteers"
          className="rounded-2xl shadow-lg"
        />
        <img
          src="https://plus.unsplash.com/premium_photo-1683140538884-07fb31428ca6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Zm9vZCUyMGRvbmF0aW9tfGVufDB8fDB8fHww?w=400"
          alt="Packed meals"
          className="rounded-2xl shadow-lg"
        />
      </motion.div>
    </div>

    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="mt-16 max-w-6xl mx-auto px-6 text-center"
    >
      <h3 className="text-3xl font-bold text-gray-800 mb-10">Meet Our Team</h3>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { name: "Tshifhiwa G Nenwali", role: "Fullstack Developer", img: greater1 },
          { name: "Luvuyo Yeni", role: "Fullstack Developer", img: "../assets/images/greater (2).jpeg" },
          { name: "Lwazi Phuma", role: "Fullstack Developer", img: "../assets/images/greater (3).jpeg" },
        ].map((member, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="bg-white p-6 rounded-2xl shadow-lg"
          >
            <img src={member.img} alt={member.name} className="w-24 h-24 rounded-full mx-auto mb-4 shadow-md" />
            <h4 className="text-xl font-semibold text-gray-800">{member.name}</h4>
            <p className="text-gray-600">{member.role}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </section>
);

const Sponsor = () => {
  const images = [
    "https://images.unsplash.com/photo-1694286068611-d0c24cbc2cd5?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1695131518586-06a26361593f?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1694286068158-836b3aec0599?w=600&auto=format&fit=crop&q=60",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="py-20 bg-gradient-to-r from-yellow-50 to-green-50 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6">
          <h2 className="text-4xl font-bold text-gray-800">
            Meet Our Sponsor
          </h2>
          <p className="text-lg text-gray-700">
            We are proudly supported by{" "}
            <span className="font-semibold text-green-600">
              Little Pina Pina Daycare Center
            </span>
            . Their dedication to nurturing children and fostering community
            values aligns with our mission to connect and nourish.
          </p>
        </div>

        <div className="relative w-full h-[500px] overflow-hidden shadow-xl">
          <motion.div
            className="flex w-full h-full"
            animate={{ x: `-${index * 100}%` }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Sponsor ${i + 1}`}
                className="w-full h-full object-cover flex-shrink-0"
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => (
  <section className="py-20 bg-gradient-to-r from-green-50 to-yellow-50">
    <div className="max-w-6xl mx-auto px-6 text-center">
      <h2 className="text-4xl font-bold text-gray-800 mb-12">What People Say</h2>
      <div className="grid md:grid-cols-2 gap-8">
        {[
          {
            quote:
              "RescueProduce makes it easy for us to share food with those in need. The platform is a game-changer!",
            name: "Little Pina Pina Daycare Center",
          },
          {
            quote:
              "Volunteering with RescueProduce is rewarding. I love helping connect food to communities!",
            name: "A Volunteer",
          },
        ].map((t, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            className="p-8 bg-white shadow-lg border border-gray-100"
          >
            <p className="text-gray-700 italic mb-4">“{t.quote}”</p>
            <h3 className="text-lg font-semibold text-green-700">{t.name}</h3>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-[#165e2a] text-white py-10">
    <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
      <div>
        <h4 className="text-xl font-bold mb-3">RescueProduce</h4>
        <p className="text-green-100 text-sm">
          Connecting donors, receivers, and volunteers to share food and build stronger communities.
        </p>
      </div>
      <div>
        <h4 className="text-xl font-bold mb-3">Quick Links</h4>
        <ul className="space-y-2 text-green-100 text-sm">
          <li><a href="#about" className="hover:text-yellow-300">About Us</a></li>
          <li><a href="#mission" className="hover:text-yellow-300">Our Mission</a></li>
          <li><a href="#sponsor" className="hover:text-yellow-300">Sponsor</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-xl font-bold mb-3">Contact</h4>
        <p className="text-green-100 text-sm">Email: info@rescueproduce.org</p>
        <p className="text-green-100 text-sm">Phone: +27 123 456 789</p>
      </div>
    </div>
    <div className="text-center text-green-200 text-sm mt-8">
      © {new Date().getFullYear()} RescueProduce. All rights reserved.
    </div>
  </footer>
);

export default function Home() {
  return (
    <main className="w-full overflow-hidden">
      <Hero />
      <Welcome />
      <Mission />
      <HowItWorks />
      <AboutUs />
      <Sponsor />
      <Testimonials />
      <Footer />
    </main>
  );
}