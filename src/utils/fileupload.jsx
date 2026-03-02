export const convertBase64ToBlob = (base64Data) => {
    if (!base64Data || typeof base64Data !== 'string') {
      throw new Error('Invalid base64 data provided');
    }
  
    // Remove the data URL prefix (if present)
    const base64String = base64Data.includes('data:') 
      ? base64Data.split(',')[1] 
      : base64Data;  // If no prefix, use the base64Data as is
    
    try {
      // Decode base64 string to binary data
      const byteCharacters = atob(base64String);
      const byteArrays = [];
  
      // Convert binary string to an array of bytes
      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);
        const byteNumbers = Array.from(slice, (char) => char.charCodeAt(0));
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
  
      // Return the Blob
      return new Blob(byteArrays, { type: 'application/pdf' });
    } catch (error) {
      throw new Error('Base64 data is not correctly encoded');
    }
  };
  