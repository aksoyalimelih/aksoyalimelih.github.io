import React, { useEffect, useRef } from 'react';

const TechBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const gridSize = 80;
    let cols = Math.ceil(width / gridSize) + 1;
    let rows = Math.ceil(height / gridSize) + 1;

    let activePrimaryColor = 'rgba(0, 242, 254, 0.12)';
    let activeGlowColor = 'rgba(0, 242, 254, 0.75)';
    
    // Matrix Rain Mode toggle
    let isMatrixRainMode = false;

    const circuits = [];
    const maxCircuits = Math.min(35, Math.floor((width * height) / 45000));
    
    const binaryDrops = [];
    const binaryFontSize = 10;
    let binaryCols = Math.floor(width / 30);
    
    const initBinaryDrops = () => {
      binaryCols = Math.floor(width / (isMatrixRainMode ? 15 : 40));
      binaryDrops.length = 0;
      for (let i = 0; i < binaryCols; i++) {
        binaryDrops[i] = Math.random() * -height;
      }
    };

    const mouse = { x: null, y: null, radius: 180 };

    class Circuit {
      constructor() {
        this.reset();
      }

      reset() {
        const gridX = Math.floor(Math.random() * cols);
        const gridY = Math.floor(Math.random() * rows);
        this.x = gridX * gridSize;
        this.y = gridY * gridSize;
        
        this.path = [{ x: this.x, y: this.y }];
        this.color = Math.random() > 0.4 ? activePrimaryColor : 'rgba(157, 78, 221, 0.12)';
        this.glowColor = this.color.replace('0.12', '0.75');
        
        const segments = Math.floor(Math.random() * 3) + 2;
        let currentX = this.x;
        let currentY = this.y;
        
        const directions = [
          { dx: 1, dy: 0 },
          { dx: 0, dy: 1 },
          { dx: -1, dy: 0 },
          { dx: 0, dy: -1 },
          { dx: 1, dy: 1 },
          { dx: -1, dy: 1 },
          { dx: 1, dy: -1 },
          { dx: -1, dy: -1 }
        ];

        for (let i = 0; i < segments; i++) {
          const dir = directions[Math.floor(Math.random() * directions.length)];
          const length = (Math.floor(Math.random() * 3) + 1) * gridSize;
          
          currentX += dir.dx * length;
          currentY += dir.dy * length;
          
          this.path.push({ x: currentX, y: currentY });
        }

        this.life = 0;
        this.duration = Math.random() * 150 + 150;
        this.packetProgress = 0;
        this.packetSpeed = Math.random() * 0.006 + 0.004;
      }

      update() {
        this.life++;
        this.packetProgress += this.packetSpeed;
        
        // Dynamic color update if theme changes
        if (this.color.includes('rgba(0, 242, 254') && !activePrimaryColor.includes('0, 242, 254')) {
          this.color = activePrimaryColor;
          this.glowColor = activeGlowColor;
        }

        if (this.packetProgress >= 1 || this.life > this.duration) {
          this.reset();
        }
      }

      draw() {
        if (isMatrixRainMode) return; // Hide circuits in Matrix mode for aesthetic focus

        ctx.beginPath();
        ctx.moveTo(this.path[0].x, this.path[0].y);
        for (let i = 1; i < this.path.length; i++) {
          ctx.lineTo(this.path[i].x, this.path[i].y);
        }
        
        let isHighlighted = false;
        if (mouse.x !== null && mouse.y !== null) {
          for (const pt of this.path) {
            if (Math.hypot(mouse.x - pt.x, mouse.y - pt.y) < mouse.radius) {
              isHighlighted = true;
              break;
            }
          }
        }

        ctx.strokeStyle = isHighlighted ? this.glowColor.replace('0.75', '0.35') : this.color;
        ctx.lineWidth = isHighlighted ? 1.5 : 0.8;
        ctx.stroke();

        const totalSegments = this.path.length - 1;
        const targetSegmentProgress = this.packetProgress * totalSegments;
        const segmentIdx = Math.floor(targetSegmentProgress);
        
        if (segmentIdx >= 0 && segmentIdx < totalSegments) {
          const startPt = this.path[segmentIdx];
          const endPt = this.path[segmentIdx + 1];
          const segProgress = targetSegmentProgress - segmentIdx;
          
          const packetX = startPt.x + (endPt.x - startPt.x) * segProgress;
          const packetY = startPt.y + (endPt.y - startPt.y) * segProgress;
          
          ctx.beginPath();
          ctx.arc(packetX, packetY, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = isHighlighted ? '#fff' : this.glowColor;
          ctx.shadowColor = this.glowColor;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }

    // Spawn initial circuits
    for (let i = 0; i < maxCircuits; i++) {
      circuits.push(new Circuit());
    }
    
    initBinaryDrops();

    const drawGrid = () => {
      ctx.strokeStyle = isMatrixRainMode ? 'rgba(57, 255, 20, 0.01)' : 'rgba(0, 242, 254, 0.015)';
      ctx.lineWidth = 0.5;
      
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };

    const drawBinaryRain = () => {
      ctx.fillStyle = isMatrixRainMode ? 'rgba(57, 255, 20, 0.35)' : 'rgba(0, 242, 254, 0.04)';
      ctx.font = `${isMatrixRainMode ? 12 : binaryFontSize}px 'Orbitron'`;
      
      for (let i = 0; i < binaryDrops.length; i++) {
        const char = Math.random() > 0.5 ? '1' : '0';
        const x = i * (isMatrixRainMode ? 15 : 40);
        const y = binaryDrops[i];
        
        ctx.fillText(char, x, y);
        
        binaryDrops[i] += isMatrixRainMode ? 4 : 1.2; // Fall speed
        
        if (binaryDrops[i] > height && Math.random() > (isMatrixRainMode ? 0.95 : 0.98)) {
          binaryDrops[i] = Math.random() * -100;
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      drawGrid();
      
      circuits.forEach(c => {
        c.update();
        c.draw();
      });

      drawBinaryRain();

      // Cyber mouse target crosshair
      if (mouse.x !== null && mouse.y !== null) {
        const highlightColor = isMatrixRainMode ? 'rgba(57, 255, 20, 0.15)' : 'rgba(0, 242, 254, 0.15)';
        const dotColor = isMatrixRainMode ? 'rgba(57, 255, 20, 0.4)' : 'rgba(0, 242, 254, 0.4)';
        
        const gradient = ctx.createRadialGradient(
          mouse.x, mouse.y, 10,
          mouse.x, mouse.y, mouse.radius
        );
        gradient.addColorStop(0, isMatrixRainMode ? 'rgba(57, 255, 20, 0.03)' : 'rgba(0, 242, 254, 0.03)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = highlightColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 12, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      cols = Math.ceil(width / gridSize) + 1;
      rows = Math.ceil(height / gridSize) + 1;
      
      circuits.forEach(c => c.reset());
      initBinaryDrops();
    };

    // Listeners for theme and matrix events
    const handleThemeChange = (e) => {
      const theme = e.detail;
      activePrimaryColor = `rgba(${theme.primaryRgb}, 0.12)`;
      activeGlowColor = `rgba(${theme.primaryRgb}, 0.75)`;
      
      if (theme.id === 'matrix-green') {
        isMatrixRainMode = true;
      } else {
        isMatrixRainMode = false;
      }
      initBinaryDrops();
    };

    const handleMatrixRainToggle = () => {
      isMatrixRainMode = !isMatrixRainMode;
      initBinaryDrops();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseLeave);
    window.addEventListener('resize', handleResize);
    window.addEventListener('themeChange', handleThemeChange);
    window.addEventListener('matrixRainToggle', handleMatrixRainToggle);

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('themeChange', handleThemeChange);
      window.removeEventListener('matrixRainToggle', handleMatrixRainToggle);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="tech-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
};

export default TechBackground;
