// Comprehensive list of popular travel destinations
export const DESTINATIONS = [
  // Bangladesh
  "Dhaka", "Chittagong", "Cox's Bazar", "Sylhet", "Rangamati", "Bandarban", 
  "Khagrachari", "Sundarbans", "Kuakata", "Saint Martin's Island", "Srimangal",
  "Paharpur", "Mahasthangarh", "Bagerhat", "Panchagarh", "Bogura", "Rajshahi",
  "Khulna", "Barisal", "Mymensingh", "Comilla", "Tangail", "Jessore", "Dinajpur",
];

// Function to filter destinations based on user input
export const filterDestinations = (input, limit = 10) => {
  if (!input || input.length < 1) return [];
  
  const inputLower = input.toLowerCase();
  
  // First priority: exact matches at the beginning
  const exactMatches = DESTINATIONS.filter(dest => 
    dest.toLowerCase().startsWith(inputLower)
  );
  
  // Second priority: contains the input
  const containsMatches = DESTINATIONS.filter(dest => 
    dest.toLowerCase().includes(inputLower) && 
    !dest.toLowerCase().startsWith(inputLower)
  );
  
  // Combine and limit results
  const allMatches = [...exactMatches, ...containsMatches];
  return allMatches.slice(0, limit);
};

// Function to get random popular destinations for placeholder suggestions
export const getPopularDestinations = (count = 5) => {
  const popular = [
    "Cox's Bazar", "Dhaka", "Sylhet", "Bandarban", "Sundarbans",
    "Tokyo", "Paris", "London", "New York", "Bali",
    "Bangkok", "Singapore", "Sydney", "Dubai", "Rome"
  ];
  
  return popular.slice(0, count);
}; 