import './styles.css';
import { TouchwordsApp } from './app.js';

function updateViewportHeight() {
  const height = window.visualViewport?.height ?? window.innerHeight;
  document.documentElement.style.setProperty('--viewport-height', `${height}px`);
}

const viewport = window.visualViewport ?? window;
viewport.addEventListener('resize', updateViewportHeight);
updateViewportHeight();

const root = document.querySelector('#app');
new TouchwordsApp(root).start();
