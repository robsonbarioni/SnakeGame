/*
Game:
    .start()
    .gameOver()
    .input()
    .update()
    .show()

Score:
    .increase()
    .reset()
    .show()

Snake:
    .turn()
    .eat()
    .isAlive()
    .update()
    .show()

Fruit:
    .show()
*/

const _game = new Game();
const _screenSize = 750;
const _scale = 30;

function preload() {
    // adicionar um background-sound (https://www.dl-sounds.com/royalty-free/)
    // pac-man: http://soundfxcenter.com/sound-effects/pacman/0
    songloop = loadSound('./gameloop.mp3');
    songdrop = loadSound('./drops.mp3');
    songfail = loadSound('./fail.mp3');
}

function setup() {
    createCanvas(_screenSize, _screenSize)
    strokeWeight(0);
    _game.start();
}

function keyPressed() {
    _game.input(keyCode);
}

function draw() {
    if (_game.update())
        _game.show();
}

function Game() {
    var snake;
    var fruit;
    var fps = 10;
    const score = new Score();
    this.paused = false;

    this.start = () => {
        this.paused = false;
        snake = new Snake();
        fruit = new Fruit();
        score.reset();
        frameRate(fps = 10);
        loop()
    };

    this.pause = () => {
        if (this.paused = !this.paused)
            songloop.stop();
        else
            songloop.play();
    };

    this.gameOver = () => {
        const _ = 'GAME OVER';

        this.pause();
        songfail.play();

        noLoop();
        clear();
        fill(200,200,200);
        textSize(35);
        textStyle(BOLD);
        text(_, _screenSize / 2 - textWidth(_) / 2, _screenSize / 2 - 17)

        setTimeout(() => { _game.start() }, 4000);
    };

    this.input = (keyCode) => {
        var ctrl = false;

        if (this.paused && keyCode != 32)
            return;

        switch (keyCode) {
            case UP_ARROW: ctrl = snake.turn(0, -1); break;
            case DOWN_ARROW: ctrl = snake.turn(0, 1); break;
            case LEFT_ARROW: ctrl = snake.turn(-1, 0); break;
            case RIGHT_ARROW: ctrl = snake.turn(1, 0); break;
            case 32: this.pause(); break;
        }

        if (ctrl && !songloop.isPlaying()) {
            songloop.setVolume(0.2)
            songloop.loop();
        }
    };

    this.update = () => {

        if (this.paused)
            return true;

        if (!snake.isAlive()) {
            this.gameOver();
            return false;
        }

        if (snake.eat(fruit)) {
            songdrop.play()
            score.increase();
            fruit = new Fruit();

            if (fps < 30)
                frameRate(fps += 2);
        }

        snake.update();
        return true;
    };

    this.show = () => {
        background(33);
        snake.show();
        fruit.show();
        score.show();
    };
}

function Score() {
    var scoreList = [];
    var currentScore = 0;

    this.increase = () => {
        currentScore++
    };

    this.reset = () => {
        var insert = scoreList.length < 3 && currentScore;
        for (var x of scoreList)
            if (currentScore > x) {
                insert = true;
                break;
            }

        if (!insert)
            return;

        if (scoreList.length === 3)
            scoreList.shift();

        scoreList.push(currentScore);
        currentScore = 0;
    };

    this.show = () => {
        fill(200,200,200);
        textFont('Orbitron');
        textSize(18);
        textStyle(BOLD);
        text(`${currentScore}  points`, 15, 30)
    };
}

function Snake() {
    this.tail = [];
    this.tailColors = [];
    this.speedX = 0;
    this.speedY = 0;
    this.y = floor(_screenSize / _scale / 2) * _scale;
    this.x = floor(_screenSize / _scale / 2) * _scale;

    this.turn = (_x, _y) => {

        if (this.speedX != 0 && this.speedX * -1 == _x)
            return false;

        if (this.speedY != 0 && this.speedY * -1 == _y)
            return false;

        this.speedX = _x;
        this.speedY = _y;
        return true;
    };

    this.eat = (_fruit) => {
        if (dist(this.x, this.y, _fruit.x, _fruit.y) >= _scale)
            return false;

        this.tail.push(createVector(this.x, this.y))
        this.tailColors.push(_fruit.color);
        return true;
    };

    this.isAlive = () => {
        for (var _ of this.tail)
            if (dist(this.x, this.y, _.x, _.y) < _scale)
                return false;

        return true;
    }

    this.update = () => {
        if (this.tail.shift())
            this.tail.push(createVector(this.x, this.y))

        // this.x = constrain(this.x + this.speedX * _scale, 0, _screenSize - _scale);
        // this.y = constrain(this.y + this.speedY * _scale, 0, _screenSize - _scale);

        this.x = this.x + this.speedX * _scale;
        if (this.x > _screenSize - _scale) this.x = 0;
        if (this.x < 0) this.x = _screenSize - _scale;

        this.y = this.y + this.speedY * _scale, 0
        if (this.y > _screenSize - _scale) this.y = 0;
        if (this.y < 0) this.y = _screenSize - _scale;
    };

    this.show = () => {
        fill(255)
        rect(this.x, this.y, _scale, _scale)

        for (var i in this.tail) {
            var _t = this.tail[i];
            var _c = this.tailColors[i];
            fill(_c[0], _c[1], _c[2])
            rect(_t.x, _t.y, _scale, _scale)
        }
    }

    return this;
}

function Fruit() {
    const _color = [[148, 0, 211], [75, 0, 130], [0, 0, 255], [0, 255, 0], [255, 255, 0], [255, 127, 0], [255, 0, 0]];

    this.x = floor(random(floor(_screenSize / _scale))) * _scale;
    this.y = floor(random(floor(_screenSize / _scale))) * _scale;
    this.color = _color[floor(random(6))];

    this.show = () => {
        fill(this.color[0], this.color[1], this.color[2])
        rect(this.x, this.y, _scale, _scale)
    }

    return this;
}
