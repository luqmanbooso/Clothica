/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fashion-focused color palette
        primary: {
          50: '#F4F1EE',
          100: '#F9F9F9',
          200: '#E8E5E2',
          300: '#D6BFAF',
          400: '#CCCCCC',
          500: '#6C7A59',
          600: '#5A6A4A',
          700: '#4A5A3B',
          800: '#3A4A2C',
          900: '#1E1E1E',
        },
        accent: {
          50: '#FEF7F7',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#B35D5D',
          600: '#A54B4B',
          700: '#8B3A3A',
          800: '#712929',
          900: '#571818',
        },
        neutral: {
          50: '#F9F9F9',
          100: '#F4F1EE',
          200: '#E8E5E2',
          300: '#D6BFAF',
          400: '#CCCCCC',
          500: '#999999',
          600: '#666666',
          700: '#444444',
          800: '#2A2A2A',
          900: '#1E1E1E',
        },
        // Custom color variables
        'fashion-primary': '#1E1E1E',
        'fashion-secondary': '#F9F9F9',
        'fashion-accent': '#D6BFAF',
        'fashion-cta': '#6C7A59',
        'fashion-sale': '#B35D5D',
        'fashion-background': '#F4F1EE',
        'fashion-hover': '#CCCCCC',
      },
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'body': ['Lato', 'sans-serif'],
        'button': ['Poppins', 'sans-serif'],
        'sans': ['Lato', 'system-ui', 'sans-serif'],
        'serif': ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-in-left': 'slideInLeft 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
        'scale-in': 'scaleIn 0.6s ease-out',
        'pulse-slow': 'pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        slideInLeft: {
          '0%': {
            opacity: '0',
            transform: 'translateX(-50px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)'
          }
        },
        slideInRight: {
          '0%': {
            opacity: '0',
            transform: 'translateX(50px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)'
          }
        },
        scaleIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.9)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)'
          }
        },
        'pulse-slow': {
          '0%, 100%': {
            opacity: '1'
          },
          '50%': {
            opacity: '0.5'
          }
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)'
          },
          '50%': {
            transform: 'translateY(-10px)'
          }
        },
        glow: {
          '0%, 100%': {
            boxShadow: '0 0 5px rgba(108, 122, 89, 0.5)'
          },
          '50%': {
            boxShadow: '0 0 20px rgba(108, 122, 89, 0.8)'
          }
        }
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 10px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 20px rgba(108, 122, 89, 0.3)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
} 