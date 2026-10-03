import React, { useEffect, useRef } from 'react';

interface Props { score: number; headline: string; burn: string }

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number): number {
  let line = '';
  for (const word of text.split(/\s+/)) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineH;
    } else line = test;
  }
  ctx.fillText(line, x, y);
  return y + lineH;
}

export const ShareCard: React.FC<Props> = ({ score, headline, burn }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    const draw = (img?: HTMLImageElement) => {
      ctx.fillStyle = '#F4EEDD'; ctx.fillRect(0, 0, 1080, 1080);
      ctx.strokeStyle = '#111'; ctx.lineWidth = 8; ctx.strokeRect(40, 40, 1000, 1000);
      ctx.fillStyle = '#111'; ctx.font = '700 40px system-ui, sans-serif';
      ctx.fillText('RESUME ROAST BATTLE', 90, 120);
      ctx.font = '800 300px system-ui, sans-serif'; ctx.fillText(String(score), 90, 420);
      ctx.font = '600 44px system-ui, sans-serif'; ctx.fillText('/ 100', 90 + ctx.measureText(String(score)).width * 0 + 560, 420);
      if (img) ctx.drawImage(img, 760, 150, 240, 240);
      ctx.font = '800 54px system-ui, sans-serif';
      let y = wrap(ctx, headline.toUpperCase(), 90, 540, 900, 64);
      ctx.font = 'italic 500 42px Georgia, serif';
      if (burn) wrap(ctx, `"${burn}"`, 90, y + 50, 900, 56);
      ctx.font = '600 30px system-ui, sans-serif'; ctx.fillStyle = '#666';
      ctx.fillText('Roasted by two rabbits. No resumes were stored.', 90, 990);
    };
    draw();
    const img = new Image();
    img.onload = () => draw(img);
    img.src = '/mascots/recruiter-avatar.png';
  }, [score, headline, burn]);

  const download = () => {
    ref.current?.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'resume-roast.png';
      a.click();
      URL.revokeObjectURL(a.href);
    });
  };

  return (
    <div className="feature-card">
      <span className="feature-title">Share your roast</span>
      <canvas ref={ref} width={1080} height={1080} className="share-canvas" />
      <button type="button" className="btn btn-primary" onClick={download}>Download roast card</button>
    </div>
  );
};
