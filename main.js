window.onload = function() {
    /* =========================Globals======================= */

    window.stage = [];
    window.totalSprites = 0;
    var gameContainer = document.getElementById('game'),
        raf = 0,
        /* Information to be debugged is shown here */
        debug = [],
        /* The next variables are used to avoid garbage collection */
        control = {},
        sprite = {},
        acc = 0,
        vx = 0,
        vy = 0,
        x = 0,
        y = 0,
        speed = 0,
        collisionPadding = 0,
        /* Game related info such as the score, players, etc. */
        score = {
            "p1": 0,
            "p2": 0,
            "winScore": 10,
            "p1_color": "",
            "p2_color": "",
            "counter": {},
            "p1_counter": need.element('div', {
                "class": 'score-card'
            }),
            "p2_counter": need.element('div', {
                "class": 'score-card'
            }),
            "reset": function() {
                this.p1 = 0;
                this.p2 = 0;
                this.p1_counter.innerHTML = (this.p1 + '').length === 1 ? '0' + (this.p1) : this.p1;
                this.p2_counter.innerHTML = (this.p2 + '').length === 1 ? '0' + (this.p2) : this.p2;
                ball.resetRandomVelocitySpeeds();
            },
            "renderP1": function() {
                this.p1_counter.innerHTML = (this.p1 + '').length === 1 ? '0' + (this.p1) : this.p1;
                !firstRun ? snd.score.play() : '';
                if (this.p1 == this.winScore) {
                    showWinMessage("Player 1 Wins!!");
                    this.reset();
                }
            },
            "renderP2": function() {
                this.p2_counter.innerHTML = (this.p2 + '').length === 1 ? '0' + (this.p2) : this.p2;
                !firstRun ? snd.score.play() : '';
                if (this.p2 == this.winScore) {
                    showWinMessage("Player 2 Wins!!");
                    this.reset();
                }
            }
        },
        winMessage = document.getElementById('win-message'),
        winner = document.getElementById('winner'),
        scoreChanged = false,
        p1 = {},
        p2 = {},
        isPaused = false,
        baseCountDown = 3,
        countDown = baseCountDown,
        countDownDiv = document.getElementById('count-down'),
        pauseContainer = document.getElementById('pause-container'),
        pauseMenu = document.getElementById('pause-menu'),
        firstRun = true,
        /* Game images */
        images = {},
        /* Audio */
        snd = {},
        sfx = {},
        music = {},
        /* Game dimension stuffs */
        width = 0,
        height = 0,
        real = {
            "width": round(window.innerHeight + (window.innerHeight * 0.5)),
            "height": round(window.innerHeight)
        },
        /* This is the display canvas */
        _canvas = {},
        _context = {},
        /* This is the offscreen canvas */
        canvas = {},
        context = {},
        /* This is the background canvas, it is drawn on once and never touched again */
        bgCanvas = {},
        bgContext = {},
        /* Frame related data */
        now,
        dt = 0,
        last = window.performance.now(),
        step = 1 / 60,
        /* Keyboard input codes */
        KEY = {
            "BACKSPACE": 8,
            "TAB": 9,
            "RETURN": 13,
            "ESC": 27,
            "SPACE": 32,
            "PAGEUP": 33,
            "PAGEDOWN": 34,
            "END": 35,
            "HOME": 36,
            "LEFT": 37,
            "UP": 38,
            "RIGHT": 39,
            "DOWN": 40,
            "INSERT": 45,
            "DELETE": 46,
            "ZERO": 48,
            "ONE": 49,
            "TWO": 50,
            "THREE": 51,
            "FOUR": 52,
            "FIVE": 53,
            "SIX": 54,
            "SEVEN": 55,
            "EIGHT": 56,
            "NINE": 57,
            "A": 65,
            "B": 66,
            "C": 67,
            "D": 68,
            "E": 69,
            "F": 70,
            "G": 71,
            "H": 72,
            "I": 73,
            "J": 74,
            "K": 75,
            "L": 76,
            "M": 77,
            "N": 78,
            "O": 79,
            "P": 80,
            "Q": 81,
            "R": 82,
            "S": 83,
            "T": 84,
            "U": 85,
            "V": 86,
            "W": 87,
            "X": 88,
            "Y": 89,
            "Z": 90,
            "TILDA": 192
        },
        /* Adds fps meter */
        fpsmeter = new FPSMeter({
            decimals: 0,
            graph: true,
            theme: 'transparent',
            heat: 1,
            left: '90%'
        });

    /* ======================endGlobals======================= */

    /* ======================Functions=================== */
    function getKey(code) {
        return KEY[code.toUpperCase()];
    }

    function getCanvasHalves() {
        return {
            "width": width * 0.5,
            "height": height * 0.5
        };
    }

    function loadImages(names, callback) {
        var n, name,
            count = names.length || 0,
            onload = function() { if (--count == 0) callback(images); };

        if (count) {
            for (n = 0; n < names.length; n++) {
                name = names[n];
                images[name] = document.createElement('img');
                images[name].addEventListener('load', onload);
                images[name].src = "images/" + name + ".png";
            }
        } else {
            callback(images);
        }
    }

    function loadSounds(names, srcs, callback) {
        var n, name, src
        count = names.length || 0,
            canplay = function() { if (--count == 0) callback(snd); };

        if (count) {
            for (n = 0; n < names.length; n++) {
                name = names[n];
                src = srcs[n];
                snd[name] = document.createElement('audio');
                snd[name].addEventListener('canplay', canplay, false);
                snd[name].src = src;
            }
        } else {
            callback(snd);
        }
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} _width 
     * @param {number} _height 
     */
    function addSprite(x, y, _width, _height, color) {
        // debugger
        var obj = {
            color: color,
            "pos": need.point(x, y),
            "velocity": need.point(),
            "original_velocity": need.point(),
            "accelleration": 10,
            "speed": 0,
            "baseSpeed": 0,

            "collisionPadding": width * 0.07,
            "nearPaddleZoneRight": function() {
                return this.pos.x > width - this.collisionPadding;
            },
            "nearPaddleZoneLeft": function() {
                return this.pos.x < this.collisionPadding;
            },

            "original_pos": need.point(x, y),
            "original_dimensions": {
                "width": round(_width),
                "height": round(_height)
            },

            "width": round(_width),
            "height": round(_height),

            "id": 0,
            "stateChanged": false,

            "isInputEnabled": false,
            "inputChanged": false,
            "toggleInput": function() {
                this.isInputEnabled = !this.isInputEnabled;
            },
            "input": {
                "add": function(control, code) {
                    this.controls[control] = {
                        "code": code,
                        "pressed": false,
                        "keyUp": function() {
                            this.pressed = false;
                            obj.inputChanged = true;
                        },
                        "keyDown": function() {
                            this.pressed = true;
                            obj.inputChanged = true;
                        }
                    };
                },
                "pressed": function(control) {
                    return this.controls[control].pressed;
                },
                "controls": {}
            },
            "_canvas": need.canvas({
                "width": round(_width),
                "height": round(_height)
            }),
            "scale": {
                "x": x / real.width,
                "y": y / real.height,
                "width": _width / real.width,
                "height": _height / real.height
            },
            "resize": function() {
                var w = real.width,
                    h = real.height,
                    x = this.original_pos.x,
                    y = this.original_pos.y;

                this.pos.x = this.scale.x * width;
                this.pos.y = this.scale.y * height;

                this.width = this.scale.width * width;
                this.height = this.scale.height * height;

                this.collisionPadding = width * 0.1;

                need.createGraphic(this, this.width, this.height, 'white');
            },
            "draw": function() {
                drawSprite(context, this);
            },
            "update": function(dt) {},
            "setVelocity": function(x, y, isBase) {
                // isBase = typeof isBase === "undefined" ? (isBase = true) : isBase;
                this.velocity = need.point(x, y);
                /* isBase ? ( */
                this.original_velocity = need.point(x, y) /* ) : '' */ ;
            },
            "reset": function(/* callback */) {
                this.pos.x = this.original_pos.x;
                this.pos.y = this.original_pos.y;
                this.velocity.x = this.original_velocity.x;
                this.velocity.y = this.original_velocity.y;
                this.speed = this.baseSpeed;
                // callback ? callback(this) : '';
            },
            "set_original_velocity": function() {
                //
            },
            "preUpdate": function() {
                // if (this.stateChanged) {
                context.clearRect(this.pos.x - 1, this.pos.y - 1, this.width + 1, this.height + 1);
                // this.stateChanged = false;
                // }
            },
            "postUpdate": function() {
                // context.strokeStyle = "yellow";
                context.strokeRect(this.pos.x, this.pos.y, this.width, this.height);
            }
        };
        obj._ctx = obj._canvas.getContext('2d');
        need.createGraphic(obj, _width, _height, obj.color || 'white');
        var index = stage.push(obj) - 1;
        stage[index].id = index;
        totalSprites = ++index;
        return stage[--index];
    }

    /* Setup the game loop function */

    function frame() {
        fpsmeter.tickStart();

        /*  Now the true stuff begins */
        now = window.performance.now();
        dt = dt + Math.min(1, (now - last) / 1000);
        // if (!isPaused) {
        while (dt > step) {
            dt = dt - step;
            update(step);
        }
        render();
        // }
        last = now;
        raf = requestAnimationFrame(frame);
        fpsmeter.tick();
    }

    function drawSprite(context, sprite) {
        context.drawImage(sprite._canvas, sprite.pos.x, sprite.pos.y, sprite._canvas.width, sprite._canvas.height);
    }

    function draw(context, canvas, _x, _y, _width, _height) {
        context.drawImage(canvas, _x || 0, _y || 0, _width || context.canvas.width, _height || context.canvas.height, _x || 0, _y || 0, _width || context.canvas.width, _height || context.canvas.height);
    }

    function clear(context) {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    }

    function update(dt) {
        if (!isPaused) {
            // for (var i = 0; i < totalSprites; i++) {
            //     // debugger
            //     stage[i].preUpdate(dt);
            // }
            for (i = 0; i < totalSprites; i++) {
                // debugger
                sprite = stage[i];
                context.clearRect(sprite.pos.x - 1, sprite.pos.y - 1, sprite.width + 1, sprite.height + 1);
                sprite.update(dt);
            }
        }
    }

    function render() {
        clear(_context);
        // clear(context);
        for (var i = 0; i < totalSprites; i++) {
            sprite = stage[i];
            sprite.draw();
            draw(_context, canvas, sprite.pos.x - 1, sprite.pos.y - 1, sprite.width + 1, sprite.height + 1);
        }
        // for (i = 0; i < totalSprites; i++) {
        // debugger
        // stage[i].postUpdate(dt);
        // }

        /* Draw offscreen canvas onto on screen display canvas */
        // draw(_context, canvas);
    }

    function resize() {
        /* TODO: Change the code for the sprites' resize function so that it 'find' the new position of the sprite in the now scaled canvas */
        var w = window.innerWidth,
            h = window.innerHeight;
        width = Math.round(window.innerHeight + (window.innerHeight * 0.5));
        height = Math.round(window.innerHeight);

        // console.log("running resize");

        /* Landscape orientation */
        if (w > h) {
            gameContainer.style.width = width + 'px';
            gameContainer.style.height = height + 'px';

            _canvas.width = width;
            _canvas.height = height;
            canvas.width = width;
            canvas.height = height;
            bgCanvas.width = width;
            bgCanvas.height = height;
            // console.log("resizing");
            for (var i = 0; i < totalSprites; i++) {
                stage[i].resize();
            }
            drawMidLine();
        }
        /* Portrait orientation */
        else if (h > w) {
            /* gameContainer.style.width = width + 'px';
            gameContainer.style.height = gameContainer.style.width;

            _canvas.width = width;
            _canvas.height = _canvas.width; */

            // Put a warning that the game should be in portrait
        }
    }

    function round(num) {
        return Math.round(num);
    }

    function drawMidLine() {
        /* Add a line on the background */
        var lineWidth = getPaddleInfo().width * 0.7,
            lineHeight = height * 0.07,
            lineX = getCanvasHalves().width - (lineWidth * 0.5),
            scoreCardWidth = 100,
            scoreCardHeight = 81,
            score_counter = {
                "width": (scoreCardWidth * 2) + lineWidth,
                "height": scoreCardHeight
            };

        need.pixelate(bgContext);
        // bgContext.fillStyle = "rgba(255,255,255,0.17)";
        bgContext.fillStyle = "white";

        for (var i = 0; i < 10; i++) {
            bgContext.fillRect(lineX, (i / 10) * height, lineWidth, lineHeight);
        }

        if (firstRun) {
            /* Now we create the score counter and place it in it's place */
            score.counter = need.element('div', {
                "id": "score",
                "style": 'width:' + score_counter.width + 'px;' + 'height:' + score_counter.height + 'px;' + "left:" + round((width * 0.5) - (score_counter.width * 0.5)) + 'px;' + "font-size:" + (scoreCardWidth * 0.5) + 'px;'
            });

            // score.p1_counter.innerHTML = "0";
            // score.p2_counter.innerHTML = "0";

            var p1_counter = need.element('div', {
                    "id": "p1",
                    "style": 'width:' + scoreCardWidth + 'px;' + 'height:' + scoreCardHeight + 'px;'
                }),
                p2_counter = need.element('div', {
                    "id": "p2",
                    "style": 'width:' + scoreCardWidth + 'px;' + 'height:' + scoreCardHeight + 'px;'
                });

            p1_counter.appendChild(score.p1_counter);
            p2_counter.appendChild(score.p2_counter);
            score.counter.appendChild(p1_counter);
            score.counter.appendChild(p2_counter);
            gameContainer.appendChild(score.counter);

            score.renderP1();
            score.renderP2();
            firstRun = false;
            gameContainer.appendChild(bgCanvas);
        }

    }

    function getPaddleInfo() {
        return {
            "width": width * 0.025,
            "height": height * 0.142
        };
    }

    function getBallInfo() {
        return {
            "width": width * 0.017,
            "height": width * 0.017
        };
    }

    function preventArrowDefault() {
        document.addEventListener('keydown', function(_eve) {
            /* Remove the scrolling caused by arrow keys */
            if (_eve.keyCode === KEY['UP'] || _eve.keyCode === KEY['DOWN'] || _eve.keyCode === KEY['LEFT'] || _eve.keyCode === KEY['RIGHT']) {
                _eve.preventDefault();
            }
        }, false);
    }

    function onKey(_eve, code, pressed) {
        // console.log(code);
        /* Start by looping through the gameObjects on the stage */
        for (var i = 0; i < totalSprites; i++) {
            if (stage[i].isInputEnabled) {
                /* Now we go through the setup controls for the player */
                for (var k in stage[i].input.controls) {
                    control = stage[i].input.controls[k];
                    if (code === control.code) {
                        pressed ? control.keyDown() : control.keyUp();
                        break;
                    }
                }
            }
        }
    }

    function collisionCheck(obj1, obj2) {
        if (obj1.pos.x < obj2.pos.x + obj2.width &&
            obj1.pos.x + obj1.width > obj2.pos.x &&
            obj1.pos.y < obj2.pos.y + obj2.height &&
            obj1.height + obj1.pos.y > obj2.pos.y) {
            return true;
        } else {
            return false;
        }
    }

    function accellerate(speedVar, accVar, dt) {
        speedVar += accVar/*  * dt */;
        console.log(speedVar);
    }

    function resetGame(callback) {
        // clear(_context);
        // clear(context);
        for (var i = 0; i < totalSprites; i++) {
            stage[i].reset();
        }
        // clear(context);
        callback ? callback() : '';
    }

    function start() {
        /*  Start the game */
        isPaused = false;
        raf = requestAnimationFrame(frame);
    }

    function stop() {
        /*  Stop the game */
        pause();
        cancelAnimationFrame(raf);
    }

    function showPauseMenu() {
        pause();
        /* Show the pause menu */
        pauseContainer.hidden ? (pauseContainer.hidden = false) : '';
        pauseMenu.hidden ? (pauseMenu.hidden = false) : '';
    }

    function pause() {
        isPaused = true;
    }

    function resume() {
        /* Hide pause menu */
        !pauseMenu.hidden ? (pauseMenu.hidden = true) : '';
        /* Hide Winner message */
        !winMessage.hidden ? (winMessage.hidden = true) : '';

        /* Show the countdown board */
        if (countDown && isPaused) {
            /* Show the transparent bleack bg for the pause menu container */
            pauseContainer.hidden ? (pauseContainer.hidden = false) : '';

            /* Show the counter */
            countDownDiv.hidden ? (countDownDiv.hidden = false) : '';
            countDownDiv.innerText = countDown + '';
            countDown--;
            setTimeout(function() {
                resume();
            }, 1000);
            snd.paddle.play();
        } else {
            isPaused = false;
            countDown = baseCountDown;
            pauseContainer.hidden = true;
            countDownDiv.hidden = true;
            snd.score.play();
        }
    }

    function hasAudio() {
        var audio = document.createElement('audio');
        if (audio && audio.canPlayType) {
            var ogg = audio.canPlayType('audio/ogg; codecs="vorbis"'),
                m4a = audio.canPlayType('audio/m4a') || audio.canPlayType('audio/x-m4a');
            return {
                ogg: (ogg === 'probably') || (ogg === 'maybe'),
                m4a: (m4a === 'probably') || (m4a === 'maybe')
            };
        }
        return false;
    }

    function createAudio(src, options, canplay) {
        var audio = document.createElement('audio');
        audio.addEventListener('canplay', canplay, false);
        audio.volume = options.volume || 0.5;
        audio.loop = options.loop || false;
        audio.muted = options.muted || false;
        audio.src = src;
        return audio;
    }

    function configSfx(snd, options) {
        snd.volume = options.volume || 0.5;
        snd.loop = options.loop || false;
        snd.muted = options.muted || false;
    }

    function toggleSfxMute() {
        for (var i in snd) {
            snd[i].muted = !snd[i].muted;
        }
    }

    function showWinMessage(message) {
        pause();
        pauseContainer.hidden ? (pauseContainer.hidden = false) : '';
        winner.innerText = message;
        winMessage.hidden ? (winMessage.hidden = false) : '';
        winner.hidden ? (winner.hidden = false) : '';
    }

    function init() {
        /* TODO: Change the code so that init opens the home screen and not the game */
        /* This is the display canvas */
        _canvas = need.canvas({
            "id": "display"
        });
        _context = _canvas.getContext('2d');
        /* This is the offscreen canvas */
        canvas = need.canvas();
        context = canvas.getContext('2d');
        /* This is the background canvas, it is drawn on once and never touched again */
        bgCanvas = need.canvas({
            "id": "background"
        });
        bgContext = bgCanvas.getContext('2d');

        resize();
        window.addEventListener('resize', resize);

        /* Add the canvas to the game */
        gameContainer.appendChild(_canvas);

        /* Now render the score */
        // score.renderP1();
        // score.renderP2();

        // document.body.appendChild(canvas);

        /* Remove anti-aliasing */
        need.pixelate(_context);
        need.pixelate(context);

        /* Draw the */
        drawMidLine();

        /* Create the two players/paddles and the ball */
        var half = getCanvasHalves(),
            paddle = getPaddleInfo(),
            padding = 25,
            ballDim = getBallInfo();

        window.p_1 = addSprite(0 + padding, half.height - (paddle.height * 0.5), paddle.width, paddle.height, score.p1_color);
        p_1.setVelocity(340);
        window.p_2 = addSprite(width - (paddle.width + padding), half.height - (paddle.height * 0.5), paddle.width, paddle.height, score.p2_color);
        p_2.setVelocity(340);
        window.ball = addSprite(round(half.width - (ballDim.width * 0.5)), round(half.height - (ballDim.height * 0.5)), ballDim.width, ballDim.height);
        ball.speed = 270;
        ball.baseSpeed = ball.speed;
        ball.accelleration = 1700;
        ball.stateChanged = true;
        ball.velocity = need.point(Math.round(Math.random()) ? ball.speed : -ball.speed, Math.round(Math.random()) ? ball.speed : -ball.speed);

        /* Place the updates for sprites here */
        p_1.update = function(dt) {
            vy = this.velocity.y;
            y = this.pos.y;

            if (this.input.pressed('up') && y > 0) {
                // this.velocity.y = 250;
                this.pos.y -= Math.round(vy * dt);
                this.stateChanged = true;
            } else if (this.input.pressed('down') && y < height - this.height) {
                // vy = 250;
                this.pos.y += Math.round(vy * dt);
                this.stateChanged = true;
            }
        };

        p_2.update = p_1.update;

        ball.currentRandomVelocitySpeedIndex = 0;

        ball.randomVelocity = function() {
            // this.speed = 200;
            return need.point(Math.random() > 0.5 ? this.speed : -this.speed, Math.round(Math.random()) ? this.speed : -this.speed);
        };

        ball.randomVelocitySpeeds = new Array(score.winScore * 2);
        ball.randomVelocitySpeedsLength = ball.randomVelocitySpeeds.length;

        ball.setRandomVelocitySpeeds = function() {
            for (var i = 0, len = this.randomVelocitySpeedsLength; i < len; i++) {
                this.randomVelocitySpeeds[i] = this.randomVelocity();
            }
        };

        ball.setRandomVelocitySpeeds();

        ball.applyRandomVelocitySpeeds = function() {
            // console.log(this.randomVelocitySpeeds[this.currentRandomVelocitySpeedIndex]);
            // this.velocity.x = this.randomVelocitySpeeds[this.currentRandomVelocitySpeedIndex].x;
            this.velocity = this.randomVelocitySpeeds[this.currentRandomVelocitySpeedIndex++];
        };

        ball.resetRandomVelocitySpeeds = function() {
            this.currentRandomVelocitySpeedIndex = 0;
            this.setRandomVelocitySpeeds();
        };

        ball.accellerate = function(dt) {
            acc = this.accelleration;
            this.speed += acc * dt;
            p_1.velocity.y += acc * dt;
            p_2.velocity.y += acc * dt;
            // accellerate(this.speed, acc, dt);
            // accellerate(p_2.velocity.y, acc, dt);
            // accellerate(p_1.velocity.y, acc, dt);
        };

        // ball.preUpdate = function() {
        //     context.clearRect(this.pos.x - 4, this.pos.y - 4, this.width + 4, this.height + 4);
        // };

        ball.update = function(dt) {
            vx = this.velocity.x;
            vy = this.velocity.y;
            x = this.pos.x;
            y = this.pos.y;
            speed = this.speed;
            collisionPadding = this.collisionPadding;

            /* If moving right */
            // console.log(this.velocity);
            if (vx > 0) {
                /* Collision test with right paddle */
                if (x > width - collisionPadding && collisionCheck(p_2, this)) {
                    snd.paddle.play();
                    if (speed < 2500) {
                        this.accellerate(dt);
                    } else {
                        this.speed = 2500;
                    }
                    this.velocity.x = -(this.speed);
                }
                /* Collision test with right wall */
                else if (x > width) {
                    // alert("Collision Speed: " + this.speed);
                    // debugger
                    score.p1++;
                    // console.log(score.p1, " | ", score.p2);
                    score.renderP1();
                    var _this = this;
                    resetGame(function() {
                        _this.velocity = _this.randomVelocitySpeeds[_this.currentRandomVelocitySpeedIndex++];
                    });
                }
            }
            /* If moving left */
            else if (vx < 0) {
                /* Collision test with left paddle */
                if (x < collisionPadding && collisionCheck(p_1, this)) {
                    snd.paddle.play();
                    if (speed < 2500) {
                        this.accellerate(dt);
                    } else {
                        this.speed = 2500;
                    }
                    // this.speed += this.accelleration * dt;
                    // p_2.velocity.y += this.accelleration * dt;
                    // p_1.velocity.y += this.accelleration * dt;
                    this.velocity.x = this.speed;

                }
                /* Collision test with left wall */
                else if (x < 0) {
                    // alert("Collision Speed: " + this.speed);
                    // debugger
                    score.p2++;
                    // console.log(score.p1, " | ", score.p2);
                    score.renderP2();
                    var _this = this;
                    resetGame(function() {
                        _this.velocity = _this.randomVelocitySpeeds[_this.currentRandomVelocitySpeedIndex++];
                    });
                }
            }

            /* If moving up */
            if (vy < 0) {
                /* Check with the top wall */
                if (y < 0) {
                    this.velocity.y = this.speed;
                    snd.wall.play();
                }
            }
            /* If moving down */
            else if (vy > 0) {
                /* Check with the bottom wall */
                if (y > height - this.height) {
                    this.velocity.y = -this.speed;
                    snd.wall.play();
                }
            }

            /* Update the position of the ball */
            this.pos.x += Math.round(this.velocity.x * dt);
            this.pos.y += Math.round(this.velocity.y * dt);
        };

        ball.applyRandomVelocitySpeeds();
        ball.setVelocity(ball.velocity.x, ball.velocity.y);

        /* Button event listeners */
        document.getElementById('pause').onclick = function() {
            showPauseMenu();
        };
        document.querySelectorAll('.resume').forEach(function(_ele) {
            _ele.onclick = function() {
                resume();
            };
        });
        document.getElementById('mute').onclick = function() {
            toggleSfxMute();
        };
        document.querySelectorAll('.reset').forEach(function(_ele) {
            _ele.onclick = function() {
                resetGame();
                pause();
                resume();
            };
        });

        /* Add controls here */
        /* Start by enabling the players' input handling */
        p_1.toggleInput();
        p_2.toggleInput();

        /* Now we make sure that arrows don't scroll the page */
        preventArrowDefault();

        /* Add the key maps */
        p_1.input.add('up', getKey('w'));
        p_1.input.add('down', getKey('s'));
        p_2.input.add('up', getKey('up'));
        p_2.input.add('down', getKey('down'));

        /* Add eventlisteners for key presses and releases */
        window.addEventListener('keyup', function(_eve) {
            return onKey(_eve, (_eve.keyCode) ? _eve.keyCode : _eve.charCode, false);
        }, false);
        window.addEventListener('keydown', function(_eve) {
            return onKey(_eve, (_eve.keyCode) ? _eve.keyCode : _eve.charCode, true);
        }, false);

        start();
        pause();
        resetGame();
        resume();
    }

    /* =====================endFunctions=================== */

    /* =======================Process==================== */

    /* First load all images */
    loadImages([], function() {
        var aud = hasAudio();

        if (aud) {
            /* Audio format */
            var format = aud.ogg ? '.ogg' : ".m4a";

            loadSounds(["wall", "score", "paddle"], [
                './../audio/sfx/ogg/plop' + format,
                './../audio/sfx/ogg/peeeeeep' + format,
                './../audio/sfx/ogg/beeep' + format
            ], function() {
                /* Setup the sound effects */
                var sfxVolume = 0.34;
                configSfx(snd.wall, {
                    "muted": false,
                    "volume": sfxVolume
                });
                configSfx(snd.score, {
                    "muted": false,
                    "volume": sfxVolume
                });
                configSfx(snd.paddle, {
                    "muted": false,
                    "volume": sfxVolume
                });

                /* Initialize game */
                init();
            });
        } else {
            var obj = {
                "play": function() {}
            };

            /* Make the empty sfx objects so that the game doesn't break on us when we try playing audio when it isn't supported */
            snd.wall = obj;
            snd.score = obj;
            snd.paddle = obj;

            init();
        }
    });

    /* ====================endProcess==================== */
};