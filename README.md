# 🚀 Alejandro Perez - Personal Portfolio Site

A modern, responsive personal portfolio website built with vanilla JavaScript, CSS3, and HTML5. Features a sleek design with smooth animations, accessibility-first approach, and comprehensive testing suite.

![Live version.](https://alexperez.me)

## ✨ Features

### 🎨 **Modern Design**
- **Glassmorphism UI**: Semi-transparent elements with blur effects.
- **Responsive Layout**: Optimized for mobile, tablet, and desktop.
- **Dark/Light Compatibility**: Clean design that works in any theme.
- **Typography**: Professional Fira Code font family.

### 🧭 **Smart Navigation**
- **Desktop**: macOS-style floating dock that auto-hides.
- **Mobile**: Bottom navigation bar with icons and labels.
- **Auto-Hide**: Desktop dock appears when cursor approaches bottom.
- **Smooth Scrolling**: Precise section targeting with scroll snap.
- **Active Highlighting**: Smart section detection while scrolling.

### 🎯 **Interactive Elements**
- **Hover Effects**: Elegant animations on interactive elements.
- **Scroll Animations**: Content fades in as you scroll.
- **Contact Icons**: Social media and contact links.
- **Typing Animation**: Name appears with typewriter effect.
- **Parallax Background**: Subtle floating shapes that move with cursor.

### ♿ **Accessibility First**
- **WCAG 2.1 Compliant**: Meets accessibility standards.
- **Keyboard Navigation**: Full keyboard support.
- **Screen Reader Friendly**: Proper ARIA labels and semantic HTML.
- **Touch Targets**: Minimum 44px touch areas on mobile.
- **Color Contrast**: High contrast ratios for readability.

### 📱 **Responsive Design**
- **Mobile-First**: Optimized for mobile devices.
- **Breakpoints**: Custom layouts for phone, tablet, and desktop.
- **Touch Optimized**: Gesture-friendly interactions.
- **Performance**: Lightweight and fast loading.

### **Code Architecture**

#### **HTML Structure (`index.html`)**
- **Semantic HTML5**: Proper document structure with semantic elements
- **Navigation**: Fixed floating menu with SVG icons
- **Background**: Animated floating shapes for visual appeal
- **Container**: Centered content area with flexible layout

#### **CSS Architecture (`style.css`)**
- **Mobile-First**: Base styles for mobile, enhanced for larger screens
- **CSS Custom Properties**: Consistent color scheme and spacing
- **Flexbox Layout**: Modern flexible layouts
- **CSS Animations**: Smooth transitions and hover effects
- **Media Queries**: Responsive breakpoints at 480px, 768px, 1024px

#### **JavaScript Functionality (`main.js`)**
```javascript
class PersonalSite {
    // Core functionality organized in a single class
    
    async init()              // Initialize the site
    async loadData()          // Load JSON content
    render(data)              // Render content sections
    initEffects()             // Initialize all interactive features
    initFloatingMenu()        // Navigation and scroll detection
    initDockAutoHide()        // Desktop dock auto-hide behavior
    initParallax()            // Background element movement
    initTyping()              // Typewriter animation
}
```

### **Key Technologies**

- **Vanilla JavaScript**: No frameworks, pure ES6+ JavaScript
- **CSS3**: Modern CSS with Grid, Flexbox, and Custom Properties
- **HTML5**: Semantic markup with proper accessibility
- **JSON**: Dynamic content loading
- **SVG Icons**: Scalable vector icons for navigation
- **Intersection Observer**: Efficient scroll detection
- **CSS Transforms**: Hardware-accelerated animations

## 📊 Data Structure

Content data filled up from a json file for easier update and management.


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

**Alejandro Perez**
- **Website**: [alexperez.me](https://alexperez.me)
- **Email**: [your.email@example.com](mailto:your.email@example.com)
- **GitHub**: [@halprez](https://github.com/yourusername)
---

⭐ **Star this repository if you found it helpful!**