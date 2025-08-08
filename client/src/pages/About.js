import React from 'react';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  ShieldCheckIcon, 
  TruckIcon, 
  StarIcon,
  UsersIcon,
  GlobeAltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const About = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const stats = [
    { icon: UsersIcon, value: '10K+', label: 'Happy Customers', color: 'from-blue-500 to-cyan-500' },
    { icon: GlobeAltIcon, value: '50+', label: 'Countries Served', color: 'from-green-500 to-emerald-500' },
    { icon: StarIcon, value: '4.9', label: 'Average Rating', color: 'from-yellow-500 to-orange-500' },
    { icon: TruckIcon, value: '24/7', label: 'Customer Support', color: 'from-purple-500 to-pink-500' }
  ];

  const values = [
    {
      icon: HeartIcon,
      title: 'Customer First',
      description: 'We put our customers at the heart of everything we do, ensuring exceptional service and satisfaction.',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Quality Assured',
      description: 'Every product meets our rigorous quality standards, ensuring you get the best value for your money.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: SparklesIcon,
      title: 'Innovation',
      description: 'We continuously innovate to bring you the latest trends and cutting-edge fashion technology.',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F4F1EE]">
      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#1E1E1E] to-[#2A2A2A]">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-5xl md:text-6xl font-display font-bold text-white mb-6"
            variants={itemVariants}
          >
            About Clothica
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            We're passionate about bringing you the finest fashion experiences, combining style, quality, and innovation.
          </motion.p>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6">
        <motion.div 
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={itemVariants}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-display font-bold text-[#1E1E1E] mb-2">
                  {stat.value}
                </h3>
                <p className="text-[#6C7A59] font-medium">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-6">
        <motion.div 
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={itemVariants}>
              <h2 className="text-4xl font-display font-bold text-[#1E1E1E] mb-6">
                Our Story
              </h2>
              <p className="text-lg text-[#6C7A59] mb-6">
                Founded in 2020, Clothica began as a small boutique with a big dream: to revolutionize the way people experience fashion. We believe that everyone deserves access to high-quality, stylish clothing that makes them feel confident and beautiful.
              </p>
              <p className="text-lg text-[#6C7A59] mb-6">
                Today, we've grown into a trusted fashion destination, serving customers worldwide with our curated collection of premium clothing, accessories, and footwear. Our commitment to quality, innovation, and customer satisfaction remains at the core of everything we do.
              </p>
              <p className="text-lg text-[#6C7A59]">
                We're not just selling clothes – we're helping people express their unique style and personality through fashion that lasts.
              </p>
            </motion.div>
            <motion.div 
              className="relative"
              variants={itemVariants}
            >
              <div className="bg-gradient-to-br from-[#6C7A59] to-[#D6BFAF] rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-display font-bold mb-4">Our Mission</h3>
                <p className="text-lg mb-4">
                  To provide exceptional fashion experiences that inspire confidence and self-expression.
                </p>
                <h3 className="text-2xl font-display font-bold mb-4">Our Vision</h3>
                <p className="text-lg">
                  To become the world's most trusted and innovative fashion platform.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-6 bg-white">
        <motion.div 
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="text-center mb-12"
            variants={itemVariants}
          >
            <h2 className="text-4xl font-display font-bold text-[#1E1E1E] mb-4">
              Our Values
            </h2>
            <p className="text-lg text-[#6C7A59] max-w-2xl mx-auto">
              These core values guide everything we do and shape our company culture.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={itemVariants}
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="bg-[#F4F1EE] rounded-2xl p-8 text-center"
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-display font-bold text-[#1E1E1E] mb-4">
                  {value.title}
                </h3>
                <p className="text-[#6C7A59]">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="bg-gradient-to-br from-[#6C7A59] to-[#D6BFAF] rounded-2xl p-12 text-white"
            variants={itemVariants}
          >
            <h2 className="text-3xl font-display font-bold mb-4">
              Join the Clothica Family
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Experience the difference that quality, style, and exceptional service can make in your fashion journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-white text-[#6C7A59] font-semibold rounded-xl hover:bg-gray-100 transition-colors">
                Shop Now
              </button>
              <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-[#6C7A59] transition-colors">
                Contact Us
              </button>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default About;
