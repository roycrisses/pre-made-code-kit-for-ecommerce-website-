// Clear browser localStorage cache for the clothing store app
console.log('Clearing browser cache...');

// Clear all localStorage items related to the app
const keysToRemove = [
  'heroProducts',
  'featuredProducts', 
  'products',
  'cart',
  'user',
  'token'
];

keysToRemove.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`Removed: ${key}`);
  }
});

// Clear all localStorage (alternative approach)
// localStorage.clear();

console.log('Cache cleared! Please refresh the page.');
