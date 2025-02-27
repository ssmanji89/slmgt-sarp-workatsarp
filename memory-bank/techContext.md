# Technical Context: www.workatsarp.com

## Technology Stack

### Core Technologies
1. **HTML5**: Semantic markup language for structuring web content
2. **CSS3**: Styling language with modern features like variables and flexbox
3. **JavaScript**: Client-side scripting for interactive functionality
4. **GitHub Pages**: Hosting service that serves static files from a GitHub repository
5. **Git**: Version control system for tracking changes and collaboration

### Front-End Technologies
1. **HTML5**: Semantic markup with modern elements and attributes
2. **CSS3**: Custom properties, flexbox, and grid for layout
3. **JavaScript**: Vanilla JS for interactive elements and form validation
4. **Google Fonts**: Montserrat and Open Sans for typography
5. **Font Awesome**: Icon library for visual elements

### External Services & Integrations
1. **Formspree/Netlify Forms**: For contact form processing
2. **Google Maps/Leaflet.js**: For interactive location maps
3. **Microsoft Integration**: For compatibility with client's ecosystem
4. **Google Analytics**: For visitor tracking and site analytics
5. **Font Awesome/Google Fonts**: For typography and icons

## Development Environment

### Local Development Setup
1. **Text Editor**: Visual Studio Code or any modern code editor
2. **Git**: Version control system for tracking changes
3. **Web Browser**: Chrome, Firefox, or Edge with developer tools
4. **Local Server**: Simple HTTP server for testing (e.g., Live Server extension)
5. **Image Editor**: For creating and optimizing images

### Build & Deployment Process
1. **Local Development**: Direct editing of HTML, CSS, and JavaScript files
2. **Version Control**: Git for tracking changes
3. **Testing**: Local browser testing before deployment
4. **Deployment**: Push to GitHub repository for automatic GitHub Pages deployment
5. **Domain Configuration**: Custom domain setup through GitHub Pages

## Technical Constraints

### GitHub Pages Limitations
1. **Server-Side Processing**: Not available (static site only)
2. **Build Plugins**: Limited to a specific allowlist
3. **Site Size**: Limited to 1GB
4. **Bandwidth**: Soft limit of 100GB per month
5. **Build Time**: Limited to 10 minutes

### Static Site Considerations
1. **Content Updates**: Requires direct HTML editing
2. **Deployment Process**: Simple push to GitHub repository
3. **Maintenance**: Easy to maintain with minimal dependencies
4. **Performance**: Fast loading times with static files
5. **Scalability**: Suitable for small to medium-sized marketing sites

### Browser Compatibility
1. **Target Browsers**: Modern browsers (Chrome, Firefox, Safari, Edge)
2. **Mobile Support**: iOS Safari and Android Chrome
3. **Legacy Support**: Limited support for older browsers
4. **Responsive Breakpoints**: Mobile, tablet, desktop, and large desktop
5. **Performance Targets**: Google PageSpeed score of 90+

## Dependencies & Third-Party Components

### External Resources
1. **Google Fonts**: Montserrat and Open Sans fonts
2. **Font Awesome**: Icon library for visual elements
3. **Placeholder Images**: Temporary images until actual property photos are available
4. **Form Processing**: Third-party service for form submissions
5. **Map Integration**: For location visualization

### JavaScript Components
1. **Form Validation**: Custom validation for contact forms
2. **Mobile Menu**: Responsive navigation for mobile devices
3. **Smooth Scrolling**: For improved user experience
4. **Image Gallery**: Simple lightbox functionality
5. **Interactive Elements**: Hover effects and transitions

### CSS Components
1. **Custom Properties**: Variables for consistent styling
2. **Flexbox & Grid**: For responsive layouts
3. **Media Queries**: For different device sizes
4. **Animations**: Subtle transitions and hover effects
5. **Print Styles**: For printable property information

## Performance Considerations

### Optimization Strategies
1. **Image Optimization**: Compressed and properly sized images
2. **Lazy Loading**: For images and non-critical resources
3. **Minification**: For CSS and JavaScript files
4. **Critical CSS**: Inline critical styles for faster rendering
5. **Caching**: Proper cache headers for static assets

### SEO Implementation
1. **Semantic HTML**: Proper use of HTML5 elements
2. **Meta Tags**: Title, description, and Open Graph tags
3. **Structured Data**: JSON-LD for local business information
4. **Sitemap**: XML sitemap for search engines
5. **Canonical URLs**: To prevent duplicate content issues

## Security Considerations

### Static Site Advantages
1. **No Server-Side Code**: Reduced attack surface
2. **No Database**: No database vulnerabilities
3. **HTTPS**: Enforced through GitHub Pages
4. **Content Security Policy**: Implemented for additional protection
5. **External Services**: Carefully vetted for security

### Form Handling Security
1. **CSRF Protection**: Implemented through form service
2. **Data Validation**: Client and service-side validation
3. **Rate Limiting**: To prevent abuse
4. **Secure Transmission**: Data sent over HTTPS
5. **Privacy Considerations**: Compliance with privacy regulations
