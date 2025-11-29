
export const removeBackground = (imageSrc: string, tolerance: number = 20): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const totalPixels = data.length / 4;
      
      // Sample background color from the top-left corner
      const bgR = data[0];
      const bgG = data[1];
      const bgB = data[2];
      
      // Helper to calculate color distance
      const isCloseToBg = (r: number, g: number, b: number) => {
         const distance = Math.sqrt(
           Math.pow(r - bgR, 2) + 
           Math.pow(g - bgG, 2) + 
           Math.pow(b - bgB, 2)
         );
         return distance < tolerance;
      };

      for (let i = 0; i < totalPixels; i++) {
        const idx = i * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        
        if (isCloseToBg(r, g, b)) {
          data[idx + 3] = 0; // Set alpha to 0 (transparent)
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL());
    };
    
    img.onerror = (e) => reject(e);
    img.src = imageSrc;
  });
};
