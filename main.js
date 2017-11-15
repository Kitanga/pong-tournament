window.onload = function() {
    /* =========================Globals======================= */

    // window.stage = [];
    // window.totalSprites = 0;
    var gameContainer = document.getElementById('game'),
        stage = [],
        totalSprites = 0,
        raf = 0,
        readyCount = 0,
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
            "winScore": 1,
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
                    // showWinMessage("Player 1 Wins!!");
                    this.reset();
                    finishMatch(true);
                }
            },
            "renderP2": function() {
                this.p2_counter.innerHTML = (this.p2 + '').length === 1 ? '0' + (this.p2) : this.p2;
                !firstRun ? snd.score.play() : '';
                if (this.p2 == this.winScore) {
                    // showWinMessage("Player 2 Wins!!");
                    this.reset();
                    finishMatch();
                }
            },
            "hide": function() {
                this.p1_counter.hidden = true;
                this.p2_counter.hidden = true;
            },
            "show": function() {
                this.p1_counter.hidden = false;
                this.p2_counter.hidden = false;
            }
        },
        winMessage = document.getElementById('win-message'),
        winner = document.getElementById('winner'),
        scoreChanged = false,
        p1 = {},
        p2 = {},
        isPaused = false,
        matchHasStarted = false,
        baseCountDown = 3,
        countDown = baseCountDown,
        countDownDiv = document.getElementById('count-down'),
        pauseContainer = document.getElementById('pause-container'),
        pauseMenu = document.getElementById('pause-menu'),
        firstRun = true,
        /* Game images */
        images = {},
        /* Audio */
        snd = {
            "stop": function() {
                for (var i in this) {
                    // console.log(this[i]);
                    if (this[i].pause) {
                        this[i].pause();
                        this[i].currentTime = 0;
                    }
                }
            }
        },
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
        }
        /* ,
                fpsmeter = new FPSMeter({
                    decimals: 0,
                    graph: true,
                    theme: 'transparent',
                    heat: 1,
                    left: '90%'
                }) */
    ;

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
            "reset": function( /* callback */ ) {
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
        // fpsmeter.tickStart();

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
        // fpsmeter.tick();
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
        var w = window.innerWidth,
            h = window.innerHeight;
        // width = Math.round(window.innerHeight + (window.innerHeight * 0.5));
        width = window.width * 0.52;
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
            if (matchHasStarted) {
                drawMidLine();
            }
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
                "style": 'width:' + score_counter.width + 'px;' + 'height:' + score_counter.height + 'px;' + "left:" + round((width * 0.5) + 14) + 'px;' + "font-size:" + (scoreCardWidth * 0.5) + 'px;'
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
            // gameContainer.appendChild(bgCanvas);
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
        if (matchHasStarted) {
            if (getKey("p") === code) {
                showPauseMenu();
            }
        }

        if (getKey("m") === code && _eve.type == "keyup") {
            toggleSfxMute();
        }

        if (getKey("return") == code && _eve.type == "keyup") {
            if (!playersList.hidden) {
                if (contenders.length > 7) {
                    prepTournament();
                    drawTable(t_context);
                    shuffleContenders();
                    startTournamentBracket();
                    snd.stop();
                    snd.tournament.play();
                }
            }
            /* Otherwise if we are on the tournament bracket view */
            else if (!t_canvas.hidden) {
                hideTournamentComponents();
                showPlayerReadyScene();
            }
            /* If we are on the readying screen */
            else if (!readying.hidden) {
                hidePlayerReadyScene();
                playMatch();
            }
            /* And if we are on the winner screen */
            else if (!champion.hidden) {
                hideChampionPage();
                snd.stop();
                snd.title.play();
                showPlayersList();
            }
        }
        // console.log(_eve);

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
        speedVar += accVar /*  * dt */ ;
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

    /* Tournament Code */
    var pinLength = 0,
        contenders = [],
        shuffledContenders = [],
        tournament = [
            new Array(1),
            new Array(2),
            new Array(4),
            new Array(8)
        ],
        matches = [],
        players = JSON.parse(localStorage.getItem('players')) || {},
        playerIDs = 0,
        playerImages = {},
        currentMatch = {},
        t_canvas = need.canvas({
            "id": "tournament-stuff" /* , */
                // "width": width,
                // "height": height
        }),
        t_context = t_canvas.getContext('2d');

    // window.t = tournament;

    function prepTournament() {
        for (var i = 0, len = tournament.length; i < len; i++) {
            var id = 0;
            // if (tournament[i].hasOwnProperty('length')) {
            for (var k = 0, len2 = tournament[i].length; k < len2; k++) {
                if (i === len - 1) {
                    /* The first stage (aka quarter-finals) */
                    tournament[i][k] = pin({
                        "drawDownLane": false,
                        "p_id": players[contenders[k]].id,
                        "drawFace": true,
                        "drawName": players[contenders[k]].name
                    });
                } else if (i) {
                    /* The normal stages */
                    tournament[i][k] = pin({
                        "active": false,
                        "isMatch": true,
                        "drawFace": false
                    });
                } else {
                    /* The winner */
                    tournament[i][k] = pin({
                        "drawSideLane": false,
                        "active": false,
                        "isMatch": true,
                        "drawFace": false
                    });
                }
            }
        }

        /* Fill up the matches array */
        for (var i = 0, len = tournament.length; i < len; i++) {
            for (var k = 0, len2 = tournament[i].length; k < len2; k++) {
                if (tournament[i][k].isMatch) {
                    matches[matches.length] = tournament[i][k];
                    matches[matches.length - 1].prevPins = [];
                    // console.log("PrevPin[0]:", k * 2);
                    // console.log("PrevPin[1]:", (k * 2) + 1);
                    // console.log("");
                    matches[matches.length - 1].prevPins[0] = tournament[i + 1] ? tournament[i + 1][k * 2] : "";
                    matches[matches.length - 1].prevPins[1] = tournament[i + 1] ? tournament[i + 1][(k * 2) + 1] : "";
                }
            }
        }
        // matches.reverse();

        /* Manually reversing the array for backward compatibility */
        (function() {
            var count = matches.length,
                array = [];

            // console.log("Matches Before Reverse:", matches.concat());
            for (var i = 0; i < count; i++) {
                array.push(matches.pop());
            }

            matches = array.concat();
            // console.log("Matches:", matches.concat());
            // console.log("Array:", matches.concat());
        })();

        // console.log(matches);
        // console.log(tournament);

        // tournament[3][0].isWinner = true;
        // tournament[3][0].active = true;

        // tournament[3][1].active = false;
        // tournament[3][1].hasPlayed = true;

        // tournament[2][0].turnOnDownLane = true;
        // tournament[2][0].active = true;
    }

    function processStage(context, stage, sX, sY) {
        var i = 0,
            length = stage.length,
            distance = (context.canvas.width / length),
            halfWidth = (distance / 2),
            halfHeight = ((context.canvas.height * 0.25) * 0.5),
            lightColor = '#7fa5dd',
            darkColor = '#082f67';

        context.fillStyle = lightColor;
        context.strokeStyle = lightColor;

        for (; i < length; i++) {
            var x = sX + (distance * i) + halfWidth,
                y = sY + halfHeight;

            /* Draw down lane */
            if (stage[i].drawDownLane) {
                if (!stage[i].turnOnDownLane) {
                    context.strokeStyle = darkColor;
                } else {
                    context.strokeStyle = lightColor;
                }
                context.beginPath();
                context.moveTo(x, y);
                context.lineTo(x, y + halfHeight);
                context.stroke();
                context.closePath();
            }

            /* Draw side lane */
            if (stage[i].drawSideLane) {
                if (!stage[i].isWinner) {
                    context.strokeStyle = darkColor;
                } else {
                    context.strokeStyle = lightColor;
                }
                context.beginPath();
                if (i % 2) {
                    /* Odd, draw to the left */
                    context.moveTo(x, y);
                    context.lineTo(x, y - halfHeight);
                    context.moveTo(x, y - halfHeight);
                    context.lineTo(x - halfWidth, y - halfHeight);
                } else {
                    /* Even, draw to the right */
                    context.moveTo(x, y);
                    context.lineTo(x, y - halfHeight);
                    context.moveTo(x, y - halfHeight);
                    context.lineTo(x + halfWidth, y - halfHeight);
                }
                context.stroke();
                context.closePath();
            }

            /* Pick color for pin depending on whether the player has played, won, or lost */
            if (stage[i].active) {

                /* Used to test user colors */
                // var color = colors[stage[i].p_id];
                // console.log(colors);
                // console.log(color);
                // console.log(stage[i].p_id);
                // context.fillStyle = color;

                context.fillStyle = lightColor;
            } else {
                context.fillStyle = darkColor;
            }

            /* Draw box */
            context.fillRect(x - (pinLength / 2), y - (pinLength / 2), pinLength, pinLength);

            /* We are drawing the pin of a knocked out p_ */
            if (!stage[i].isWinner && stage[i].hasPlayed) {
                stage[i].p_id !== '' ? context.drawImage(playerImages[stage[i].p_id].greyscale, x - Math.round(pinLength * 0.5), y - Math.round(pinLength * 0.5)) : '';
                context.strokeStyle = darkColor;
                context.lineWidth = 2;
                context.strokeRect(x - (pinLength / 2), y - (pinLength / 2), pinLength, pinLength);
                context.lineWidth = 4;
                context.strokeStyle = 'rgba(255, 0, 0, 0.43)';

                // context.beginPath();
                // context.moveTo(x - Math.round(pinLength * 0.5) + 7, y - Math.round(pinLength * 0.5) + 7);
                // context.lineTo(x + Math.round(pinLength * 0.5) - 7, y + Math.round(pinLength * 0.5) - 7);

                // context.moveTo(x + Math.round(pinLength * 0.5) - 7, y - Math.round(pinLength * 0.5) + 7);
                // context.lineTo(x - Math.round(pinLength * 0.5) + 7, y + Math.round(pinLength * 0.5) - 7);

                // // context.moveTo(x, y);
                // // context.lineTo(x, y);

                // context.stroke();
                // context.closePath();

                // document.body.appendChild(playerImages[stage[i].p_id].greyscale);
            } else {
                context.lineWidth = 2;
                stage[i].p_id !== '' ? context.drawImage(playerImages[stage[i].p_id].normal, x - Math.round(pinLength * 0.5), y - Math.round(pinLength * 0.5)) : '';
                // console.log(playerImages[stage[i].p_id])
                context.strokeStyle = lightColor;
                context.strokeRect(x - (pinLength / 2), y - (pinLength / 2), pinLength, pinLength);
            }

            /* Drawing of names */
            if (stage[i].drawName) {
                context.strokeStyle = lightColor;
                context.font = 'oblique small-caps 100 14px sans-serif';
                context.strokeText(stage[i].drawName.slice(0, 7), x - (pinLength / 2), y + (halfHeight * 0.5) + (context.lineWidth * 2));
            }

            /* Do this so that the other line draws are not affected */
            context.lineWidth = 1;
        }

    }

    function playMatch() {
        currentMatch = matches.shift();

        currentMatch.active = true;
        currentMatch.turnOnDownLane = true;

        currentMatch.prevPins[0].drawFace = true;
        currentMatch.prevPins[1].drawFace = true;

        hideTournamentComponents();
        startMatch();
    }

    function startMatch() {
        matchHasStarted = true;
        hideTournamentComponents();
        snd.stop();
        if (matches.length) {
            snd.preFinal.play();
        } else {
            snd.final.play();
        }
        gameContainer.style.width = Math.round(window.innerHeight + (window.innerHeight * 0.5)) + 'px';
        gameContainer.style.height = Math.round(window.innerHeight) + 'px';
        _canvas.style.width = gameContainer.style.width;
        _canvas.style.height = gameContainer.style.height;
        canvas.style.width = gameContainer.style.width;
        canvas.style.height = gameContainer.style.height;
        bgCanvas.style.width = gameContainer.style.width;
        bgCanvas.style.height = gameContainer.style.height;
        showGame();
        drawMidLine();
        start();
        pause();
        resetGame();
        resume();
    }

    function finishMatch(player1winner) {
        stop();
        hideGame();
        gameContainer.style.width = "52%";
        if (player1winner) {
            currentMatch.p_id = currentMatch.prevPins[0].p_id;

            /* The winner */
            currentMatch.prevPins[0].isWinner = true;
            currentMatch.prevPins[0].active = true;
            currentMatch.prevPins[0].hasPlayed = true;

            /* The loser */
            currentMatch.prevPins[1].active = false;
            currentMatch.prevPins[1].hasPlayed = true;
        } else {
            currentMatch.p_id = currentMatch.prevPins[1].p_id;

            /* The winner */
            currentMatch.prevPins[1].isWinner = true;
            currentMatch.prevPins[1].active = true;
            currentMatch.prevPins[1].hasPlayed = true;

            /* The loser */
            currentMatch.prevPins[0].active = false;
            currentMatch.prevPins[0].hasPlayed = true;
        }
        drawTable(t_context);
        if (matches.length) {
            snd.stop();
            snd.tournament.play();
            showTournamentBracket();
        } else {
            hideTournamentComponents();
            addFirst8();
            // showPlayersList();
            winnerName.innerText = players[currentMatch.p_id].name.toUpperCase();
            showChampionPage();
        }
    }

    function hideTournamentComponents() {
        t_canvas.hidden = true;
        playersList.hidden = true;
    }

    function hideTournamentBracket() {
        t_canvas.hidden = true;
    }

    function showTournamentBracket() {
        t_canvas.hidden = false;
    }

    function showPlayersList() {
        playersList.hidden = false;
    }

    function hiddenPlayersList() {
        playersList.hidden = true;
    }

    function showChampionPage() {
        champion.hidden = false;
    }

    function hiddenChampionPage() {
        champion.hidden = true;
    }

    function showGame() {
        _canvas.hidden = false;
        bgCanvas.hidden = false;
        score.show();
        // canvas.width = gameContainer.clientWidth;
        // canvas.height = gameContainer.clientHeight;
        // console.log(canvas.width, canvas.height);
    }

    function hideGame() {
        _canvas.hidden = true;
        bgCanvas.hidden = true;
        score.hide();
    }

    function drawTable(context) {
        clear(context);
        for (var i = 0, len = tournament.length; i < len; i++) {
            processStage(context, tournament[i], 0, context.canvas.height * (0.25 * i));
        }
    }

    function updatePlayerPool() {
        localStorage.setItem("players", JSON.stringify(players));
    }


    function processPlayerInfo() {
        // if (player[0]) {
        function getCanvasImage(index, type, /* playerCanvas, */ dataURL, x, y, _width, _height) {
            var canvas = need.canvas(),
                context = canvas.getContext('2d'),
                img = new Image();

            canvas.width = _width;
            canvas.height = _height;

            var canvas2 = need.canvas({
                    "width": pinLength,
                    "height": pinLength
                }),
                context2 = canvas2.getContext('2d');
            img.onload = function() {
                img.width = pinLength;
                img.height = pinLength;
                context.drawImage(img, x, y, _width, _height, 0, 0, pinLength, pinLength);

                context2.drawImage(canvas, 0, 0, _width, _height /*  */ );
                canvas2.style.border = "1px solid white";
                // canvas = canvas2;
                // playerImages[index][type] = canvas2;
                // document.body.appendChild(playerCanvas);
            };
            img.src = dataURL;
            // canvas.width = pinLength;
            // canvas.height = pinLength;
            return canvas2;
        }

        var count = 0;
        availablePlayers.innerHTML = "<h3>Available Players</h3>";
        for (var i in players) {
            if (players[i]) {
                playerImages[i] = {
                    "normal": need.canvas(),
                    "greyscale": need.canvas()
                };

                // playerImages[i].normal.src = players[i].normal;
                // playerImages[i].greyscale.src = players[i].greyscale;

                playerImages[i].normal = getCanvasImage(i, 'normal', players[i].images.normal.string, 0, 0, players[i].images.normal.pinLength, players[i].images.normal.pinLength);
                playerImages[i].greyscale = getCanvasImage(i, 'normal', players[i].images.greyscale.string, 0, 0, players[i].images.greyscale.pinLength, players[i].images.greyscale.pinLength);

                // console.log(playerImages[i])
                // document.body.appendChild(playerImages[i].greyscale);

                /* Add the player's info into the available players list */
                var playerDiv = need.element("p", {
                    "class": "playerCard"
                });

                playerDiv.innerText = count + 1 + ". Name: " + players[i].name + " | ID: " + players[i].id;
                availablePlayers.appendChild(playerDiv);
                count++;
            }
        }
        playerIDs = count;
        // }
    }

    function shuffleContenders() {
        // for (var i = 0, len = contenders.length, total = 8; i < total; i++) {
        //     contenders[i] = i;
        // }

        for (var i = 0, len = contenders.length; i < len; i++) {
            var item = contenders.splice(need.math.randomInt(0, contenders.length - 1), 1)[0];
            // item = item[0];
            shuffledContenders[i] = item;
        }
        contenders = shuffledContenders.concat();
        // console.log(contenders);
        // console.log(shuffledContenders);
    }

    function renderContenderList() {
        // if (contenders.length) {
        contendersList.innerHTML = "<h3>Contenders (<span id=contenderCount>0</span>/8)</h3>";
        for (var i = 0, len = contenders.length; i < len; i++) {
            var contender = need.element('p'),
                player = players[contenders[[i]]];

            contenderCount.innerText - 0 < 8 ? (contenderCount.innerText = (contenderCount.innerText - 0) + 1) : '';
            contender.innerText = i + 1 + ". Name: " + player.name + " | ID: " + player.id;
            i < 8 ? (contender.style.color = "#7fa5dd") : (contender.style.color = "red");
            contendersList.appendChild(contender);
        }
        // } else {
        // contendersList.innerHTML = "<h3>Contenders (<span id=contenderCount>0</span>/8)</h3>";
        // }
    }

    function removeContenderFromList() {
        var id = prompt("Player to be removed as contender");
        id ? (id -= 0) : (id = '');
        for (var i = 0, len = contenders.length; i < len; i++) {
            if (contenders[i] === id) {
                // console.log(contenders);
                contenders.splice(i, 1);
                // console.log(contenders);
                contenderCount.innerText - 0 !== 0 ? (contenderCount.innerText = (contenderCount.innerText - 0) - 1) : '';
                renderContenderList();
            }
        }
    }

    function addContenderToList() {
        var id = prompt("Player to be added as contender"),
            failed = false;
        id ? (id -= 0) : (id = '');
        for (var i = 0, len = contenders.length; i < len; i++) {
            if (contenders[i] === id) {
                failed = true;
            }
        }
        if (players[id] && !failed) {
            contenders.push(id);
            // contendersList.innerHTML = "<h3>Contenders (<span id=contenderCount>0</span>/8)</h3>";
            contenderCount.innerText - 0 < 8 ? (contenderCount.innerText = (contenderCount.innerText - 0) + 1) : '';
            renderContenderList();
        } else {
            if (!players[id]) {
                alert("You put an ID that doesn't exist.");
            } else {
                alert("The player's already a contender.");
            }
        }
    }

    function player(options) {
        var obj = {
            "id": 0,
            "name": '',
            "images": {
                "normal": {
                    "string": '',
                    "pinLength": 0
                },
                "grayscale": {
                    "string": '',
                    "pinLength": 0
                }
            }
        };

        if (options) {
            for (var i in options) {
                obj[i] = options[i];
            }
        }

        return obj;
    }

    function pin(options) {
        var obj = {
            "isWinner": false,
            "p_id": '',
            "turnOnDownLane": false,
            "turnOnSideLane": false,
            "active": true,
            "drawDownLane": true,
            "drawSideLane": true,
            "hasPlayed": false,
            "drawFace": false,
            // "nextPin": {},
            "prevPins": []
        };

        if (options) {
            for (var i in options) {
                obj[i] = options[i];
            }
        }

        return obj;
    }

    function startTournamentBracket() {
        hideTournamentComponents();
        showTournamentBracket();
    }

    function showPlayerReadyScene() {
        readying.hidden = false;
    }

    function hidePlayerReadyScene() {
        readying.hidden = true;
    }

    function checkPlayerReadiness() {
        readyCount++;
        if (readyCount > 1) {
            readyCount = 0;
            playMatch();
        }
    }

    function createPlayer() {
        var name = prompt("New player's name"),
            normalDataUrl = '',
            greyscaleDataUrl = '',
            canvas = need.canvas({
                "width": pinLength,
                "height": pinLength
            }),
            context = canvas.getContext('2d'),
            constraints = { video: true, audio: false };

        preview.hidden = false;
        showPlayersList();

        takePhoto.onclick = function() {
            context.drawImage(picPreview, 0, 0, pinLength, pinLength);
            // document.body.appendChild(canvas);
            normalDataUrl = canvas.toDataURL();
            greyscaleDataUrl = (function() {
                var imageData = context.getImageData(0, 0, canvas.width, canvas.height);

                var data = imageData.data;

                for (var i = 0; i < data.length; i += 4) {
                    var brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
                    // red
                    data[i] = brightness;
                    // green
                    data[i + 1] = brightness;
                    // blue
                    data[i + 2] = brightness;
                    // alpha
                    data[i + 3] = 255 * 0.25;
                }

                imageData.data = data;
                context.putImageData(imageData, 0, 0);
                return canvas.toDataURL();
            })();

            players[playerIDs++] = player({
                id: playerIDs - 1,
                name: name,
                images: {
                    normal: {
                        "string": normalDataUrl,
                        "pinLength": pinLength
                    },
                    greyscale: {
                        "string": greyscaleDataUrl,
                        "pinLength": pinLength
                    }
                }
            });

            updatePlayerPool();
            processPlayerInfo();
            preview.hidden = true;
            showPlayersList();
        };

        var promisifiedOldGUM = function(constraints) {

            // First get ahold of getUserMedia, if present
            var getUserMedia = (navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia);

            // Some browsers just don't implement it - return a rejected promise with an error
            // to keep a consistent interface
            if (!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
            }

            // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
            return new Promise(function(resolve, reject) {
                getUserMedia.call(navigator, constraints, resolve, reject);
            });

        }

        // Older browsers might not implement mediaDevices at all, so we set an empty object first
        if (navigator.mediaDevices === undefined) {
            navigator.mediaDevices = {};
        }

        // Some browsers partially implement mediaDevices. We can't just assign an object
        // with getUserMedia as it would overwrite existing properties.
        // Here, we will just add the getUserMedia property if it's missing.
        if (navigator.mediaDevices.getUserMedia === undefined) {
            navigator.mediaDevices.getUserMedia = promisifiedOldGUM;
        }

        navigator.mediaDevices.getUserMedia(constraints)
            .then(function(stream) {
                picPreview.src = window.URL.createObjectURL(stream);
                picPreview.play();
                canvas.width = picPreview.clientWidth;
                canvas.height = picPreview.clientHeight;
            })
            .catch(function(err) {
                console.log(err.name + ": " + err.message);
            });
        // The Polyfill above was extracted from https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    }

    function addFirst8() {
        if (shuffledContenders.length) {
            contenders = shuffledContenders.concat();
            renderContenderList();
        }
        /* Otherwise if we haven't filled the shiffeldContenders array we add the first 8 players */
        else if (playerIDs) {
            for (var i = 0, length = playerIDs > 8 ? 8 : playerIDs; i < length; i++) {
                contenders[i] = players[i].id;
            }
            renderContenderList();
        }
    }

    function init2() {
        gameContainer.appendChild(t_canvas);
        t_canvas.width = t_canvas.clientWidth;
        t_canvas.height = t_canvas.clientHeight;
        /* Now we set the starting x, y, width, heights of the tournament tree pins */
        pinLength = Math.round(gameContainer.clientWidth / 8) - ((gameContainer.clientWidth / 8) * 0.34);
        t_canvas.hidden = true;
        playersList.hidden = false;

        processPlayerInfo();

        /* Used for testing */
        addFirst8();

        addContenderBtn.onclick = function() {
            addContenderToList();
        };

        removeContenderBtn.onclick = function() {
            removeContenderFromList();
        };

        createPlayerBtn.onclick = function() {
            createPlayer();
        };

        startTournamentBtn.onclick = function() {
            if (contenders.length > 7) {
                prepTournament();
                drawTable(t_context);
                shuffleContenders();
                startTournamentBracket();
            }
        };
    }

    function setDimensions() {
        width = gameContainer.clientWidth;
        height = gameContainer.clientHeight;
    }


    function init() {
        /* This is the display canvas */
        _canvas = need.canvas({
            "id": "display",
            "hidden": true,
            "width": gameContainer.clientWidth + "px",
            "height": gameContainer.clientHeight + "px"
        });
        _context = _canvas.getContext('2d');
        /* Add the canvas to the game */
        gameContainer.appendChild(_canvas);
        /* This is the offscreen canvas */
        canvas = need.canvas({
            "width": gameContainer.clientWidth + "px",
            "height": gameContainer.clientHeight + "px"
        });
        // console.log(canvas.width, canvas.height)
        context = canvas.getContext('2d');
        /* This is the background canvas, it is drawn on once and never touched again */
        bgCanvas = need.canvas({
            "id": "background",
            "hidden": true,
            "width": gameContainer.clientWidth + "px",
            "height": gameContainer.clientHeight + "px"
        });
        bgContext = bgCanvas.getContext('2d');

        gameContainer.appendChild(bgCanvas);

        /* For now remove resize */
        // resize();
        setDimensions();
        window.addEventListener('resize', setDimensions);



        /* Now render the score */
        // score.renderP1();
        // score.renderP2();

        // document.body.appendChild(canvas);

        /* Remove anti-aliasing */
        need.pixelate(_context);
        need.pixelate(context);


        /* Create the two players/paddles and the ball */
        var half = getCanvasHalves(),
            paddle = getPaddleInfo(),
            padding = 25,
            p_velocity = 520,
            ballDim = getBallInfo();

        window.p_1 = addSprite(0 + padding, half.height - (paddle.height * 0.5), paddle.width, paddle.height, score.p1_color);
        p_1.setVelocity(p_velocity);
        window.p_2 = addSprite(width - (paddle.width + padding), half.height - (paddle.height * 0.5), paddle.width, paddle.height, score.p2_color);
        p_2.setVelocity(p_velocity);
        window.ball = addSprite(round(half.width - (ballDim.width * 0.5)), round(half.height - (ballDim.height * 0.5)), ballDim.width, ballDim.height);
        ball.speed = 250;
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

            if (y < 0) {
                this.pos.y = 0;
            } else if (y > height - this.height) {
                this.pos.y = height - this.height;
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
                    if (speed < 1700) {
                        this.accellerate(dt);
                    } else {
                        this.speed = 1700;
                    }
                    speed = this.speed;
                    this.velocity.x = -(speed);
                    this.velocity.y = speed * need.math.randomInt(-1.7, 1.7);
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
                    if (speed < 1700) {
                        this.accellerate(dt);
                    } else {
                        this.speed = 1700;
                    }
                    speed = this.speed;
                    this.velocity.x = speed;
                    this.velocity.y = speed * need.math.randomInt(-1.7, 1.7);

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
                    this.pos.y = 0;
                    this.velocity.y = (speed);
                    snd.wall.play();
                }
            }
            /* If moving down */
            else if (vy > 0) {
                /* Check with the bottom wall */
                if (y > height - this.height) {
                    this.pos.y = height - this.height;
                    this.velocity.y = -(speed);
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
        // document.getElementById('pause').onclick = function() {
        //     showPauseMenu();
        // };
        document.querySelectorAll('.resume').forEach(function(_ele) {
            _ele.onclick = function() {
                resume();
            };
        });
        // document.getElementById('mute').onclick = function() {
        //     toggleSfxMute();
        // };
        document.querySelectorAll('.reset').forEach(function(_ele) {
            _ele.onclick = function() {
                resetGame();
                pause();
                resume();
            };
        });

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

        /* Tournament Initialization */
        gameContainer.appendChild(t_canvas);
        t_canvas.width = t_canvas.clientWidth;
        t_canvas.height = t_canvas.clientHeight;
        /* Now we set the starting x, y, width, heights of the tournament tree pins */
        pinLength = Math.round(gameContainer.clientWidth / 8) - ((gameContainer.clientWidth / 8) * 0.34);
        t_canvas.hidden = true;
        playersList.hidden = false;

        processPlayerInfo();

        /* Used for testing */
        addFirst8();

        addContenderBtn.onclick = function() {
            addContenderToList();
        };

        removeContenderBtn.onclick = function() {
            removeContenderFromList();
        };

        createPlayerBtn.onclick = function() {
            createPlayer();
        };

        startTournamentBtn.onclick = function() {
            if (contenders.length > 7) {
                prepTournament();
                drawTable(t_context);
                shuffleContenders();
                startTournamentBracket();
                snd.stop();
                snd.tournament.play();
            }
        };

        // t_canvas.onclick = function() {
        //     hideTournamentComponents();
        //     showPlayerReadyScene();
        // };

        // ready.onclick = function() {
        //     // debugger;
        //     hidePlayerReadyScene();
        //     playMatch();
        // };


        /* Play Main Title Music */
        snd.stop();
        snd.title.play();

        /* For testing, mute audio */
        // toggleSfxMute();

        /* This starts the game */
        /* Draw the */
        // drawMidLine();
        // start();
        // pause();
        // resetGame();
        // resume();
    }

    /* =====================endFunctions=================== */

    /* =======================Process==================== */

    /* First load all images */
    loadImages([], function() {
        var aud = hasAudio(),
            hasSound = false;

        /* Audio format */
        var format = aud.ogg ? 'ogg' : "m4a";

        var names = ["wall", "score", "paddle", "title", "final", "tournament", "preFinal"],
            links = []
            /*
                        links = [
                            './../audio/sfx/' + format + '/plop' + '.' + format,
                            './../audio/sfx/' + format + '/peeeeeep' + '.' + format,
                            './../audio/sfx/' + format + '/beeep' + '.' + format,
                            './../audio/music/' + format + '/title' + '.' + format,
                            './../audio/music/' + format + '/final' + '.' + format,
                            './../audio/music/' + format + '/tournament_view' + '.' + format,
                            './../audio/music/' + format + '/preFinalMatches' + '.' + format
                        ] */
        ;

        if (aud && hasSound) {

            loadSounds(names, links, function() {
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

                configSfx(snd.title, {
                    "loop": true
                });
                configSfx(snd.final, {
                    "loop": true
                });
                configSfx(snd.tournament, {
                    "loop": true
                });
                configSfx(snd.preFinal, {
                    "loop": true
                });

                /* Initialize game */
                init();
            });
        } else {
            var obj = {
                "play": function() {},
                "stop": function() {}
            };

            /* Make the empty sfx objects so that the game doesn't break on us when we try playing audio when it isn't supported */
            for (var i = 0, length = names.length; i < length; i++) {
                snd[names[i]] = obj;
            }

            init();
        }
    });

    /* ====================endProcess==================== */
};