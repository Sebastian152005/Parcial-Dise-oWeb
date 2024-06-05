// Inicializacion del juego
(function (window) {
    let Game = {
        lastUpdateTime: Date.now(), // Variable para almacenar la última vez que se actualizó el juego
        frameDuration: 1000 / 60, // Duración de cada frame (en milisegundos), para 30 FPS

        init: function () {
            this.c = document.getElementById("game")
            this.c.width = this.c.width
            this.c.height = this.c.height
            this.ctx = this.c.getContext("2d")
            this.color = "rgba(20,20,20,.7)"
            this.bullets = []
            this.enemyBullets = []
            this.enemies = []
            this.particles = []
            this.bulletIndex = 0
            this.enemyBulletIndex = 0
            this.enemyIndex = 0
            this.particleIndex = 0
            this.maxParticles = 10
            this.maxEnemies = 6
            this.enemiesAlive = 0
            this.currentFrame = 0
            this.maxLives = 5
            this.life = 0
            this.binding()
            this.player = new Player()
            this.score = 0
            this.paused = false
            this.shooting = false
            this.oneShot = false
            this.isGameOver = false
            this.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame
            for (let i = 0; i < this.maxEnemies; i++) {
                new Enemy()
                this.enemiesAlive++
            }

            this.video = document.createElement("video")
            this.video.id = "gameVideo"
            this.video.width = this.c.width
            this.video.height = this.c.height
            this.video.style.position = "absolute"
            this.video.style.top = "60%"
            this.video.style.left = "50%"
            this.video.style.transform = "translate(-50%, -50%)"
            this.video.style.zIndex = "-1"
            this.video.loop = true
            this.video.src = "video/espacio.mp4"

            this.video.addEventListener('loadeddata', () => {
                this.video.play()
                this.audio.play()
                this.loop()
            })

            document.body.appendChild(this.video)

            this.audio = new Audio('sounds/fondo.mp3')
            this.audio.loop = true
            this.audio.volume = 0.3
        },

        // Funciones del evento  (Pulsaciones de tecla, Click)
        binding: function () {
            window.addEventListener("keydown", this.buttonDown)
            window.addEventListener("keyup", this.buttonUp)
            window.addEventListener("keypress", this.keyPressed)
            this.c.addEventListener("click", this.clicked)
        },

        clicked: function () {
            if (!Game.paused) {
                Game.pause()
                Game.audio.pause()  
            } else {
                if (Game.isGameOver) {
                    Game.init()
                    Game.audio.play()  
                } else {
                    Game.unPause()
                    Game.loop()
                    Game.invincibleMode(1000)
                    Game.audio.play()  
                }
            }
        },

        keyPressed: function (e) {
            if (e.keyCode === 32) {
                if (!Game.player.invincible && !Game.oneShot) {
                    Game.player.shoot()
                    Game.oneShot = true
                }
                if (Game.isGameOver) {
                    Game.init()
                }
                e.preventDefault()
            }
        },

        buttonUp: function (e) {
            if (e.keyCode === 32) {
                Game.shooting = false
                Game.oneShot = false
                e.preventDefault()
            }
            if (e.keyCode === 37 || e.keyCode === 65) {
                Game.player.movingLeft = false
            }
            if (e.keyCode === 39 || e.keyCode === 68) {
                Game.player.movingRight = false
            }
        },

        buttonDown: function (e) {
            if (e.keyCode === 32) {
                Game.shooting = true
            }
            if (e.keyCode === 37 || e.keyCode === 65) {
                Game.player.movingLeft = true
            }
            if (e.keyCode === 39 || e.keyCode === 68) {
                Game.player.movingRight = true
            }
        },

        random: function (min, max) {
            return Math.floor(Math.random() * (max - min) + min)
        },

        invincibleMode: function (s) {
            this.player.invincible = true
            setTimeout(function () {
                Game.player.invincible = false
            }, s)
        },

        collision: function (a, b) {
            return !(
                ((a.y + a.height) < (b.y)) ||
                (a.y > (b.y + b.height)) ||
                ((a.x + a.width) < b.x) ||
                (a.x > (b.x + b.width))
            )
        },

        clear: function () {
            this.ctx.fillStyle = Game.color
            this.ctx.fillRect(0, 0, this.c.width, this.c.height)
        },

        pause: function () {
            this.paused = true
        },

        unPause: function () {
            this.paused = false
        },

        drawVideo: function () {
            if (this.video.paused) {
                this.video.play()
                this.audio.play()
            }
            this.ctx.drawImage(this.video, 0, 0, this.c.width, this.c.height)
        },

        gameOver: function () {
            this.isGameOver = true
            this.clear()
            let message = "Fin del juego"
            let message2 = "Puntaje: " + Game.score
            let message3 = "Haga clic o presione la barra espaciadora para volver a jugar"
            this.pause()
            this.audio.pause()  
            this.ctx.fillStyle = "white"
            this.ctx.font = "bold 30px Lato, sans-serif"
            this.ctx.fillText(message, this.c.width / 2 - this.ctx.measureText(message).width / 2, this.c.height / 2 - 50)
            this.ctx.fillText(message2, this.c.width / 2 - this.ctx.measureText(message2).width / 2, this.c.height / 2 - 5)
            this.ctx.font = "bold 16px Lato, sans-serif"
            this.ctx.fillText(message3, this.c.width / 2 - this.ctx.measureText(message3).width / 2, this.c.height / 2 + 30)
        },

        updateScore: function () {
            this.ctx.fillStyle = "#05FAFF"
            this.ctx.font = "18px Lato, sans-serif"
            this.ctx.fillText("Puntaje: " + this.score, 8, 20)
            this.ctx.fillText("Vidas: " + (this.maxLives - this.life), 8, 40)
        },

        // Función principal del bucle del juego
        loop: function () {
            let now = Date.now()
            let elapsed = now - Game.lastUpdateTime

            if (elapsed > Game.frameDuration) {
                Game.lastUpdateTime = now - (elapsed % Game.frameDuration)

                if (!Game.paused) {
                    Game.clear()
                    
                    Game.drawVideo()

                    for (let i in Game.enemies) {
                        let currentEnemy = Game.enemies[i]
                        currentEnemy.draw()
                        currentEnemy.update()
                        if (Game.currentFrame % currentEnemy.shootingSpeed === 0) {
                            currentEnemy.shoot()
                        }
                    }
                    for (let x in Game.enemyBullets) {
                        Game.enemyBullets[x].draw()
                        Game.enemyBullets[x].update()
                    }
                    for (let z in Game.bullets) {
                        Game.bullets[z].draw()
                        Game.bullets[z].update()
                    }
                    if (Game.player.invincible) {
                        if (Game.currentFrame % 20 === 0) {
                            Game.player.draw()
                        }
                    } else {
                        Game.player.draw()
                    }

                    for (let i in Game.particles) {
                        Game.particles[i].draw()
                    }
                    Game.player.update()
                    Game.updateScore()
                    Game.currentFrame++
                }
            }

            Game.requestAnimationFrame.call(window, Game.loop)
        }
    }

    // Funcion de la clase Jugador
    let Player = function () {
        this.width = 70
        this.height = 70
        this.x = Game.c.width / 2 - this.width / 2
        this.y = Game.c.height - this.height
        this.movingLeft = false
        this.movingRight = false
        this.speed = 8
        this.invincible = false
        this.image = new Image()
        this.image.src = 'image/nave.png'
    }

    Player.prototype.die = function () {
        if (Game.life < Game.maxLives) {
            Game.invincibleMode(2000)
            Game.life++
        } else {
            Game.pause()
            Game.gameOver()
        }
    }

    Player.prototype.draw = function () {
        Game.ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
    }

    Player.prototype.update = function () {
        if (this.movingLeft && this.x > 0) {
            this.x -= this.speed
        }
        if (this.movingRight && this.x + this.width < Game.c.width) {
            this.x += this.speed
        }
        if (Game.shooting && Game.currentFrame % 10 === 0) {
            this.shoot()
        }
        for (let i in Game.enemyBullets) {
            let currentBullet = Game.enemyBullets[i]
            if (Game.collision(currentBullet, this) && !Game.player.invincible) {
                this.die()
                delete Game.enemyBullets[i]
            }
        }
    }

    Player.prototype.shoot = function () {
        Game.bullets[Game.bulletIndex] = new Bullet(this.x + this.width / 2)
        Game.bulletIndex++
    }

    // Funcion de la clase Bala
    let Bullet = function (x) {
        this.width = 8 
        this.height = 20 
        this.x = x
        this.y = Game.c.height - 10
        this.vy = 9                    
        this.index = Game.bulletIndex
        this.active = true
        this.color = "orange" 
    }

    Bullet.prototype.draw = function () {
        
        Game.ctx.shadowBlur = 10
        Game.ctx.shadowColor = "orange"

        
        Game.ctx.fillStyle = this.color
        Game.ctx.beginPath()
        Game.ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2)
        Game.ctx.fill()

        
        Game.ctx.shadowBlur = 0
        Game.ctx.shadowColor = "transparent"
    }

    Bullet.prototype.update = function () {
        this.y -= this.vy
        if (this.y < 0) {
            delete Game.bullets[this.index]
        }
    }

    // Funcion de la clase Enemigo
    let Enemy = function () {
        this.width = 100
        this.height = 60
        this.x = Game.random(0, (Game.c.width - this.width))
        this.y = Game.random(10, 40)
        this.vy = Game.random(1, 3) * .1
        this.index = Game.enemyIndex
        Game.enemies[Game.enemyIndex] = this
        Game.enemyIndex++
        this.speed = Game.random(2, 3)
        this.shootingSpeed = Game.random(100, 150)
        this.movingLeft = Math.random() < 0.5 ? true : false
        this.image = new Image()
        this.image.src = 'image/ovni2.png'
    }

    Enemy.prototype.draw = function () {
        Game.ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
    }

    Enemy.prototype.update = function () {
        if (this.movingLeft) {
            if (this.x > 0) {
                this.x -= this.speed
                this.y += this.vy
            } else {
                this.movingLeft = false
            }
        } else {
            if (this.x + this.width < Game.c.width) {
                this.x += this.speed
                this.y += this.vy
            } else {
                this.movingLeft = true
            }
        }

        for (let i in Game.bullets) {
            let currentBullet = Game.bullets[i]
            if (Game.collision(currentBullet, this)) {
                this.die()
                delete Game.bullets[i]
            }
        }
    }

    Enemy.prototype.die = function () {
        this.explode()
        delete Game.enemies[this.index]
        Game.score += 15
        Game.enemiesAlive = Game.enemiesAlive > 1 ? Game.enemiesAlive - 1 : 0
        if (Game.enemiesAlive < Game.maxEnemies) {
            Game.enemiesAlive++
            setTimeout(function () {
                new Enemy()
            }, 2000)
        }
    }

    Enemy.prototype.explode = function () {
        for (let i = 0; i < Game.maxParticles; i++) {
            new Particle(this.x + this.width / 2, this.y, this.color)
        }
    }

    Enemy.prototype.shoot = function () {
        new EnemyBullet(this.x + this.width / 2, this.y + this.height, this.color)
    }

    // Funcion de la clase Bala Enemiga
    let EnemyBullet = function (x, y, color) {
        this.width = 5
        this.height = 20
        this.x = x
        this.y = y
        this.vy = 3
        this.color = "lime"  
        this.index = Game.enemyBulletIndex
        Game.enemyBullets[Game.enemyBulletIndex] = this
        Game.enemyBulletIndex++
    }
    
    EnemyBullet.prototype.draw = function () {
        
        Game.ctx.fillStyle = this.color
    
        Game.ctx.shadowColor = 'rgba(0, 255, 0, 0.8)'
        Game.ctx.shadowBlur = 10
        Game.ctx.shadowOffsetX = 0
        Game.ctx.shadowOffsetY = 0
    
        
        const cornerRadius = 3  
        Game.ctx.beginPath()
        Game.ctx.moveTo(this.x + cornerRadius, this.y)
        Game.ctx.arcTo(this.x + this.width, this.y, this.x + this.width, this.y + this.height, cornerRadius)
        Game.ctx.arcTo(this.x + this.width, this.y + this.height, this.x, this.y + this.height, cornerRadius)
        Game.ctx.arcTo(this.x, this.y + this.height, this.x, this.y, cornerRadius)
        Game.ctx.arcTo(this.x, this.y, this.x + this.width, this.y, cornerRadius)
        Game.ctx.closePath()
    
        Game.ctx.fill()

        Game.ctx.shadowColor = 'rgba(0, 0, 0, 0)'
        Game.ctx.shadowBlur = 0
        Game.ctx.shadowOffsetX = 0
        Game.ctx.shadowOffsetY = 0
    }
    
    EnemyBullet.prototype.update = function () {
        this.y += this.vy
        if (this.y > Game.c.height) {
            delete Game.enemyBullets[this.index]
        }
    }

    // Definicion de la clase Particula
    let Particle = function (x, y, color) {
        this.x = x
        this.y = y
        this.vx = Game.random(-5, 5)
        this.vy = Game.random(-5, 5)
        this.color = color
        this.image = new Image()
        this.image.src = 'image/explosion.png' 
        Game.particles[Game.particleIndex] = this
        this.id = Game.particleIndex
        Game.particleIndex++
        this.life = 0
        this.gravity = .05
        this.size = 40
        this.maxlife = 100
    }

    Particle.prototype.draw = function () {
        this.x += this.vx
        this.y += this.vy
        this.vy += this.gravity
        this.size *= .89
        Game.ctx.drawImage(this.image, this.x, this.y, this.size, this.size)
        this.life++
        if (this.life >= this.maxlife) {
            delete Game.particles[this.id]
        }
    }

    Game.init()

}(window))