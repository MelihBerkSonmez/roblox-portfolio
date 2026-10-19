const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

let particles = [];
const mouse = { x: null, y: null, radius: 150 };

// Initial Target Color is White (255, 255, 255)
let globalTargetColor = { r: 255, g: 255, b: 255 };

class Pixel {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 2;
        
        // Random velocity for floating effect
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        
        // Spawn color: White
        this.r = 255;
        this.g = 255;
        this.b = 255;
    }

    update() {
        // Move pixels
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off screen edges
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        // COLOR LERPING: Move current color toward globalTargetColor
        // 0.05 is the "Tween" speed. Lower is slower/smoother.
        this.r += (globalTargetColor.r - this.r) * 0.05;
        this.g += (globalTargetColor.g - this.g) * 0.05;
        this.b += (globalTargetColor.b - this.b) * 0.05;

        // Mouse Interaction: Grow when mouse is near
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
            // Grows based on proximity
            this.size = 15 * (1 - distance / mouse.radius) + 2;
        } else {
            // Shrinks back to normal floating size
            if (this.size > 3) this.size -= 0.1;
        }
    }

    draw() {
        // Floor the numbers to keep them valid RGB values
        ctx.fillStyle = `rgb(${Math.floor(this.r)}, ${Math.floor(this.g)}, ${Math.floor(this.b)})`;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

// SECTION COLORS: Matches the IDs in your HTML
const sectionColors = {
    'me': { r: 255, g: 255, b: 255 },                    // White
    'experience-education': { r: 255, g: 0, b: 122 },    // Neon Pink
    'past-works': { r: 0, g: 209, b: 255 },              // Electric Blue
    'how-do-i-work': { r: 255, g: 165, b: 0 },           // Orange
    'genai-policy': { r: 80, g: 220, b: 120 },           // Green
    'contact': { r: 180, g: 100, b: 255 }                // Purple
};

// SCROLL DETECTION: Changes globalTargetColor based on visible section
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const color = sectionColors[entry.target.id];
            if (color) {
                globalTargetColor = color;
            }
        }
    });
}, { threshold: 0.5 }); // Trigger when section is 50% on screen

// Watch all section elements
document.querySelectorAll('section').forEach(s => observer.observe(s));

// --- ENGINE SETUP ---

function init() {
    particles = [];
    const particleCount = 120;
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Pixel(Math.random() * canvas.width, Math.random() * canvas.height));
    }
}

function animate() {
    // Semi-transparent background creates a faint trail effect
    ctx.fillStyle = 'rgba(26, 26, 26, 0.4)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animate);
}

// --- EVENT LISTENERS ---

window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

// Click "Speed Boost" (Like an explosion without spawning new parts)
window.addEventListener('mousedown', () => {
    particles.forEach(p => { p.vx *= 4; p.vy *= 4; });
});

window.addEventListener('mouseup', () => {
    setTimeout(() => {
        particles.forEach(p => { p.vx /= 4; p.vy /= 4; });
    }, 200);
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init(); // Respawn particles to fit new screen size
});

// Start the engine
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
init();
animate();
