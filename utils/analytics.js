// Frontend Google Analytics 4 (GA4) Integration
const initGA = () => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
  }
};

// Track page views
const trackPageView = (url) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Track events
const trackEvent = (action, category, label, value = '') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }
};

// Track ecommerce events
const ecommerceEvents = {
  // Track product views
  viewItem: (items) => {
    trackEvent('view_item', 'ecommerce', 'Product Viewed');
    if (window.gtag) {
      window.gtag('event', 'view_item', {
        items: items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          item_brand: item.brand,
          item_category: item.category,
          quantity: item.quantity || 1
        }))
      });
    }
  },

  // Track add to cart
  addToCart: (items) => {
    trackEvent('add_to_cart', 'ecommerce', 'Product Added to Cart');
    if (window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'USD',
        value: items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0),
        items: items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          item_brand: item.brand,
          item_category: item.category,
          quantity: item.quantity || 1
        }))
      });
    }
  },

  // Track purchase
  purchase: (transaction, items) => {
    trackEvent('purchase', 'ecommerce', 'Purchase Completed', transaction.value);
    if (window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: transaction.id,
        value: transaction.value,
        currency: transaction.currency || 'USD',
        tax: transaction.tax || 0,
        shipping: transaction.shipping || 0,
        items: items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          item_brand: item.brand,
          item_category: item.category,
          quantity: item.quantity || 1
        }))
      });
    }
  }
};

// Server-side tracking (for API routes)
const serverSideTrack = async (event, params = {}) => {
  if (process.env.GA_MEASUREMENT_ID && process.env.GA_API_SECRET) {
    try {
      const measurementId = process.env.GA_MEASUREMENT_ID;
      const apiSecret = process.env.GA_API_SECRET;
      
      const response = await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`, {
        method: 'POST',
        body: JSON.stringify({
          client_id: params.clientId || 'server',
          events: [{
            name: event,
            params: {
              ...params,
              timestamp_micros: Date.now() * 1000
            }
          }]
        })
      });

      if (!response.ok) {
        console.error('GA4 tracking failed:', await response.text());
      }
    } catch (error) {
      console.error('Error sending to GA4:', error);
    }
  }
};

module.exports = {
  initGA,
  trackPageView,
  trackEvent,
  ecommerceEvents,
  serverSideTrack
};
