// Utility function to get the full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  const API_URL = process.env.REACT_APP_URL;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it starts with /images/, construct the full backend URL
  if (imagePath.startsWith('/images/')) {
    return `${API_URL}${imagePath}`;
  }
  
  // If it's just the filename, add the full path
  if (imagePath.startsWith('images/')) {
    return `${API_URL}/${imagePath}`;
  }
  
  // Default case - assume it's just a filename
  return `${API_URL}/images/${imagePath}`;
}; 