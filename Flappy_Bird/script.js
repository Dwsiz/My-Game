console.log('Script loaded');

const levels = {
    easy: {
        name: 'Easy',
        pipeSpeed: 1.5,
        pipeGap: 200,
        gravity: 500,
        starChance: 0.2,
        bgColor: 0x000033,
        musicFreq: 220,
        birds: ['bird1', 'bird2']
    },
    medium: {
        name: 'Medium',
        pipeSpeed: 2.6,
        pipeGap: 170,
        gravity: 700,
        starChance: 0.3,
        bgColor: 0x003366,
        musicFreq: 330,
        birds: ['bird1', 'bird2', 'bird3']
    },
    hard: {
        name: 'Hard',
        pipeSpeed: 4.7,
        pipeGap: 130,
        gravity: 1050,
        starChance: 0.4,
        bgColor: 0x220011,
        musicFreq: 440,
        birds: ['bird1', 'bird2', 'bird3', 'bird4']
    }
};

const visualSettings = {
    maxSparkCount: 28,
    sparkAnimatedEvery: 4,
    hardEmberCount: 10,
    jumpParticleQty: 6,
    gameOverBurst: 28
};

const sharedAudio = {
    context: null
};

function setDomLogoVisibility(isVisible) {
    const logo = document.getElementById('uni-logo-overlay');
    if (!logo) return;

    if (isVisible) {
        logo.classList.remove('logo-hidden');
    } else {
        logo.classList.add('logo-hidden');
    }
}

function createUiButton(scene, x, y, text, callback, options = {}) {
    const width = options.width || 170;
    const height = options.height || 56;
    const fillColor = options.fillColor || 0x0E1D34;
    const strokeColor = options.strokeColor || 0x84EBFF;
    const hoverColor = options.hoverColor || 0x163053;
    const textColor = options.textColor || '#EAF6FF';

    const container = scene.add.container(x, y);
    const glow = scene.add.rectangle(0, 0, width + 16, height + 16, strokeColor, 0.16).setVisible(false);
    const hitbox = scene.add.rectangle(0, 0, width, height, 0x000000, 0.001).setInteractive({ useHandCursor: true });
    const background = scene.add.graphics();

    const drawBackground = (color, alpha) => {
        background.clear();
        background.fillStyle(color, alpha);
        background.fillRoundedRect(-width / 2, -height / 2, width, height, 18);
        background.lineStyle(2, strokeColor, 0.95);
        background.strokeRoundedRect(-width / 2, -height / 2, width, height, 18);
    };

    drawBackground(fillColor, 0.95);

    const label = scene.add.text(0, 0, text, {
        fontFamily: 'Sora, sans-serif',
        fontSize: `${options.fontSize || 21}px`,
        fontStyle: '700',
        color: textColor
    }).setOrigin(0.5);

    container.add([glow, background, label, hitbox]);

    hitbox.on('pointerover', () => {
        scene.tweens.killTweensOf(container);
        glow.setVisible(true);
        drawBackground(hoverColor, 0.98);
        scene.tweens.add({ targets: container, scale: 1.05, duration: 120, ease: 'Sine.Out' });
    });

    hitbox.on('pointerout', () => {
        scene.tweens.killTweensOf(container);
        glow.setVisible(false);
        drawBackground(fillColor, 0.95);
        scene.tweens.add({ targets: container, scale: 1, duration: 120, ease: 'Sine.Out' });
    });

    hitbox.on('pointerdown', () => {
        scene.tweens.killTweensOf(container);
        scene.tweens.add({ targets: container, scale: 0.97, duration: 70, yoyo: true, ease: 'Sine.InOut' });
        callback();
    });

    return container;
}

function createSparkField(scene, count, palette = [0x9EEAFF, 0xFFD6A8, 0xFFFFFF]) {
    const finalCount = Math.min(count, visualSettings.maxSparkCount);

    for (let i = 0; i < finalCount; i++) {
        const x = Phaser.Math.Between(0, scene.cameras.main.width);
        const y = Phaser.Math.Between(0, scene.cameras.main.height);
        const radius = Phaser.Math.FloatBetween(0.8, 2.2);
        const color = Phaser.Utils.Array.GetRandom(palette);
        const spark = scene.add.circle(x, y, radius, color, Phaser.Math.FloatBetween(0.3, 0.7));

        if (i % visualSettings.sparkAnimatedEvery === 0) {
            scene.tweens.add({
                targets: spark,
                alpha: Phaser.Math.FloatBetween(0.12, 0.45),
                duration: Phaser.Math.Between(1400, 3200),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.InOut'
            });
        }
    }
}

class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    create() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        this.createMenuBackdrop(centerX, centerY);
        setDomLogoVisibility(true);

        this.add.text(centerX, centerY - 170, 'FLAPPY BIRD', {
            fontFamily: 'Sora, sans-serif',
            fontSize: '72px',
            fontStyle: '700',
            color: '#ECF7FF',
            stroke: '#67DAFF',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.add.text(centerX, centerY - 92, 'Select difficulty to launch', {
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '24px',
            color: '#BFD8F4'
        }).setOrigin(0.5);

        this.createButton(centerX - 190, centerY + 18, 'Easy', () => this.selectLevel('easy'));
        this.createButton(centerX, centerY + 18, 'Medium', () => this.selectLevel('medium'));
        this.createButton(centerX + 190, centerY + 18, 'Hard', () => this.selectLevel('hard'));
    }

    createButton(x, y, text, callback) {
        return createUiButton(this, x, y, text, callback, {
            width: 175,
            height: 58,
            fontSize: 22
        });
    }

    createMenuBackdrop(centerX, centerY) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.rectangle(centerX, centerY, width, height, 0x061126);
        const haloA = this.add.circle(width * 0.16, height * 0.24, 210, 0x40C8FF, 0.2);
        const haloB = this.add.circle(width * 0.86, height * 0.76, 280, 0xFF9E54, 0.18);

        for (let i = 0; i < 10; i++) {
            const y = (i + 1) * (height / 11);
            this.add.rectangle(centerX, y, width, 1, 0x84EBFF, 0.08);
        }

        for (let i = 0; i < 8; i++) {
            const x = (i + 1) * (width / 9);
            this.add.rectangle(x, centerY, 1, height, 0x84EBFF, 0.05);
        }

        this.tweens.add({ targets: haloA, alpha: 0.28, duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
        this.tweens.add({ targets: haloB, alpha: 0.26, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

        createSparkField(this, 65);
    }

    selectLevel(levelKey) {
        this.scene.start('BirdSelectScene', { level: levelKey });
    }
}

class BirdSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BirdSelectScene' });
    }

    init(data) {
        this.levelKey = data.level;
        this.level = levels[this.levelKey];
    }

    preload() {
        // Create basic bird texture for selection
        const birdGraphics = this.add.graphics();
        birdGraphics.fillStyle(0xFF00FF);
        birdGraphics.fillEllipse(15, 15, 20, 15);
        birdGraphics.lineStyle(2, 0xFFFFFF, 1);
        birdGraphics.strokeEllipse(15, 15, 20, 15);
        birdGraphics.generateTexture('bird', 30, 30);
        birdGraphics.destroy();
    }

    create() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        setDomLogoVisibility(true);

        this.createSelectionBackdrop(centerX, centerY);

        this.add.text(centerX, centerY - 214, `${this.level.name.toUpperCase()} MODE`, {
            fontFamily: 'Sora, sans-serif',
            fontSize: '50px',
            fontStyle: '700',
            color: '#ECF7FF',
            stroke: '#7CEFFF',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.add.text(centerX, centerY - 160, 'Pick your pilot', {
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '29px',
            color: '#BFD8F4'
        }).setOrigin(0.5);

        // Bird selection
        const birds = this.level.birds;
        const spacing = birds.length >= 4 ? 185 : 220;
        const startX = centerX - (birds.length - 1) * spacing / 2;
        birds.forEach((birdKey, index) => {
            const x = startX + index * spacing;
            const y = centerY;
            this.createBirdButton(x, y, birdKey, index);
        });

        // Back button
        this.createButton(centerX, centerY + 220, 'Back', () => this.scene.start('StartScene'));
    }

    createBirdButton(x, y, birdKey, index) {
        const container = this.add.container(x, y);
        const cardGlow = this.add.rectangle(0, 8, 156, 188, 0x73E7FF, 0.16).setVisible(false);
        const hitbox = this.add.rectangle(0, 2, 144, 176, 0x000000, 0.001).setInteractive({ useHandCursor: true });
        const card = this.add.graphics();
        card.fillStyle(0x0E1B30, 0.9);
        card.fillRoundedRect(-72, -86, 144, 176, 22);
        card.lineStyle(2, 0x84EBFF, 0.8);
        card.strokeRoundedRect(-72, -86, 144, 176, 22);

        const birdGraphics = this.add.graphics();
        let birdName = '';
        
        if (birdKey === 'bird1') {
            birdName = 'Phoenix';
            birdGraphics.fillStyle(0xFF00FF);
            birdGraphics.fillEllipse(0, -5, 35, 25);
            birdGraphics.fillStyle(0xFFFF00);
            birdGraphics.fillTriangle(-10, -10, -25, -15, -15, 5);
            birdGraphics.fillStyle(0xFF0000);
            birdGraphics.fillTriangle(18, -3, 30, -6, 30, 0);
            birdGraphics.fillStyle(0x000000);
            birdGraphics.fillCircle(10, -8, 3);
            birdGraphics.fillCircle(10, -3, 3);
            birdGraphics.fillStyle(0xFFA500);
            birdGraphics.fillRect(-5, 12, 3, 8);
            birdGraphics.fillRect(3, 12, 3, 8);
        } else if (birdKey === 'bird2') {
            birdName = 'Emerald';
            birdGraphics.fillStyle(0x00FF00);
            birdGraphics.fillRect(-15, -15, 30, 30);
            birdGraphics.fillStyle(0x00FFFF);
            birdGraphics.fillTriangle(-15, -10, -25, -20, -20, 0);
            birdGraphics.fillStyle(0xFF0000);
            birdGraphics.fillTriangle(15, -5, 28, -8, 28, -2);
            birdGraphics.fillStyle(0x000000);
            birdGraphics.fillCircle(5, -10, 3);
            birdGraphics.fillCircle(5, 0, 3);
        } else if (birdKey === 'bird3') {
            birdName = 'Sapphire';
            birdGraphics.fillStyle(0x0000FF);
            birdGraphics.fillTriangle(0, -20, -18, 15, 18, 15);
            birdGraphics.fillStyle(0xFFFF00);
            birdGraphics.fillTriangle(-15, -10, -30, -20, -20, 5);
            birdGraphics.fillStyle(0xFF0000);
            birdGraphics.fillTriangle(18, 0, 32, -5, 32, 5);
            birdGraphics.fillStyle(0x000000);
            birdGraphics.fillCircle(5, -5, 3);
            birdGraphics.fillCircle(5, 10, 3);
        } else if (birdKey === 'bird4') {
            birdName = 'Solaris';
            birdGraphics.fillStyle(0xFFFF00);
            birdGraphics.fillCircle(0, 0, 18);
            birdGraphics.fillStyle(0xFF8800);
            birdGraphics.fillTriangle(-10, -8, -28, -15, -18, 8);
            birdGraphics.fillStyle(0xFF0000);
            birdGraphics.fillTriangle(18, -2, 32, -6, 32, 2);
            birdGraphics.fillStyle(0x000000);
            birdGraphics.fillCircle(8, -6, 3);
            birdGraphics.fillCircle(8, 4, 3);
        }
        
        birdGraphics.lineStyle(3, 0xECF7FF, 0.95);
        birdGraphics.strokeCircle(0, 0, 42);
        
        const label = this.add.text(0, 62, birdName, {
            fontFamily: 'Sora, sans-serif',
            fontSize: '18px',
            fontStyle: '700',
            color: '#EBF7FF'
        }).setOrigin(0.5);
        const helper = this.add.text(0, 84, 'tap to select', {
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '12px',
            color: '#95B9DA'
        }).setOrigin(0.5);
        
        container.add([cardGlow, card, birdGraphics, label, helper, hitbox]);
        
        hitbox.on('pointerover', () => {
            this.tweens.killTweensOf(container);
            cardGlow.setVisible(true);
            container.setScale(1.04);
            birdGraphics.lineStyle(4, 0x7CEFFF, 1);
            birdGraphics.strokeCircle(0, 0, 45);
        });
        hitbox.on('pointerout', () => {
            this.tweens.killTweensOf(container);
            cardGlow.setVisible(false);
            container.setScale(1);
            birdGraphics.lineStyle(3, 0xECF7FF, 0.95);
            birdGraphics.strokeCircle(0, 0, 42);
        });
        hitbox.on('pointerdown', () => this.startGame(birdKey));
    }

    createButton(x, y, text, callback) {
        return createUiButton(this, x, y, text, callback, {
            width: 148,
            height: 52,
            fontSize: 19
        });
    }

    createSelectionBackdrop(centerX, centerY) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this.add.rectangle(centerX, centerY, width, height, this.level.bgColor);

        this.add.circle(width * 0.18, height * 0.2, 180, 0x52D2FF, 0.16);
        this.add.circle(width * 0.84, height * 0.74, 260, 0xFFB46F, 0.14);

        for (let i = 0; i < 8; i++) {
            const y = (i + 1) * (height / 9);
            this.add.rectangle(centerX, y, width, 1, 0xA7EDFF, 0.08);
        }

        createSparkField(this, 42, [0xA4EBFF, 0xFFD2A0, 0xFFFFFF]);
    }

    startGame(birdKey) {
        setDomLogoVisibility(false);
        this.scene.start('FlappyBird', { level: this.levelKey, bird: birdKey });
    }
}

class FlappyBird extends Phaser.Scene {
    constructor() {
        super({ key: 'FlappyBird' });
    }

    init(data) {
        this.levelKey = data.level;
        this.birdKey = data.bird;
        this.level = levels[this.levelKey];
    }

    preload() {
        console.log('Preloading...');
        // Create bird texture based on selection
        this.createBirdTexture(this.birdKey);

        const pipeGraphics = this.add.graphics();
        pipeGraphics.fillStyle(0x102748);
        pipeGraphics.fillRect(0, 0, 50, 400);
        pipeGraphics.fillStyle(0x1D3961);
        pipeGraphics.fillRect(6, 0, 10, 400);
        pipeGraphics.fillStyle(0x6EE8FF, 0.35);
        pipeGraphics.fillRect(38, 0, 5, 400);
        pipeGraphics.lineStyle(2, 0x9AEFFF, 0.9);
        pipeGraphics.strokeRect(0, 0, 50, 400);
        pipeGraphics.generateTexture('pipe', 50, 400);
        pipeGraphics.destroy();

        const hardPipeGraphics = this.add.graphics();
        hardPipeGraphics.fillStyle(0x6B0F1A);
        hardPipeGraphics.fillRect(8, 0, 48, 400);
        hardPipeGraphics.fillStyle(0xFF6A00);
        for (let i = 0; i < 16; i++) {
            const y = i * 25;
            hardPipeGraphics.fillTriangle(8, y, 0, y + 12, 8, y + 24);
            hardPipeGraphics.fillTriangle(56, y, 64, y + 12, 56, y + 24);
        }
        hardPipeGraphics.lineStyle(2, 0xFFD29D, 1);
        hardPipeGraphics.strokeRect(8, 0, 48, 400);
        hardPipeGraphics.generateTexture('pipe-hard', 64, 400);
        hardPipeGraphics.destroy();
        console.log('Pipe texture created');

        // Load particle texture
        const particleGraphics = this.add.graphics();
        particleGraphics.fillStyle(0xFFFF00);
        particleGraphics.fillCircle(5, 5, 5);
        particleGraphics.generateTexture('particle', 10, 10);
        particleGraphics.destroy();
        console.log('Preload complete');
    }

    createBirdTexture(birdKey) {
        const birdGraphics = this.add.graphics();
        if (birdKey === 'bird1') {
            birdGraphics.fillStyle(0xFF00FF); // Pink
            birdGraphics.fillEllipse(15, 15, 20, 15);
            birdGraphics.fillStyle(0xFFFF00);
            birdGraphics.fillTriangle(10, 10, 20, 5, 15, 20);
            birdGraphics.fillStyle(0xFF0000);
            birdGraphics.fillTriangle(25, 15, 30, 12, 30, 18);
            birdGraphics.fillStyle(0x000000);
            birdGraphics.fillCircle(18, 12, 2);
            birdGraphics.fillCircle(22, 12, 2);
            birdGraphics.fillStyle(0xFFA500);
            birdGraphics.fillRect(14, 22, 2, 5);
            birdGraphics.fillRect(18, 22, 2, 5);
        } else if (birdKey === 'bird2') {
            birdGraphics.fillStyle(0x00FF00); // Green
            birdGraphics.fillRect(10, 10, 20, 20);
            birdGraphics.fillStyle(0xFFFF00);
            birdGraphics.fillCircle(15, 8, 5);
            birdGraphics.fillStyle(0x000000);
            birdGraphics.fillCircle(12, 15, 1);
            birdGraphics.fillCircle(18, 15, 1);
        } else if (birdKey === 'bird3') {
            birdGraphics.fillStyle(0x0000FF); // Blue
            birdGraphics.fillTriangle(15, 5, 5, 25, 25, 25);
            birdGraphics.fillStyle(0xFFFFFF);
            birdGraphics.fillCircle(15, 15, 3);
            birdGraphics.fillStyle(0x000000);
            birdGraphics.fillCircle(13, 13, 1);
            birdGraphics.fillCircle(17, 13, 1);
        } else if (birdKey === 'bird4') {
            birdGraphics.fillStyle(0xFFFF00); // Yellow
            birdGraphics.fillCircle(15, 15, 12);
            birdGraphics.fillStyle(0xFF0000);
            birdGraphics.fillTriangle(20, 10, 25, 7, 25, 13);
            birdGraphics.fillStyle(0x000000);
            birdGraphics.fillCircle(12, 12, 2);
            birdGraphics.fillCircle(18, 12, 2);
        }
        birdGraphics.lineStyle(2, 0xFFFFFF, 1);
        birdGraphics.strokeRect(0, 0, 30, 30);
        birdGraphics.generateTexture('bird', 30, 30);
        birdGraphics.destroy();
        console.log('Bird texture created for', birdKey);
    }

    create() {
        console.log('Creating game...');
        setDomLogoVisibility(false);
        this.score = 0;
        this.gameOverFlag = false;
        this.paused = false;
        this.pausedText = null;
        this.highScore = parseInt(localStorage.getItem('flappyHighScore')) || 0;
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Futuristic background with parallax layers based on level
        if (this.levelKey === 'hard') {
            this.createHardMap(centerX, centerY);
        } else {
            this.createNeoMap(centerX, centerY);
        }

        // Neon ground
        const groundColor = this.levelKey === 'hard' ? 0xFF6A00 : 0x59D9FF;
        this.ground = this.add.rectangle(centerX, this.cameras.main.height - 20, this.cameras.main.width, 40, groundColor);
        this.ground.setStrokeStyle(2, 0xEAF6FF);

        // Title with glow
        this.add.text(centerX, 48, `${this.level.name.toUpperCase()} FLIGHT`, {
            fontFamily: 'Sora, sans-serif',
            fontSize: '30px',
            fontStyle: '700',
            color: '#EAF6FF',
            stroke: '#6EE8FF',
            strokeThickness: 2
        }).setOrigin(0.5).setAlpha(0.95);

        // Bird with settings
        this.bird = this.physics.add.sprite(100, centerY, 'bird');
        this.bird.body.gravity.y = this.level.gravity;
        this.bird.body.collideWorldBounds = true;

        // Particle emitter for jump
        this.jumpParticles = this.add.particles('particle');
        this.jumpEmitter = this.jumpParticles.createEmitter({
            speed: { min: 100, max: 200 },
            scale: { start: 0.5, end: 0 },
            lifespan: 450,
            alpha: { start: 1, end: 0 },
            quantity: visualSettings.jumpParticleQty,
            frequency: -1
        });

        // Pipes group
        this.pipes = this.physics.add.group();

        // Stars group for bonus
        this.stars = this.physics.add.group();

        this.createHud();

        // Input
        this.input.on('pointerdown', this.jump, this);
        this.input.keyboard.on('keydown-SPACE', this.jump, this);
        this.input.keyboard.on('keydown-P', this.togglePause, this);
        this.input.keyboard.on('keydown-ESC', () => {
            this.physics.resume();
            this.scene.start('StartScene');
        });

        // Timer for pipes with level speed
        this.time.addEvent({
            delay: 1500,
            callback: this.addPipe,
            callbackScope: this,
            loop: true
        });

        // Audio context for sounds
        try {
            if (!sharedAudio.context) {
                sharedAudio.context = new (window.AudioContext || window.webkitAudioContext)();
            }
            this.audioContext = sharedAudio.context;
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.audioContext = null;
        }

        // Background music based on level
        this.startBackgroundMusic();
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onSceneShutdown, this);
        console.log('Game created successfully.');
    }

    addCloud(x, y) {
        const cloud = this.add.graphics();
        cloud.fillStyle(0xFFFFFF, 0.8);
        cloud.fillCircle(x, y, 30);
        cloud.fillCircle(x + 40, y, 40);
        cloud.fillCircle(x + 80, y, 30);
        cloud.fillCircle(x + 20, y - 20, 25);
        cloud.fillCircle(x + 60, y - 20, 35);
    }

    addStars() {
        createSparkField(this, 42, [0xB5EEFF, 0xFFF2E2, 0xFFFFFF]);
    }

    createNeoMap(centerX, centerY) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.bg1 = this.add.rectangle(centerX, centerY, width, height, this.level.bgColor);
        this.bg2 = this.add.rectangle(centerX, centerY, width, height, 0x0E223D).setAlpha(0.32);
        this.add.circle(width * 0.2, height * 0.2, 170, 0x6EDFFF, 0.18);
        this.add.circle(width * 0.86, height * 0.72, 250, 0xFFA96C, 0.14);

        for (let i = 0; i < 9; i++) {
            const y = (i + 1) * (height / 10);
            this.add.rectangle(centerX, y, width, 1, 0x88EAFD, 0.08);
        }

        this.addStars();
    }

    createHud() {
        const scorePanel = this.add.graphics();
        scorePanel.fillStyle(0x081324, 0.72);
        scorePanel.fillRoundedRect(14, 14, 196, 88, 16);
        scorePanel.lineStyle(2, 0x84EBFF, 0.6);
        scorePanel.strokeRoundedRect(14, 14, 196, 88, 16);

        this.scoreText = this.add.text(28, 28, '', {
            fontFamily: 'Sora, sans-serif',
            fontSize: '24px',
            fontStyle: '700',
            color: '#EAF6FF',
            lineSpacing: 10
        });
        this.updateScoreText();

        const infoWidth = 320;
        const infoHeight = 34;
        const infoX = this.cameras.main.width - infoWidth - 14;
        const infoY = this.cameras.main.height - infoHeight - 14;
        const infoPanel = this.add.graphics();
        infoPanel.fillStyle(0x081324, 0.62);
        infoPanel.fillRoundedRect(infoX, infoY, infoWidth, infoHeight, 12);
        infoPanel.lineStyle(1, 0x84EBFF, 0.55);
        infoPanel.strokeRoundedRect(infoX, infoY, infoWidth, infoHeight, 12);

        this.add.text(this.cameras.main.width - 24, this.cameras.main.height - 24, 'CLICK/SPACE JUMP   P PAUSE   ESC MENU', {
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '13px',
            color: '#D7ECFF'
        }).setOrigin(1, 1);
    }

    updateScoreText() {
        this.scoreText.setText(`Score ${this.score}\nBest  ${this.highScore}`);
    }

    createHardMap(centerX, centerY) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.bg1 = this.add.rectangle(centerX, centerY, width, height, 0x140006);
        this.bg2 = this.add.rectangle(centerX, centerY, width, height, 0x3C0F00).setAlpha(0.45);

        this.add.circle(width - 140, 110, 80, 0xFF5E00, 0.2);
        this.add.circle(width - 140, 110, 42, 0xFFD19A, 0.3);

        for (let i = 0; i < 10; i++) {
            const y = (i + 1) * (height / 11);
            this.add.rectangle(centerX, y, width, 2, 0xFF5E00, 0.08);
        }

        for (let i = 0; i < visualSettings.hardEmberCount; i++) {
            const ember = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.Between(1, 3),
                0xFFB347,
                Phaser.Math.FloatBetween(0.2, 0.6)
            );

            this.tweens.add({
                targets: ember,
                y: ember.y - Phaser.Math.Between(20, 80),
                alpha: 0,
                duration: Phaser.Math.Between(1000, 2500),
                repeat: -1,
                yoyo: false,
                onRepeat: () => {
                    ember.y = Phaser.Math.Between(height - 100, height);
                    ember.x = Phaser.Math.Between(0, width);
                    ember.alpha = Phaser.Math.FloatBetween(0.2, 0.6);
                }
            });
        }
    }

    startBackgroundMusic() {
        if (!this.audioContext || this.bgOscillator) return;
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        this.bgOscillator = this.audioContext.createOscillator();
        this.bgGain = this.audioContext.createGain();
        this.bgOscillator.connect(this.bgGain);
        this.bgGain.connect(this.audioContext.destination);
        this.bgOscillator.frequency.setValueAtTime(this.level.musicFreq, this.audioContext.currentTime);
        this.bgOscillator.type = 'triangle';
        this.bgGain.gain.setValueAtTime(0.018, this.audioContext.currentTime);
        this.bgOscillator.start();
    }

    update() {
        if (this.gameOverFlag || this.paused) return;

        // Rotate bird
        this.bird.angle = this.bird.body.velocity.y * 0.1;

        // Check collisions
        this.physics.overlap(this.bird, this.pipes, this.hitPipe, null, this);
        this.physics.overlap(this.bird, this.stars, this.collectStar, null, this);
        const birdBottom = this.bird.getBounds().bottom;
        const groundTop = this.ground.getBounds().top;
        if (birdBottom >= groundTop) {
            this.gameOver();
        }
    }

    jump() {
        if (this.gameOverFlag || this.paused) return;
        this.bird.body.velocity.y = -300;
        // Emit particles
        this.jumpEmitter.explode(visualSettings.jumpParticleQty, this.bird.x, this.bird.y);
        this.playSound(440, 0.1); // Jump sound
    }

    togglePause() {
        this.paused = !this.paused;
        if (this.paused) {
            this.physics.pause();
            this.pausedText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'PAUSED', {
                fontFamily: 'Sora, sans-serif',
                fontSize: '58px',
                fontStyle: '700',
                color: '#F4FBFF',
                stroke: '#6EE8FF',
                strokeThickness: 4
            }).setOrigin(0.5);
        } else {
            this.physics.resume();
            if (this.pausedText) {
                this.pausedText.destroy();
                this.pausedText = null;
            }
        }
    }

    addPipe() {
        const gap = this.level.pipeGap;
        const pipeHeight = Phaser.Math.Between(50, this.cameras.main.height - gap - 60);
        const pipeTexture = this.levelKey === 'hard' ? 'pipe-hard' : 'pipe';
        const pipeWidth = this.levelKey === 'hard' ? 64 : 50;

        // Top pipe
        const topPipe = this.physics.add.sprite(this.cameras.main.width + pipeWidth / 2, pipeHeight / 2, pipeTexture);
        topPipe.setDisplaySize(pipeWidth, pipeHeight);
        topPipe.body.allowGravity = false;
        topPipe.body.immovable = true;
        this.pipes.add(topPipe);

        // Bottom pipe
        const bottomPipeY = pipeHeight + gap + (this.cameras.main.height - pipeHeight - gap - 40) / 2; // 40 for ground
        const bottomPipe = this.physics.add.sprite(this.cameras.main.width + pipeWidth / 2, bottomPipeY, pipeTexture);
        bottomPipe.setDisplaySize(pipeWidth, this.cameras.main.height - pipeHeight - gap - 40);
        bottomPipe.body.allowGravity = false;
        bottomPipe.body.immovable = true;
        this.pipes.add(bottomPipe);

        // Move pipes with level speed
        this.tweens.add({
            targets: [topPipe, bottomPipe],
            x: -pipeWidth,
            duration: 3000 / this.level.pipeSpeed, // Faster for higher levels
            onComplete: () => {
                topPipe.destroy();
                bottomPipe.destroy();
                this.score += 1;
                this.updateScoreText();
                this.playSound(660, 0.1); // Score sound
            }
        });

        // Sometimes add a star based on level chance
        if (Phaser.Math.Between(0, 10) > 10 * (1 - this.level.starChance)) {
            const starY = pipeHeight + gap / 2;
            const star = this.stars.create(this.cameras.main.width + 60, starY, 'particle');
            star.setTint(0xFFFF00);
            star.setScale(2);
            star.body.allowGravity = false;
            star.body.immovable = true;
            this.tweens.add({
                targets: star,
                x: -50,
                duration: 3000 / this.level.pipeSpeed,
                onComplete: () => star.destroy()
            });
        }
    }

    hitPipe() {
        this.gameOver();
    }

    collectStar(bird, star) {
        star.destroy();
        this.score += 10; // Bonus points
        this.updateScoreText();
        this.playSound(880, 0.2); // Collect sound
    }

    gameOver() {
        this.gameOverFlag = true;
        this.physics.pause();
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('flappyHighScore', this.highScore);
        }
        // Explosion particles
        this.jumpEmitter.explode(visualSettings.gameOverBurst, this.bird.x, this.bird.y);
        this.playSound(220, 0.5); // Game over sound

        this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x030A14, 0.58);
        this.add.text(centerX, centerY - 24, 'MISSION FAILED', {
            fontFamily: 'Sora, sans-serif',
            fontSize: '62px',
            fontStyle: '700',
            color: '#F4FBFF',
            stroke: '#FF9760',
            strokeThickness: 5
        }).setOrigin(0.5);
        this.add.text(centerX, centerY + 40, 'Tap to relaunch', {
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '30px',
            color: '#CAF0FF'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => this.scene.restart());
    }

    playSound(frequency, duration) {
        if (!this.audioContext) return;
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'square';

        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    onSceneShutdown() {
        if (this.bgOscillator) {
            try {
                this.bgOscillator.stop();
            } catch (e) {
                // Ignore if oscillator already stopped.
            }
            this.bgOscillator.disconnect();
            this.bgOscillator = null;
        }

        if (this.bgGain) {
            this.bgGain.disconnect();
            this.bgGain = null;
        }

        if (this.jumpParticles) {
            this.jumpParticles.destroy();
            this.jumpParticles = null;
        }
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [StartScene, BirdSelectScene, FlappyBird]
};

console.log('Config created');
if (typeof Phaser === 'undefined') {
    console.error('Phaser not loaded! Check CDN or network.');
} else {
    console.log('Phaser loaded, starting game...');
    const game = new Phaser.Game(config);
    console.log('Game instance created');
}