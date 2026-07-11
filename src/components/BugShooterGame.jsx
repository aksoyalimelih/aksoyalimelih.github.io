import React, { useEffect, useRef, useState } from 'react';
import sfx from '../utils/sfx';

const BugShooterGame = ({ onClose }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  // Game states
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('gameHighScore') || '0'));
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState('menu'); // menu, playing, gameover

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;

    // Canvas sizing based on container width
    const resizeCanvas = () => {
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = Math.min(450, rect.width * 0.7);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Entity lists
    const lasers = [];
    const bugs = [];
    const particles = [];
    
    // Player ship config
    const player = {
      x: canvas.width / 2,
      y: canvas.height - 35,
      width: 25,
      height: 20,
      speed: 8,
      color: '#00f2fe'
    };

    // Keyboard inputs
    const keys = {};

    const handleKeyDown = (e) => {
      keys[e.code] = true;
      if (e.code === 'Space' && gameState === 'playing') {
        e.preventDefault(); // prevent scroll
        shootLaser();
      }
    };

    const handleKeyUp = (e) => {
      keys[e.code] = false;
    };

    // Mouse control
    const handleMouseMove = (e) => {
      if (gameState !== 'playing') return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      player.x = Math.max(player.width, Math.min(canvas.width - player.width, mouseX));
    };

    const handleCanvasClick = () => {
      if (gameState === 'playing') {
        shootLaser();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleCanvasClick);

    // Spawn configs
    let spawnTimer = 0;
    let spawnRate = 90; // spawn bug every 90 frames
    let speedMultiplier = 1;

    // Laser class
    class Laser {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 7;
        this.radius = 2.5;
        this.color = '#ff007f';
      }
      update() {
        this.y -= this.speed;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Bug class (Enemies)
    class Bug {
      constructor() {
        this.x = Math.random() * (canvas.width - 40) + 20;
        this.y = -20;
        this.speed = (Math.random() * 1.5 + 1) * speedMultiplier;
        this.radius = Math.random() * 6 + 9; // Size
        this.color = '#e11d48'; // Rosy red bug
        this.legsAngle = 0;
      }
      update() {
        this.y += this.speed;
        this.legsAngle += 0.15;
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Draw bug legs (little spider-like lines)
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.8;
        for (let i = 0; i < 6; i++) {
          const angleOffset = Math.sin(this.legsAngle + i) * 0.25;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          const xDir = i < 3 ? -1 : 1;
          const yDir = (i % 3 - 1) * 6;
          ctx.lineTo(xDir * (this.radius + 6), yDir + angleOffset * 10);
          ctx.stroke();
        }

        // Draw bug body
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw bug eyes (little glowing dots)
        ctx.beginPath();
        ctx.arc(-3, -2, 2, 0, Math.PI * 2);
        ctx.arc(3, -2, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        ctx.restore();
      }
    }

    // Explosion Particle class
    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.015;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color.replace(')', `, ${this.alpha})`).replace('rgb', 'rgba');
        ctx.fill();
      }
    }

    const shootLaser = () => {
      lasers.push(new Laser(player.x, player.y - 12));
      sfx.playLaser();
    };

    const spawnBug = () => {
      bugs.push(new Bug());
    };

    const triggerExplosion = (x, y, color) => {
      for (let i = 0; i < 15; i++) {
        particles.push(new Particle(x, y, color || 'rgb(225, 29, 72)'));
      }
    };

    // Reset game parameters
    const restartGame = () => {
      lasers.length = 0;
      bugs.length = 0;
      particles.length = 0;
      setScore(0);
      setLives(3);
      setGameState('playing');
      setIsPlaying(true);
      player.x = canvas.width / 2;
      spawnTimer = 0;
      speedMultiplier = 1;
      spawnRate = 90;
    };

    // Game loop
    const gameLoop = () => {
      // Clear Screen
      ctx.fillStyle = 'rgba(7, 8, 14, 0.4)'; // trails effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (gameState === 'playing') {
        // Player keyboard controls fallback
        if (keys['ArrowLeft'] || keys['KeyA']) {
          player.x = Math.max(player.width, player.x - player.speed);
        }
        if (keys['ArrowRight'] || keys['KeyD']) {
          player.x = Math.min(canvas.width - player.width, player.x + player.speed);
        }

        // Draw Player Ship (Glowy triangle fighter)
        ctx.beginPath();
        ctx.moveTo(player.x, player.y - 12); // nose
        ctx.lineTo(player.x - player.width, player.y + player.height); // bottom left
        ctx.lineTo(player.x + player.width, player.y + player.height); // bottom right
        ctx.closePath();
        
        ctx.fillStyle = player.color;
        ctx.shadowColor = player.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw Ship detail lines
        ctx.beginPath();
        ctx.moveTo(player.x, player.y - 4);
        ctx.lineTo(player.x, player.y + player.height);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Increment spawn rates dynamically based on score
        speedMultiplier = 1 + score * 0.05;
        spawnRate = Math.max(30, 90 - score * 2);

        // Spawn bugs
        spawnTimer++;
        if (spawnTimer >= spawnRate) {
          spawnBug();
          spawnTimer = 0;
        }

        // Update & Draw lasers
        for (let i = lasers.length - 1; i >= 0; i--) {
          lasers[i].update();
          lasers[i].draw();
          
          // Remove out of bounds
          if (lasers[i].y < 0) {
            lasers.splice(i, 1);
          }
        }

        // Update & Draw bugs
        for (let i = bugs.length - 1; i >= 0; i--) {
          bugs[i].update();
          bugs[i].draw();

          // Bug hitting player ship (Collision)
          const distToPlayer = Math.hypot(bugs[i].x - player.x, bugs[i].y - player.y);
          if (distToPlayer < bugs[i].radius + 15) {
            triggerExplosion(bugs[i].x, bugs[i].y, 'rgb(0, 242, 254)');
            triggerExplosion(player.x, player.y, 'rgb(255, 0, 127)');
            sfx.playExplosion();
            bugs.splice(i, 1);
            
            setLives(prev => {
              const updated = prev - 1;
              if (updated <= 0) {
                setGameState('gameover');
                setIsPlaying(false);
              }
              return updated;
            });
            continue;
          }

          // Bug escaping past screen bottom (lose life)
          if (bugs[i].y > canvas.height + 20) {
            bugs.splice(i, 1);
            setLives(prev => {
              const updated = prev - 1;
              if (updated <= 0) {
                setGameState('gameover');
                setIsPlaying(false);
              }
              return updated;
            });
            continue;
          }

          // Collision detection between laser and bug
          for (let j = lasers.length - 1; j >= 0; j--) {
            const dist = Math.hypot(bugs[i].x - lasers[j].x, bugs[i].y - lasers[j].y);
            if (dist < bugs[i].radius + lasers[j].radius) {
              // Boom!
              triggerExplosion(bugs[i].x, bugs[i].y, 'rgb(225, 29, 72)');
              sfx.playExplosion();
              bugs.splice(i, 1);
              lasers.splice(j, 1);
              
              setScore(prev => {
                const nextScore = prev + 1;
                // Highscore checks
                if (nextScore > highScore) {
                  setHighScore(nextScore);
                  localStorage.setItem('gameHighScore', nextScore.toString());
                }
                return nextScore;
              });
              break;
            }
          }
        }

        // Update & Draw explosion particles
        for (let i = particles.length - 1; i >= 0; i--) {
          particles[i].update();
          particles[i].draw();
          if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
          }
        }
      } else {
        // Menu or Game Over layout
        ctx.fillStyle = '#fff';
        ctx.font = "20px 'Orbitron'";
        ctx.textAlign = 'center';
        
        if (gameState === 'menu') {
          ctx.fillText("BUG_SHOOTER_IDE_v1.0", canvas.width / 2, canvas.height / 2 - 30);
          ctx.font = "12px 'Outfit'";
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.fillText("Fare hareketi ile geminizi yönlendirin.", canvas.width / 2, canvas.height / 2 + 10);
          ctx.fillText("Ateş etmek için fareye tıklayın veya SPACE tuşuna basın.", canvas.width / 2, canvas.height / 2 + 30);
          
          // Draw a button box
          ctx.fillStyle = 'rgba(0, 242, 254, 0.15)';
          ctx.strokeStyle = '#00f2fe';
          ctx.lineWidth = 1;
          ctx.fillRect(canvas.width / 2 - 75, canvas.height / 2 + 65, 150, 40);
          ctx.strokeRect(canvas.width / 2 - 75, canvas.height / 2 + 65, 150, 40);
          
          ctx.fillStyle = '#fff';
          ctx.font = "600 13px 'Orbitron'";
          ctx.fillText("BAŞLAT [ENTER]", canvas.width / 2, canvas.height / 2 + 89);
        } else if (gameState === 'gameover') {
          ctx.fillStyle = '#ef4444';
          ctx.fillText("DERLEME HATASI (GAME OVER)", canvas.width / 2, canvas.height / 2 - 30);
          ctx.font = "14px 'Outfit'";
          ctx.fillStyle = '#fff';
          ctx.fillText(`Toplam Temizlenen Bug: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
          
          // Draw restart button
          ctx.fillStyle = 'rgba(157, 78, 221, 0.15)';
          ctx.strokeStyle = '#9d4edd';
          ctx.lineWidth = 1;
          ctx.fillRect(canvas.width / 2 - 75, canvas.height / 2 + 55, 150, 40);
          ctx.strokeRect(canvas.width / 2 - 75, canvas.height / 2 + 55, 150, 40);
          
          ctx.fillStyle = '#fff';
          ctx.font = "600 13px 'Orbitron'";
          ctx.fillText("TEKRAR DENE", canvas.width / 2, canvas.height / 2 + 79);
        }
      }

      animId = requestAnimationFrame(gameLoop);
    };

    const handleMenuInput = (e) => {
      if (e.code === 'Enter') {
        if (gameState === 'menu' || gameState === 'gameover') {
          restartGame();
        }
      }
    };

    const handleOverlayClick = (e) => {
      if (gameState !== 'playing') {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        if (gameState === 'menu') {
          if (clickX > canvas.width / 2 - 75 && clickX < canvas.width / 2 + 75 &&
              clickY > canvas.height / 2 + 65 && clickY < canvas.height / 2 + 105) {
            restartGame();
          }
        } else if (gameState === 'gameover') {
          if (clickX > canvas.width / 2 - 75 && clickX < canvas.width / 2 + 75 &&
              clickY > canvas.height / 2 + 55 && clickY < canvas.height / 2 + 95) {
            restartGame();
          }
        }
      }
    };

    window.addEventListener('keydown', handleMenuInput);
    canvas.addEventListener('click', handleOverlayClick);

    animId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keydown', handleMenuInput);
      window.removeEventListener('resize', resizeCanvas);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('click', handleCanvasClick);
        canvas.removeEventListener('click', handleOverlayClick);
      }
      cancelAnimationFrame(animId);
    };
  }, [gameState, score, highScore]);

  return (
    <div className="bug-shooter-game-container">
      <div className="game-hud mb-3">
        <div className="hud-metric font-mono">
          <span>BUGS_SHOT:</span> <span className="text-gradient font-heavy">{score}</span>
        </div>
        <div className="hud-metric font-mono">
          <span>HIGH_SCORE:</span> <span className="text-gradient-purple">{highScore}</span>
        </div>
        <div className="hud-lives">
          {[...Array(3)].map((_, i) => (
            <span key={i} className={`heart-icon ${i < lives ? 'active' : 'dead'}`}>
              ⚡
            </span>
          ))}
        </div>
      </div>
      
      <div ref={containerRef} className="game-canvas-wrapper glass-card">
        <canvas ref={canvasRef} style={{ display: 'block', cursor: gameState === 'playing' ? 'none' : 'default' }} />
      </div>
      
      <div className="game-controls-help font-mono text-center text-xs mt-3 text-muted">
        [MOUSE] gemiyi hareket ettirir, [TIKLA/SPACE] lazer fırlatır
      </div>
    </div>
  );
};

export default BugShooterGame;
