const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [BootScene, GameScene, GameOverScene]
};

const game = new Phaser.Game(config);

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        this.load.image('background', 'assets/background.png');
        this.load.image('player', 'assets/player.png');
        this.load.image('platform', 'assets/platform.png');
    }

    create() {
        this.add.image(400, 300, 'background');
        const title = this.add.text(400, 150, 'Jump!', { fontSize: '64px', fill: '#fff' }).setOrigin(0.5);
        title.setClassName('title');

        const playButton = this.add.text(400, 300, 'Играть', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        playButton.setClassName('button');

        playButton.setInteractive();
        playButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('background', 'assets/background.png');
        this.load.image('player', 'assets/player.png');
        this.load.image('platform', 'assets/platform.png');
    }

    create() {
        this.add.image(400, 300, 'background');

        // Игрок
        this.player = this.physics.add.sprite(400, 300, 'player');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        // Платформы
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 568, 'platform').setScale(2).refreshBody();

        this.physics.add.collider(this.player, this.platforms);

        // Управление через наклоны
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('deviceorientation', (event) => {
                            const tiltX = event.gamma / 90; // Наклон по горизонтали
                            this.player.setVelocityX(tiltX * 200);
                        });
                    }
                })
                .catch(console.error);
        } else {
            window.addEventListener('deviceorientation', (event) => {
                const tiltX = event.gamma / 90; // Наклон по горизонтали
                this.player.setVelocityX(tiltX * 200);
            });
        }
    }

    update() {
        if (this.player.y > 600) {
            this.scene.start('GameOverScene', { score: this.score });
        }
    }
}

class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.score = data.score;
    }

    create() {
        const gameOverText = this.add.text(400, 300, 'Вы упали :(', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
        gameOverText.setClassName('title');

        const scoreText = this.add.text(400, 400, `Счет: ${this.score}`, { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        scoreText.setClassName('title');

        const restartButton = this.add.text(400, 500, 'Играть опять', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        restartButton.setClassName('button');

        restartButton.setInteractive();
        restartButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}
