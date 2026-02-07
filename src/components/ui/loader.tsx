import React from 'react';
import loaderGif from '../../assets/ERPV4 Loader.gif';

type LoaderProps = {
  size?: number | string;
  className?: string;
  alt?: string;
};

const Loader: React.FC<LoaderProps> = ({ size = 32, className = '', alt = 'Loading' }) => {
  const src = loaderGif;

  // If the GIF is not available, fall back to inline SVG spinner
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src={src}
        alt={alt}
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 50 50');
            svg.setAttribute('width', String(size));
            svg.setAttribute('height', String(size));
            svg.innerHTML = `<circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-dasharray="31.415,31.415" transform="rotate(0 25 25)">
            <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
          </circle>`;
            parent.appendChild(svg);
          }
        }}
        style={{ width: size, height: size, objectFit: 'contain' }}
      />
    </div>
  );
};

export default Loader;
