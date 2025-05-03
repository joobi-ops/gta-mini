/**
 * Utility functions for the game
 */

// Random number generator between min and max (inclusive)
function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Check collision between two rectangles
function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

// Calculate distance between two points
function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Get angle between two points (in radians)
function getAngle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

// Convert angle to direction (4 or 8 directions)
function angleToDirection(angle, directions = 4) {
    angle = angle * (180 / Math.PI); // Convert to degrees
    if (angle < 0) angle += 360; // Normalize to 0-360
    
    if (directions === 4) {
        // 4-direction (up, right, down, left)
        if (angle >= 315 || angle < 45) return 'right';
        if (angle >= 45 && angle < 135) return 'down';
        if (angle >= 135 && angle < 225) return 'left';
        return 'up';
    } else {
        // 8-direction (including diagonals)
        if (angle >= 337.5 || angle < 22.5) return 'right';
        if (angle >= 22.5 && angle < 67.5) return 'down-right';
        if (angle >= 67.5 && angle < 112.5) return 'down';
        if (angle >= 112.5 && angle < 157.5) return 'down-left';
        if (angle >= 157.5 && angle < 202.5) return 'left';
        if (angle >= 202.5 && angle < 247.5) return 'up-left';
        if (angle >= 247.5 && angle < 292.5) return 'up';
        return 'up-right';
    }
}

// Linear interpolation
function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

// Sound manager
const SoundManager = {
    sounds: {},
    
    // Load a sound
    load: function(name, src, volume = 1.0) {
        const sound = new Audio(src);
        sound.volume = volume;
        this.sounds[name] = sound;
    },
    
    // Play a sound
    play: function(name, loop = false) {
        if (!this.sounds[name]) return;
        
        // Clone the sound to allow overlapping plays
        const soundClone = this.sounds[name].cloneNode();
        soundClone.loop = loop;
        soundClone.play();
        return soundClone;
    },
    
    // Stop all sounds
    stopAll: function() {
        for (const name in this.sounds) {
            this.sounds[name].pause();
            this.sounds[name].currentTime = 0;
        }
    }
};

// Particle system
class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    // Add a particle
    add(x, y, vx, vy, size, color, life, gravity = 0) {
        this.particles.push({
            x, y, vx, vy, size, color, life, gravity,
            maxLife: life
        });
    }
    
    // Create an explosion effect
    createExplosion(x, y, count = 20, size = 5, color = '#ff3300') {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const particleSize = size * (0.5 + Math.random() * 0.5);
            const life = 30 + Math.random() * 30;
            
            this.add(x, y, vx, vy, particleSize, color, life, 0.1);
        }
    }
    
    // Update all particles
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Update position
            p.x += p.vx;
            p.y += p.vy;
            
            // Apply gravity
            p.vy += p.gravity;
            
            // Decrease life
            p.life--;
            
            // Remove dead particles
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    // Draw all particles
    draw(ctx) {
        for (const p of this.particles) {
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
}

// Messaging system for on-screen notifications
const MessageSystem = {
    messages: [],
    
    // Add a message
    add: function(text, duration = 3000) {
        const message = {
            text,
            duration,
            opacity: 0,
            y: 100,
            timestamp: Date.now()
        };
        
        this.messages.push(message);
        
        // Remove the message after its duration
        setTimeout(() => {
            const index = this.messages.indexOf(message);
            if (index !== -1) {
                this.messages.splice(index, 1);
            }
        }, duration);
    },
    
    // Update all messages
    update: function() {
        const now = Date.now();
        for (const message of this.messages) {
            const elapsed = now - message.timestamp;
            
            // Fade in
            if (elapsed < 500) {
                message.opacity = elapsed / 500;
                message.y = 100 + (1 - message.opacity) * 20;
            } 
            // Fade out
            else if (elapsed > message.duration - 500) {
                message.opacity = (message.duration - elapsed) / 500;
                message.y = 100 - (1 - message.opacity) * 20;
            } 
            // Stable
            else {
                message.opacity = 1;
                message.y = 100;
            }
        }
    },
    
    // Draw all messages
    draw: function(ctx) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = 'bold 20px Arial';
        
        // Position messages vertically
        let yOffset = 0;
        for (const message of this.messages) {
            ctx.fillStyle = `rgba(255, 255, 255, ${message.opacity})`;
            ctx.strokeStyle = `rgba(0, 0, 0, ${message.opacity})`;
            ctx.lineWidth = 3;
            
            const y = message.y + yOffset;
            
            // Text shadow for better visibility
            ctx.strokeText(message.text, ctx.canvas.width / 2, y);
            ctx.fillText(message.text, ctx.canvas.width / 2, y);
            
            yOffset += 30;
        }
        ctx.restore();
    }
};