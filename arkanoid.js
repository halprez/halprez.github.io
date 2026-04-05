class ArkanoidGame {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.state = 'waiting'; // waiting, playing, won, lost
        this.originalHTML = container.innerHTML;
        this.score = 0;
        this.lives = 3;
        this.brickWords = [];
        this.bricks = [];
        this.ball = { x: 0, y: 0, dx: 0, dy: 0, radius: 6 };
        this.paddle = { x: 0, y: 0, width: 100, height: 12 };
        this.colors = this.readThemeColors();
        this.boundMouseMove = this.onMouseMove.bind(this);
        this.boundTouchMove = this.onTouchMove.bind(this);
        this.boundClick = this.onClick.bind(this);
        this.boundKeyDown = this.onKeyDown.bind(this);
        this.boundResize = this.onResize.bind(this);
    }

    readThemeColors() {
        const style = getComputedStyle(document.body);
        const theme = document.body.getAttribute('data-theme');
        const isDark = theme === 'dark' || theme === 'c64';

        return {
            bg: isDark ? '#1a1a2e' : '#f5f5f5',
            brick: isDark ? '#4a90e2' : '#333',
            brickText: isDark ? '#fff' : '#fff',
            brickStroke: isDark ? '#6ab0ff' : '#555',
            paddle: isDark ? '#e0e0e0' : '#1a1a1a',
            ball: isDark ? '#ffffff' : '#000000',
            text: isDark ? '#e0e0e0' : '#1a1a1a',
            textMuted: isDark ? '#aaa' : '#666',
            overlay: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)',
        };
    }

    start() {
        this.colors = this.readThemeColors();
        const aboutWindow = this.container.querySelector('.site-window');
        if (!aboutWindow) return;

        const bioEl = aboutWindow.querySelector('.bio');
        const bioText = bioEl ? bioEl.textContent : 'Arkanoid Game';
        this.brickWords = bioText.split(/\s+/).filter(w => w.length > 0);

        // Hide all windows except the first (About)
        const windows = this.container.querySelectorAll('.site-window');
        windows.forEach((w, i) => {
            if (i > 0) w.style.display = 'none';
        });

        // Hide the bottom nav bar
        const nav = document.querySelector('.floating-menu');
        if (nav) nav.style.display = 'none';

        // Replace window pane content with game canvas
        const pane = aboutWindow.querySelector('.window-pane');
        const titleBar = aboutWindow.querySelector('.title-bar .title');
        if (titleBar) titleBar.textContent = 'Arkanoid';

        // Add exit button
        const closeBtn = aboutWindow.querySelector('.close');
        if (closeBtn) {
            closeBtn.style.cursor = 'pointer';
            closeBtn.addEventListener('click', () => this.exit());
        }

        pane.innerHTML = `
            <div class="arkanoid-container">
                <div class="arkanoid-hud">
                    <span class="arkanoid-score">Score: 0</span>
                    <span class="arkanoid-lives">Lives: 3</span>
                </div>
                <canvas id="arkanoid-canvas"></canvas>
            </div>
        `;

        this.canvas = document.getElementById('arkanoid-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreEl = pane.querySelector('.arkanoid-score');
        this.livesEl = pane.querySelector('.arkanoid-lives');

        this.sizeCanvas();
        this.buildBricks();
        this.resetBallAndPaddle();
        this.attachEvents();
        this.state = 'waiting';
        this.draw();

        // Scroll to top so the game is visible
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    sizeCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        const w = Math.min(rect.width, 800);
        const h = Math.max(500, Math.min(window.innerHeight * 0.7, 700));
        this.canvas.width = w;
        this.canvas.height = h;
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';
    }

    buildBricks() {
        this.bricks = [];
        const cw = this.canvas.width;
        const ch = this.canvas.height;
        const cols = Math.min(6, Math.max(3, Math.floor(cw / 120)));
        const brickPadding = 6;
        const brickWidth = (cw - brickPadding * (cols + 1)) / cols;
        const brickHeight = 28;
        const topOffset = 20;

        let wordIndex = 0;
        const maxRows = Math.floor((ch * 0.45) / (brickHeight + brickPadding));
        const maxBricks = maxRows * cols;
        const totalWords = Math.min(this.brickWords.length, maxBricks);
        const rows = Math.ceil(totalWords / cols);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (wordIndex >= totalWords) break;
                this.bricks.push({
                    x: brickPadding + c * (brickWidth + brickPadding),
                    y: topOffset + r * (brickHeight + brickPadding),
                    w: brickWidth,
                    h: brickHeight,
                    word: this.brickWords[wordIndex],
                    alive: true,
                    opacity: 1,
                });
                wordIndex++;
            }
        }
    }

    resetBallAndPaddle() {
        const cw = this.canvas.width;
        const ch = this.canvas.height;
        this.paddle.x = (cw - this.paddle.width) / 2;
        this.paddle.y = ch - 30;
        this.ball.x = cw / 2;
        this.ball.y = this.paddle.y - this.ball.radius - 2;
        this.ball.dx = 0;
        this.ball.dy = 0;
    }

    launchBall() {
        const speed = 4;
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
        this.ball.dx = Math.cos(angle) * speed;
        this.ball.dy = Math.sin(angle) * speed;
        this.state = 'playing';
    }

    attachEvents() {
        this.canvas.addEventListener('mousemove', this.boundMouseMove);
        this.canvas.addEventListener('touchmove', this.boundTouchMove, { passive: false });
        this.canvas.addEventListener('click', this.boundClick);
        document.addEventListener('keydown', this.boundKeyDown);
        window.addEventListener('resize', this.boundResize);
    }

    detachEvents() {
        this.canvas?.removeEventListener('mousemove', this.boundMouseMove);
        this.canvas?.removeEventListener('touchmove', this.boundTouchMove);
        this.canvas?.removeEventListener('click', this.boundClick);
        document.removeEventListener('keydown', this.boundKeyDown);
        window.removeEventListener('resize', this.boundResize);
    }

    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        this.paddle.x = Math.max(0, Math.min(x - this.paddle.width / 2, this.canvas.width - this.paddle.width));

        if (this.state === 'waiting') {
            this.ball.x = this.paddle.x + this.paddle.width / 2;
        }
    }

    onTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        this.paddle.x = Math.max(0, Math.min(x - this.paddle.width / 2, this.canvas.width - this.paddle.width));

        if (this.state === 'waiting') {
            this.ball.x = this.paddle.x + this.paddle.width / 2;
        }
    }

    onClick() {
        if (this.state === 'waiting') {
            this.launchBall();
        } else if (this.state === 'won' || this.state === 'lost') {
            this.restart();
        }
    }

    onKeyDown(e) {
        if (e.code === 'Space') {
            e.preventDefault();
            this.onClick();
        }
    }

    onResize() {
        this.sizeCanvas();
        this.buildBricks();
        this.resetBallAndPaddle();
        this.state = 'waiting';
    }

    update() {
        if (this.state !== 'playing') return;

        const b = this.ball;
        const cw = this.canvas.width;
        const ch = this.canvas.height;

        b.x += b.dx;
        b.y += b.dy;

        // Wall collisions
        if (b.x - b.radius <= 0 || b.x + b.radius >= cw) {
            b.dx = -b.dx;
            b.x = Math.max(b.radius, Math.min(b.x, cw - b.radius));
        }
        if (b.y - b.radius <= 0) {
            b.dy = -b.dy;
            b.y = b.radius;
        }

        // Paddle collision
        if (
            b.dy > 0 &&
            b.y + b.radius >= this.paddle.y &&
            b.y + b.radius <= this.paddle.y + this.paddle.height + 4 &&
            b.x >= this.paddle.x &&
            b.x <= this.paddle.x + this.paddle.width
        ) {
            const hitPos = (b.x - this.paddle.x) / this.paddle.width;
            const angle = -Math.PI / 2 + (hitPos - 0.5) * 1.2;
            const speed = Math.sqrt(b.dx * b.dx + b.dy * b.dy);
            const newSpeed = Math.min(speed * 1.005, 8);
            b.dx = Math.cos(angle) * newSpeed;
            b.dy = Math.sin(angle) * newSpeed;
            b.y = this.paddle.y - b.radius;
        }

        // Ball lost
        if (b.y - b.radius > ch) {
            this.lives--;
            this.livesEl.textContent = `Lives: ${this.lives}`;
            if (this.lives <= 0) {
                this.state = 'lost';
                return;
            }
            this.resetBallAndPaddle();
            this.state = 'waiting';
            return;
        }

        // Brick collisions
        for (const brick of this.bricks) {
            if (!brick.alive) continue;
            if (
                b.x + b.radius > brick.x &&
                b.x - b.radius < brick.x + brick.w &&
                b.y + b.radius > brick.y &&
                b.y - b.radius < brick.y + brick.h
            ) {
                brick.alive = false;
                this.score += 10;
                this.scoreEl.textContent = `Score: ${this.score}`;

                // Determine bounce direction
                const overlapLeft = b.x + b.radius - brick.x;
                const overlapRight = brick.x + brick.w - (b.x - b.radius);
                const overlapTop = b.y + b.radius - brick.y;
                const overlapBottom = brick.y + brick.h - (b.y - b.radius);
                const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                if (minOverlap === overlapTop || minOverlap === overlapBottom) {
                    b.dy = -b.dy;
                } else {
                    b.dx = -b.dx;
                }
                break;
            }
        }

        // Win check
        if (this.bricks.every(br => !br.alive)) {
            this.state = 'won';
        }
    }

    draw() {
        const ctx = this.ctx;
        const cw = this.canvas.width;
        const ch = this.canvas.height;
        const c = this.colors;

        ctx.fillStyle = c.bg;
        ctx.fillRect(0, 0, cw, ch);

        // Draw bricks
        for (const brick of this.bricks) {
            if (!brick.alive) continue;
            ctx.fillStyle = c.brick;
            ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
            ctx.strokeStyle = c.brickStroke;
            ctx.lineWidth = 1;
            ctx.strokeRect(brick.x, brick.y, brick.w, brick.h);

            // Draw word
            ctx.fillStyle = c.brickText;
            ctx.font = '11px "Fira Code", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const displayText = brick.word.length > Math.floor(brick.w / 8)
                ? brick.word.slice(0, Math.floor(brick.w / 8) - 1) + '.'
                : brick.word;
            ctx.fillText(displayText, brick.x + brick.w / 2, brick.y + brick.h / 2);
        }

        // Draw paddle
        ctx.fillStyle = c.paddle;
        ctx.beginPath();
        const pr = 4;
        ctx.roundRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height, pr);
        ctx.fill();

        // Draw ball
        ctx.fillStyle = c.ball;
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        ctx.fill();

        // Overlays
        if (this.state === 'waiting') {
            ctx.fillStyle = c.textMuted;
            ctx.font = '14px "Fira Code", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Click or tap to launch', cw / 2, this.paddle.y - 40);
        } else if (this.state === 'won') {
            this.drawOverlay('You Win!', `Score: ${this.score}`);
        } else if (this.state === 'lost') {
            this.drawOverlay('Game Over', `Score: ${this.score}`);
        }

        this.update();
        this.animationId = requestAnimationFrame(() => this.draw());
    }

    drawOverlay(title, subtitle) {
        const ctx = this.ctx;
        const cw = this.canvas.width;
        const ch = this.canvas.height;
        const c = this.colors;

        ctx.fillStyle = c.overlay;
        ctx.fillRect(0, 0, cw, ch);

        ctx.fillStyle = c.text;
        ctx.font = 'bold 28px "Fira Code", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(title, cw / 2, ch / 2 - 20);

        ctx.font = '16px "Fira Code", monospace';
        ctx.fillStyle = c.textMuted;
        ctx.fillText(subtitle, cw / 2, ch / 2 + 15);

        ctx.font = '13px "Fira Code", monospace';
        ctx.fillText('Click to play again', cw / 2, ch / 2 + 50);
    }

    restart() {
        this.score = 0;
        this.lives = 3;
        this.scoreEl.textContent = 'Score: 0';
        this.livesEl.textContent = 'Lives: 3';
        this.colors = this.readThemeColors();
        this.buildBricks();
        this.resetBallAndPaddle();
        this.state = 'waiting';
    }

    exit() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.detachEvents();
        this.container.innerHTML = this.originalHTML;

        // Restore the bottom nav bar
        const nav = document.querySelector('.floating-menu');
        if (nav) nav.style.display = '';

        // Re-init effects since we replaced the DOM
        const event = new CustomEvent('arkanoid-exit');
        document.dispatchEvent(event);
    }
}
