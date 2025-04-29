class Stage4Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'Stages4Scene' });
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

// Stage4Scene and Stage5Scene code would be here