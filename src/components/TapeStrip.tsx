import React from 'react';

interface TapeStripProps {
  position?: 'top-center' | 'top-left' | 'top-right';
}

export const TapeStrip: React.FC<TapeStripProps> = ({ position = 'top-center' }) => {
  return <div className={`tape-strip ${position}`} aria-hidden="true" />;
};
