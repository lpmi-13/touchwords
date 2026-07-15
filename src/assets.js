import diamond from '../assets/images/diamond.png?inline';
import heart from '../assets/images/Heart.png?inline';

export const assets = Object.freeze({
  logo: new URL('../assets/images/logo.png', import.meta.url).href,
  heart,
  diamond,
  backgrounds: [
    new URL('../assets/images/voodoo_cactus_island_scaled.jpg', import.meta.url).href,
    new URL('../assets/images/fishbgexp_scaled.jpg', import.meta.url).href,
    new URL('../assets/images/cloudsinthedesert_scaled.jpg', import.meta.url).href,
  ],
});
