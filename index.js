#!/usr/bin/env node

const Snake = require("arthur-snake");

const program = require("commander");

program
	.version("1.0.0")
	.option("-s, --server", "Snake server")
	.option("-n, --nick", "Snake nick")
	.parse(process.argv);

const random = require("random-js")();

const server = program.server || "ws://wrt.qjex.xyz:8080/snake/ws/faster";

const snake = new Snake();

const go = [
	{x: 0, y: -1, msg: "UP"},
	{x: 0, y: 1, msg: "DOWN"},
	{x: 1, y: 0, msg: "RIGHT"},
	{x: -1, y: 0, msg: "LEFT"}
]

const nick = program.nick || ("Bot #" + random.integer(1, 100000));

let pos, id;

let rows, columns;

snake.on("init", () => {
	pos = undefined;
	id = undefined;
	rows = snake.map.rows;
	columns = snake.map.columns;
});

snake.on("cell.update", (x, y, ev) => {
	if (typeof ev.info === "undefined") return;
	const info = ev.info;
	if (typeof id === "undefined" && info.nick == nick) {
		id = info.id;
	}
	if (typeof info.id !== "undefined" && info.id == id) {
		pos = {x: x, y: y};
	}
});

snake.on("map.update", () => {
	if (typeof pos === "undefined") return;
	let bfs = [];
	for (let i = 0; i < rows; i++) {
		bfs[i] = [];
		for (let j = 0; j < columns; j++) bfs[i][j] = {visited: false};
	}
	let un = 0;
	let uk = 1;
	let q = [];
	q[0] = {x: pos.x, y: pos.y};
	bfs[pos.y][pos.x].visited = true;
	bfs[pos.y][pos.x].start = true;
	let tx, ty;
	let find = false;

	const gg = [0, 1, 2, 3];
	random.shuffle(gg);
	//console.log(gg);

	while (un < uk) {
		const el = q[un++];
		let x = el.x;
		let y = el.y;
		const m = snake.map.map[y][x].info;
		if (typeof m !== "undefined") {
			if (m.type == "food") {
				find = true;
				tx = x;
				ty = y;
				break;
			}
		}
		for (let i = 0; i < go.length; i++) {
			const ggg = go[gg[i]];
			let fx = x + ggg.x;
			let fy = y + ggg.y;

			if (fx < 0) fx += columns;
			if (fy < 0) fy += rows;
			if (fx >= columns) fx -= columns;
			if (fy >= rows) fy -= rows;

			const toMap = snake.map.map[fy][fx].info;
			if (toMap.type != "free" && toMap.type != "food" || bfs[fy][fx].visited) continue;
			q[uk++] = {x: fx, y: fy, from: ggg};
			bfs[fy][fx].visited = true;
			bfs[fy][fx].from = ggg;
		}
	}
	if (!find) {
		if (uk >= 2) {
			//console.log(q[1]);
			snake.go(q[1].from.msg);
		}
		return;
	}
	while (true) {
		const cur = bfs[ty][tx];
		if (typeof cur.from === "undefined") break;
		let nx = tx - cur.from.x;
		let ny = ty - cur.from.y;

		if (nx < 0) nx += columns;
		if (ny < 0) ny += rows;
		if (nx >= columns) nx -= columns;
		if (ny >= rows) ny -= rows;

		if (bfs[ny][nx].start) {
			//console.log(cur);
			snake.go(cur.from.msg);
			return;
		}
		tx = nx;
		ty = ny;
	}
});


snake.on("ws.open", () => {
	snake.join(nick);
});
snake.connectTo(server);
