let wave = 1;
let enemiesSpawned = 0;
let maxEnemiesPerWave = 15;
let boss;
let bossHealth = 20;
let waveText;
let waveEndTimer = null;
let powerups;
let speedBoost = false;
let tripleShot = false;
let bossHealthBar;
let bossHealthBarBg;

let player, bullets, enemies, enemyBullets;
let score = 0, lives = 3;
let scoreText, livesText, bossHealthText;
let keys;
let backgroundMusicInstance = null;

// Landing Page Scene
class LandingPageScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LandingPageScene' });
    }

    preload() {
        this.load.image('background', 'assets/img/lp-bg1.jpg');
        this.load.image('startButton', 'assets/img/btn-start.png');
        this.load.image('onePlayerButton', 'assets/img/1p.png', { frameWidth: 250, frameHeight: 250 });
        this.load.image('twoPlayerButton', 'assets/img/2p.png', { frameWidth: 250, frameHeight: 250 });
        this.load.audio('buttonClick', 'assets/sounds/buttonClick.mp3'); // Load button click sound
        this.load.audio('backgroundMusic', 'assets/sounds/backgroundMusic1.wav'); // Load background music
    }
    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        const buttonWidth = 900;
        const buttonHeight = 550;
    
        this.add.image(centerX, centerY, 'background').setOrigin(0.5, 0.5).setDisplaySize(1300, 750);
    
        const onePlayerButton = this.add.image(centerX - buttonWidth / 8 , centerY + 70, 'onePlayerButton').setInteractive();
        const twoPlayerButton = this.add.image(centerX + buttonWidth / 8 , centerY + 65 , 'twoPlayerButton').setInteractive();
    
        const buttonClickSound = this.sound.add('buttonClick', { rate: 2.5 }); // Add button click sound with adjusted speed
    
        // Check if background music is already playing
        if (!backgroundMusicInstance) {
            backgroundMusicInstance = this.sound.add('backgroundMusic', { loop: true }); // Add background music with loop
            backgroundMusicInstance.play(); // Play background music
        }
    
        onePlayerButton.on('pointerdown', () => {
            buttonClickSound.play(); // Play sound on button click
            console.log('1 Player Mode Selected');
            this.scene.start('BattleshipSelectionScene', { mode: '1player' });
        });
    
        twoPlayerButton.on('pointerdown', () => {
            buttonClickSound.play(); // Play sound on button click
            console.log('2 Player Mode Selected');
            this.scene.start('BattleshipSelectionScene', { mode: '2player' });
        });
    
        this.add.text(centerX, centerY + 250, 'Use WASD or Arrow Keys to move, Space to shoot', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
    }
}

// Battleship Selection Scene
class BattleshipSelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleshipSelectionScene' });
    }

    preload() {
        this.load.image('ship1', 'assets/img/ship1.png');
        this.load.image('ship2', 'assets/img/ship2.png');
        this.load.image('ship3', 'assets/img/ship3.png');
        this.load.image('backgroundBS', 'assets/img/selection-bg.jpg');
        this.load.image('bullet1', 'assets/img/bullet1.png');
        this.load.image('bullet2', 'assets/img/bullet2.png');
        this.load.image('bullet3', 'assets/img/bullet3.png');
        this.load.image('playButton', 'assets/img/start.png');
        this.load.image('backButton', 'assets/img/back-btn.png');
        this.load.image('iconKey', 'assets/img/sbss.png');
        this.load.image('arrow', 'assets/img/arrow.png');
        this.load.audio('buttonClick', 'assets/sounds/buttonClick.mp3'); // Load button click sound
    }

    create(data) {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        const buttonClickSound = this.sound.add('buttonClick', { rate: 2.5 }); // Add button click sound with adjusted speed
        this.mode = data.mode;
        this.turn = 1;

        this.add.image(centerX, centerY, 'backgroundBS').setOrigin(0.5, 0.5).setDisplaySize(1300, 750);

        const upperLeftIcon = this.add.image(50, 50, 'iconKey').setOrigin(0.3).setScale(1).setInteractive();
        upperLeftIcon.on('pointerdown', () => {
            buttonClickSound.play();
            this.scene.start('LandingPageScene');
        });

        // Add instructions for controls at the top of the screen
        this.add.text(centerX, 0, '', {
            fontSize: '32px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Player 1 controls
        this.add.text(centerX, 140, 'Instructions PLAYER 1:WASD to move and SPACE to shoot', {
            fontSize: '22px',
            fill: '#fff',
        }).setOrigin(0.5);

        // Player 2 controls (only visible in 2-player mode)
        if (this.mode === '2player') {
            this.add.text(centerX, 190, 'Instructions PLAYER 2:Arrow Keys to move SHIFT to shoot', {
                fontSize: '22px',
                fill: '#fff',
            }).setOrigin(0.5);
        }

        this.ships = [
            { key: 'ship1', name: 'Destroyer', sprite: this.add.image(centerX - 300, centerY, 'ship1').setInteractive().setScale(0.6), bullet: 'bullet1', description: 'A heavy battleship with high damage but slow speed.' },
            { key: 'ship2', name: 'Speedstar', sprite: this.add.image(centerX, centerY, 'ship2').setInteractive().setScale(0.6), bullet: 'bullet2', description: 'A fast and agile battleship with medium firepower.' },
            { key: 'ship3', name: 'Defender', sprite: this.add.image(centerX + 300, centerY, 'ship3').setInteractive().setScale(0.6), bullet: 'bullet3', description: 'A balanced battleship with strong defense and attack.' }
        ];

        this.ships.forEach(ship => {
            this.add.text(ship.sprite.x, ship.sprite.y - 100, ship.name, {
                fontSize: '24px',
                fill: '#fff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            ship.sprite.on('pointerdown', () => {
                buttonClickSound.play();
                this.selectShip(ship);
            });
        });

        this.descriptionText = this.add.text(centerX, centerY + 150, '', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
        this.playButton = this.add.image(centerX, centerY + 220, 'playButton').setInteractive().setScale(0.8).setVisible(false);

        const backButton = this.add.image(130, this.cameras.main.height - 70, 'backButton').setInteractive();
        backButton.on('pointerdown', () => {
            buttonClickSound.play();
            this.scene.start('LandingPageScene');
        });

        this.arrowIndicator = this.add.image(centerX - 250, centerY - 150, 'arrow').setScale(0.5);
        this.arrowIndicator.setVisible(this.mode === '2player');

        this.player1Selection = null;
        this.player2Selection = null;
    }

    selectShip(selectedShip) {
        if (this.mode === '1player') {
            this.player1Selection = selectedShip;
            this.descriptionText.setText(`${selectedShip.name} - ${selectedShip.description}`);
            selectedShip.sprite.setTint(0x8c52ff); // Highlight Player 1's selection
            this.ships.forEach(ship => {
                if (ship !== selectedShip) {
                    ship.sprite.clearTint(); // Clear tint for other ships
                }
            });
            this.finalizeSelection();
            return;
        }

        if (this.turn === 1 && !this.player1Selection) {
            this.player1Selection = selectedShip;
            selectedShip.sprite.setTint(0x8c52ff); // Player 1 ship tint
            this.descriptionText.setText(`Player 1 selected: ${selectedShip.name} - ${selectedShip.description}`);
            this.turn = 2;
            this.arrowIndicator.x = selectedShip.sprite.x; // Move arrow to selected ship
        } 
        else if (this.turn === 2 && !this.player2Selection && selectedShip !== this.player1Selection) {
            this.player2Selection = selectedShip;
            selectedShip.sprite.setTint(0xff5252); // Player 2 ship tint
            this.descriptionText.setText(`Player 2 selected: ${selectedShip.name} - ${selectedShip.description}`);
            this.arrowIndicator.setVisible(false);
            this.finalizeSelection();
        }

        // Show Play Button when both players have selected a ship
        this.playButton.setVisible(this.player1Selection !== null && (this.mode === '1player' || this.player2Selection !== null));
    }

    finalizeSelection() {
        if ((this.mode === '1player' && this.player1Selection) || (this.mode === '2player' && this.player1Selection && this.player2Selection)) {
            this.playButton.setVisible(true);
            this.playButton.once('pointerdown', () => {
                this.sound.play('buttonClick', { rate: 2.5 });
                this.startGame();
            });
        }
    }

    startGame() {
        this.scene.start('StageSelectionScene', {
            player1Ship: this.player1Selection.key,
            player2Ship: this.mode === '2player' ? this.player2Selection.key : null,
            mode: this.mode,
            player1Bullet: this.player1Selection.bullet,
            player2Bullet: this.mode === '2player' ? this.player2Selection.bullet : null,
            completedStages: [1], // Assuming Stage 1 is unlocked initially
            currentStage: 1
        });
    }
}

class StageSelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StageSelectionScene' });
    }

    preload() {
        this.load.image('stageBg', 'assets/img/stage-bg.jpg');
        this.load.image('lock', 'assets/img/lock.png');

        // 🎯 Load stage button spritesheets
        this.load.spritesheet('stage1Button', 'assets/sprites/stage1Button.png', { frameWidth: 200, frameHeight: 250 });
        this.load.spritesheet('stage2Button', 'assets/img/stage2Button.png', { frameWidth: 200, frameHeight: 250 });
        this.load.spritesheet('stage3Button', 'assets/img/stage3Button.png', { frameWidth: 200, frameHeight: 250 });
        this.load.spritesheet('stage4Button', 'assets/img/stage4Button.png', { frameWidth: 200, frameHeight: 250 });
        this.load.spritesheet('stage5Button', 'assets/img/stage5Button.png', { frameWidth: 200, frameHeight: 250 });

        this.load.on('complete', () => {
            console.log('All assets loaded');
        });

        // 🎯 Load back button spritesheet
        this.load.image('ewan', 'assets/img/back.png', { frameWidth: 80, frameHeight: 40 });

        // Load button click sound
        this.load.audio('buttonClick', 'assets/sounds/buttonClick.mp3');
    }

    create(data) {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        console.log(Phaser.VERSION);
    
        this.add.image(centerX, centerY, 'stageBg').setOrigin(0.5, 0.5).setDisplaySize(1300, 750);
    
        this.completedStages = data.completedStages || [1];
        this.currentStage = data.currentStage || 1;
    
        const numButtons = 5;
        const buttonSpacing = 200;
        const startX = centerX - ((numButtons - 1) * buttonSpacing) / 2;
    
        const stageButtons = [
            { key: 'stage1Button', stage: 1 },
            { key: 'stage2Button', stage: 2 },
            { key: 'stage3Button', stage: 3 },
            { key: 'stage4Button', stage: 4 },
            { key: 'stage5Button', stage: 5 }
        ];
    
        const buttonClickSound = this.sound.add('buttonClick', { rate: 2.5 }); // Add button click sound with adjusted speed
    
        stageButtons.forEach((buttonData, index) => {
            const buttonX = startX + index * buttonSpacing;
            const buttonY = centerY;
    
            const button = this.add.sprite(buttonX, buttonY - 30, buttonData.key, 0) // Frame 0 = default
                .setInteractive({ useHandCursor: true })
                .setScale(0.9);
    
            console.log(`Button ${buttonData.stage} created at (${buttonX}, ${buttonY}) with texture ${button.texture.key}`);
    
            const isLocked = !this.completedStages.includes(buttonData.stage) && buttonData.stage !== this.currentStage;
    
            if (isLocked) {
                const lockImage = this.add.image(buttonX + 20, buttonY - 20, 'lock').setScale(0.4);
                lockImage.setDepth(1);
                button.setAlpha(0.5);
            }
    
            button.on('pointerdown', () => {
                if (!isLocked) {
                    buttonClickSound.play(); // Play sound on button click
                    console.log(`Stage ${buttonData.stage} selected`);
                    let targetScene;
                    switch (buttonData.stage) {
                        case 1:
                            targetScene = 'MainGameScene';
                            break;
                        case 2:
                            targetScene = 'Stage2Scene';
                            break;
                        case 3:
                            targetScene = 'Stage3Scene';
                            break;
                        case 4:
                            targetScene = 'Stage4Scene'; // Assuming you have a Stage4Scene
                            break;
                        case 5:
                            targetScene = 'Stage5Scene'; // Assuming you have a Stage5Scene
                            break;
                        default:
                            targetScene = 'MainGameScene';
                    }
                    this.scene.start(targetScene, {
                        stage: buttonData.stage,
                        player1Ship: data.player1Ship,
                        player2Ship: data.player2Ship,
                        mode: data.mode,
                        player1Bullet: data.player1Bullet,
                        player2Bullet: data.player2Bullet
                    });
                }
            });
    
            button.on('pointerover', () => {
                if (!isLocked) button.setFrame(1); // Hover frame
            });
    
            button.on('pointerout', () => {
                button.setFrame(0); // Default frame
            });
        });
    
        // Back Button
        const backButton = this.add.sprite(50, 75, 'ewan', 0)
            .setInteractive({ useHandCursor: true })
            .setScale(0.5);
    
        backButton.on('pointerdown', () => {
            buttonClickSound.play(); // Play sound on button click
            this.scene.start('LandingPageScene');
        });
    
        backButton.on('pointerover', () => {
            backButton.setFrame(1); // Hover frame
        });
    
        backButton.on('pointerout', () => {
            backButton.setFrame(0);
        });
    }
}



// Main Game Scene
class MainGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainGameScene' });
        this.wave = 1;
        this.enemiesSpawned = 0;
        this.maxEnemiesPerWave = 15;
        this.boss = null;
        this.bossHealth = 20;
        this.speedBoost = false;
        this.tripleShot = false;
        this.score = 0;
        this.lives = 3;
        this.player1 = null;
        this.player2 = null;
        this.bullets = null;
        this.enemies = null;
        this.enemyBullets = null;
        this.keys = null;
        this.arrowKeys = null;
        this.scoreText = null;
        this.waveText = null;
        this.livesIcons = null;
        this.explosionsGroup = null;
        this.powerUps = null;
        this.shootSound = null;
        this.destructionSound = null;
        this.bossBulletSound = null;
        this.bossDestructionSound = null;
    }

    preload() {
        // Load the video file
        this.load.video('stage1bgvid', 'assets/vid/stage1.mp4', undefined, true); // true enables noAudio

        // Add error handling
        this.load.on('fileerror', (file) => {
            console.error('Failed to load file:', file.key);
        });
    
        // Debugging: Log when the video is loaded
        this.load.on('filecomplete', (key) => {
            if (key === 'stage1bgvid') {
                console.log('Video loaded successfully:', key);
            }
        });
        // Debugging: Log when the video is loaded
      
        // Load other assets
        this.load.image('console-bg', 'assets/img/console-bg3.jpg');
        this.load.image('ship1', 'assets/img/ship1.png');
        this.load.image('ship2', 'assets/img/ship2.png');
        this.load.image('ship3', 'assets/img/ship3.png');
        this.load.image('bullet', 'assets/img/user-bullet.png');
        this.load.image('enemy', 'assets/img/enemy1.png');
        this.load.image('enemyBullet', 'assets/img/enemy-bullet.png');
        this.load.image('powerSpeed', 'assets/img/power-speed.png');
        this.load.image('powerGun', 'assets/img/power-gun.png');
        this.load.image('powerLife', 'assets/img/power-life.png');
        this.load.image('lifeIcon', 'assets/img/power-life.png');
        this.load.image('boss', 'assets/img/boss2.png');
        this.load.image('bossBullet', 'assets/img/boss-bullet2.png'); //bullet2
        this.load.audio('shootSound', 'assets/sounds/laserSound.wav');
        this.load.audio('destructionSound', 'assets/sounds/destructionSound.wav');
        this.load.spritesheet('explosion', 'assets/sprites/explosion.png', { frameWidth: 64, frameHeight: 64 });
        this.load.audio('bossBulletSound', 'assets/sounds/bossBulletSounds.wav');
        this.load.audio('bossDestructionSound', 'assets/sounds/bossDestructionSound.wav');
    }
    create(data) {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        console.log("Received data:", data);
        const video = this.add.video(centerX, centerY, 'stage1bgvid');
    
        // Debugging: Check if the video object exists
        if (!video) {
            console.error('Video object is null. Using fallback image.');
            this.add.image(centerX, centerY, 'console-bg').setDisplaySize(1300, 750);
            return;
        }
    
        // Set the video's depth to ensure it's rendered behind other objects
        video.setDepth(-1);
    
        // Play the video before setting the display size
        video.play(true); // Loop the video
    
        // Ensure the video is fully loaded before setting the size
        video.on('play', () => {
            console.log('Video is now playing. Setting display size...');
            video.setOrigin(0.5, 0.5).setDisplaySize(1300, 750);
        });
    
        // Handle video errors
        video.on('error', () => {
            console.error('Video failed to load. Using fallback image.');
            this.add.image(centerX, centerY, 'console-bg').setDisplaySize(1300, 750);
        });
    
        this.stage = data.stage || 1;
        this.player1Ship = data.player1Ship || 'ship1';
        this.player2Ship = data.player2Ship || 'ship1';
        this.mode = data.mode || '1player';
        this.player1BulletType = data.player1Bullet || 'bullet1';
        this.player2BulletType = data.player2Bullet || 'bullet1';
    
        console.log('Stage:', this.stage);
        console.log('Player 1 Ship:', this.player1Ship);
        console.log('Player 2 Ship:', this.player2Ship);
    
        // Initialize player1 and player2 with visibility set to false
        this.player1 = this.physics.add.sprite(-100, -100, this.player1Ship).setVisible(false);
        this.player2 = this.physics.add.sprite(-100, -100, this.player2Ship).setVisible(false);
    
        this.shootSound = this.sound.add('shootSound');
        this.bossBulletSound = this.sound.add('bossBulletSound');
        this.destructionSound = this.sound.add('destructionSound');
        this.bossDestructionSound = this.sound.add('bossDestructionSound');
    
        this.player1 = this.physics.add.sprite(400, 500, this.player1Ship).setCollideWorldBounds(true).setScale(0.35);
        this.player1.body.setSize(this.player1.width * 0.3, this.player1.height * 0.3);
        this.player1.setDepth(1);
        this.player1Lives = 3;
        this.player1Score = 0;
    
        if (this.mode === '2player') {
            this.player2 = this.physics.add.sprite(800, 500, this.player2Ship).setCollideWorldBounds(true).setScale(0.35);
            this.player2.body.setSize(this.player2.width * 0.3, this.player2.height * 0.3);
            this.player2.setDepth(1);
            this.player2Lives = 3;
            this.player2Score = 0;
        }
    
        this.player1LivesIcons = this.add.group({
            classType: Phaser.GameObjects.Image, // Force correct type
            key: 'lifeIcon',
            repeat: this.player1Lives - 1,
            runChildUpdate: true
        });
        
        for (let i = 0; i < this.player1Lives; i++) {
            this.player1LivesIcons.add(this.add.image(72 + i * 30, 42, 'lifeIcon').setScale(1));
        }
        
        if (this.mode === '2player') {
            this.player2LivesIcons = this.add.group({
                key: 'lifeIcon',
                repeat: this.player2Lives - 1,
                setXY: { x: this.cameras.main.width - 72 - (this.player2Lives - 1), y: 42, stepX: -30 }
            });
        }
    
        this.player1ScoreText = this.add.text(60, 12, 'Score: 0', { fontSize: '20px', fill: '#fff' });
        if (this.mode === '2player') {
            this.player2ScoreText = this.add.text(this.cameras.main.width - 60, 12, 'Score: 0', { fontSize: '20px', fill: '#fff' }).setOrigin(1, 0);
        }
    
        this.player1Bullets = this.physics.add.group({
            defaultKey: this.player1BulletType,
            maxSize: 1000,
            runChildUpdate: true,
            createCallback: (bullet) => {
                bullet.setScale(0.7);
                bullet.body.setSize(bullet.width * 0.2, bullet.height * 0.5);
            }
        });
    
        if (this.mode === '2player') {
            this.player2Bullets = this.physics.add.group({
                defaultKey: this.player2BulletType,
                maxSize: 1000,
                runChildUpdate: true,
                createCallback: (bullet) => {
                    bullet.setScale(0.7);
                    bullet.body.setSize(bullet.width * 0.2, bullet.height * 0.5);
                }
            });
        }
    
        this.enemies = this.physics.add.group({ defaultKey: 'enemy', maxSize: 20, runChildUpdate: true });
        this.enemyBullets = this.physics.add.group({ defaultKey: 'enemyBullet', maxSize: 1000, runChildUpdate: true });
    
        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE
        });
    
        if (this.mode === '2player') {
            this.arrowKeys = this.input.keyboard.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.UP,
                down: Phaser.Input.Keyboard.KeyCodes.DOWN,
                left: Phaser.Input.Keyboard.KeyCodes.LEFT,
                right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
                shift: Phaser.Input.Keyboard.KeyCodes.SHIFT
            });
        }
    
        this.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.shootBullet(this.player1);
            }
        });
    
        this.waveText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, '', { fontSize: '40px', fill: '#ffffff' }).setOrigin(0.5);
        this.physics.add.overlap(this.player1Bullets, this.enemies, (bullet, enemy) => this.destroyEnemy(bullet, enemy), null, this);
        if (this.mode === '2player') {
            this.physics.add.overlap(this.player2Bullets, this.enemies, (bullet, enemy) => this.destroyEnemy(bullet, enemy), null, this);
        }
        this.physics.add.overlap(this.player1, this.enemies, (player, enemy) => this.playerHit(player, enemy), null, this);
        this.physics.add.overlap(this.player1, this.enemyBullets, (player, bullet) => this.playerHit(player, bullet), null, this);
        if (this.player2) {
            this.physics.add.overlap(this.player2, this.enemies, (player, enemy) => this.playerHit(player, enemy), null, this);
            this.physics.add.overlap(this.player2, this.enemyBullets, (player, bullet) => this.playerHit(player, bullet), null, this);
        }
        this.powerUps = this.physics.add.group();
        this.physics.add.overlap(this.player1, this.powerUps, (player, powerup) => this.collectPowerup(player, powerup), null, this);
        if (this.player2) {
            this.physics.add.overlap(this.player2, this.powerUps, (player, powerup) => this.collectPowerup(player, powerup), null, this);
        }
        this.waveText.setText(`Wave ${this.wave}`);
        this.time.delayedCall(2000, () => {
            this.waveText.setText('');
            this.time.addEvent({ delay: 1000, callback: this.spawnEnemy, callbackScope: this, loop: true });
        }, [], this);
    
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 1, end: 5 }),
            frameRate: 40,
            repeat: 0,
            hideOnComplete: true
        });
        this.explosionsGroup = this.physics.add.group();
        // ✅ GLOBAL ENEMY SHOOT TIMER
        this.enemyShootTimer = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                this.enemies.getChildren().forEach(enemy => {
                    if (enemy.active) this.enemyShoot(enemy);
                });
            },
            callbackScope: this
        });

        // ✅ PAUSE BUTTON
        const pauseButton = document.getElementById('pauseBtn');
        let isPaused = false;
        if (pauseButton) {
            pauseButton.addEventListener('click', () => {
                isPaused = !isPaused;
                if (isPaused) {
                    this.scene.pause();
                    pauseButton.innerText = '▶️ Resume';
                } else {
                    this.scene.resume();
                    pauseButton.innerText = '⏸ Pause';
                }
            });
        }

    }

update() {
    let speed = this.speedBoost ? 500 : 300;

    if (this.keys) {
        if (this.keys.left.isDown) this.player1.setVelocityX(-speed);
        else if (this.keys.right.isDown) this.player1.setVelocityX(speed);
        else this.player1.setVelocityX(0);
        if (this.keys.up.isDown) this.player1.setVelocityY(-speed);
        else if (this.keys.down.isDown) this.player1.setVelocityY(speed);
        else this.player1.setVelocityY(0);

        if (Phaser.Input.Keyboard.JustDown(this.keys.space)) this.shootBullet(this.player1);
    }

    if (this.player2 && this.arrowKeys) {
        if (this.arrowKeys.left.isDown) this.player2.setVelocityX(-speed);
        else if (this.arrowKeys.right.isDown) this.player2.setVelocityX(speed);
        else this.player2.setVelocityX(0);
        if (this.arrowKeys.up.isDown) this.player2.setVelocityY(-speed);
        else if (this.arrowKeys.down.isDown) this.player2.setVelocityY(speed);
        else this.player2.setVelocityY(0);

        if (Phaser.Input.Keyboard.JustDown(this.arrowKeys.shift)) this.shootBullet(this.player2);
    }

    if (this.boss?.active) this.moveBoss();
}

    
updateLivesUI(livesIcons, lives, isPlayer2 = false) {
    // Debugging: Check if livesIcons is defined
    if (!livesIcons) {
        console.error('livesIcons is undefined!');
        return;
    }

    console.log(`--- Updating Lives UI ---`);
    console.log(`Player: ${isPlayer2 ? "Player 2" : "Player 1"}`);
    console.log(`Before clearing, Lives UI Count: ${livesIcons.getLength()}`);
    console.log(`Lives Left: ${lives}`);

    // Destroy each life icon properly
    livesIcons.getChildren().forEach(icon => {
        icon.destroy();  // Fully remove the object
    });

    // Clear the group to remove any references
    livesIcons.clear(true, true);

    // Force Phaser to process pending changes before adding new icons
    this.time.delayedCall(100, () => {
        console.log(`After clearing, Lives UI Count: ${livesIcons.getLength()}`);

        // Re-add icons based on the updated number of lives
        for (let i = 0; i < lives; i++) {
            let newX = isPlayer2 ? this.cameras.main.width - 72 - i * 30 : 72 + i * 30;
            let newLifeIcon = this.add.image(newX, 42, 'lifeIcon').setScale(1);
            livesIcons.add(newLifeIcon);
        }

        console.log(`After adding, Lives UI Count: ${livesIcons.getLength()}`);
    }, [], this);
}



    moveBoss() {
        if (!this.boss.moveTimer) {
            this.boss.moveTimer = this.time.delayedCall(Phaser.Math.Between(1000, 3000), () => {
                this.boss.moveTimer = null;
            }, [], this);
            const directions = [
                { x: 100, y: 0 }, { x: -100, y: 0 }, { x: 0, y: 100 }, { x: 0, y: -100 },
                { x: 100, y: 100 }, { x: -100, y: 100 }, { x: 100, y: -100 }, { x: -100, y: -100 }
            ];
            const direction = Phaser.Utils.Array.GetRandom(directions);
            this.boss.setVelocityX(direction.x);
            this.boss.setVelocityY(direction.y);
            const speed = Phaser.Math.Between(50, 150);
            this.boss.setVelocityX(this.boss.body.velocity.x * speed / 100);
            this.boss.setVelocityY(this.boss.body.velocity.y * speed / 100);
        }

        if (this.boss.x <= 100) this.boss.setVelocityX(100);
        else if (this.boss.x >= 700) this.boss.setVelocityX(-100);
        if (this.boss.y <= 50) this.boss.setVelocityY(100);
        else if (this.boss.y >= 200) this.boss.setVelocityY(-100);
    }

    spawnEnemy() {
        if (this.enemiesSpawned < this.maxEnemiesPerWave) {
            // Center of the screen
            const centerX = this.cameras.main.centerX;
            const centerY = 0; // Spawn at the top of the screen
    
            // Randomize the X position within a range around the center
            const scatterRange = 500; // Adjust this value to control how far enemies can spawn from the center
            const x = Phaser.Math.Between(centerX - scatterRange, centerX + scatterRange); // Random X position within the range
    
            // Create the enemy at the randomized position
            const enemy = this.enemies.create(x, centerY, 'enemy');
            if (enemy) {
                enemy.setVelocityY(100); // Move downward
                enemy.body.setSize(enemy.width * 0.2, enemy.height * 0.1); // Adjust hitbox
            }
    
            // Add shooting behavior for the enemy
            
    
            this.enemiesSpawned++; // Increment the enemy count
        }
    
        // Start the wave end timer if all enemies are spawned
        if (this.enemiesSpawned >= this.maxEnemiesPerWave && !this.waveEndTimer) {
            this.waveEndTimer = this.time.delayedCall(2000, this.nextWave, [], this); // End wave after 2 seconds
        }
    }


    enemyShoot(enemy) {
        if (!enemy.active) return;
        const bullet = this.enemyBullets.get(enemy.x, enemy.y + 20);
        if (bullet) {
            bullet.setActive(true).setVisible(true).setVelocityY(200);
            bullet.body.setSize(bullet.width * 0.1, bullet.height * 0.3);
        }
    }

    nextWave() {
        this.wave++;
        if (this.wave <= 3) {
            this.waveText.setText(`Wave ${this.wave}`);
            this.time.delayedCall(2000, () => { this.waveText.setText(''); }, [], this);
            this.enemiesSpawned = 0;
            this.maxEnemiesPerWave += 15;
            this.waveEndTimer = null;
            this.time.delayedCall(2000, this.spawnEnemy, [], this);
        } else {
            this.time.delayedCall(3000, this.bossFight, [], this);
        }
    }

    bossFight() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        const healthBarWidth = 300;
    
        this.waveText = this.add.text(centerX, centerY, '', { fontSize: '40px', fill: '#ffffff' }).setOrigin(0.5);
        this.bossHealth = 20;
        this.bossDestroyed = false;
        this.waveText.setText('Final Boss!');
        this.time.delayedCall(2000, () => { this.waveText.setText(''); }, [], this);
    
        this.boss = this.physics.add.sprite(centerX, 100, 'boss').setScale(0.8).setVelocityY(50);
        this.boss.body.setSize(this.boss.width * 0.5, this.boss.height * 0.5);
        this.boss.setCollideWorldBounds(true);
    
        this.physics.add.overlap(this.player1Bullets, this.boss, (boss, bullet) => this.hitBoss(boss, bullet), null, this);
        if (this.mode === '2player') {
            this.physics.add.overlap(this.player2Bullets, this.boss, (boss, bullet) => this.hitBoss(boss, bullet), null, this);
        }
    
        this.bossHealthBarBg = this.add.graphics();
        this.bossHealthBarBg.fillStyle(0x222222, 1);
        this.bossHealthBarBg.fillRect(centerX - healthBarWidth / 2, 50, healthBarWidth, 15);
    
        this.bossHealthBar = this.add.graphics();
        this.bossHealthBar.fillStyle(0xff0000, 1);
        this.bossHealthBar.fillRect(centerX - healthBarWidth / 2, 50, healthBarWidth, 10);
    
        this.time.addEvent({
            delay: 2000,
            callback: this.bossShoot,
            callbackScope: this,
            loop: true
        });
    }
    
    hitBoss(boss, bullet) {
        if (!boss || !boss.active || this.bossDestroyed) return;
        bullet.destroy();
        this.bossHealth = Math.max(0, this.bossHealth - 1);
        let healthPercentage = this.bossHealth / 20;
        const centerX = this.cameras.main.centerX;
        const healthBarWidth = 300;
        this.bossHealthBar.clear();
        this.bossHealthBar.fillStyle(0xff0000, 1);
        this.bossHealthBar.fillRect(centerX - healthBarWidth / 2, 50, healthBarWidth * healthPercentage, 15);
    
        if (this.bossHealth <= 0) {
            if (!this.bossDestroyed) {
            this.bossDestroyed = true;
            this.time.delayedCall(500, () => {
                if (this.boss && this.boss.active) {
                this.boss.destroy();
                this.bossHealthBar.destroy();
                this.bossHealthBarBg.destroy();
                this.add.text(centerX, this.cameras.main.centerY, 'YOU WIN!', {
                    fontSize: '40px',
                    fill: '#0f0',
                    fontStyle: 'bold'
                }).setOrigin(0.5);
                if (this.bossDestructionSound) {
                    this.bossDestructionSound.play();
                }
                }
    
                    // Pass all necessary data to Stage2Scene
                    this.time.delayedCall(2000, () => {
                        this.scene.start('StageSelectionScene', {
                            player1Ship: this.player1Ship,
                            player2Ship: this.player2Ship,
                            mode: this.mode,
                            player1Bullet: this.player1BulletType,
                            player2Bullet: this.player2BulletType,
                            player1Lives: this.player1Lives,
                            player2Lives: this.player2Lives,
                            player1Score: this.player1Score,
                            player2Score: this.player2Score,
                            completedStages: [1, 2], // Mark Stage 2 as completed
                            currentStage: 2
                        });
                    }, [], this);
                });
            }
        }
    }


    bossShoot() {
        if (!this.boss || !this.boss.active) return;
        const bullet = this.enemyBullets.get(this.boss.x, this.boss.y + 20, 'bossBullet');
        if (bullet) {
            bullet.setActive(true).setVisible(true).setVelocityY(800); // Increased speed from 200 to 800
            bullet.body.setSize(bullet.width * 0.5, bullet.height * 0.5);
            this.bossBulletSound.play(); // Play shoot sound
        }

        // Double Shot every 3 seconds
        this.time.addEvent({
            delay: 4000,
            callback: () => {
                let bulletGap = 45; // Adjust this value for wider/narrower spread
                const positions = [-bulletGap, bulletGap]; // Double shot positions

                positions.forEach(offset => {
                    let extraBullet = this.enemyBullets.get(this.boss.x + offset, this.boss.y + 20, 'bossBullet');
                    if (extraBullet) {
                        extraBullet.setActive(true).setVisible(true).setVelocityY(800);
                        extraBullet.body.setSize(extraBullet.width * 0.5, extraBullet.height * 0.5);
                        this.bossBulletSound.play(); // Play shoot sound
                    }
                });
            },
            callbackScope: this,
            loop: true
        });
    }

    destroyEnemy(bullet, enemy) {
        if (!enemy) return;
        if (this.destructionSound) this.destructionSound.play();
        let explosion = this.explosionsGroup.create(enemy.x, enemy.y, 'explosion');
        explosion.play('explode');
        if (bullet) bullet.destroy();
        enemy.destroy();
        if (Phaser.Math.Between(1, 100) <= 30) {
            this.spawnPowerup(enemy.x, enemy.y);
        }
        if (bullet && bullet.parent) {
            if (bullet.parent === this.player1) {
                this.player1Score += 10;
                this.player1ScoreText.setText(`Score: ${this.player1Score}`);
            } else if (bullet.parent === this.player2) {
                this.player2Score += 10;
                this.player2ScoreText.setText(`Score: ${this.player2Score}`);
            }
        }
    }
    playerHit(player, object) {
        if (!player || !player.active || !object || !object.active) return;
    
        object.destroy();
    
        if (player === this.player1) {
            console.log('Player 1 hit! Updating Lives UI...');
            this.player1Lives--; // Reduce player lives
            this.updateLivesUI(this.player1LivesIcons, this.player1Lives); // Update UI
    
            console.log(`Player 1 Lives after hit: ${this.player1Lives}`);
            if (this.player1Lives <= 0) {
                player.setActive(false).setVisible(false);
                this.keys.space.enabled = false; // Disable shooting for Player 1
            }
        } else if (player === this.player2) {
            this.player2Lives--;
            console.log(`Player 2 Lives: ${this.player2Lives}`); // Debug log
            this.updateLivesUI(this.player2LivesIcons, this.player2Lives, true); // Update Player 2 lives icons
            if (this.player2Lives <= 0) {
                player.setActive(false).setVisible(false);
                this.arrowKeys.shift.enabled = false; // Disable shooting for Player 2
            }
        }
    
        // Check if either player has lost all lives
        if ((this.player1Lives <= 0 && this.mode === '1player') || 
            (this.player1Lives <= 0 && (!this.player2 || this.player2Lives <= 0))) {
            this.gameOver();
        }
    
        player.setTint(0xff0000);
        this.time.delayedCall(1000, () => {
            player.clearTint();
        }, [], this);
    }
    shootBullet(player) {
        if (player === this.player1 && this.player1Lives <= 0) return; // Disable shooting for Player 1 if lives are 0
        if (player === this.player2 && this.player2Lives <= 0) return; // Disable shooting for Player 2 if lives are 0

        if (this.shootSound) {
            this.shootSound.play({ rate: 1.5 }); // Speed up the shooting sound
        }

        if (this.tripleShot) {
            let bulletGap = 35; // Adjust this value for wider/narrower spread
            const positions = [-bulletGap, 0, bulletGap]; // Bullet spread positions

            positions.forEach(offset => {
                let bullet = player === this.player1 
                    ? this.player1Bullets.get(player.x + offset, player.y - 20) 
                    : this.player2Bullets.get(player.x + offset, player.y - 20);
                    
                if (bullet) {
                    bullet.setActive(true).setVisible(true).setVelocityY(-400);
                    bullet.body.setSize(bullet.width * 0.2, bullet.height * 0.2); // Smaller hitbox
                    bullet.parent = player;
                }
            });

        } else { // Single Shot
            let bullet = player === this.player1 
                ? this.player1Bullets.get(player.x, player.y - 20) 
                : this.player2Bullets.get(player.x, player.y - 20);
                
            if (bullet) {
                bullet.setActive(true).setVisible(true).setVelocityY(-400);
                bullet.body.setSize(bullet.width * 0.1, bullet.height * 0.4);
                bullet.parent = player;
            }
        }
    }
    spawnPowerup(x, y) {
        const powerUpTypes = this.stage === 2 
            ? ['powerSpeed', 'powerGun', 'powerLife', 'powerShield', 'powerBomb'] 
            : ['powerSpeed', 'powerGun', 'powerLife']; // Only basic power-ups in Stage 1
    
        const randomPowerUp = Phaser.Utils.Array.GetRandom(powerUpTypes);
        const powerUp = this.powerUps.create(x, y, randomPowerUp).setVelocityY(100);
        powerUp.setData('type', randomPowerUp);
        powerUp.body.setSize(powerUp.width * 0.1, powerUp.height * 0.1);
    }

        collectPowerup(player, powerup) {
        const powerupType = powerup.getData('type');
    
        switch (powerupType) {
            case 'powerSpeed': // Speed Boost Power-Up
                this.speedBoost = true;
                player.setTint(0x00ff00); // Flash green
                this.time.delayedCall(5000, () => {
                    this.speedBoost = false;
                    player.clearTint(); // Reset tint
                }, [], this);
                break;
    
            case 'powerGun': // Triple Shot Power-Up
                this.tripleShot = true;
                this.time.delayedCall(5000, () => {
                    this.tripleShot = false; // Reset triple shot
                }, [], this);
                break;
    
            case 'powerLife': // Extra Life Power-Up
                if (player === this.player1) {
                    this.player1Lives++;
                    this.updateLivesUI(this.player1LivesIcons, this.player1Lives, false); // Update Player 1 lives UI
                } else if (player === this.player2) {
                    this.player2Lives++;
                    this.updateLivesUI(this.player2LivesIcons, this.player2Lives, true); // Update Player 2 lives UI
                }
                break;
    
            case 'powerShield': // Shield Power-Up (New)
                player.setTint(0x0000ff); // Flash blue
                player.invincible = true; // Make player invincible
                this.time.delayedCall(5000, () => {
                    player.invincible = false;
                    player.clearTint(); // Reset tint
                }, [], this);
                break;
    
            case 'powerBomb': // Bomb Power-Up (New)
                this.enemies.getChildren().forEach(enemy => {
                    if (enemy.active) {
                        this.destroyEnemy(null, enemy); // Destroy all active enemies
                    }
                });
                break;
    
            default:
                console.warn(`Unknown power-up type: ${powerupType}`);
                break;
        }
    
        powerup.destroy(); // Remove the power-up after collection
    }

   
    gameOver() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        this.add.text(centerX, centerY, 'Game Over!', {
            fontSize: '40px',
            fill: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    
        // Disable players
        if (this.player1) this.player1.setActive(false).setVisible(false);
        if (this.player2) this.player2.setActive(false).setVisible(false);
    
        // Clear all game objects
        this.enemies.clear(true, true);
        this.enemyBullets.clear(true, true);
        this.powerUps.clear(true, true);
    
        // Reset game state
        this.wave = 1;
        this.enemiesSpawned = 0;
        this.maxEnemiesPerWave = 15;
        this.boss = null;
        this.bossHealth = 20;
        this.speedBoost = false;
        this.tripleShot = false;
        this.score = 0;
        this.lives = 3;
    
        // Reset player lives
        this.player1Lives = 3;
        if (this.mode === '2player') {
            this.player2Lives = 3;
        }
    
        // Reset UI
        if (this.livesIcons) {
            this.livesIcons.clear(true, true);
        }
        this.updateLivesUI(this.player1LivesIcons, this.player1Lives);
        if (this.mode === '2player') {
            this.updateLivesUI(this.player2LivesIcons, this.player2Lives, true);
        }
    
        // Restart the scene after a delay
        this.time.delayedCall(2000, () => {
            this.scene.restart();
        }, [], this);
    }
}



class Stage2Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'Stage2Scene' });
        this.wave = 1;
        this.enemiesSpawned = 0;
        this.maxEnemiesPerWave = 25;
        this.boss = null;
        this.bossHealth = 20;
        this.speedBoost = false;
        this.tripleShot = false;
        this.score = 0;
        this.lives = 3;
        this.player1 = null;
        this.player2 = null;
        this.bullets = null;
        this.enemies = null;
        this.enemyBullets = null;
        this.keys = null;
        this.arrowKeys = null;
        this.scoreText = null;
        this.waveText = null;
        this.livesIcons = null;
        this.explosionsGroup = null;
        this.powerUps = null;
        this.shootSound = null;
        this.destructionSound = null;
    }
    preload() {
        this.load.video('stage2bgvid', 'assets/vid/stage2.mp4', undefined, true); // true enables noAudio

        // Add error handling
        this.load.on('fileerror', (file) => {
            console.error('Failed to load file:', file.key);
        });
    
        // Debugging: Log when the video is loaded
        this.load.on('filecomplete', (key) => {
            if (key === 'stage2bgvid') {
                console.log('Video loaded successfully:', key);
            }
        });


        this.load.audio('shootSound', 'assets/sounds/laserSound.wav');
        this.load.audio('destructionSound', 'assets/sounds/destructionSound.wav');
        this.load.spritesheet('explosion', 'assets/sprites/explosion.png', { frameWidth: 64, frameHeight: 64 });
        
    
        this.load.image('console-bg', 'assets/img/console-bg1.jpg');
        this.load.image('ship1', 'assets/img/ship1.png');
        this.load.image('ship2', 'assets/img/ship2.png');
        this.load.image('ship3', 'assets/img/ship3.png');
      
        this.load.image('powerSpeed', 'assets/img/power-speed.png');
        this.load.image('powerGun', 'assets/img/power-gun.png');
        this.load.image('powerLife', 'assets/img/power-life.png');
        this.load.image('lifeIcon', 'assets/img/power-life.png');
        this.load.image('powerBomb', 'assets/img/bomb.png');

        this.load.image('stage2Bg', 'assets/img/stage2-bg1.jpg');
        this.load.image('enemy2', 'assets/img/enemy2.png');


        this.load.image('boss2', 'assets/img/boss.png');
        this.load.image('bossBullet2', 'assets/img/boss-bullet1.png');

        this.load.image('enemy2', 'assets/img/enemy2.png');
        this.load.image('enemyBullet2', 'assets/img/enemy-bullet2.png');


        this.load.audio('bossBulletSound', 'assets/sounds/bossBulletSound.wav');
        this.load.audio('bossDestructionSound', 'assets/sounds/bossDestructionSound.wav');
        

    }
    
    create(data) {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        console.log("Received data:", data);
        const video = this.add.video(centerX, centerY, 'stage2bgvid');
    
        // Debugging: Check if the video object exists
        if (!video) {
            console.error('Video object is null. Using fallback image.');
            this.add.image(centerX, centerY, 'console-bg').setDisplaySize(1300, 750);
            return;
        }
    
        // Set the video's depth to ensure it's rendered behind other objects
        video.setDepth(-1);
    
        // Play the video before setting the display size
        video.play(true); // Loop the video
    
        // Ensure the video is fully loaded before setting the size
        video.on('play', () => {
            console.log('Video is now playing. Setting display size...');
            video.setOrigin(0.5, 0.5).setDisplaySize(1300, 750);
        });
    
        // Handle video errors
        video.on('error', () => {
            console.error('Video failed to load. Using fallback image.');
            this.add.image(centerX, centerY, 'console-bg').setDisplaySize(1300, 750);
        });
    
        this.stage = data.stage || 1;
        this.player1Ship = data.player1Ship || 'ship1';
        this.player2Ship = data.player2Ship || 'ship1';
        this.mode = data.mode || '1player';
        this.player1BulletType = data.player1Bullet || 'bullet1';
        this.player2BulletType = data.player2Bullet || 'bullet1';
    
        console.log('Stage:', this.stage);
        console.log('Player 1 Ship:', this.player1Ship);
        console.log('Player 2 Ship:', this.player2Ship);
    
        // Initialize player1 and player2 with visibility set to false
        this.player1 = this.physics.add.sprite(-100, -100, this.player1Ship).setVisible(false);
        this.player2 = this.physics.add.sprite(-100, -100, this.player2Ship).setVisible(false);
    
        this.shootSound = this.sound.add('shootSound');
        this.bossBulletSound = this.sound.add('bossBulletSound');
        this.destructionSound = this.sound.add('destructionSound');
        this.bossDestructionSound = this.sound.add('bossDestructionSound');
    
        this.player1 = this.physics.add.sprite(400, 500, this.player1Ship).setCollideWorldBounds(true).setScale(0.35);
        this.player1.body.setSize(this.player1.width * 0.3, this.player1.height * 0.3);
        this.player1.setDepth(1);
        this.player1Lives = 3;
        this.player1Score = 0;
    
        if (this.mode === '2player') {
            this.player2 = this.physics.add.sprite(800, 500, this.player2Ship).setCollideWorldBounds(true).setScale(0.35);
            this.player2.body.setSize(this.player2.width * 0.3, this.player2.height * 0.3);
            this.player2.setDepth(1);
            this.player2Lives = 3;
            this.player2Score = 0;
        }
    
        this.player1LivesIcons = this.add.group({
            classType: Phaser.GameObjects.Image, // Force correct type
            key: 'lifeIcon',
            repeat: this.player1Lives - 1,
            runChildUpdate: true
        });
    
        for (let i = 0; i < this.player1Lives; i++) {
            this.player1LivesIcons.add(this.add.image(72 + i * 30, 42, 'lifeIcon').setScale(1));
        }
    
        if (this.mode === '2player') {
            this.player2LivesIcons = this.add.group({
                key: 'lifeIcon',
                repeat: this.player2Lives - 1,
                setXY: { x: this.cameras.main.width - 72 - (this.player2Lives - 1), y: 42, stepX: -30 }
            });
        }
    
        this.player1ScoreText = this.add.text(60, 12, 'Score: 0', { fontSize: '20px', fill: '#fff' });
        if (this.mode === '2player') {
            this.player2ScoreText = this.add.text(this.cameras.main.width - 60, 12, 'Score: 0', { fontSize: '20px', fill: '#fff' }).setOrigin(1, 0);
        }
    
        this.player1Bullets = this.physics.add.group({
            defaultKey: this.player1BulletType,
            maxSize: 1000,
            runChildUpdate: true,
            createCallback: (bullet) => {
                bullet.setScale(0.7);
                bullet.body.setSize(bullet.width * 0.2, bullet.height * 0.5);
            }
        });
    
        if (this.mode === '2player') {
            this.player2Bullets = this.physics.add.group({
                defaultKey: this.player2BulletType,
                maxSize: 1000,
                runChildUpdate: true,
                createCallback: (bullet) => {
                    bullet.setScale(0.7);
                    bullet.body.setSize(bullet.width * 0.2, bullet.height * 0.5);
                }
            });
        }
    
        this.enemies = this.physics.add.group({ defaultKey: 'enemy', maxSize: 20, runChildUpdate: true });
        this.enemyBullets = this.physics.add.group({ defaultKey: 'enemyBullet', maxSize: 1000, runChildUpdate: true });
    
        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE
        });
    
        if (this.mode === '2player') {
            this.arrowKeys = this.input.keyboard.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.UP,
                down: Phaser.Input.Keyboard.KeyCodes.DOWN,
                left: Phaser.Input.Keyboard.KeyCodes.LEFT,
                right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
                shift: Phaser.Input.Keyboard.KeyCodes.SHIFT
            });
        }
    
        this.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.shootBullet(this.player1);
            }
        });
    
        this.waveText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, '', { fontSize: '40px', fill: '#ffffff' }).setOrigin(0.5);
        this.physics.add.overlap(this.player1Bullets, this.enemies, (bullet, enemy) => this.destroyEnemy(bullet, enemy), null, this);
        if (this.mode === '2player') {
            this.physics.add.overlap(this.player2Bullets, this.enemies, (bullet, enemy) => this.destroyEnemy(bullet, enemy), null, this);
        }
        this.physics.add.overlap(this.player1, this.enemies, (player, enemy) => this.playerHit(player, enemy), null, this);
        this.physics.add.overlap(this.player1, this.enemyBullets, (player, bullet) => this.playerHit(player, bullet), null, this);
        if (this.player2) {
            this.physics.add.overlap(this.player2, this.enemies, (player, enemy) => this.playerHit(player, enemy), null, this);
            this.physics.add.overlap(this.player2, this.enemyBullets, (player, bullet) => this.playerHit(player, bullet), null, this);
        }
        this.powerUps = this.physics.add.group();
        this.physics.add.overlap(this.player1, this.powerUps, (player, powerup) => this.collectPowerup(player, powerup), null, this);
        if (this.player2) {
            this.physics.add.overlap(this.player2, this.powerUps, (player, powerup) => this.collectPowerup(player, powerup), null, this);
        }
        this.waveText.setText(`Wave ${this.wave}`);
        this.time.delayedCall(2000, () => {
            this.waveText.setText('');
            this.time.addEvent({ delay: 1000, callback: this.spawnEnemy, callbackScope: this, loop: true });
        }, [], this);
    
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 1, end: 5 }),
            frameRate: 40,
            repeat: 0,
            hideOnComplete: true
        });
        this.explosionsGroup = this.physics.add.group();
        // ✅ GLOBAL ENEMY SHOOT TIMER
        this.enemyShootTimer = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                this.enemies.getChildren().forEach(enemy => {
                    if (enemy.active) this.enemyShoot(enemy);
                });
            },
            callbackScope: this
        });

        // ✅ PAUSE BUTTON
        const pauseButton = document.getElementById('pauseBtn');
        let isPaused = false;
        if (pauseButton) {
            pauseButton.addEventListener('click', () => {
                isPaused = !isPaused;
                if (isPaused) {
                    this.scene.pause();
                    pauseButton.innerText = '▶️ Resume';
                } else {
                    this.scene.resume();
                    pauseButton.innerText = '⏸ Pause';
                }
            });
        }

    }

    update() {
        let speed = this.speedBoost ? 500 : 300;

        if (this.keys) {
            if (this.keys.left.isDown) this.player1.setVelocityX(-speed);
            else if (this.keys.right.isDown) this.player1.setVelocityX(speed);
            else this.player1.setVelocityX(0);
            if (this.keys.up.isDown) this.player1.setVelocityY(-speed);
            else if (this.keys.down.isDown) this.player1.setVelocityY(speed);
            else this.player1.setVelocityY(0);

            if (Phaser.Input.Keyboard.JustDown(this.keys.space)) this.shootBullet(this.player1);
        }

        if (this.player2 && this.arrowKeys) {
            if (this.arrowKeys.left.isDown) this.player2.setVelocityX(-speed);
            else if (this.arrowKeys.right.isDown) this.player2.setVelocityX(speed);
            else this.player2.setVelocityX(0);
            if (this.arrowKeys.up.isDown) this.player2.setVelocityY(-speed);
            else if (this.arrowKeys.down.isDown) this.player2.setVelocityY(speed);
            else this.player2.setVelocityY(0);

            if (Phaser.Input.Keyboard.JustDown(this.arrowKeys.shift)) this.shootBullet(this.player2);
        }

        if (this.boss?.active) this.moveBoss();
    }


       
updateLivesUI(livesIcons, lives, isPlayer2 = false) {
    // Debugging: Check if livesIcons is defined
    if (!livesIcons) {
        console.error('livesIcons is undefined!');
        return;
    }

    console.log(`--- Updating Lives UI ---`);
    console.log(`Player: ${isPlayer2 ? "Player 2" : "Player 1"}`);
    console.log(`Before clearing, Lives UI Count: ${livesIcons.getLength()}`);
    console.log(`Lives Left: ${lives}`);

    // Destroy each life icon properly
    livesIcons.getChildren().forEach(icon => {
        icon.destroy();  // Fully remove the object
    });

    // Clear the group to remove any references
    livesIcons.clear(true, true);

    // Force Phaser to process pending changes before adding new icons
    this.time.delayedCall(100, () => {
        console.log(`After clearing, Lives UI Count: ${livesIcons.getLength()}`);

        // Re-add icons based on the updated number of lives
        for (let i = 0; i < lives; i++) {
            let newX = isPlayer2 ? this.cameras.main.width - 72 - i * 30 : 72 + i * 30;
            let newLifeIcon = this.add.image(newX, 42, 'lifeIcon').setScale(1);
            livesIcons.add(newLifeIcon);
        }

        console.log(`After adding, Lives UI Count: ${livesIcons.getLength()}`);
    }, [], this);
}


playerHit(player, object) {
    if (!player || !player.active || !object || !object.active) return;

    object.destroy();

    if (player === this.player1) {
        console.log('Player 1 hit! Updating Lives UI...');
        this.player1Lives--; // Reduce player lives
        this.updateLivesUI(this.player1LivesIcons, this.player1Lives); // Update UI

        console.log(`Player 1 Lives after hit: ${this.player1Lives}`);
        if (this.player1Lives <= 0) {
            player.setActive(false).setVisible(false);
            this.keys.space.enabled = false; // Disable shooting for Player 1
        }
    } else if (player === this.player2) {
        this.player2Lives--;
        console.log(`Player 2 Lives: ${this.player2Lives}`); // Debug log
        this.updateLivesUI(this.player2LivesIcons, this.player2Lives, true); // Update Player 2 lives icons
        if (this.player2Lives <= 0) {
            player.setActive(false).setVisible(false);
            this.arrowKeys.shift.enabled = false; // Disable shooting for Player 2
        }
    }

    // Check if either player has lost all lives
    if ((this.player1Lives <= 0 && this.mode === '1player') || 
        (this.player1Lives <= 0 && (!this.player2 || this.player2Lives <= 0))) {
        this.gameOver();
    }

    player.setTint(0xff0000);
    this.time.delayedCall(1000, () => {
        player.clearTint();
    }, [], this);
}

    shootBullet(player) {
        if (player === this.player1 && this.player1Lives <= 0) return; // Disable shooting for Player 1 if lives are 0
        if (player === this.player2 && this.player2Lives <= 0) return; // Disable shooting for Player 2 if lives are 0

        if (this.shootSound) {
            this.shootSound.play({ rate: 1.5 }); // Speed up the shooting sound
        }

        if (this.tripleShot) {
            let bulletGap = 35; // Adjust this value for wider/narrower spread
            const positions = [-bulletGap, 0, bulletGap]; // Bullet spread positions

            positions.forEach(offset => {
                let bullet = player === this.player1 
                    ? this.player1Bullets.get(player.x + offset, player.y - 20) 
                    : this.player2Bullets.get(player.x + offset, player.y - 20);
                    
                if (bullet) {
                    bullet.setActive(true).setVisible(true).setVelocityY(-400);
                    bullet.body.setSize(bullet.width * 0.2, bullet.height * 0.2); // Smaller hitbox
                    bullet.parent = player;
                }
            });

        } else { // Single Shot
            let bullet = player === this.player1 
                ? this.player1Bullets.get(player.x, player.y - 20) 
                : this.player2Bullets.get(player.x, player.y - 20);
                
            if (bullet) {
                bullet.setActive(true).setVisible(true).setVelocityY(-400);
                bullet.body.setSize(bullet.width * 0.1, bullet.height * 0.4);
                bullet.parent = player;
            }
        }
    }

    moveBoss() {
        if (!this.boss.moveTimer) {
            this.boss.moveTimer = this.time.delayedCall(Phaser.Math.Between(1000, 3000), () => {
                this.boss.moveTimer = null;
            }, [], this);
            const directions = [
                { x: 100, y: 0 }, { x: -100, y: 0 }, { x: 0, y: 100 }, { x: 0, y: -100 },
                { x: 100, y: 100 }, { x: -100, y: 100 }, { x: 100, y: -100 }, { x: -100, y: -100 }
            ];
            const direction = Phaser.Utils.Array.GetRandom(directions);
            this.boss.setVelocityX(direction.x);
            this.boss.setVelocityY(direction.y);
            const speed = Phaser.Math.Between(50, 150);
            this.boss.setVelocityX(this.boss.body.velocity.x * speed / 100);
            this.boss.setVelocityY(this.boss.body.velocity.y * speed / 100);
        }

        if (this.boss.x <= 100) this.boss.setVelocityX(100);
        else if (this.boss.x >= 700) this.boss.setVelocityX(-100);
        if (this.boss.y <= 50) this.boss.setVelocityY(100);
        else if (this.boss.y >= 200) this.boss.setVelocityY(-100);
    }

    
    spawnEnemy() {
        if (this.enemiesSpawned < this.maxEnemiesPerWave) {
            // Center of the screen
            const centerX = this.cameras.main.centerX;
            const centerY = 0; // Spawn at the top of the screen
    
            // Randomize the X position within a range around the center
            const scatterRange = 500; // Adjust this value to control how far enemies can spawn from the center
            const x = Phaser.Math.Between(centerX - scatterRange, centerX + scatterRange); // Random X position within the range
    
            // Create the enemy at the randomized position
            const enemy = this.enemies.create(x, centerY, 'enemy2');
            if (enemy) {
                enemy.setVelocityY(100); // Move downward
                enemy.body.setSize(enemy.width * 0.2, enemy.height * 0.1); // Adjust hitbox
            }
    
            // Add shooting behavior for the enemy
            
    
            this.enemiesSpawned++; // Increment the enemy count
        }
    
        // Start the wave end timer if all enemies are spawned
        if (this.enemiesSpawned >= this.maxEnemiesPerWave && !this.waveEndTimer) {
            this.waveEndTimer = this.time.delayedCall(2000, this.nextWave, [], this); // End wave after 2 seconds
        }
    }

    enemyShoot(enemy) {
        if (!enemy.active) return;
        const bullet = this.enemyBullets.get(enemy.x, enemy.y + 20, 'enemyBullet2');
        if (bullet) {
            bullet.setActive(true).setVisible(true).setVelocityY(200);
            bullet.body.setSize(bullet.width * 0.1, bullet.height * 0.3);
        }
    }

    nextWave() {
        this.wave++;
        if (this.wave <= 3) {
            this.waveText.setText(`Wave ${this.wave}`);
            this.time.delayedCall(2000, () => { this.waveText.setText(''); }, [], this);
            this.enemiesSpawned = 0;
            this.maxEnemiesPerWave += 25;
            this.waveEndTimer = null;
            this.time.delayedCall(2000, this.spawnEnemy, [], this);
        } else {
            this.time.delayedCall(3000, this.bossFight, [], this);
        }
    }

    bossFight() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        const healthBarWidth = 300;
    
        this.waveText = this.add.text(centerX, centerY, '', { fontSize: '40px', fill: '#ffffff' }).setOrigin(0.5);
        this.bossHealth = 30;
        this.bossDestroyed = false;
        this.waveText.setText('Final Boss!');
        this.time.delayedCall(2000, () => { this.waveText.setText(''); }, [], this);
    
        this.boss = this.physics.add.sprite(centerX, 100, 'boss2').setScale(2).setVelocityY(50);
        this.boss.body.setSize(this.boss.width * 0.5, this.boss.height * 0.5);
        this.boss.setCollideWorldBounds(true);
    
        this.physics.add.overlap(this.player1Bullets, this.boss, (boss, bullet) => this.hitBoss(boss, bullet), null, this);
        if (this.mode === '2player') {
            this.physics.add.overlap(this.player2Bullets, this.boss, (boss, bullet) => this.hitBoss(boss, bullet), null, this);
        }
    
        this.bossHealthBarBg = this.add.graphics();
        this.bossHealthBarBg.fillStyle(0x222222, 1);
        this.bossHealthBarBg.fillRect(centerX - healthBarWidth / 2, 50, healthBarWidth, 15);
    
        this.bossHealthBar = this.add.graphics();
        this.bossHealthBar.fillStyle(0xff0000, 1);
        this.bossHealthBar.fillRect(centerX - healthBarWidth / 2, 50, healthBarWidth, 10);
    
        this.time.addEvent({
            delay: 2000,
            callback: this.bossShoot,
            callbackScope: this,
            loop: true
        });
    }
    
    hitBoss(boss, bullet) {
        if (!boss || !boss.active || this.bossDestroyed) return;
        bullet.destroy();
        this.bossHealth = Math.max(0, this.bossHealth - 1);
        let healthPercentage = this.bossHealth / 20;
        const centerX = this.cameras.main.centerX;
        const healthBarWidth = 300;
        this.bossHealthBar.clear();
        this.bossHealthBar.fillStyle(0xff0000, 1);
        this.bossHealthBar.fillRect(centerX - healthBarWidth / 2, 50, healthBarWidth * healthPercentage, 15);
    
        if (this.bossHealth <= 0) {
            if (!this.bossDestroyed) {
            this.bossDestroyed = true;
            this.time.delayedCall(500, () => {
                if (this.boss && this.boss.active) {
                this.boss.destroy();
                this.bossHealthBar.destroy();
                this.bossHealthBarBg.destroy();
                this.add.text(centerX, this.cameras.main.centerY, 'YOU WIN!', {
                    fontSize: '40px',
                    fill: '#0f0',
                    fontStyle: 'bold'
                }).setOrigin(0.5);
                if (this.bossDestructionSound) {
                    this.bossDestructionSound.play();
                }
                }
    
                    // Pass all necessary data to Stage2Scene
                    this.time.delayedCall(2000, () => {
                        this.scene.start('StageSelectionScene', {
                            player1Ship: this.player1Ship,
                            player2Ship: this.player2Ship,
                            mode: this.mode,
                            player1Bullet: this.player1BulletType,
                            player2Bullet: this.player2BulletType,
                            player1Lives: this.player1Lives,
                            player2Lives: this.player2Lives,
                            player1Score: this.player1Score,
                            player2Score: this.player2Score,
                            completedStages: [1, 2, 3], // Mark Stage 2 as completed
                            currentStage: 3
                        });
                    }, [], this);
                });
            }
        }
    }

    bossShoot() {
        if (!this.boss || !this.boss.active) return;
        const bullet = this.enemyBullets.get(this.boss.x, this.boss.y + 20, 'bossBullet2');
        if (bullet) {
            bullet.setActive(true).setVisible(true).setVelocityY(800); // Increased speed from 200 to 800
            bullet.body.setSize(bullet.width * 0.5, bullet.height * 0.5);
            this.bossBulletSound.play(); // Play shoot sound
        }

        // Double Shot every 3 seconds
        this.time.addEvent({
            delay: 4000,
            callback: () => {
                let bulletGap = 45; // Adjust this value for wider/narrower spread
                const positions = [-bulletGap, bulletGap]; // Double shot positions

                positions.forEach(offset => {
                    let extraBullet = this.enemyBullets.get(this.boss.x + offset, this.boss.y + 20, 'bossBullet2');
                    if (extraBullet) {
                        extraBullet.setActive(true).setVisible(true).setVelocityY(800);
                        extraBullet.body.setSize(extraBullet.width * 0.5, extraBullet.height * 0.5);
                        this.bossBulletSound.play(); // Play shoot sound
                    }
                });
            },
            callbackScope: this,
            loop: true
        });
    }
    
  

    destroyEnemy(bullet, enemy) {
        if (!enemy) return;
        if (this.destructionSound) this.destructionSound.play();
        let explosion = this.explosionsGroup.create(enemy.x, enemy.y, 'explosion');
        explosion.play('explode');
        if (bullet) bullet.destroy();
        enemy.destroy();
        if (Phaser.Math.Between(1, 100) <= 30) {
            this.spawnPowerup(enemy.x, enemy.y);
        }
        if (bullet && bullet.parent) {
            if (bullet.parent === this.player1) {
                this.player1Score += 10;
                this.player1ScoreText.setText(`Score: ${this.player1Score}`);
            } else if (bullet.parent === this.player2) {
                this.player2Score += 10;
                this.player2ScoreText.setText(`Score: ${this.player2Score}`);
            }
        }
    }
  

    spawnPowerup(x, y) {
        const powerUpTypes = this.stage === 2 
            ? ['powerSpeed', 'powerGun', 'powerLife', 'powerBomb'] 
            : ['powerSpeed', 'powerGun', 'powerLife']; //Only basic power-ups in Stage 1
    
        const randomPowerUp = Phaser.Utils.Array.GetRandom(powerUpTypes);
        const powerUp = this.powerUps.create(x, y, randomPowerUp).setVelocityY(100);
        powerUp.setData('type', randomPowerUp);
        powerUp.body.setSize(powerUp.width * 0.1, powerUp.height * 0.1);
    }

    collectPowerup(player, powerup) {
        const powerupType = powerup.getData('type');
    
        switch (powerupType) {
            case 'powerSpeed': // Speed Boost Power-Up
                this.speedBoost = true;
                player.setTint(0x00ff00); // Flash green
                this.time.delayedCall(5000, () => {
                    this.speedBoost = false;
                    player.clearTint(); // Reset tint
                }, [], this);
                break;
    
            case 'powerGun': // Triple Shot Power-Up
                this.tripleShot = true;
                this.time.delayedCall(5000, () => {
                    this.tripleShot = false; // Reset triple shot
                }, [], this);
                break;
    
            case 'powerLife': // Extra Life Power-Up
                if (player === this.player1) {
                    this.player1Lives++;
                    this.updateLivesUI(this.player1LivesIcons, this.player1Lives, false); // Update Player 1 lives UI
                } else if (player === this.player2) {
                    this.player2Lives++;
                    this.updateLivesUI(this.player2LivesIcons, this.player2Lives, true); // Update Player 2 lives UI
                }
                break;
    
            case 'powerBomb': // Bomb Power-Up (New)
                this.enemies.getChildren().forEach(enemy => {
                    if (enemy.active) {
                        this.destroyEnemy(null, enemy); // Destroy all active enemies
                    }
                });
                break;
    
            default:
                console.warn(`Unknown power-up type: ${powerupType}`);
                break;
        }
    
        powerup.destroy(); // Remove the power-up after collection
    }

 


    gameOver() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        this.add.text(centerX, centerY, 'Game Over!', {
            fontSize: '40px',
            fill: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    
        // Disable players
        if (this.player1) this.player1.setActive(false).setVisible(false);
        if (this.player2) this.player2.setActive(false).setVisible(false);
    
        // Clear all game objects
        this.enemies.clear(true, true);
        this.enemyBullets.clear(true, true);
        this.powerUps.clear(true, true);
    
        // Reset game state
        this.wave = 1;
        this.enemiesSpawned = 0;
        this.maxEnemiesPerWave = 25;
        this.boss = null;
        this.bossHealth = 20;
        this.speedBoost = false;
        this.tripleShot = false;
        this.score = 0;
        this.lives = 3;
    
        // Reset player lives
        this.player1Lives = 3;
        if (this.mode === '2player') {
            this.player2Lives = 3;
        }
    
        // Reset UI
        if (this.livesIcons) {
            this.livesIcons.clear(true, true);
        }
        this.updateLivesUI(this.player1LivesIcons, this.player1Lives);
        if (this.mode === '2player') {
            this.updateLivesUI(this.player2LivesIcons, this.player2Lives, true);
        }
    
        // Restart the scene after a delay
        this.time.delayedCall(2000, () => {
            this.scene.restart();
        }, [], this);
    }

}



class Stage3Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'Stage3Scene' });
        this.wave = 1;
        this.enemiesSpawned = 0;
        this.maxEnemiesPerWave = 30;
        this.boss = null;
        this.bossHealth = 20;
        this.speedBoost = false;
        this.tripleShot = false;
        this.score = 0;
        this.lives = 3;
        this.player1 = null;
        this.player2 = null;
        this.bullets = null;
        this.enemies = null;
        this.enemyBullets = null;
        this.keys = null;
        this.arrowKeys = null;
        this.scoreText = null;
        this.waveText = null;
        this.livesIcons = null;
        this.explosionsGroup = null;
        this.powerUps = null;
        this.shootSound = null;
        this.destructionSound = null;
    }
    preload() {

        this.load.video('stage3bgvid', 'assets/vid/stage3.mp4', undefined, true); // true enables noAudio

        // Add error handling
        this.load.on('fileerror', (file) => {
            console.error('Failed to load file:', file.key);
        });
    
        // Debugging: Log when the video is loaded
        this.load.on('filecomplete', (key) => {
            if (key === 'stage3bgvid') {
                console.log('Video loaded successfully:', key);
            }
        });


        this.load.audio('shootSound', 'assets/sounds/laserSound.wav');
        this.load.audio('destructionSound', 'assets/sounds/destructionSound.wav');
        this.load.spritesheet('explosion', 'assets/sprites/explosion.png', { frameWidth: 64, frameHeight: 64 });
        
        this.load.image('ship1', 'assets/img/ship1.png');
        this.load.image('ship2', 'assets/img/ship2.png');
        this.load.image('ship3', 'assets/img/ship3.png');
      
        this.load.image('powerSpeed', 'assets/img/power-speed.png');
        this.load.image('powerGun', 'assets/img/power-gun.png');
        this.load.image('powerLife', 'assets/img/power-life.png');
        this.load.image('lifeIcon', 'assets/img/power-life.png');
        this.load.image('powerBomb', 'assets/img/bomb.png');
        
        this.load.image('stage3Bg', 'assets/img/stage3-bg.jpg');
        this.load.image('enemy3', 'assets/img/enemy3.png');
        this.load.image('enemyBullet3', 'assets/img/enemy-bullet3.png');


        this.load.image('boss3', 'assets/img/boss3.png');
        this.load.image('bossBullet3', 'assets/img/boss-bullet3.png');

        this.load.audio('bossBulletSound', 'assets/sounds/bossBulletSound.wav');
        this.load.audio('bossDestructionSound', 'assets/sounds/bossDestructionSound.wav');
        

    }
    create(data) {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        console.log("Received data:", data);
        const video = this.add.video(centerX, centerY, 'stage3bgvid');
    
        // Debugging: Check if the video object exists
        if (!video) {
            console.error('Video object is null. Using fallback image.');
            this.add.image(centerX, centerY, 'console-bg').setDisplaySize(1300, 750);
            return;
        }
    
        // Set the video's depth to ensure it's rendered behind other objects
        video.setDepth(-1);
    
        // Play the video before setting the display size
        video.play(true); // Loop the video
    
        // Ensure the video is fully loaded before setting the size
        video.on('play', () => {
            console.log('Video is now playing. Setting display size...');
            video.setOrigin(0.5, 0.5).setDisplaySize(1300, 750);
        });
    
        // Handle video errors
        video.on('error', () => {
            console.error('Video failed to load. Using fallback image.');
            this.add.image(centerX, centerY, 'console-bg').setDisplaySize(1300, 750);
        });
    
        this.stage = data.stage || 1;
        this.player1Ship = data.player1Ship || 'ship1';
        this.player2Ship = data.player2Ship || 'ship1';
        this.mode = data.mode || '1player';
        this.player1BulletType = data.player1Bullet || 'bullet1';
        this.player2BulletType = data.player2Bullet || 'bullet1';
    
        console.log('Stage:', this.stage);
        console.log('Player 1 Ship:', this.player1Ship);
        console.log('Player 2 Ship:', this.player2Ship);
    
        // Initialize player1 and player2 with visibility set to false
        this.player1 = this.physics.add.sprite(-100, -100, this.player1Ship).setVisible(false);
        this.player2 = this.physics.add.sprite(-100, -100, this.player2Ship).setVisible(false);
    
        this.shootSound = this.sound.add('shootSound');
        this.bossBulletSound = this.sound.add('bossBulletSound');
        this.destructionSound = this.sound.add('destructionSound');
        this.bossDestructionSound = this.sound.add('bossDestructionSound');
    
        this.player1 = this.physics.add.sprite(400, 500, this.player1Ship).setCollideWorldBounds(true).setScale(0.35);
        this.player1.body.setSize(this.player1.width * 0.3, this.player1.height * 0.3);
        this.player1.setDepth(1);
        this.player1Lives = 3;
        this.player1Score = 0;
    
        if (this.mode === '2player') {
            this.player2 = this.physics.add.sprite(800, 500, this.player2Ship).setCollideWorldBounds(true).setScale(0.35);
            this.player2.body.setSize(this.player2.width * 0.3, this.player2.height * 0.3);
            this.player2.setDepth(1);
            this.player2Lives = 3;
            this.player2Score = 0;
        }
    
        this.player1LivesIcons = this.add.group({
            classType: Phaser.GameObjects.Image, // Force correct type
            key: 'lifeIcon',
            repeat: this.player1Lives - 1,
            runChildUpdate: true
        });
    
        for (let i = 0; i < this.player1Lives; i++) {
            this.player1LivesIcons.add(this.add.image(72 + i * 30, 42, 'lifeIcon').setScale(1));
        }
    
        if (this.mode === '2player') {
            this.player2LivesIcons = this.add.group({
                key: 'lifeIcon',
                repeat: this.player2Lives - 1,
                setXY: { x: this.cameras.main.width - 72 - (this.player2Lives - 1), y: 42, stepX: -30 }
            });
        }
    
        this.player1ScoreText = this.add.text(60, 12, 'Score: 0', { fontSize: '20px', fill: '#fff' });
        if (this.mode === '2player') {
            this.player2ScoreText = this.add.text(this.cameras.main.width - 60, 12, 'Score: 0', { fontSize: '20px', fill: '#fff' }).setOrigin(1, 0);
        }
    
        this.player1Bullets = this.physics.add.group({
            defaultKey: this.player1BulletType,
            maxSize: 1000,
            runChildUpdate: true,
            createCallback: (bullet) => {
                bullet.setScale(0.7);
                bullet.body.setSize(bullet.width * 0.2, bullet.height * 0.5);
            }
        });
    
        if (this.mode === '2player') {
            this.player2Bullets = this.physics.add.group({
                defaultKey: this.player2BulletType,
                maxSize: 1000,
                runChildUpdate: true,
                createCallback: (bullet) => {
                    bullet.setScale(0.7);
                    bullet.body.setSize(bullet.width * 0.2, bullet.height * 0.5);
                }
            });
        }
    
        this.enemies = this.physics.add.group({ defaultKey: 'enemy', maxSize: 20, runChildUpdate: true });
        this.enemyBullets = this.physics.add.group({ defaultKey: 'enemyBullet', maxSize: 1000, runChildUpdate: true });
    
        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE
        });
    
        if (this.mode === '2player') {
            this.arrowKeys = this.input.keyboard.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.UP,
                down: Phaser.Input.Keyboard.KeyCodes.DOWN,
                left: Phaser.Input.Keyboard.KeyCodes.LEFT,
                right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
                shift: Phaser.Input.Keyboard.KeyCodes.SHIFT
            });
        }
    
        this.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.shootBullet(this.player1);
            }
        });
    
        this.waveText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, '', { fontSize: '40px', fill: '#ffffff' }).setOrigin(0.5);
        this.physics.add.overlap(this.player1Bullets, this.enemies, (bullet, enemy) => this.destroyEnemy(bullet, enemy), null, this);
        if (this.mode === '2player') {
            this.physics.add.overlap(this.player2Bullets, this.enemies, (bullet, enemy) => this.destroyEnemy(bullet, enemy), null, this);
        }
        this.physics.add.overlap(this.player1, this.enemies, (player, enemy) => this.playerHit(player, enemy), null, this);
        this.physics.add.overlap(this.player1, this.enemyBullets, (player, bullet) => this.playerHit(player, bullet), null, this);
        if (this.player2) {
            this.physics.add.overlap(this.player2, this.enemies, (player, enemy) => this.playerHit(player, enemy), null, this);
            this.physics.add.overlap(this.player2, this.enemyBullets, (player, bullet) => this.playerHit(player, bullet), null, this);
        }
        this.powerUps = this.physics.add.group();
        this.physics.add.overlap(this.player1, this.powerUps, (player, powerup) => this.collectPowerup(player, powerup), null, this);
        if (this.player2) {
            this.physics.add.overlap(this.player2, this.powerUps, (player, powerup) => this.collectPowerup(player, powerup), null, this);
        }
        this.waveText.setText(`Wave ${this.wave}`);
        this.time.delayedCall(2000, () => {
            this.waveText.setText('');
            this.time.addEvent({ delay: 1000, callback: this.spawnEnemy, callbackScope: this, loop: true });
        }, [], this);
    
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 1, end: 5 }),
            frameRate: 40,
            repeat: 0,
            hideOnComplete: true
        });
        this.explosionsGroup = this.physics.add.group();
        // ✅ GLOBAL ENEMY SHOOT TIMER
        this.enemyShootTimer = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                this.enemies.getChildren().forEach(enemy => {
                    if (enemy.active) this.enemyShoot(enemy);
                });
            },
            callbackScope: this
        });

        // ✅ PAUSE BUTTON
        const pauseButton = document.getElementById('pauseBtn');
        let isPaused = false;
        if (pauseButton) {
            pauseButton.addEventListener('click', () => {
                isPaused = !isPaused;
                if (isPaused) {
                    this.scene.pause();
                    pauseButton.innerText = '▶️ Resume';
                } else {
                    this.scene.resume();
                    pauseButton.innerText = '⏸ Pause';
                }
            });
        }

    }


    update() {
        let speed = this.speedBoost ? 500 : 300;

        if (this.keys) {
            if (this.keys.left.isDown) this.player1.setVelocityX(-speed);
            else if (this.keys.right.isDown) this.player1.setVelocityX(speed);
            else this.player1.setVelocityX(0);
            if (this.keys.up.isDown) this.player1.setVelocityY(-speed);
            else if (this.keys.down.isDown) this.player1.setVelocityY(speed);
            else this.player1.setVelocityY(0);

            if (Phaser.Input.Keyboard.JustDown(this.keys.space)) this.shootBullet(this.player1);
        }

        if (this.player2 && this.arrowKeys) {
            if (this.arrowKeys.left.isDown) this.player2.setVelocityX(-speed);
            else if (this.arrowKeys.right.isDown) this.player2.setVelocityX(speed);
            else this.player2.setVelocityX(0);
            if (this.arrowKeys.up.isDown) this.player2.setVelocityY(-speed);
            else if (this.arrowKeys.down.isDown) this.player2.setVelocityY(speed);
            else this.player2.setVelocityY(0);

            if (Phaser.Input.Keyboard.JustDown(this.arrowKeys.shift)) this.shootBullet(this.player2);
        }
            
        if (this.boss?.active) this.moveBoss();
    }

       
updateLivesUI(livesIcons, lives, isPlayer2 = false) {
    // Debugging: Check if livesIcons is defined
    if (!livesIcons) {
        console.error('livesIcons is undefined!');
        return;
    }

    console.log(`--- Updating Lives UI ---`);
    console.log(`Player: ${isPlayer2 ? "Player 2" : "Player 1"}`);
    console.log(`Before clearing, Lives UI Count: ${livesIcons.getLength()}`);
    console.log(`Lives Left: ${lives}`);

    // Destroy each life icon properly
    livesIcons.getChildren().forEach(icon => {
        icon.destroy();  // Fully remove the object
    });

    // Clear the group to remove any references
    livesIcons.clear(true, true);

    // Force Phaser to process pending changes before adding new icons
    this.time.delayedCall(100, () => {
        console.log(`After clearing, Lives UI Count: ${livesIcons.getLength()}`);

        // Re-add icons based on the updated number of lives
        for (let i = 0; i < lives; i++) {
            let newX = isPlayer2 ? this.cameras.main.width - 72 - i * 30 : 72 + i * 30;
            let newLifeIcon = this.add.image(newX, 42, 'lifeIcon').setScale(1);
            livesIcons.add(newLifeIcon);
        }

        console.log(`After adding, Lives UI Count: ${livesIcons.getLength()}`);
    }, [], this);
}


playerHit(player, object) {
    if (!player || !player.active || !object || !object.active) return;

    object.destroy();

    if (player === this.player1) {
        console.log('Player 1 hit! Updating Lives UI...');
        this.player1Lives--; // Reduce player lives
        this.updateLivesUI(this.player1LivesIcons, this.player1Lives); // Update UI

        console.log(`Player 1 Lives after hit: ${this.player1Lives}`);
        if (this.player1Lives <= 0) {
            player.setActive(false).setVisible(false);
            this.keys.space.enabled = false; // Disable shooting for Player 1
        }
    } else if (player === this.player2) {
        this.player2Lives--;
        console.log(`Player 2 Lives: ${this.player2Lives}`); // Debug log
        this.updateLivesUI(this.player2LivesIcons, this.player2Lives, true); // Update Player 2 lives icons
        if (this.player2Lives <= 0) {
            player.setActive(false).setVisible(false);
            this.arrowKeys.shift.enabled = false; // Disable shooting for Player 2
        }
    }

    // Check if either player has lost all lives
    if ((this.player1Lives <= 0 && this.mode === '1player') || 
        (this.player1Lives <= 0 && (!this.player2 || this.player2Lives <= 0))) {
        this.gameOver();
    }

    player.setTint(0xff0000);
    this.time.delayedCall(1000, () => {
        player.clearTint();
    }, [], this);
}

    shootBullet(player) {
        if (player === this.player1 && this.player1Lives <= 0) return; // Disable shooting for Player 1 if lives are 0
        if (player === this.player2 && this.player2Lives <= 0) return; // Disable shooting for Player 2 if lives are 0

        if (this.shootSound) {
            this.shootSound.play({ rate: 1.5 }); // Speed up the shooting sound
        }

        if (this.tripleShot) {
            let bulletGap = 35; // Adjust this value for wider/narrower spread
            const positions = [-bulletGap, 0, bulletGap]; // Bullet spread positions

            positions.forEach(offset => {
                let bullet = player === this.player1 
                    ? this.player1Bullets.get(player.x + offset, player.y - 20) 
                    : this.player2Bullets.get(player.x + offset, player.y - 20);
                    
                if (bullet) {
                    bullet.setActive(true).setVisible(true).setVelocityY(-400);
                    bullet.body.setSize(bullet.width * 0.2, bullet.height * 0.2); // Smaller hitbox
                    bullet.parent = player;
                }
            });

        } else { // Single Shot
            let bullet = player === this.player1 
                ? this.player1Bullets.get(player.x, player.y - 20) 
                : this.player2Bullets.get(player.x, player.y - 20);
                
            if (bullet) {
                bullet.setActive(true).setVisible(true).setVelocityY(-400);
                bullet.body.setSize(bullet.width * 0.1, bullet.height * 0.4);
                bullet.parent = player;
            }
        }
    }

    moveBoss() {
        if (!this.boss.moveTimer) {
            this.boss.moveTimer = this.time.delayedCall(Phaser.Math.Between(1000, 3000), () => {
                this.boss.moveTimer = null;
            }, [], this);
            const directions = [
                { x: 100, y: 0 }, { x: -100, y: 0 }, { x: 0, y: 100 }, { x: 0, y: -100 },
                { x: 100, y: 100 }, { x: -100, y: 100 }, { x: 100, y: -100 }, { x: -100, y: -100 }
            ];
            const direction = Phaser.Utils.Array.GetRandom(directions);
            this.boss.setVelocityX(direction.x);
            this.boss.setVelocityY(direction.y);
            const speed = Phaser.Math.Between(50, 150);
            this.boss.setVelocityX(this.boss.body.velocity.x * speed / 100);
            this.boss.setVelocityY(this.boss.body.velocity.y * speed / 100);
        }

        if (this.boss.x <= 100) this.boss.setVelocityX(100);
        else if (this.boss.x >= 700) this.boss.setVelocityX(-100);
        if (this.boss.y <= 50) this.boss.setVelocityY(100);
        else if (this.boss.y >= 200) this.boss.setVelocityY(-100);
    }

    
    spawnEnemy() {
        if (this.enemiesSpawned < this.maxEnemiesPerWave) {
            // Center of the screen
            const centerX = this.cameras.main.centerX;
            const centerY = 0; // Spawn at the top of the screen
    
            // Randomize the X position within a range around the center
            const scatterRange = 500; // Adjust this value to control how far enemies can spawn from the center
            const x = Phaser.Math.Between(centerX - scatterRange, centerX + scatterRange); // Random X position within the range
    
            // Create the enemy at the randomized position
            const enemy = this.enemies.create(x, centerY, 'enemy3');
            if (enemy) {
                enemy.setVelocityY(100); // Move downward
                enemy.body.setSize(enemy.width * 0.2, enemy.height * 0.1); // Adjust hitbox
            }
    
            // Add shooting behavior for the enemy
            
    
            this.enemiesSpawned++; // Increment the enemy count
        }
    
        // Start the wave end timer if all enemies are spawned
        if (this.enemiesSpawned >= this.maxEnemiesPerWave && !this.waveEndTimer) {
            this.waveEndTimer = this.time.delayedCall(2000, this.nextWave, [], this); // End wave after 2 seconds
        }
    }

    enemyShoot(enemy) {
        if (!enemy.active) return;
        const bullet = this.enemyBullets.get(enemy.x, enemy.y + 20, 'enemyBullet3');
        if (bullet) {
            bullet.setActive(true).setVisible(true).setVelocityY(200);
            bullet.body.setSize(bullet.width * 0.1, bullet.height * 0.3);
        }
    }

    nextWave() {
        this.wave++;
        if (this.wave <= 3) {
            this.waveText.setText(`Wave ${this.wave}`);
            this.time.delayedCall(2000, () => { this.waveText.setText(''); }, [], this);
            this.enemiesSpawned = 0;
            this.maxEnemiesPerWave += 30;
            this.waveEndTimer = null;
            this.time.delayedCall(2000, this.spawnEnemy, [], this);
        } else {
            this.time.delayedCall(3000, this.bossFight, [], this);
        }
    }

    bossFight() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        const healthBarWidth = 300;
    
        this.waveText = this.add.text(centerX, centerY, '', { fontSize: '40px', fill: '#ffffff' }).setOrigin(0.5);
        this.bossHealth = 40;
        this.bossDestroyed = false;
        this.waveText.setText('Final Boss!');
        this.time.delayedCall(2000, () => { this.waveText.setText(''); }, [], this);
    
        this.boss = this.physics.add.sprite(centerX, 100, 'boss3').setScale(1.5).setVelocityY(50);
        this.boss.body.setSize(this.boss.width * 0.5, this.boss.height * 0.5);
        this.boss.setCollideWorldBounds(true);
    
        this.physics.add.overlap(this.player1Bullets, this.boss, (boss, bullet) => this.hitBoss(boss, bullet), null, this);
        if (this.mode === '2player') {
            this.physics.add.overlap(this.player2Bullets, this.boss, (boss, bullet) => this.hitBoss(boss, bullet), null, this);
        }
    
        this.bossHealthBarBg = this.add.graphics();
        this.bossHealthBarBg.fillStyle(0x222222, 1);
        this.bossHealthBarBg.fillRect(centerX - healthBarWidth / 2, 50, healthBarWidth, 15);
    
        this.bossHealthBar = this.add.graphics();
        this.bossHealthBar.fillStyle(0xff0000, 1);
        this.bossHealthBar.fillRect(centerX - healthBarWidth / 2, 50, healthBarWidth, 10);
    
        this.time.addEvent({
            delay: 2000,
            callback: this.bossShoot,
            callbackScope: this,
            loop: true
        });
    }
    
    hitBoss(boss, bullet) {
        if (!boss || !boss.active || this.bossDestroyed) return;
        bullet.destroy();
        this.bossHealth = Math.max(0, this.bossHealth - 1);
        let healthPercentage = this.bossHealth / 20;
        const centerX = this.cameras.main.centerX;
        const healthBarWidth = 300;
        this.bossHealthBar.clear();
        this.bossHealthBar.fillStyle(0xff0000, 1);
        this.bossHealthBar.fillRect(centerX - healthBarWidth / 2, 50, healthBarWidth * healthPercentage, 15);
    
        if (this.bossHealth <= 0) {
            if (!this.bossDestroyed) {
            this.bossDestroyed = true;
            this.time.delayedCall(500, () => {
                if (this.boss && this.boss.active) {
                this.boss.destroy();
                this.bossHealthBar.destroy();
                this.bossHealthBarBg.destroy();
                this.add.text(centerX, this.cameras.main.centerY, 'YOU WIN!', {
                    fontSize: '40px',
                    fill: '#0f0',
                    fontStyle: 'bold'
                }).setOrigin(0.5);
                if (this.bossDestructionSound) {
                    this.bossDestructionSound.play();
                }
                }
    
                    // Pass all necessary data to Stage2Scene
                    this.time.delayedCall(2000, () => {
                        this.scene.start('StageSelectionScene', {
                            player1Ship: this.player1Ship,
                            player2Ship: this.player2Ship,
                            mode: this.mode,
                            player1Bullet: this.player1BulletType,
                            player2Bullet: this.player2BulletType,
                            player1Lives: this.player1Lives,
                            player2Lives: this.player2Lives,
                            player1Score: this.player1Score,
                            player2Score: this.player2Score,
                            completedStages: [1, 2, 3, 4], // Mark Stage 2 as completed
                            currentStage: 4
                        });
                    }, [], this);
                });
            }
        }
    }

    bossShoot() {
        if (!this.boss || !this.boss.active) return;
        const bullet = this.enemyBullets.get(this.boss.x, this.boss.y + 20, 'bossBullet3');
        if (bullet) {
            bullet.setActive(true).setVisible(true).setVelocityY(800); // Increased speed from 200 to 800
            bullet.body.setSize(bullet.width * 0.5, bullet.height * 0.5);
            this.bossBulletSound.play(); // Play shoot sound
        }

        // Triple Shot every 4 seconds
        this.time.addEvent({
            delay: 4000,
            callback: () => {
                let bulletGap = 55; // Adjust this value for wider/narrower spread
                const positions = [-bulletGap, 0, bulletGap]; // Triple shot positions 

                positions.forEach(offset => {
                    let extraBullet = this.enemyBullets.get(this.boss.x + offset, this.boss.y + 20, 'bossBullet3');
                    if (extraBullet) {
                        extraBullet.setActive(true).setVisible(true).setVelocityY(800);
                        extraBullet.body.setSize(extraBullet.width * 0.5, extraBullet.height * 0.5);
                        this.bossBulletSound.play(); // Play shoot sound
                    }
                });
            },
            callbackScope: this,
            loop: true
        });
    }
    
  

    destroyEnemy(bullet, enemy) {
        if (!enemy) return;
        if (this.destructionSound) this.destructionSound.play();
        let explosion = this.explosionsGroup.create(enemy.x, enemy.y, 'explosion');
        explosion.play('explode');
        if (bullet) bullet.destroy();
        enemy.destroy();
        if (Phaser.Math.Between(1, 100) <= 30) {
            this.spawnPowerup(enemy.x, enemy.y);
        }
        if (bullet && bullet.parent) {
            if (bullet.parent === this.player1) {
                this.player1Score += 10;
                this.player1ScoreText.setText(`Score: ${this.player1Score}`);
            } else if (bullet.parent === this.player2) {
                this.player2Score += 10;
                this.player2ScoreText.setText(`Score: ${this.player2Score}`);
            }
        }
    }
  

    spawnPowerup(x, y) {
        const powerUpTypes = this.stage === 2 
            ? ['powerSpeed', 'powerGun', 'powerLife', 'powerBomb'] 
            : ['powerSpeed', 'powerGun', 'powerLife']; //Only basic power-ups in Stage 1
    
        const randomPowerUp = Phaser.Utils.Array.GetRandom(powerUpTypes);
        const powerUp = this.powerUps.create(x, y, randomPowerUp).setVelocityY(100);
        powerUp.setData('type', randomPowerUp);
        powerUp.body.setSize(powerUp.width * 0.1, powerUp.height * 0.1);
    }

    collectPowerup(player, powerup) {
        const powerupType = powerup.getData('type');
    
        switch (powerupType) {
            case 'powerSpeed': // Speed Boost Power-Up
                this.speedBoost = true;
                player.setTint(0x00ff00); // Flash green
                this.time.delayedCall(5000, () => {
                    this.speedBoost = false;
                    player.clearTint(); // Reset tint
                }, [], this);
                break;
    
            case 'powerGun': // Triple Shot Power-Up
                this.tripleShot = true;
                this.time.delayedCall(5000, () => {
                    this.tripleShot = false; // Reset triple shot
                }, [], this);
                break;
    
            case 'powerLife': // Extra Life Power-Up
                if (player === this.player1) {
                    this.player1Lives++;
                    this.updateLivesUI(this.player1LivesIcons, this.player1Lives, false); // Update Player 1 lives UI
                } else if (player === this.player2) {
                    this.player2Lives++;
                    this.updateLivesUI(this.player2LivesIcons, this.player2Lives, true); // Update Player 2 lives UI
                }
                break;
    
            case 'powerBomb': // Bomb Power-Up (New)
                this.enemies.getChildren().forEach(enemy => {
                    if (enemy.active) {
                        this.destroyEnemy(null, enemy); // Destroy all active enemies
                    }
                });
                break;
    
            default:
                console.warn(`Unknown power-up type: ${powerupType}`);
                break;
        }
    
        powerup.destroy(); // Remove the power-up after collection
    }

    gameOver() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        this.add.text(centerX, centerY, 'Game Over!', {
            fontSize: '40px',
            fill: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    
        // Disable players
        if (this.player1) this.player1.setActive(false).setVisible(false);
        if (this.player2) this.player2.setActive(false).setVisible(false);
    
        // Clear all game objects
        this.enemies.clear(true, true);
        this.enemyBullets.clear(true, true);
        this.powerUps.clear(true, true);
    
        // Reset game state
        this.wave = 1;
        this.enemiesSpawned = 0;
        this.maxEnemiesPerWave = 30;
        this.boss = null;
        this.bossHealth = 20;
        this.speedBoost = false;
        this.tripleShot = false;
        this.score = 0;
        this.lives = 3;
    
        // Reset player lives
        this.player1Lives = 3;
        if (this.mode === '2player') {
            this.player2Lives = 3;
        }
    
        // Reset UI
        if (this.livesIcons) {
            this.livesIcons.clear(true, true);
        }
        this.updateLivesUI(this.player1LivesIcons, this.player1Lives);
        if (this.mode === '2player') {
            this.updateLivesUI(this.player2LivesIcons, this.player2Lives, true);
        }
    
        // Restart the scene after a delay
        this.time.delayedCall(2000, () => {
            this.scene.restart();
        }, [], this);
    }

}



class Stage4Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'Stages4Scene' });
        this.wave = 1;
        this.enemiesSpawned = 0;
        this.maxEnemiesPerWave = 30;
        this.boss = null;
        this.bossHealth = 20;
        this.speedBoost = false;
        this.tripleShot = false;
        this.score = 0;
        this.lives = 3;
        this.player1 = null;
        this.player2 = null;
        this.bullets = null;
        this.enemies = null;
        this.enemyBullets = null;
        this.keys = null;
        this.arrowKeys = null;
        this.scoreText = null;
        this.waveText = null;
        this.livesIcons = null;
        this.explosionsGroup = null;
        this.powerUps = null;
        this.shootSound = null;
        this.destructionSound = null;
    }
    preload() {

        this.load.video('stage4bgvid', 'assets/vid/stage4.mp4', undefined, true); // true enables noAudio

        // Add error handling
        this.load.on('fileerror', (file) => {
            console.error('Failed to load file:', file.key);
        });
    
        // Debugging: Log when the video is loaded
        this.load.on('filecomplete', (key) => {
            if (key === 'stage4bgvid') {
                console.log('Video loaded successfully:', key);
            }
        });


        this.load.audio('shootSound', 'assets/sounds/laserSound.wav');
        this.load.audio('destructionSound', 'assets/sounds/destructionSound.wav');
        this.load.spritesheet('explosion', 'assets/sprites/explosion.png', { frameWidth: 64, frameHeight: 64 });
        
        this.load.image('ship1', 'assets/img/ship1.png');
        this.load.image('ship2', 'assets/img/ship2.png');
        this.load.image('ship3', 'assets/img/ship3.png');
      
        this.load.image('powerSpeed', 'assets/img/power-speed.png');
        this.load.image('powerGun', 'assets/img/power-gun.png');
        this.load.image('powerLife', 'assets/img/power-life.png');
        this.load.image('lifeIcon', 'assets/img/power-life.png');
        this.load.image('powerBomb', 'assets/img/bomb.png');
        
        this.load.image('stage3Bg', 'assets/img/stage3-bg.jpg');
        this.load.image('enemy4', 'assets/img/enemy4.png');
        this.load.image('enemyBullet4', 'assets/img/enemy-bullet4.png');


        this.load.image('boss4', 'assets/img/boss4.png');
        this.load.image('bossBullet4', 'assets/img/boss-bullet4.png');

        this.load.audio('bossBulletSound', 'assets/sounds/bossBulletSound.wav');
        this.load.audio('bossDestructionSound', 'assets/sounds/bossDestructionSound.wav');
        

    }
    create(data) {
     
        // Set the video's depth to ensure it's rendered behind other objects
        video.setDepth(-1);
    
        // Play the video before setting the display size
        video.play(true); // Loop the video
    
        // Ensure the video is fully loaded before setting the size
        video.on('play', () => {
            console.log('Video is now playing. Setting display size...');
            video.setOrigin(0.5, 0.5).setDisplaySize(1300, 750);
        });
    
        // Handle video errors
        video.on('error', () => {
            console.error('Video failed to load. Using fallback image.');
            this.add.image(centerX, centerY, 'console-bg').setDisplaySize(1300, 750);
        });
    
        this.stage = data.stage || 1;
        this.player1Ship = data.player1Ship || 'ship1';
        this.player2Ship = data.player2Ship || 'ship1';
        this.mode = data.mode || '1player';
        this.player1BulletType = data.player1Bullet || 'bullet1';
        this.player2BulletType = data.player2Bullet || 'bullet1';
    
        console.log('Stage:', this.stage);
        console.log('Player 1 Ship:', this.player1Ship);
        console.log('Player 2 Ship:', this.player2Ship);
    
        // Initialize player1 and player2 with visibility set to false
        this.player1 = this.physics.add.sprite(-100, -100, this.player1Ship).setVisible(false);
        this.player2 = this.physics.add.sprite(-100, -100, this.player2Ship).setVisible(false);
    
        this.shootSound = this.sound.add('shootSound');
        this.bossBulletSound = this.sound.add('bossBulletSound');
        this.destructionSound = this.sound.add('destructionSound');
        this.bossDestructionSound = this.sound.add('bossDestructionSound');
    
        this.player1 = this.physics.add.sprite(400, 500, this.player1Ship).setCollideWorldBounds(true).setScale(0.35);
        this.player1.body.setSize(this.player1.width * 0.3, this.player1.height * 0.3);
        this.player1.setDepth(1);
        this.player1Lives = 3;
        this.player1Score = 0;
    
        if (this.mode === '2player') {
            this.player2 = this.physics.add.sprite(800, 500, this.player2Ship).setCollideWorldBounds(true).setScale(0.35);
            this.player2.body.setSize(this.player2.width * 0.3, this.player2.height * 0.3);
            this.player2.setDepth(1);
            this.player2Lives = 3;
            this.player2Score = 0;
        }
    
        this.player1LivesIcons = this.add.group({
            classType: Phaser.GameObjects.Image, // Force correct type
            key: 'lifeIcon',
            repeat: this.player1Lives - 1,
            runChildUpdate: true
        });
    
        for (let i = 0; i < this.player1Lives; i++) {
            this.player1LivesIcons.add(this.add.image(72 + i * 30, 42, 'lifeIcon').setScale(1));
        }
    
        if (this.mode === '2player') {
            this.player2LivesIcons = this.add.group({
                key: 'lifeIcon',
                repeat: this.player2Lives - 1,
                setXY: { x: this.cameras.main.width - 72 - (this.player2Lives - 1), y: 42, stepX: -30 }
            });
        }
    
        this.player1ScoreText = this.add.text(60, 12, 'Score: 0', { fontSize: '20px', fill: '#fff' });
        if (this.mode === '2player') {
            this.player2ScoreText = this.add.text(this.cameras.main.width - 60, 12, 'Score: 0', { fontSize: '20px', fill: '#fff' }).setOrigin(1, 0);
        }
    
        this.player1Bullets = this.physics.add.group({
            defaultKey: this.player1BulletType,
            maxSize: 1000,
            runChildUpdate: true,
            createCallback: (bullet) => {
                bullet.setScale(0.7);
                bullet.body.setSize(bullet.width * 0.2, bullet.height * 0.5);
            }
        });
    
        if (this.mode === '2player') {
            this.player2Bullets = this.physics.add.group({
                defaultKey: this.player2BulletType,
                maxSize: 1000,
                runChildUpdate: true,
                createCallback: (bullet) => {
                    bullet.setScale(0.7);
                    bullet.body.setSize(bullet.width * 0.2, bullet.height * 0.5);
                }
            });
        }
    
        this.enemies = this.physics.add.group({ defaultKey: 'enemy', maxSize: 20, runChildUpdate: true });
        this.enemyBullets = this.physics.add.group({ defaultKey: 'enemyBullet', maxSize: 1000, runChildUpdate: true });
    
        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE
        });
    
        if (this.mode === '2player') {
            this.arrowKeys = this.input.keyboard.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.UP,
                down: Phaser.Input.Keyboard.KeyCodes.DOWN,
                left: Phaser.Input.Keyboard.KeyCodes.LEFT,
                right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
                shift: Phaser.Input.Keyboard.KeyCodes.SHIFT
            });
        }
    
        this.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.shootBullet(this.player1);
            }
        });
    
        this.waveText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, '', { fontSize: '40px', fill: '#ffffff' }).setOrigin(0.5);
        this.physics.add.overlap(this.player1Bullets, this.enemies, (bullet, enemy) => this.destroyEnemy(bullet, enemy), null, this);
        if (this.mode === '2player') {
            this.physics.add.overlap(this.player2Bullets, this.enemies, (bullet, enemy) => this.destroyEnemy(bullet, enemy), null, this);
        }
        this.physics.add.overlap(this.player1, this.enemies, (player, enemy) => this.playerHit(player, enemy), null, this);
        this.physics.add.overlap(this.player1, this.enemyBullets, (player, bullet) => this.playerHit(player, bullet), null, this);
        if (this.player2) {
            this.physics.add.overlap(this.player2, this.enemies, (player, enemy) => this.playerHit(player, enemy), null, this);
            this.physics.add.overlap(this.player2, this.enemyBullets, (player, bullet) => this.playerHit(player, bullet), null, this);
        }
        this.powerUps = this.physics.add.group();
        this.physics.add.overlap(this.player1, this.powerUps, (player, powerup) => this.collectPowerup(player, powerup), null, this);
        if (this.player2) {
            this.physics.add.overlap(this.player2, this.powerUps, (player, powerup) => this.collectPowerup(player, powerup), null, this);
        }
        this.waveText.setText(`Wave ${this.wave}`);
        this.time.delayedCall(2000, () => {
            this.waveText.setText('');
            this.time.addEvent({ delay: 1000, callback: this.spawnEnemy, callbackScope: this, loop: true });
        }, [], this);
    
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 1, end: 5 }),
            frameRate: 40,
            repeat: 0,
            hideOnComplete: true
        });
        this.explosionsGroup = this.physics.add.group();
        // ✅ GLOBAL ENEMY SHOOT TIMER
        this.enemyShootTimer = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                this.enemies.getChildren().forEach(enemy => {
                    if (enemy.active) this.enemyShoot(enemy);
                });
            },
            callbackScope: this
        });

        // ✅ PAUSE BUTTON
        const pauseButton = document.getElementById('pauseBtn');
        let isPaused = false;
        if (pauseButton) {
            pauseButton.addEventListener('click', () => {
                isPaused = !isPaused;
                if (isPaused) {
                    this.scene.pause();
                    pauseButton.innerText = '▶️ Resume';
                } else {
                    this.scene.resume();
                    pauseButton.innerText = '⏸ Pause';
                }
            });
        }

    }


    update() {
        let speed = this.speedBoost ? 500 : 300;

        if (this.keys) {
            if (this.keys.left.isDown) this.player1.setVelocityX(-speed);
            else if (this.keys.right.isDown) this.player1.setVelocityX(speed);
            else this.player1.setVelocityX(0);
            if (this.keys.up.isDown) this.player1.setVelocityY(-speed);
            else if (this.keys.down.isDown) this.player1.setVelocityY(speed);
            else this.player1.setVelocityY(0);

            if (Phaser.Input.Keyboard.JustDown(this.keys.space)) this.shootBullet(this.player1);
        }

        if (this.player2 && this.arrowKeys) {
            if (this.arrowKeys.left.isDown) this.player2.setVelocityX(-speed);
            else if (this.arrowKeys.right.isDown) this.player2.setVelocityX(speed);
            else this.player2.setVelocityX(0);
            if (this.arrowKeys.up.isDown) this.player2.setVelocityY(-speed);
            else if (this.arrowKeys.down.isDown) this.player2.setVelocityY(speed);
            else this.player2.setVelocityY(0);

            if (Phaser.Input.Keyboard.JustDown(this.arrowKeys.shift)) this.shootBullet(this.player2);
        }
            
        if (this.boss?.active) this.moveBoss();
    }


       
updateLivesUI(livesIcons, lives, isPlayer2 = false) {
    // Debugging: Check if livesIcons is defined
    if (!livesIcons) {
        console.error('livesIcons is undefined!');
        return;
    }

    console.log(`--- Updating Lives UI ---`);
    console.log(`Player: ${isPlayer2 ? "Player 2" : "Player 1"}`);
    console.log(`Before clearing, Lives UI Count: ${livesIcons.getLength()}`);
    console.log(`Lives Left: ${lives}`);

    // Destroy each life icon properly
    livesIcons.getChildren().forEach(icon => {
        icon.destroy();  // Fully remove the object
    });

    // Clear the group to remove any references
    livesIcons.clear(true, true);

    // Force Phaser to process pending changes before adding new icons
    this.time.delayedCall(100, () => {
        console.log(`After clearing, Lives UI Count: ${livesIcons.getLength()}`);

        // Re-add icons based on the updated number of lives
        for (let i = 0; i < lives; i++) {
            let newX = isPlayer2 ? this.cameras.main.width - 72 - i * 30 : 72 + i * 30;
            let newLifeIcon = this.add.image(newX, 42, 'lifeIcon').setScale(1);
            livesIcons.add(newLifeIcon);
        }

        console.log(`After adding, Lives UI Count: ${livesIcons.getLength()}`);
    }, [], this);
}



playerHit(player, object) {
    if (!player || !player.active || !object || !object.active) return;

    object.destroy();

    if (player === this.player1) {
        console.log('Player 1 hit! Updating Lives UI...');
        this.player1Lives--; // Reduce player lives
        this.updateLivesUI(this.player1LivesIcons, this.player1Lives); // Update UI

        console.log(`Player 1 Lives after hit: ${this.player1Lives}`);
        if (this.player1Lives <= 0) {
            player.setActive(false).setVisible(false);
            this.keys.space.enabled = false; // Disable shooting for Player 1
        }
    } else if (player === this.player2) {
        this.player2Lives--;
        console.log(`Player 2 Lives: ${this.player2Lives}`); // Debug log
        this.updateLivesUI(this.player2LivesIcons, this.player2Lives, true); // Update Player 2 lives icons
        if (this.player2Lives <= 0) {
            player.setActive(false).setVisible(false);
            this.arrowKeys.shift.enabled = false; // Disable shooting for Player 2
        }
    }

    // Check if either player has lost all lives
    if ((this.player1Lives <= 0 && this.mode === '1player') || 
        (this.player1Lives <= 0 && (!this.player2 || this.player2Lives <= 0))) {
        this.gameOver();
    }

    player.setTint(0xff0000);
    this.time.delayedCall(1000, () => {
        player.clearTint();
    }, [], this);
}
    shootBullet(player) {
        if (player === this.player1 && this.player1Lives <= 0) return; // Disable shooting for Player 1 if lives are 0
        if (player === this.player2 && this.player2Lives <= 0) return; // Disable shooting for Player 2 if lives are 0

        if (this.shootSound) {
            this.shootSound.play({ rate: 1.5 }); // Speed up the shooting sound
        }

        if (this.tripleShot) {
            let bulletGap = 35; // Adjust this value for wider/narrower spread
            const positions = [-bulletGap, 0, bulletGap]; // Bullet spread positions

            positions.forEach(offset => {
                let bullet = player === this.player1 
                    ? this.player1Bullets.get(player.x + offset, player.y - 20) 
                    : this.player2Bullets.get(player.x + offset, player.y - 20);
                    
                if (bullet) {
                    bullet.setActive(true).setVisible(true).setVelocityY(-400);
                    bullet.body.setSize(bullet.width * 0.2, bullet.height * 0.2); // Smaller hitbox
                    bullet.parent = player;
                }
            });

        } else { // Single Shot
            let bullet = player === this.player1 
                ? this.player1Bullets.get(player.x, player.y - 20) 
                : this.player2Bullets.get(player.x, player.y - 20);
                
            if (bullet) {
                bullet.setActive(true).setVisible(true).setVelocityY(-400);
                bullet.body.setSize(bullet.width * 0.1, bullet.height * 0.4);
                bullet.parent = player;
            }
        }
    }

    moveBoss() {
        if (!this.boss.moveTimer) {
            this.boss.moveTimer = this.time.delayedCall(Phaser.Math.Between(1000, 3000), () => {
                this.boss.moveTimer = null;
            }, [], this);
            const directions = [
                { x: 100, y: 0 }, { x: -100, y: 0 }, { x: 0, y: 100 }, { x: 0, y: -100 },
                { x: 100, y: 100 }, { x: -100, y: 100 }, { x: 100, y: -100 }, { x: -100, y: -100 }
            ];
            const direction = Phaser.Utils.Array.GetRandom(directions);
            this.boss.setVelocityX(direction.x);
            this.boss.setVelocityY(direction.y);
            const speed = Phaser.Math.Between(50, 150);
            this.boss.setVelocityX(this.boss.body.velocity.x * speed / 100);
            this.boss.setVelocityY(this.boss.body.velocity.y * speed / 100);
        }

        if (this.boss.x <= 100) this.boss.setVelocityX(100);
        else if (this.boss.x >= 700) this.boss.setVelocityX(-100);
        if (this.boss.y <= 50) this.boss.setVelocityY(100);
        else if (this.boss.y >= 200) this.boss.setVelocityY(-100);
    }

   
    spawnEnemy() {
        if (this.enemiesSpawned < this.maxEnemiesPerWave) {
            // Center of the screen
            const centerX = this.cameras.main.centerX;
            const centerY = 0; // Spawn at the top of the screen
    
            // Randomize the X position within a range around the center
            const scatterRange = 500; // Adjust this value to control how far enemies can spawn from the center
            const x = Phaser.Math.Between(centerX - scatterRange, centerX + scatterRange); // Random X position within the range
    
            // Create the enemy at the randomized position
            const enemy = this.enemies.create(x, centerY, 'enemy4');
            if (enemy) {
                enemy.setVelocityY(100); // Move downward
                enemy.body.setSize(enemy.width * 0.2, enemy.height * 0.1); // Adjust hitbox
            }
    
            // Add shooting behavior for the enemy
            
    
            this.enemiesSpawned++; // Increment the enemy count
        }
    
        // Start the wave end timer if all enemies are spawned
        if (this.enemiesSpawned >= this.maxEnemiesPerWave && !this.waveEndTimer) {
            this.waveEndTimer = this.time.delayedCall(2000, this.nextWave, [], this); // End wave after 2 seconds
        }
    }


    enemyShoot(enemy) {
        if (!enemy.active) return;
        const bullet = this.enemyBullets.get(enemy.x, enemy.y + 20, 'enemyBullet4');
        if (bullet) {
            bullet.setActive(true).setVisible(true).setVelocityY(200);
            bullet.body.setSize(bullet.width * 0.1, bullet.height * 0.3);
        }
    }

    nextWave() {
        this.wave++;
        if (this.wave <= 3) {
            this.waveText.setText(`Wave ${this.wave}`);
            this.time.delayedCall(2000, () => { this.waveText.setText(''); }, [], this);
            this.enemiesSpawned = 0;
            this.maxEnemiesPerWave += 10;
            this.waveEndTimer = null;
            this.time.delayedCall(2000, this.spawnEnemy, [], this);
        } else {
            this.time.delayedCall(3000, this.bossFight, [], this);
        }
    }

    bossFight() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        const healthBarWidth = 300;
        const healthBarHeight = 15; // Define healthBarHeight here
    
        this.waveText = this.add.text(centerX, centerY, '', { fontSize: '40px', fill: '#ffffff' }).setOrigin(0.5);
        this.bossHealth = 50;
        this.bossDestroyed = false;
        this.waveText.setText('Final Boss!');
        this.time.delayedCall(2000, () => { this.waveText.setText(''); }, [], this);
    
        // Spawn the boss
        this.boss = this.physics.add.sprite(centerX, 100, 'boss4').setScale(1.5).setVelocityY(50);
        this.boss.body.setSize(this.boss.width * 0.5, this.boss.height * 0.5);
        this.boss.setCollideWorldBounds(true);
    
        // Add overlap for player bullets and boss
        this.physics.add.overlap(this.player1Bullets, this.boss, (boss, bullet) => this.hitBoss(boss, bullet), null, this);
        if (this.mode === '2player') {
            this.physics.add.overlap(this.player2Bullets, this.boss, (boss, bullet) => this.hitBoss(boss, bullet), null, this);
        }
    
        // Boss health bar background
        this.bossHealthBarBg = this.add.graphics();
        this.bossHealthBarBg.fillStyle(0x222222, 1);
        this.bossHealthBarBg.fillRect(this.boss.x - healthBarWidth / 2, this.boss.y - 100, healthBarWidth, healthBarHeight);

        // Health bar
        this.bossHealthBar = this.add.graphics();
        this.bossHealthBar.fillStyle(0xff0000, 1);
        this.bossHealthBar.fillRect(this.boss.x - healthBarWidth / 2, this.boss.y - 100, healthBarWidth, healthBarHeight);
    
        // Boss shooting behavior
        this.time.addEvent({
            delay: 2000,
            callback: this.bossShoot,
            callbackScope: this,
            loop: true
        });
    
        // Spawn accompanying enemies periodically
        this.time.addEvent({
            delay: 5000, // Spawn enemies every 5 seconds
            callback: this.spawnBossEnemies,
            callbackScope: this,
            loop: true
        });
    }

    spawnBossEnemies() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
    
        // Spawn 2-4 normal enemies near the boss
        const numEnemies = Phaser.Math.Between(2, 4); // Random number of enemies
        for (let i = 0; i < numEnemies; i++) {
            const x = Phaser.Math.Between(centerX - 200, centerX + 200); // Random X position near the boss
            const y = Phaser.Math.Between(50, 150); // Random Y position near the top of the screen
    
            const enemy = this.enemies.create(x, y, 'enemy4');
            if (enemy) {
                enemy.setVelocityY(100); // Move downward
                enemy.body.setSize(enemy.width * 0.2, enemy.height * 0.1); // Adjust hitbox
            }
    
            // Add shooting behavior for the enemy
            
        }
    }
    
    hitBoss(boss, bullet) {
        // Check if the boss or bullet is invalid
        if (!boss || !boss.active || this.bossDestroyed) return;
    
        // Destroy the bullet
        bullet.destroy();
    
        // Reduce boss health
        this.bossHealth = Math.max(0, this.bossHealth - 1);
    
        // Calculate health percentage
        const maxHealth = 20; // Adjust if your boss has a different max health
        const healthPercentage = this.bossHealth / maxHealth;
    
        // Health bar dimensions
        const healthBarWidth = 300;
        const healthBarHeight = 15;
    
        // Position the health bar relative to the boss
        const healthBarX = boss.x - healthBarWidth / 2; // Center health bar horizontally
        const healthBarY = boss.y - 100; // Position health bar above the boss
    
        // Update the health bar
        this.bossHealthBar.clear();
        this.bossHealthBar.fillStyle(0xff0000, 1);
        this.bossHealthBar.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercentage, healthBarHeight);
    
        // Check if the boss is defeated
        if (this.bossHealth <= 0 && !this.bossDestroyed) {
            this.bossDestroyed = true;
    
            // Delay boss destruction for visual effect
            this.time.delayedCall(500, () => {
                if (this.boss && this.boss.active) {
                    // Destroy the boss and health bar
                    this.boss.destroy();
                    this.bossHealthBar.destroy();
                    this.bossHealthBarBg.destroy();
    
                    // Display "YOU WIN!" message
                    this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'YOU WIN!', {
                        fontSize: '40px',
                        fill: '#0f0',
                        fontStyle: 'bold'
                    }).setOrigin(0.5);
    
                    // Play boss destruction sound
                    if (this.bossDestructionSound) {
                        this.bossDestructionSound.play();
                    }
    
                    // Transition to the next scene after a delay
                    this.time.delayedCall(2000, () => {
                        this.scene.start('StageSelectionScene', {
                            player1Ship: this.player1Ship,
                            player2Ship: this.player2Ship,
                            mode: this.mode,
                            player1Bullet: this.player1BulletType,
                            player2Bullet: this.player2BulletType,
                            player1Lives: this.player1Lives,
                            player2Lives: this.player2Lives,
                            player1Score: this.player1Score,
                            player2Score: this.player2Score,
                            completedStages: [1, 2, 3, 4], // Mark stages as completed
                            currentStage: 4 // Set the current stage to 4
                        });
                    }, [], this);
                }
            }, [], this);
        }
    }

    
    bossShoot() {
        if (!this.boss || !this.boss.active) return; // Ensure the boss exists and is active
    
        // Single shot
        const bullet = this.enemyBullets.get(this.boss.x, this.boss.y + 20, 'bossBullet4');
        if (bullet) {
            bullet.setActive(true).setVisible(true).setVelocityY(800); // Set bullet speed
            bullet.body.setSize(bullet.width * 0.5, bullet.height * 0.5); // Adjust hitbox
            this.bossBulletSound.play(); // Play shoot sound
        }
    
        // Triple shot every 4 seconds
        this.time.addEvent({
            delay: 2000,
            callback: () => {
                if (!this.boss || !this.boss.active) return; // Ensure the boss is still active
    
                const bulletGap = 55; // Adjust this value for wider/narrower spread
                const positions = [-bulletGap, 0, bulletGap]; // Triple shot positions
    
                positions.forEach(offset => {
                    const extraBullet = this.enemyBullets.get(this.boss.x + offset, this.boss.y + 20, 'bossBullet4');
                    if (extraBullet) {
                        extraBullet.setActive(true).setVisible(true).setVelocityY(800); // Set bullet speed
                        extraBullet.body.setSize(extraBullet.width * 0.5, extraBullet.height * 0.5); // Adjust hitbox
                        this.bossBulletSound.play(); // Play shoot sound
                    }
                });
            },
            callbackScope: this,
            loop: true
        });
    }
  

    destroyEnemy(bullet, enemy) {
        if (!enemy) return;
        if (this.destructionSound) this.destructionSound.play();
        let explosion = this.explosionsGroup.create(enemy.x, enemy.y, 'explosion');
        explosion.play('explode');
        if (bullet) bullet.destroy();
        enemy.destroy();
        if (Phaser.Math.Between(1, 100) <= 30) {
            this.spawnPowerup(enemy.x, enemy.y);
        }
        if (bullet && bullet.parent) {
            if (bullet.parent === this.player1) {
                this.player1Score += 10;
                this.player1ScoreText.setText(`Score: ${this.player1Score}`);
            } else if (bullet.parent === this.player2) {
                this.player2Score += 10;
                this.player2ScoreText.setText(`Score: ${this.player2Score}`);
            }
        }
    }
  

    spawnPowerup(x, y) {
        const powerUpTypes = this.stage === 2 
            ? ['powerSpeed', 'powerGun', 'powerLife', 'powerBomb'] 
            : ['powerSpeed', 'powerGun', 'powerLife']; //Only basic power-ups in Stage 1
    
        const randomPowerUp = Phaser.Utils.Array.GetRandom(powerUpTypes);
        const powerUp = this.powerUps.create(x, y, randomPowerUp).setVelocityY(100);
        powerUp.setData('type', randomPowerUp);
        powerUp.body.setSize(powerUp.width * 0.1, powerUp.height * 0.1);
    }

    collectPowerup(player, powerup) {
        const powerupType = powerup.getData('type');
    
        switch (powerupType) {
            case 'powerSpeed': // Speed Boost Power-Up
                this.speedBoost = true;
                player.setTint(0x00ff00); // Flash green
                this.time.delayedCall(5000, () => {
                    this.speedBoost = false;
                    player.clearTint(); // Reset tint
                }, [], this);
                break;
    
            case 'powerGun': // Triple Shot Power-Up
                this.tripleShot = true;
                this.time.delayedCall(5000, () => {
                    this.tripleShot = false; // Reset triple shot
                }, [], this);
                break;
    
            case 'powerLife': // Extra Life Power-Up
                if (player === this.player1) {
                    this.player1Lives++;
                    this.updateLivesUI(this.player1LivesIcons, this.player1Lives, false); // Update Player 1 lives UI
                } else if (player === this.player2) {
                    this.player2Lives++;
                    this.updateLivesUI(this.player2LivesIcons, this.player2Lives, true); // Update Player 2 lives UI
                }
                break;
    
            case 'powerBomb': // Bomb Power-Up (New)
                this.enemies.getChildren().forEach(enemy => {
                    if (enemy.active) {
                        this.destroyEnemy(null, enemy); // Destroy all active enemies
                    }
                });
                break;
    
            default:
                console.warn(`Unknown power-up type: ${powerupType}`);
                break;
        }
    
        powerup.destroy(); // Remove the power-up after collection
    }

    gameOver() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        this.add.text(centerX, centerY, 'Game Over!', {
            fontSize: '40px',
            fill: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    
        // Disable players
        if (this.player1) this.player1.setActive(false).setVisible(false);
        if (this.player2) this.player2.setActive(false).setVisible(false);
    
        // Clear all game objects
        this.enemies.clear(true, true);
        this.enemyBullets.clear(true, true);
        this.powerUps.clear(true, true);
    
        // Reset game state
        this.wave = 1;
        this.enemiesSpawned = 0;
        this.maxEnemiesPerWave = 10;
        this.boss = null;
        this.bossHealth = 20;
        this.speedBoost = false;
        this.tripleShot = false;
        this.score = 0;
        this.lives = 3;
    
        // Reset player lives
        this.player1Lives = 3;
        if (this.mode === '2player') {
            this.player2Lives = 3;
        }
    
        // Reset UI
        if (this.livesIcons) {
            this.livesIcons.clear(true, true);
        }
        this.updateLivesUI(this.player1LivesIcons, this.player1Lives);
        if (this.mode === '2player') {
            this.updateLivesUI(this.player2LivesIcons, this.player2Lives, true);
        }
    
        // Restart the scene after a delay
        this.time.delayedCall(2000, () => {
            this.scene.restart();
        }, [], this);
    }

}
       


class Stage5Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'StagesScene' });
        this.wave = 1;
        this.enemiesSpawned = 0;
        this.maxEnemiesPerWave = 21;
        this.boss = null;
        this.bossHealth = 20;
        this.speedBoost = false;
        this.tripleShot = false;
        this.score = 0;
        this.lives = 3;
        this.player1 = null;
        this.player2 = null;
        this.bullets = null;
        this.enemies = null;
        this.enemyBullets = null;
        this.keys = null;
        this.arrowKeys = null;
        this.scoreText = null;
        this.waveText = null;
        this.livesIcons = null;
        this.explosionsGroup = null;
        this.powerUps = null;
        this.shootSound = null;
        this.destructionSound = null;
    }
    preload() {

        this.load.video('stage5bgvid', 'assets/vid/stage1.mp4', undefined, true); // true enables noAudio

        // Add error handling
        this.load.on('fileerror', (file) => {
            console.error('Failed to load file:', file.key);
        });
    
        // Debugging: Log when the video is loaded
        this.load.on('filecomplete', (key) => {
            if (key === 'stage5bgvid') {
                console.log('Video loaded successfully:', key);
            }
        });


        this.load.audio('shootSound', 'assets/sounds/laserSound.wav');
        this.load.audio('destructionSound', 'assets/sounds/destructionSound.wav');
        this.load.spritesheet('explosion', 'assets/sprites/explosion.png', { frameWidth: 64, frameHeight: 64 });
        
        this.load.image('ship1', 'assets/img/ship1.png');
        this.load.image('ship2', 'assets/img/ship2.png');
        this.load.image('ship3', 'assets/img/ship3.png');
      
        this.load.image('powerSpeed', 'assets/img/power-speed.png');
        this.load.image('powerGun', 'assets/img/power-gun.png');
        this.load.image('powerLife', 'assets/img/power-life.png');
        this.load.image('lifeIcon', 'assets/img/power-life.png');
        this.load.image('powerBomb', 'assets/img/bomb.png');
        
        this.load.image('stage3Bg', 'assets/img/stage3-bg.jpg');

        this.load.image('enemy5', 'assets/img/enemy5.png');
        this.load.image('enemyBullet5', 'assets/img/enemy-bullet5.png');
        this.load.image('boss5', 'assets/img/boss5.png');
        this.load.image('bossBullet5', 'assets/img/boss-bullet5.png');

        this.load.audio('bossBulletSound', 'assets/sounds/bossBulletSound.wav');
        this.load.audio('bossDestructionSound', 'assets/sounds/bossDestructionSound.wav');
        

    }
    create(data) {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        console.log("Received data:", data);
        const video = this.add.video(centerX, centerY, 'stage4bgvid');
    
        // Debugging: Check if the video object exists
        if (!video) {
            console.error('Video object is null. Using fallback image.');
            this.add.image(centerX, centerY, 'console-bg').setDisplaySize(1300, 750);
            return;
        }
    
        // Set the video's depth to ensure it's rendered behind other objects
        video.setDepth(-1);
    
        // Play the video before setting the display size
        video.play(true); // Loop the video
    
        // Ensure the video is fully loaded before setting the size
        video.on('play', () => {
            console.log('Video is now playing. Setting display size...');
            video.setOrigin(0.5, 0.5).setDisplaySize(1300, 750);
        });
    
        // Handle video errors
        video.on('error', () => {
            console.error('Video failed to load. Using fallback image.');
            this.add.image(centerX, centerY, 'console-bg').setDisplaySize(1300, 750);
        });
    
        this.stage = data.stage || 1;
        this.player1Ship = data.player1Ship || 'ship1';
        this.player2Ship = data.player2Ship || 'ship1';
        this.mode = data.mode || '1player';
        this.player1BulletType = data.player1Bullet || 'bullet1';
        this.player2BulletType = data.player2Bullet || 'bullet1';
    
        console.log('Stage:', this.stage);
        console.log('Player 1 Ship:', this.player1Ship);
        console.log('Player 2 Ship:', this.player2Ship);
    
        if (this.mode === '2player') {
            this.player2 = this.physics.add.sprite(800, 500, this.player2Ship).setCollideWorldBounds(true).setScale(0.35);
            this.player2.body.setSize(this.player2.width * 0.3, this.player2.height * 0.3);
            this.player2.setDepth(1);
            this.player2Lives = 3;
            this.player2Score = 0;
        }
    
        this.player1LivesIcons = this.add.group({
            classType: Phaser.GameObjects.Image, // Force correct type
            key: 'lifeIcon',
            repeat: this.player1Lives - 1,
            runChildUpdate: true
        });
    
        for (let i = 0; i < this.player1Lives; i++) {
            this.player1LivesIcons.add(this.add.image(72 + i * 30, 42, 'lifeIcon').setScale(1));
        }
    
        if (this.mode === '2player') {
            this.player2LivesIcons = this.add.group({
                key: 'lifeIcon',
                repeat: this.player2Lives - 1,
                setXY: { x: this.cameras.main.width - 72 - (this.player2Lives - 1), y: 42, stepX: -30 }
            });
        }
    
        this.player1ScoreText = this.add.text(60, 12, 'Score: 0', { fontSize: '20px', fill: '#fff' });
        if (this.mode === '2player') {
            this.player2ScoreText = this.add.text(this.cameras.main.width - 60, 12, 'Score: 0', { fontSize: '20px', fill: '#fff' }).setOrigin(1, 0);
        }
    
        this.player1Bullets = this.physics.add.group({
            defaultKey: this.player1BulletType,
            maxSize: 1000,
            runChildUpdate: true,
            createCallback: (bullet) => {
                bullet.setScale(0.7);
                bullet.body.setSize(bullet.width * 0.2, bullet.height * 0.5);
            }
        });
    
        if (this.mode === '2player') {
            this.player2Bullets = this.physics.add.group({
                defaultKey: this.player2BulletType,
                maxSize: 1000,
                runChildUpdate: true,
                createCallback: (bullet) => {
                    bullet.setScale(0.7);
                    bullet.body.setSize(bullet.width * 0.2, bullet.height * 0.5);
                }
            });
        }
    
        this.enemies = this.physics.add.group({ defaultKey: 'enemy', maxSize: 20, runChildUpdate: true });
        this.enemyBullets = this.physics.add.group({ defaultKey: 'enemyBullet', maxSize: 1000, runChildUpdate: true });
    
        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE
        });
    
        if (this.mode === '2player') {
            this.arrowKeys = this.input.keyboard.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.UP,
                down: Phaser.Input.Keyboard.KeyCodes.DOWN,
                left: Phaser.Input.Keyboard.KeyCodes.LEFT,
                right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
                shift: Phaser.Input.Keyboard.KeyCodes.SHIFT
            });
        }
    
        this.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.shootBullet(this.player1);
            }
        });
    
        this.waveText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, '', { fontSize: '40px', fill: '#ffffff' }).setOrigin(0.5);
        this.physics.add.overlap(this.player1Bullets, this.enemies, (bullet, enemy) => this.destroyEnemy(bullet, enemy), null, this);
        if (this.mode === '2player') {
            this.physics.add.overlap(this.player2Bullets, this.enemies, (bullet, enemy) => this.destroyEnemy(bullet, enemy), null, this);
        }
       
        this.powerUps = this.physics.add.group();
        this.physics.add.overlap(this.player1, this.powerUps, (player, powerup) => this.collectPowerup(player, powerup), null, this);
        if (this.player2) {
            this.physics.add.overlap(this.player2, this.powerUps, (player, powerup) => this.collectPowerup(player, powerup), null, this);
        }
        this.waveText.setText(`Wave ${this.wave}`);
        this.time.delayedCall(2000, () => {
            this.waveText.setText('');
            this.time.addEvent({ delay: 1000, callback: this.spawnEnemy, callbackScope: this, loop: true });
        }, [], this);
    
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 1, end: 5 }),
            frameRate: 40,
            repeat: 0,
            hideOnComplete: true
        });
        this.explosionsGroup = this.physics.add.group();
        // ✅ GLOBAL ENEMY SHOOT TIMER
        this.enemyShootTimer = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                this.enemies.getChildren().forEach(enemy => {
                    if (enemy.active) this.enemyShoot(enemy);
                });
            },
            callbackScope: this
        });

        // ✅ PAUSE BUTTON
        const pauseButton = document.getElementById('pauseBtn');
        let isPaused = false;
        if (pauseButton) {
            pauseButton.addEventListener('click', () => {
                isPaused = !isPaused;
                if (isPaused) {
                    this.scene.pause();
                    pauseButton.innerText = '▶️ Resume';
                } else {
                    this.scene.resume();
                    pauseButton.innerText = '⏸ Pause';
                }
            });
        }

    }


    update() {
        let speed = this.speedBoost ? 500 : 300;

        if (this.keys) {
            if (this.keys.left.isDown) this.player1.setVelocityX(-speed);
            else if (this.keys.right.isDown) this.player1.setVelocityX(speed);
            else this.player1.setVelocityX(0);
            if (this.keys.up.isDown) this.player1.setVelocityY(-speed);
            else if (this.keys.down.isDown) this.player1.setVelocityY(speed);
            else this.player1.setVelocityY(0);

            if (Phaser.Input.Keyboard.JustDown(this.keys.space)) this.shootBullet(this.player1);
        }

        if (this.player2 && this.arrowKeys) {
            if (this.arrowKeys.left.isDown) this.player2.setVelocityX(-speed);
            else if (this.arrowKeys.right.isDown) this.player2.setVelocityX(speed);
            else this.player2.setVelocityX(0);
            if (this.arrowKeys.up.isDown) this.player2.setVelocityY(-speed);
            else if (this.arrowKeys.down.isDown) this.player2.setVelocityY(speed);
            else this.player2.setVelocityY(0);

            if (Phaser.Input.Keyboard.JustDown(this.arrowKeys.shift)) this.shootBullet(this.player2);
        }
            
        if (this.boss?.active) this.moveBoss();
    }


       
updateLivesUI(livesIcons, lives, isPlayer2 = false) {
    // Debugging: Check if livesIcons is defined
    if (!livesIcons) {
        console.error('livesIcons is undefined!');
        return;
    }

    console.log(`--- Updating Lives UI ---`);
    console.log(`Player: ${isPlayer2 ? "Player 2" : "Player 1"}`);
    console.log(`Before clearing, Lives UI Count: ${livesIcons.getLength()}`);
    console.log(`Lives Left: ${lives}`);

    // Destroy each life icon properly
    livesIcons.getChildren().forEach(icon => {
        icon.destroy();  // Fully remove the object
    });

    // Clear the group to remove any references
    livesIcons.clear(true, true);

    // Force Phaser to process pending changes before adding new icons
    this.time.delayedCall(100, () => {
        console.log(`After clearing, Lives UI Count: ${livesIcons.getLength()}`);

        // Re-add icons based on the updated number of lives
        for (let i = 0; i < lives; i++) {
            let newX = isPlayer2 ? this.cameras.main.width - 72 - i * 30 : 72 + i * 30;
            let newLifeIcon = this.add.image(newX, 42, 'lifeIcon').setScale(1);
            livesIcons.add(newLifeIcon);
        }

        console.log(`After adding, Lives UI Count: ${livesIcons.getLength()}`);
    }, [], this);
}



playerHit(player, object) {
    if (!player || !player.active || !object || !object.active) return;

    object.destroy();

    if (player === this.player1) {
        console.log('Player 1 hit! Updating Lives UI...');
        this.player1Lives--; // Reduce player lives
        this.updateLivesUI(this.player1LivesIcons, this.player1Lives); // Update UI

        console.log(`Player 1 Lives after hit: ${this.player1Lives}`);
        if (this.player1Lives <= 0) {
            player.setActive(false).setVisible(false);
            this.keys.space.enabled = false; // Disable shooting for Player 1
        }
    } else if (player === this.player2) {
        this.player2Lives--;
        console.log(`Player 2 Lives: ${this.player2Lives}`); // Debug log
        this.updateLivesUI(this.player2LivesIcons, this.player2Lives, true); // Update Player 2 lives icons
        if (this.player2Lives <= 0) {
            player.setActive(false).setVisible(false);
            this.arrowKeys.shift.enabled = false; // Disable shooting for Player 2
        }
    }

    // Check if either player has lost all lives
    if ((this.player1Lives <= 0 && this.mode === '1player') || 
        (this.player1Lives <= 0 && (!this.player2 || this.player2Lives <= 0))) {
        this.gameOver();
    }

    player.setTint(0xff0000);
    this.time.delayedCall(1000, () => {
        player.clearTint();
    }, [], this);
}

    shootBullet(player) {
        if (player === this.player1 && this.player1Lives <= 0) return; // Disable shooting for Player 1 if lives are 0
        if (player === this.player2 && this.player2Lives <= 0) return; // Disable shooting for Player 2 if lives are 0

        if (this.shootSound) {
            this.shootSound.play({ rate: 1.5 }); // Speed up the shooting sound
        }

        if (this.tripleShot) {
            let bulletGap = 35; // Adjust this value for wider/narrower spread
            const positions = [-bulletGap, 0, bulletGap]; // Bullet spread positions

            positions.forEach(offset => {
                let bullet = player === this.player1 
                    ? this.player1Bullets.get(player.x + offset, player.y - 20) 
                    : this.player2Bullets.get(player.x + offset, player.y - 20);
                    
                if (bullet) {
                    bullet.setActive(true).setVisible(true).setVelocityY(-400);
                    bullet.body.setSize(bullet.width * 0.2, bullet.height * 0.2); // Smaller hitbox
                    bullet.parent = player;
                }
            });

        } else { // Single Shot
            let bullet = player === this.player1 
                ? this.player1Bullets.get(player.x, player.y - 20) 
                : this.player2Bullets.get(player.x, player.y - 20);
                
            if (bullet) {
                bullet.setActive(true).setVisible(true).setVelocityY(-400);
                bullet.body.setSize(bullet.width * 0.1, bullet.height * 0.4);
                bullet.parent = player;
            }
        }
    }

    moveBoss() {
        if (!this.boss.moveTimer) {
            this.boss.moveTimer = this.time.delayedCall(Phaser.Math.Between(1000, 3000), () => {
                this.boss.moveTimer = null;
            }, [], this);
            const directions = [
                { x: 100, y: 0 }, { x: -100, y: 0 }, { x: 0, y: 100 }, { x: 0, y: -100 },
                { x: 100, y: 100 }, { x: -100, y: 100 }, { x: 100, y: -100 }, { x: -100, y: -100 }
            ];
            const direction = Phaser.Utils.Array.GetRandom(directions);
            this.boss.setVelocityX(direction.x);
            this.boss.setVelocityY(direction.y);
            const speed = Phaser.Math.Between(50, 150);
            this.boss.setVelocityX(this.boss.body.velocity.x * speed / 100);
            this.boss.setVelocityY(this.boss.body.velocity.y * speed / 100);
        }

        if (this.boss.x <= 100) this.boss.setVelocityX(100);
        else if (this.boss.x >= 700) this.boss.setVelocityX(-100);
        if (this.boss.y <= 50) this.boss.setVelocityY(100);
        else if (this.boss.y >= 200) this.boss.setVelocityY(-100);
    }

   
    spawnEnemy() {
        if (this.enemiesSpawned < this.maxEnemiesPerWave) {
            // Center of the screen
            const centerX = this.cameras.main.centerX;
            const centerY = 0; // Spawn at the top of the screen
    
            // Randomize the X position within a range around the center
            const scatterRange = 500; // Adjust this value to control how far enemies can spawn from the center
            const x = Phaser.Math.Between(centerX - scatterRange, centerX + scatterRange); // Random X position within the range
    
            // Create the enemy at the randomized position
            const enemy = this.enemies.create(x, centerY, 'enemy5');
            if (enemy) {
                enemy.setVelocityY(100); // Move downward
                enemy.body.setSize(enemy.width * 0.2, enemy.height * 0.1); // Adjust hitbox
            }
    
            // Add shooting behavior for the enemy
            
    
            this.enemiesSpawned++; // Increment the enemy count
        }
    
        // Start the wave end timer if all enemies are spawned
        if (this.enemiesSpawned >= this.maxEnemiesPerWave && !this.waveEndTimer) {
            this.waveEndTimer = this.time.delayedCall(2000, this.nextWave, [], this); // End wave after 2 seconds
        }
    }


    enemyShoot(enemy) {
        if (!enemy.active) return;
        const bullet = this.enemyBullets.get(enemy.x, enemy.y + 20, 'enemyBullet5');
        if (bullet) {
            bullet.setActive(true).setVisible(true).setVelocityY(200);
            bullet.body.setSize(bullet.width * 0.1, bullet.height * 0.3);
        }
    }

    nextWave() {
        this.wave++;
        if (this.wave <= 3) {
            this.waveText.setText(`Wave ${this.wave}`);
            this.time.delayedCall(2000, () => { this.waveText.setText(''); }, [], this);
            this.enemiesSpawned = 0;
            this.maxEnemiesPerWave += 10;
            this.waveEndTimer = null;
            this.time.delayedCall(2000, this.spawnEnemy, [], this);
        } else {
            this.time.delayedCall(3000, this.bossFight, [], this);
        }
    }

    bossFight() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        const healthBarWidth = 300;
        const healthBarHeight = 15; // Define healthBarHeight here
    
        this.waveText = this.add.text(centerX, centerY, '', { fontSize: '40px', fill: '#ffffff' }).setOrigin(0.5);
        this.bossHealth = 50;
        this.bossDestroyed = false;
        this.waveText.setText('Final Boss!');
        this.time.delayedCall(2000, () => { this.waveText.setText(''); }, [], this);
    
        // Spawn the boss
        this.boss = this.physics.add.sprite(centerX, 100, 'boss5').setScale(1.5).setVelocityY(50);
        this.boss.body.setSize(this.boss.width * 0.5, this.boss.height * 0.5);
        this.boss.setCollideWorldBounds(true);
    
        // Add overlap for player bullets and boss
        this.physics.add.overlap(this.player1Bullets, this.boss, (boss, bullet) => this.hitBoss(boss, bullet), null, this);
        if (this.mode === '2player') {
            this.physics.add.overlap(this.player2Bullets, this.boss, (boss, bullet) => this.hitBoss(boss, bullet), null, this);
        }
    
        // Boss health bar background
        this.bossHealthBarBg = this.add.graphics();
        this.bossHealthBarBg.fillStyle(0x222222, 1);
        this.bossHealthBarBg.fillRect(this.boss.x - healthBarWidth / 2, this.boss.y - 100, healthBarWidth, healthBarHeight);

        // Health bar
        this.bossHealthBar = this.add.graphics();
        this.bossHealthBar.fillStyle(0xff0000, 1);
        this.bossHealthBar.fillRect(this.boss.x - healthBarWidth / 2, this.boss.y - 100, healthBarWidth, healthBarHeight);
    
        // Boss shooting behavior
        this.time.addEvent({
            delay: 2000,
            callback: this.bossShoot,
            callbackScope: this,
            loop: true
        });
    
        // Spawn accompanying enemies periodically
        this.time.addEvent({
            delay: 5000, // Spawn enemies every 5 seconds
            callback: this.spawnBossEnemies,
            callbackScope: this,
            loop: true
        });
    }

    spawnBossEnemies() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
    
        // Spawn 2-4 normal enemies near the boss
        const numEnemies = Phaser.Math.Between(2, 4); // Random number of enemies
        for (let i = 0; i < numEnemies; i++) {
            const x = Phaser.Math.Between(centerX - 200, centerX + 200); // Random X position near the boss
            const y = Phaser.Math.Between(50, 150); // Random Y position near the top of the screen
    
            const enemy = this.enemies.create(x, y, 'enemy5');
            if (enemy) {
                enemy.setVelocityY(100); // Move downward
                enemy.body.setSize(enemy.width * 0.2, enemy.height * 0.1); // Adjust hitbox
            }
    
            // Add shooting behavior for the enemy
            
        }
    }
    
    hitBoss(boss, bullet) {
        // Check if the boss or bullet is invalid
        if (!boss || !boss.active || this.bossDestroyed) return;
    
        // Destroy the bullet
        bullet.destroy();
    
        // Reduce boss health
        this.bossHealth = Math.max(0, this.bossHealth - 1);
    
        // Calculate health percentage
        const maxHealth = 20; // Adjust if your boss has a different max health
        const healthPercentage = this.bossHealth / maxHealth;
    
        // Health bar dimensions
        const healthBarWidth = 300;
        const healthBarHeight = 15;
    
        // Position the health bar relative to the boss
        const healthBarX = boss.x - healthBarWidth / 2; // Center health bar horizontally
        const healthBarY = boss.y - 100; // Position health bar above the boss
    
        // Update the health bar
        this.bossHealthBar.clear();
        this.bossHealthBar.fillStyle(0xff0000, 1);
        this.bossHealthBar.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercentage, healthBarHeight);
    
        // Check if the boss is defeated
        if (this.bossHealth <= 0 && !this.bossDestroyed) {
            this.bossDestroyed = true;
    
            // Delay boss destruction for visual effect
            this.time.delayedCall(500, () => {
                if (this.boss && this.boss.active) {
                    // Destroy the boss and health bar
                    this.boss.destroy();
                    this.bossHealthBar.destroy();
                    this.bossHealthBarBg.destroy();
    
                    // Display "YOU WIN!" message
                    this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'YOU WIN!', {
                        fontSize: '40px',
                        fill: '#0f0',
                        fontStyle: 'bold'
                    }).setOrigin(0.5);
    
                    // Play boss destruction sound
                    if (this.bossDestructionSound) {
                        this.bossDestructionSound.play();
                    }
    
                    // Transition to the next scene after a delay
                    this.time.delayedCall(2000, () => {
                        this.scene.start('StageSelectionScene', {
                            player1Ship: this.player1Ship,
                            player2Ship: this.player2Ship,
                            mode: this.mode,
                            player1Bullet: this.player1BulletType,
                            player2Bullet: this.player2BulletType,
                            player1Lives: this.player1Lives,
                            player2Lives: this.player2Lives,
                            player1Score: this.player1Score,
                            player2Score: this.player2Score,
                            completedStages: [1, 2, 3, 4, 5], // Mark stages as completed
                            currentStage: 5 // Set the current stage to 4
                        });
                    }, [], this);
                }
            }, [], this);
        }
    }

    
    bossShoot() {
        if (!this.boss || !this.boss.active) return; // Ensure the boss exists and is active
    
        // Single shot
        const bullet = this.enemyBullets.get(this.boss.x, this.boss.y + 20, 'bossBullet5');
        if (bullet) {
            bullet.setActive(true).setVisible(true).setVelocityY(800); // Set bullet speed
            bullet.body.setSize(bullet.width * 0.5, bullet.height * 0.5); // Adjust hitbox
            this.bossBulletSound.play(); // Play shoot sound
        }
    
        // Triple shot every 4 seconds
        this.time.addEvent({
            delay: 2000,
            callback: () => {
                if (!this.boss || !this.boss.active) return; // Ensure the boss is still active
    
                const bulletGap = 55; // Adjust this value for wider/narrower spread
                const positions = [-bulletGap, 0, bulletGap]; // Triple shot positions
    
                positions.forEach(offset => {
                    const extraBullet = this.enemyBullets.get(this.boss.x + offset, this.boss.y + 20, 'bossBullet4');
                    if (extraBullet) {
                        extraBullet.setActive(true).setVisible(true).setVelocityY(800); // Set bullet speed
                        extraBullet.body.setSize(extraBullet.width * 0.5, extraBullet.height * 0.5); // Adjust hitbox
                        this.bossBulletSound.play(); // Play shoot sound
                    }
                });
            },
            callbackScope: this,
            loop: true
        });
    }
  

    destroyEnemy(bullet, enemy) {
        if (!enemy) return;
        if (this.destructionSound) this.destructionSound.play();
        let explosion = this.explosionsGroup.create(enemy.x, enemy.y, 'explosion');
        explosion.play('explode');
        if (bullet) bullet.destroy();
        enemy.destroy();
        if (Phaser.Math.Between(1, 100) <= 30) {
            this.spawnPowerup(enemy.x, enemy.y);
        }
        if (bullet && bullet.parent) {
            if (bullet.parent === this.player1) {
                this.player1Score += 10;
                this.player1ScoreText.setText(`Score: ${this.player1Score}`);
            } else if (bullet.parent === this.player2) {
                this.player2Score += 10;
                this.player2ScoreText.setText(`Score: ${this.player2Score}`);
            }
        }
    }
  

    spawnPowerup(x, y) {
        const powerUpTypes = this.stage === 2 
            ? ['powerSpeed', 'powerGun', 'powerLife', 'powerBomb'] 
            : ['powerSpeed', 'powerGun', 'powerLife']; //Only basic power-ups in Stage 1
    
        const randomPowerUp = Phaser.Utils.Array.GetRandom(powerUpTypes);
        const powerUp = this.powerUps.create(x, y, randomPowerUp).setVelocityY(100);
        powerUp.setData('type', randomPowerUp);
        powerUp.body.setSize(powerUp.width * 0.1, powerUp.height * 0.1);
    }

    collectPowerup(player, powerup) {
        const powerupType = powerup.getData('type');
    
        switch (powerupType) {
            case 'powerSpeed': // Speed Boost Power-Up
                this.speedBoost = true;
                player.setTint(0x00ff00); // Flash green
                this.time.delayedCall(5000, () => {
                    this.speedBoost = false;
                    player.clearTint(); // Reset tint
                }, [], this);
                break;
    
            case 'powerGun': // Triple Shot Power-Up
                this.tripleShot = true;
                this.time.delayedCall(5000, () => {
                    this.tripleShot = false; // Reset triple shot
                }, [], this);
                break;
    
            case 'powerLife': // Extra Life Power-Up
                if (player === this.player1) {
                    this.player1Lives++;
                    this.updateLivesUI(this.player1LivesIcons, this.player1Lives, false); // Update Player 1 lives UI
                } else if (player === this.player2) {
                    this.player2Lives++;
                    this.updateLivesUI(this.player2LivesIcons, this.player2Lives, true); // Update Player 2 lives UI
                }
                break;
    
            case 'powerBomb': // Bomb Power-Up (New)
                this.enemies.getChildren().forEach(enemy => {
                    if (enemy.active) {
                        this.destroyEnemy(null, enemy); // Destroy all active enemies
                    }
                });
                break;
    
            default:
                console.warn(`Unknown power-up type: ${powerupType}`);
                break;
        }
    
        powerup.destroy(); // Remove the power-up after collection
    }



    gameOver() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        this.add.text(centerX, centerY, 'Game Over!', {
            fontSize: '40px',
            fill: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    
        // Disable players
        if (this.player1) this.player1.setActive(false).setVisible(false);
        if (this.player2) this.player2.setActive(false).setVisible(false);
    
        // Clear all game objects
        this.enemies.clear(true, true);
        this.enemyBullets.clear(true, true);
        this.powerUps.clear(true, true);
    
        // Reset game state
        this.wave = 1;
        this.enemiesSpawned = 0;
        this.maxEnemiesPerWave = 10;
        this.boss = null;
        this.bossHealth = 20;
        this.speedBoost = false;
        this.tripleShot = false;
        this.score = 0;
        this.lives = 3;
    
        // Reset player lives
        this.player1Lives = 3;
        if (this.mode === '2player') {
            this.player2Lives = 3;
        }
    
        // Reset UI
        if (this.livesIcons) {
            this.livesIcons.clear(true, true);
        }
        this.updateLivesUI(this.player1LivesIcons, this.player1Lives);
        if (this.mode === '2player') {
            this.updateLivesUI(this.player2LivesIcons, this.player2Lives, true);
        }
    
        // Restart the scene after a delay
        this.time.delayedCall(2000, () => {
            this.scene.restart();
        }, [], this);
    }

}

const config = {
    type: Phaser.AUTO,
    width: 1300,
    height: 750,
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
        },
    },
    parent: 'game-container',
    scene: [LandingPageScene, BattleshipSelectionScene, MainGameScene, 
            StageSelectionScene, Stage2Scene, Stage3Scene, Stage4Scene, Stage5Scene],
};

const game = new Phaser.Game(config);

