export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
  }

  init() {
    this.score = 0; // Inicializar la puntuación
    this.ballInitialVelocity = { x: 200, y: -200 }; // Velocidad inicial de la pelota
  }

  preload() {
    this.load.image("sky", "./public/assets/space3.png");
  }

  create() {
    // Fondo
    this.add.image(400, 300, "sky").setDepth(0);

    // Paleta
    this.paddle = this.add.rectangle(400, 500, 80, 20, 0x00ff00).setDepth(9);
    this.physics.add.existing(this.paddle);
    this.paddle.body.setImmovable(true);
    this.paddle.body.setCollideWorldBounds(true);

    // Pelota
    this.ball = this.add.circle(400, 480, 10, 0xff0000);
    this.physics.add.existing(this.ball);
    this.ball.body.setCollideWorldBounds(true);
    this.ball.body.setBounce(1.1);
    this.resetBall();

    // Ladrillos
    this.bricks = this.physics.add.staticGroup();
    this.createBricks();

    // Colisiones
    this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);
    this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);

    // Input
    this.input.on('pointermove', this.movePaddle, this);

    // Marcador
    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
  }

  update() {
    this.checkBallSpeed();
    this.checkBallOutOfBounds();
  }

  movePaddle(pointer) {
    const paddleX = pointer.x;
    const paddleWidth = this.paddle.width;

    if (paddleX < paddleWidth / 2) {
      this.paddle.setX(paddleWidth / 2);
    } else if (paddleX > this.cameras.main.width - paddleWidth / 2) {
      this.paddle.setX(this.cameras.main.width - paddleWidth / 2);
    } else {
      this.paddle.setX(paddleX);
    }
  }

  resetBall() {
    this.ball.setPosition(400, 480);
    this.ball.body.setVelocity(this.ballInitialVelocity.x, this.ballInitialVelocity.y);
  }

  hitBrick(ball, brick) {
    brick.destroy();
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    if (this.bricks.countActive() === 0) {
      this.scene.restart();
      this.score = 0;
    }
  }

  hitPaddle(ball, paddle) {
    let diff = 0;

    if (ball.x < paddle.x) {
      diff = paddle.x - ball.x;
      ball.body.setVelocityX(-10 * diff);
    } else if (ball.x > paddle.x) {
      diff = ball.x - paddle.x;
      ball.body.setVelocityX(10 * diff);
    } else {
      ball.body.setVelocityX(2 + Math.random() * 8);
    }
  }

  createBricks() {
    for (let i = 0; i < 20; i++) {
      let x = 70 + (i % 10) * 70;
      let y = 100 + Math.floor(i / 10) * 35;
      let brick = this.add.rectangle(x, y, 60, 20, 0x0000ff);
      this.physics.add.existing(brick, true);
      this.bricks.add(brick);
    }
  }

  checkBallSpeed() {
    const maxSpeed = 400;
    let velocityX = this.ball.body.velocity.x;
    let velocityY = this.ball.body.velocity.y;

    if (Phaser.Math.Distance.Between(0, 0, velocityX, velocityY) > maxSpeed) {
      const ratio = maxSpeed / Phaser.Math.Distance.Between(0, 0, velocityX, velocityY);
      this.ball.body.setVelocity(velocityX * ratio, velocityY * ratio);
    }
  }

  checkBallOutOfBounds() {
    if (this.ball.getBottomCenter().y > this.cameras.main.height) {
      this.scene.restart();
      this.score = 0;
    }
  }
}
