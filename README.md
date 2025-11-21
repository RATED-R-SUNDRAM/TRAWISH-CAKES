# Trawish Cakes Website

A beautiful, responsive cake company website with animations, dynamic image loading, and email integration.

## Features

- 🎂 **Cake Splitting Animation** - Animated welcome screen when the site loads
- 📸 **Dynamic Image Gallery** - Automatically loads images from the CAKE IMAGES folder
- ⭐ **Glittery Stars** - Animated stars in the background
- 🎨 **Responsive Design** - Works perfectly on all devices (mobile, tablet, desktop)
- 📧 **Email Integration** - Order form sends emails to owner and customer
- 🎯 **Child-Friendly** - Large, easy-to-click buttons and colorful design
- 🔄 **Auto-Update** - Images automatically update when you add new ones to the folder

## Setup Instructions

### Basic Setup

1. The website is ready to use! Just open `index.html` in a web browser.

2. **For Email Integration (Optional but Recommended):**

   The website currently uses a fallback email method (mailto links). For better email automation, set up EmailJS:

   a. Go to [EmailJS.com](https://www.emailjs.com) and create a free account
   
   b. Create an email service (Gmail, Outlook, etc.)
   
   c. Create email templates:
      - **Order Template**: For receiving new orders
      - **Acceptance Template**: For customer confirmation
   
   d. Get your Public Key, Service ID, and Template IDs
   
   e. Update `script.js`:
      - Replace `YOUR_PUBLIC_KEY` with your EmailJS Public Key
      - Replace `YOUR_SERVICE_ID` with your Service ID
      - Replace `YOUR_TEMPLATE_ID` with your Order Template ID
   
   f. Update `accept-order.html`:
      - Replace `YOUR_PUBLIC_KEY` with your EmailJS Public Key
      - Replace `YOUR_SERVICE_ID` with your Service ID
      - Replace `YOUR_ACCEPTANCE_TEMPLATE_ID` with your Acceptance Template ID
      - Replace `YOUR_DECLINE_TEMPLATE_ID` with your Decline Template ID

### Email Template Variables

For the **Order Template**, use these variables:
- `{{to_email}}` - Owner's email (ss6437p@gmail.com)
- `{{customer_name}}` - Customer's name
- `{{customer_email}}` - Customer's email
- `{{customer_phone}}` - Customer's phone
- `{{cake_type}}` - Type of cake
- `{{cake_weight}}` - Cake size/weight
- `{{delivery_date}}` - Delivery date
- `{{customization}}` - Customization details
- `{{special_requests}}` - Special requests/allergies
- `{{order_id}}` - Unique order ID
- `{{acceptance_link}}` - Link to accept the order

For the **Acceptance Template**, use:
- `{{to_email}}` - Customer's email
- `{{customer_name}}` - Customer's name
- `{{order_id}}` - Order ID
- `{{subject}}` - Email subject
- `{{message}}` - Confirmation message

## How It Works

1. **Home Page**: Displays with cake splitting animation, random background cake images, and glittery stars
2. **Order Form**: Click "Place an Order" button to open the attractive cake-themed form
3. **Order Submission**: Form data is sent via email to ss6437p@gmail.com with an acceptance link
4. **Order Acceptance**: Click the acceptance link to accept/decline the order
5. **Customer Confirmation**: Once accepted, customer receives a confirmation email

## Image Management

- Add new cake images to the `CAKE IMAGES` folder
- The gallery will automatically update when the page refreshes
- Images are randomly selected for the background
- All images are dynamically loaded, so no code changes needed when adding/removing images

## File Structure

```
TRAWISH CAKES/
├── index.html              # Main website page
├── styles.css              # All styling and animations
├── script.js               # JavaScript functionality
├── accept-order.html       # Order acceptance page
├── CAKE IMAGES/            # Cake images folder
└── LOGO/                   # Logo folder
```

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Notes

- The website uses modern CSS and JavaScript features
- EmailJS free tier allows 200 emails per month
- Images should be in JPG, PNG, or WebP format for best compatibility
- The site is fully responsive and will scale automatically to fit any screen size

## Support

For issues or questions, contact: ss6437p@gmail.com

