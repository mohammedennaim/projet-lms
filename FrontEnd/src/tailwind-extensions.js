// Tailwind CSS extensions for animations used in CourseManagement
if (window.tailwind) {
  window.tailwind.config.theme.extend.keyframes = {
    ...window.tailwind.config.theme.extend.keyframes,
    slideInLeft: {
      'from': { opacity: '0', transform: 'translateX(-20px)' },
      'to': { opacity: '1', transform: 'translateX(0)' }
    },
    slideInUp: {
      'from': { opacity: '0', transform: 'translateY(20px)' },
      'to': { opacity: '1', transform: 'translateY(0)' }
    },
    slideInRight: {
      'from': { transform: 'translateX(100%)', opacity: '0' },
      'to': { transform: 'translateX(0)', opacity: '1' }
    },
    bounce: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-10px)' }
    },
    scaleIn: {
      'from': { opacity: '0', transform: 'scale(0.9) translateY(-20px)' },
      'to': { opacity: '1', transform: 'scale(1) translateY(0)' }
    }
  };
  window.tailwind.config.theme.extend.animation = {
    ...window.tailwind.config.theme.extend.animation,
    fadeIn: 'fadeIn 0.5s ease-out',
    slideInLeft: 'slideInLeft 0.5s ease-out',
    slideInUp: 'slideInUp 0.5s ease-out',
    slideInRight: 'slideInRight 0.3s ease-out',
    'scale-in': 'scaleIn 0.3s ease-out',
    bounce: 'bounce 2s infinite'
  };
}
