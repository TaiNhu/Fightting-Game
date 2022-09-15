import "./style.css";

document.querySelector("#app").innerHTML = `
    <div class="game-over">
        Game Over
    </div>
    <div>
        <section class="widget">
            <div class="player-hp"><div class="player-hp-real"></div></div>
            <div class="timer">100</div>
            <div class="enemy-hp"><div class="enemy-hp-real"></div></div>
        </section>
        <canvas id="main-game"></canvas>
    </div>
`;

const canvas = document.getElementById("main-game");
const ctx = canvas.getContext("2d");
const bg = new Image();
bg.src = "./images/background.png";
const shop = new Image();
shop.src = "./images/shop.png";
const playerHP = document.querySelector(".player-hp-real");
const enemyHP = document.querySelector(".enemy-hp-real");
const gameOver = document.querySelector(".game-over");
const timer = document.querySelector(".timer");
let shopFrame = 0;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.drawImage(bg, 0, 0, canvas.width, canvas.height + 156);
ctx.drawImage(
	shop,
	118 * shopFrame,
	0,
	118,
	128,
	(canvas.width * 3) / 4 - 118,
	canvas.height,
	118,
	128
);
const gravity = 10;
const fps = 50;
const interval = 1000 / fps;
let lastTime2 = 0;
let lastTime3 = 0;
let lastTime = 0;
let frameHold = 5;
let frameElapsed = 0;

let keys = [];

class Sprite {
	constructor({ position, velocity, color = "red", name }) {
		this.name = name;
		this.position = position;
		this.velocity = velocity;
		this.height = 150;
		this.width = 50;
		this.color = color;
		this.jump = "endJump";
		this.direction = "right";
		this.frame = {
			x: 0,
			y: 0,
		};
		this.attackBox = {
			position: this.position,
			width: 200,
			height: 50,
		};
		this.isAttack = false;
		this.hitPoint = 100;
		this.frameHold = 5;
		this.frameElapsed = 0;
		this.lastState = "Idle";
		this.animate = true;
		this.images = {
			Idle_right: {
				image: new Image(),
				imageSrc: `images/${this.name}/Idle_${this.direction}.png`,
				state: "Idle",
			},
			Run_right: {
				image: new Image(),
				imageSrc: `images/${this.name}/Run_${this.direction}.png`,
				state: "Run",
			},
			Attack1_right: {
				image: new Image(),
				imageSrc: `images/${this.name}/Attack1_${this.direction}.png`,
				state: "Attack1",
			},
			Jump_right: {
				image: new Image(),
				imageSrc: `images/${this.name}/Jump_${this.direction}.png`,
				state: "Jump",
			},
			Fall_right: {
				image: new Image(),
				imageSrc: `images/${this.name}/Fall_${this.direction}.png`,
				state: "Fall",
			},
			Death_right: {
				image: new Image(),
				imageSrc: `images/${this.name}/Death_${this.direction}.png`,
				state: "Death",
			},
		};
		for (var i in this.images) {
			this.images[i].image.src = this.images[i].imageSrc;
			this.images[new String(this.images[i].state) + "_" + "left"] = {
				image: new Image(),
				imageSrc: `images/${this.name}/${this.images[i].state}_left.png`,
			};
			this.images[new String(this.images[i].state) + "_" + "left"].image.src =
				this.images[new String(this.images[i].state) + "_" + "left"].imageSrc;
		}
	}

	draw(state = "Idle", enemy) {
		var noFrame = 0;
		if (this.isAttack) {
			noFrame = this.name == "samuraiMack" ? 6 : 4;
		} else if (state == "Jump" || state == "Fall") {
			noFrame = 2;
		} else if (state == "Run") {
			noFrame = this.name == "samuraiMack" ? 8 : 8;
		} else if (state == "Death") {
			noFrame = this.name == "samuraiMack" ? 6 : 7;
		} else {
			noFrame = this.name == "samuraiMack" ? 8 : 4;
		}
		var image = this.images[state + "_" + this.direction].image;
		if (this.lastState !== state) {
			if (this.direction === "right") {
				this.frame.x = 0;
			} else {
				this.frame.x = noFrame - 1;
			}
			this.lastState = state;
		}
		ctx.drawImage(
			image,
			(this.frame.x * image.width) / noFrame,
			0,
			image.width / noFrame,
			image.height,
			this.position.x - (this.direction == "right" ? 250 : 200),
			this.position.y -
				50 * ((this.width * 10) / this.height) +
				(this.name == "samuraiMack" ? 10 : 0),
			this.width * 10,
			this.height * ((this.width * 10) / this.height)
		);
		this.frameElapsed++;
		if (this.frameElapsed % this.frameHold === 0) {
			if (
				this.direction === "right" &&
				this.frame.x < noFrame - 1 &&
				this.animate
			) {
				this.frame.x++;
			} else if (
				this.direction === "left" &&
				this.frame.x > 0 &&
				this.animate
			) {
				this.frame.x--;
			} else {
				if (this.direction === "right") {
					this.frame.x = 0;
					if (this.lastState == "Death") {
						this.frame.x = noFrame - 1;
						this.animate = false;
					}
				} else {
					this.frame.x = noFrame - 1;
					if (this.lastState == "Death") {
						this.frame.x = 0;
						this.animate = false;
					}
				}
				if (this.isAttack) {
					this.isAttack = false;
					var e = this.name == "samuraiMack" ? enemyHP : playerHP;
					if (
						(this.attackBox.position.x < enemy.position.x + enemy.width &&
							this.attackBox.position.x + this.attackBox.width >
								enemy.position.x &&
							this.attackBox.position.y < enemy.position.y + enemy.height &&
							this.attackBox.position.y + this.attackBox.height >
								enemy.position.y &&
							this.direction === "right") ||
						(this.attackBox.position.x - this.attackBox.width + this.width <
							enemy.position.x + enemy.width &&
							this.attackBox.position.x -
								this.attackBox.width +
								this.width +
								this.attackBox.width >
								enemy.position.x &&
							this.attackBox.position.y < enemy.position.y + enemy.height &&
							this.attackBox.position.y + this.attackBox.height >
								enemy.position.y &&
							this.direction === "left")
					) {
						if (
							e.offsetWidth -
								(document.querySelector(
									`${this.name == "samuraiMack" ? ".enemy-hp" : ".player-hp"}`
								).offsetWidth *
									10) /
									100 >
							0
						) {
							e.style.width =
								e.offsetWidth -
								(document.querySelector(".enemy-hp").offsetWidth * 10) / 100 +
								"px";
						} else {
							e.style.width = 0 + "px";
							enemy.draw("Death");
							gameOverF(
								`Player ${
									this.name == "samuraiMack" ? 1 : 2
								} win \n press Q to play again.`
							);
						}
					}
				}
			}
			this.frameElapsed = 0;
		}
	}

	attack(enemy) {
		if (this.isAttack) {
			this.draw("Attack1", enemy);
		}
	}

	update() {
		if (
			!keys[87] &&
			!keys[68] &&
			!keys[65] &&
			!keys[32] &&
			this.jump == "endJump" &&
			!this.isAttack &&
			this.lastState != "Death"
		) {
			this.draw();
		} else if (this.lastState == "Death") {
			this.draw("Death");
		}
		var x = this.velocity.x;
		var y = this.velocity.y;
		if (keys[87] && !this.isAttack) {
			if (this.jump == "endJump") {
				this.jump = "startJump";
			}
		}
		if (this.jump == "startJump") {
			y = this.velocity.y < 0 ? this.velocity.y : -this.velocity.y;
			this.position.y += y;
			this.draw("Jump");
		}
		if (this.position.y + this.height + gravity > canvas.height) {
			y = 0;
		} else if (this.position.y + y <= 400 && this.jump == "startJump") {
			y = 0;
			this.jump = "onJump";
		} else if (this.jump == "onJump") {
			this.draw("Fall");
			if (this.position.y + this.height + gravity + y >= canvas.height)
				this.jump = "endJump";
		}
		this.position.y += gravity;
		if (this.position.y + this.height >= canvas.height)
			this.position.y = canvas.height - this.height;
		if (keys[68] && !this.isAttack) {
			x = Math.abs(this.velocity.x);
			this.direction = "right";
			if (this.jump == "endJump" && !this.isAttack) {
				this.draw("Run");
			}
		} else if (keys[65] && !this.isAttack) {
			x = -this.velocity.x;
			this.direction = "left";
			if (this.jump == "endJump" && !this.isAttack) {
				this.draw("Run");
			}
		}
		if (
			(!keys[68] && !keys[65]) ||
			this.position.x + x < 0 ||
			this.position.x + x + this.width > canvas.width
		) {
			x = 0;
		}
		if (!this.isAttack) this.position.x += x;
	}
}

let player = new Sprite({
	position: {
		x: canvas.width / 4 - 50,
		y: canvas.height - 200,
	},
	velocity: {
		x: 10,
		y: 30,
	},
	color: "blue",
	name: "samuraiMack",
});

let enemy = new Sprite({
	position: {
		x: (canvas.width * 3) / 4 - 50,
		y: canvas.height - 200,
	},
	velocity: {
		x: 10,
		y: 30,
	},
	color: "red",
	name: "kenji",
});

enemy.update = () => {
	if (
		!keys[38] &&
		!keys[39] &&
		!keys[37] &&
		!keys[13] &&
		enemy.jump == "endJump" &&
		!enemy.isAttack &&
		enemy.lastState != "Death"
	) {
		enemy.draw();
	} else if (enemy.lastState == "Death") {
		enemy.draw("Death");
	}
	var x = enemy.velocity.x;
	var y = enemy.velocity.y;
	if (keys[38] && !enemy.isAttack) {
		if (enemy.jump == "endJump") {
			enemy.jump = "startJump";
		}
	}
	if (enemy.jump == "startJump") {
		enemy.draw("Jump");
		y = enemy.velocity.y < 0 ? enemy.velocity.y : -enemy.velocity.y;
		enemy.position.y += y;
	}
	if (enemy.position.y + enemy.height + gravity > canvas.height) {
		y = 0;
	} else if (enemy.position.y + y <= 400 && enemy.jump == "startJump") {
		y = 0;
		enemy.jump = "onJump";
	} else if (enemy.jump == "onJump") {
		if (enemy.position.y + enemy.height + gravity + y >= canvas.height)
			enemy.jump = "endJump";
		enemy.draw("Fall");
	}
	enemy.position.y += gravity;
	if (enemy.position.y + enemy.height >= canvas.height)
		enemy.position.y = canvas.height - enemy.height;
	if (keys[39] && !enemy.isAttack) {
		if (enemy.jump == "endJump") {
			enemy.draw("Run");
		}
		x = Math.abs(enemy.velocity.x);
		enemy.direction = "right";
	} else if (keys[37] && !enemy.isAttack) {
		if (enemy.jump == "endJump") {
			enemy.draw("Run");
		}
		x = -enemy.velocity.x;
		enemy.direction = "left";
	}
	if (
		(!keys[39] && !keys[37]) ||
		enemy.position.x + x < 0 ||
		enemy.position.x + x + enemy.width > canvas.width
	) {
		x = 0;
	}
	if (!enemy.isAttack) enemy.position.x += x;
};

function animate(timeStamp) {
	var deltaTime = timeStamp - lastTime;
	var deltaTime2 = timeStamp - lastTime2;
	if (deltaTime2 >= 1000) {
		if (parseInt(timer.innerText) > 0) {
			timer.innerText = new String(parseInt(timer.innerText) - 1);
		}
		lastTime2 = timeStamp;
		if (timer.innerText === "0") {
			gameOverF("Draw \n press Q to play again.");
		}
	}
	if (deltaTime > interval) {
		frameElapsed++;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(bg, 0, 0, canvas.width, canvas.height + 150);
		ctx.drawImage(
			shop,
			(shopFrame * shop.width) / 6,
			0,
			shop.width / 6,
			shop.height,
			(canvas.width * 3) / 5,
			canvas.height - shop.height * (((shop.width / 6) * 4) / shop.height) - 5,
			(shop.width / 6) * 4,
			shop.height * (((shop.width / 6) * 4) / shop.height)
		);
		if (frameElapsed % frameHold === 0) {
			if (shopFrame < 5) {
				shopFrame++;
			} else {
				shopFrame = 0;
			}
		}
		player.update();
		player.attack(enemy);
		enemy.update();
		enemy.attack(player);
		lastTime = timeStamp;
	}
	if (timeStamp - lastTime3 > 50) {
		lastTime3 = timeStamp;
	}
	window.requestAnimationFrame(animate);
}

animate(0);

window.addEventListener("keydown", keyDown);

function keyDown(e) {
	if (e.keyCode !== 32 && e.keyCode !== 13) keys[e.keyCode] = true;
}

window.addEventListener("keyup", keyUp);

function keyUp(e) {
	delete keys[e.keyCode];
	if (e.keyCode === 81) {
		if (gameOver.classList.contains("active")) {
			gameOver.classList.remove("active");
			restart();
		}
	}
	if (e.keyCode === 32 || e.keyCode === 13) {
		if (e.keyCode === 13) {
			enemy.isAttack = true;
		}
		if (e.keyCode === 32) {
			player.isAttack = true;
		}
	}
}

function restart() {
	keys = [];
	window.removeEventListener("keyup", keyUp);
	window.addEventListener("keydown", keyDown);
	window.addEventListener("keyup", keyUp);
	player = new Sprite({
		position: {
			x: canvas.width / 4 - 50,
			y: canvas.height - 200,
		},
		velocity: {
			x: 10,
			y: 30,
		},
		color: "blue",
		name: "samuraiMack",
	});

	enemy = new Sprite({
		position: {
			x: (canvas.width * 3) / 4 - 50,
			y: canvas.height - 200,
		},
		velocity: {
			x: 10,
			y: 30,
		},
		color: "red",
		name: "kenji",
	});

	enemy.update = () => {
		if (
			!keys[38] &&
			!keys[39] &&
			!keys[37] &&
			!keys[13] &&
			enemy.jump == "endJump" &&
			!enemy.isAttack &&
			enemy.lastState != "Death"
		) {
			enemy.draw();
		} else if (enemy.lastState == "Death") {
			enemy.draw("Death");
		}
		var x = enemy.velocity.x;
		var y = enemy.velocity.y;
		if (keys[38] && !enemy.isAttack) {
			if (enemy.jump == "endJump") {
				enemy.jump = "startJump";
			}
		}
		if (enemy.jump == "startJump") {
			y = enemy.velocity.y < 0 ? enemy.velocity.y : -enemy.velocity.y;
			enemy.position.y += y;
			enemy.draw("Jump");
		}
		if (enemy.position.y + enemy.height + gravity > canvas.height) {
			y = 0;
		} else if (enemy.position.y + y <= 400 && enemy.jump == "startJump") {
			y = 0;
			enemy.jump = "onJump";
		} else if (enemy.jump == "onJump") {
			if (enemy.position.y + enemy.height + gravity + y >= canvas.height)
				enemy.jump = "endJump";
			enemy.draw("Fall");
		}
		enemy.position.y += gravity;
		if (enemy.position.y + enemy.height >= canvas.height)
			enemy.position.y = canvas.height - enemy.height;
		if (keys[39] && !enemy.isAttack) {
			x = Math.abs(enemy.velocity.x);
			enemy.direction = "right";
			if (enemy.jump == "endJump") {
				enemy.draw("Run");
			}
		} else if (keys[37] && !enemy.isAttack) {
			x = -enemy.velocity.x;
			enemy.direction = "left";
			if (enemy.jump == "endJump") {
				enemy.draw("Run");
			}
		}
		if (
			(!keys[39] && !keys[37]) ||
			enemy.position.x + x < 0 ||
			enemy.position.x + x + enemy.width > canvas.width
		) {
			x = 0;
		}
		if (!enemy.isAttack) enemy.position.x += x;
	};
	timer.innerText = "100";
	playerHP.style.width = "100%";
	enemyHP.style.width = "100%";
}

function gameOverF(title) {
	window.removeEventListener("keydown", keyDown);
	window.removeEventListener("keyup", keyUp);
	window.addEventListener("keyup", (e) => {
		if (e.keyCode === 81) {
			if (gameOver.classList.contains("active")) {
				gameOver.classList.remove("active");
				restart();
			}
		}
	});
	gameOver.innerText = title;
	gameOver.classList.add("active");
}
