(function() {
	var cos = Math.cos(Math.PI / 12);
	var sin = Math.sin(Math.PI / 12);

	var canvas = document.getElementById('game');
	var ctx = canvas.getContext('2d');
	var image_data;

	window.started = 0;
	canvas.onclick = function() {
		if (window.started == 0) { play_sound(0); window.started = 1; }
	};
	var restart = function () {
		if (window.started) { window.started = 2; }
	};
	document.getElementById('restart').onclick = restart;
	document.addEventListener('keypress', function(event) {
		if ((event.charCode | 32) == 114) { restart(); }
	});

	document.onmousemove = function(event) {
		mouse.x = event.pageX - canvas.offsetLeft;
		mouse.y = event.pageY - canvas.offsetTop;
		return false;
	};

	var level = 0;
	var stage = null;

	var colors = ['#FF0000', '#00FF00', '#0000FF'];
	var sparks = [null, null, null];

	var ball = {x:40, y:180, c:0, r:20};
	var save = {};
	var mouse = {x:ball.x, y:ball.y};

	var audio = document.getElementById('audiosprites');
	var end;
	audio.addEventListener(
		'timeupdate',
		function() { if (audio.currentTime > end) audio.pause(); },
		false);

	function play_sound(i) {
		audio.currentTime = 3 * i;
		end = 3 * i + 2.2;
		audio.play();
	}

	function collide(vx, vy) {
		var result = 1;
		var x = ball.x + vx;
		var y = ball.y + vy;
		var cx = x - 0.5;
		var cy = y - 0.5;
		var sx = Math.max(0, Math.floor(x - ball.r));
		var sy = Math.max(0, Math.floor(y - ball.r));
		var ex = Math.min(479, Math.floor(x + ball.r));
		var ey = Math.min(479, Math.floor(y + ball.r));
		for (var iy = sy; iy <= ey; iy++) {
			var dy = Math.max(0, Math.abs(iy - cy) - 0.5);
			for (var ix = sx; ix <= ex; ix++) {
				var dx = Math.max(0, Math.abs(ix - cx) - 0.5);
				if (dx * dx + dy * dy < ball.r * ball.r) {
					var i = 4 * (ix + 480 * iy);
					var r = 2 + image_data[i];
					var g = 2 + image_data[i+1];
					var b = 2 + image_data[i+2];
					if (((r|g|b) & 252) == 0) {
						if ([r&b,r&g,g&b][ball.c] & 2) {
							return 0;
						}
						result |= [g&b,r&b,r&g][ball.c] & 2 ? 4 : (~r^g^b) & 2;
					}
				}
			}
		}
		return result;
	}

	var warp_time;

	var painter = function(time) {
		if (window.started) {
			painter = paint_next_fadeout;
			warp_time = time;
		}
	};

	function paint_fadeout(time, dir, followup) {
		if (stage) {
			paint_stage();
			paint_ball();
			paint_sparks(time);
		}
		var w = (time - warp_time) / 8;
		ctx.fillStyle = 'black';
		for (var x = dir < 0 ? 0 : 40 - w; x < 480; x += 40) {
			ctx.fillRect(x, 0, w, 360);
		}
		if (w >= 40) {
			if (dir) {
				save.level = level += save.dir = dir;
				save.y = ball.y;
				save.c = ball.c;
			}
			else {
				level = save.level;
				ball.y = save.y;
				ball.c = save.c;
			}
			stage = document.getElementById('level' + ('0' + level).slice(-2));
			stage.style.opacity = 1;
			painter = followup;
		}
	}

	function paint_fadein(time, dir) {
		var w = 80 - (time - warp_time) / 8;
		paint_stage();
		if (w > 0) {
			ball.x = 240 - (w + 200) * dir;
			paint_ball();
			ctx.fillStyle = 'black';
			for (var x = dir < 0 ? 40 - w : 0; x < 480; x += 40) {
				ctx.fillRect(x, 0, w, 360);
			}
		}
		else {
			image_data = ctx.getImageData(0, 0, 480, 360).data;
			ball.x = 240 - 200 * dir;
			paint_ball();
			painter = paint_game;
		}
	}

	function paint_next_fadeout(time) {
		paint_fadeout(time, 1, paint_next_fadein);
	}

	function paint_next_fadein(time) {
		paint_fadein(time, 1);
	}

	function paint_prev_fadeout(time) {
		paint_fadeout(time, -1, paint_prev_fadein);
	}

	function paint_prev_fadein(time) {
		paint_fadein(time, -1);
	}

	function paint_restart_fadeout(time) {
		paint_fadeout(time, 0, paint_restart_fadein);
	}

	function paint_restart_fadein(time) {
		paint_fadein(time, save.dir);
	}

	function move_ball(time) {
		var vx = (mouse.x - ball.x) / 10;
		var vy = (mouse.y - ball.y) / 10;
		var mag2 = (vx * vx + vy * vy) / 8;
		if (mag2 > 1) {
			var mag = Math.sqrt(mag2);
			vx /= mag;
			vy /= mag;
		}
		ball.x += vx;
		ball.y += vy;
		var i = 12, vx1 = vx, vy1 = vy, vx2, vy2, c;
		while (i-- && !(c = collide(vx2 = vx, vy2 = vy))) {
			vx = vx1 * cos - vy1 * sin;
			vy = vx1 * sin + vy1 * cos;
			if (c = collide(vx1 = vx, vy1 = vy)) break;
			vx = vx2 * cos + vy2 * sin;
			vy = -vx2 * sin + vy2 * cos;
		}
		ball.x += vx;
		ball.y += vy;
		if (c == 5) {
			ball.c = (ball.c + 1) % 3;
			play_sound(ball.c + 3);
			sparks[ball.c] = {x:ball.x, y:ball.y, c:ball.c, t:time};
		}
	}

	function paint_circle(obj) {
		ctx.fillStyle = colors[obj.c];
		ctx.beginPath();
		ctx.arc(obj.x, obj.y, obj.r, 0, 2 * Math.PI);
		ctx.fill();
	}

	function paint_ball() {
		paint_circle(ball);
	}

	function paint_spark(obj, x, y) {
		ctx.beginPath();
		ctx.moveTo(obj.x + x * 0.9, obj.y + y * 0.9);
		ctx.lineTo(obj.x + x, obj.y + y);
		ctx.stroke();
	}

	function paint_sparks(time) {
		for (var c = 0; c < 3; c++) {
			var obj = sparks[c];
			if (obj) {
				var t = (time - obj.t) / 5;
				if (t > 40) {
					sparks[c] = null;
				}
				else {
					var r, x = 1, y = 0, rnd = c;
					ctx.lineCap = 'round';
					ctx.lineWidth = 6;
					ctx.strokeStyle = colors[c];
					for (var i = 0; i < 24; i++) {
						rnd = rnd * 1.13 % 1 + 1.2;
						r = 10 + t * rnd;
						paint_spark(obj, x * r, y * r);
						r = x * cos - y * sin;
						y = x * sin + y * cos;
						x = r;
					}
				}
			}
		}
	}

	function paint_stage() {
		ctx.drawImage(stage, 0, 0);
	}

	function paint_game(time) {
		move_ball(time);
		paint_stage();
		paint_ball();
		paint_sparks(time);
		if (ball.x < 10) {
			play_sound(2);
			painter = paint_prev_fadeout;
			warp_time = time;
		}
		else if (ball.x > 470) {
			play_sound(level & 1);
			painter = paint_next_fadeout;
			warp_time = time;
		}
		else if (window.started > 1) {
			window.started = 1;
			play_sound(save.dir < 0 ? 2 : ~level & 1);
			painter = paint_restart_fadeout;
			warp_time = time;
		}
	}

	// Thanks to:
	// http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/

	var time0;
	function game_loop(time) {
		requestAnimationFrame(game_loop);
		painter(time - time0);
	}
	requestAnimationFrame(function(time) {
		game_loop(time0 = time);
	});
})();
