const axios = require('axios');
const { parsePhoneNumberFromString } = require('libphonenumber-js');
require('dotenv').config();

// Phone number validation using libphonenumber-js
const validatePhoneNumber = (phoneNumber, countryCode = 'NP') => {
  try {
    const phone = parsePhoneNumberFromString(phoneNumber, countryCode);
    return {
      isValid: phone && phone.isValid(),
      formatted: phone ? phone.formatInternational() : null,
      country: phone ? phone.country : null
    };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
};

// Address validation using Loqate (Pitney Bowes)
const validateAddress = async (address) => {
  try {
    const response = await axios.get('https://api.addressy.com/Capture/Interactive/Find/v1.10/json3.ws', {
      params: {
        Key: process.env.ADDRESS_VALIDATION_KEY,
        Text: address,
        Container: '',
        Origin: '',
        Countries: 'US,CA,GB,AU,NP', // Add more country codes as needed
        Limit: 5,
        Language: 'en'
      }
    });
    
    return {
      isValid: response.data.Items && response.data.Items.length > 0,
      suggestions: response.data.Items || []
    };
  } catch (error) {
    console.error('Address validation error:', error.message);
    return { isValid: false, error: error.message };
  }
};

// Format address for display
const formatAddress = (address) => {
  if (!address) return '';
  
  const { line1, line2, city, state, postalCode, country } = address;
  const parts = [line1];
  
  if (line2) parts.push(line2);
  if (city) parts.push(city);
  if (state) parts.push(state);
  if (postalCode) parts.push(postalCode);
  if (country) parts.push(country);
  
  return parts.join(', ');
};

module.exports = {
  validatePhoneNumber,
  validateAddress,
  formatAddress
};
