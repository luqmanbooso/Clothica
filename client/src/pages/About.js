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
    { icon: UsersIcon, value: '10K+', label: 'Happy Customers', color: 'from-[#6C7A59] to-[#9CAF88]' },
    { icon: GlobeAltIcon, value: '50+', label: 'Countries Served', color: 'from-[#D4AF37] to-[#E8B4B8]' },
    { icon: StarIcon, value: '4.9', label: 'Average Rating', color: 'from-[#E8B4B8] to-[#F5F1E8]' },
    { icon: TruckIcon, value: '24/7', label: 'Customer Support', color: 'from-[#9CAF88] to-[#6C7A59]' }
  ];

  const values = [
    {
      icon: HeartIcon,
      title: 'Customer First',
      description: 'We put our customers at the heart of everything we do, ensuring exceptional service and satisfaction.',
      color: 'from-[#B35D5D] to-[#E8B4B8]'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Quality Assured',
      description: 'Every product meets our rigorous quality standards, ensuring you get the best value for your money.',
      color: 'from-[#6C7A59] to-[#9CAF88]'
    },
    {
      icon: SparklesIcon,
      title: 'Innovation',
      description: 'We continuously innovate to bring you the latest trends and cutting-edge fashion technology.',
      color: 'from-[#D4AF37] to-[#E8B4B8]'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F4F1EE]">
      {/* Enhanced Hero Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#0F0F0F] via-[#1A1A1A] to-[#2A2A2A] relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-[#D4AF37]/20 to-[#E8B4B8]/20 rounded-full blur-3xl animate-pulse-soft"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-[#6C7A59]/20 to-[#9CAF88]/20 rounded-full blur-3xl animate-pulse-soft" style={{animationDelay: '2s'}}></div>
        </div>
        
        <motion.div 
          className="max-w-6xl mx-auto text-center relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#F5F1E8] via-[#D4AF37] to-[#6C7A59] mb-8"
            variants={itemVariants}
          >
            ABOUT CLOTHICA
          </motion.h1>
          <motion.p 
            className="text-2xl text-[#E6E6FA] max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            We're passionate about bringing you the finest fashion experiences, combining style, quality, and innovation with cutting-edge technology.
          </motion.p>
        </motion.div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#F5F1E8] to-[#E6E6FA]">
        <motion.div 
          className="max-w-7xl mx-auto"
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
                className="text-center group"
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${stat.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl transition-all duration-300`}>
                  <stat.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-black text-[#1E1E1E] mb-3">
                  {stat.value}
                </h3>
                <p className="text-[#6C7A59] font-bold text-lg">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

            {/* Enhanced Story Section */}
      <section className="py-20 px-6">
        <motion.div 
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={itemVariants}>
              <h2 className="text-5xl font-black text-[#1E1E1E] mb-8">
                Our Story
              </h2>
              <p className="text-xl text-[#6C7A59] mb-6 leading-relaxed">
                Founded in 2020, Clothica began as a small boutique with a big dream: to revolutionize the way people experience fashion. We believe that everyone deserves access to high-quality, stylish clothing that makes them feel confident and beautiful.
              </p>
              <p className="text-xl text-[#6C7A59] mb-6 leading-relaxed">
                Today, we've grown into a trusted fashion destination, serving customers worldwide with our curated collection of premium clothing, accessories, and footwear. Our commitment to quality, innovation, and customer satisfaction remains at the core of everything we do.
              </p>
              <p className="text-xl text-[#6C7A59] leading-relaxed">
                We're not just selling clothes – we're helping people express their unique style and personality through fashion that lasts.
              </p>
            </motion.div>
            <motion.div 
              className="relative"
              variants={itemVariants}
            >
              <div className="bg-gradient-to-br from-[#6C7A59] to-[#9CAF88] rounded-3xl p-10 text-white shadow-2xl">
                <h3 className="text-3xl font-black mb-6">Our Mission</h3>
                 <p className="text-xl mb-6 leading-relaxed">
                   To provide exceptional fashion experiences that inspire confidence and self-expression.
                 </p>
                 <h3 className="text-3xl font-black mb-6">Our Vision</h3>
                 <p className="text-xl leading-relaxed">
                   To become the world's most trusted and innovative fashion platform.
                 </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Enhanced Values Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#F5F1E8] to-[#E6E6FA]">
        <motion.div 
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="text-center mb-16"
            variants={itemVariants}
          >
            <h2 className="text-5xl font-black text-[#1E1E1E] mb-6">
              Our Values
            </h2>
            <p className="text-xl text-[#6C7A59] max-w-3xl mx-auto leading-relaxed">
              These core values guide everything we do and shape our company culture.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
            variants={itemVariants}
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="bg-white/95 backdrop-blur-sm rounded-3xl p-10 text-center shadow-2xl border border-[#6C7A59]/20 group hover:shadow-3xl transition-all duration-500"
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${value.color} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl group-hover:shadow-2xl transition-all duration-300`}>
                  <value.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-[#1E1E1E] mb-6">
                  {value.title}
                </h3>
                <p className="text-[#6C7A59] text-lg leading-relaxed">
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
