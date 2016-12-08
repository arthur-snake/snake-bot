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
	"UP",
	"DOWN",
	"RIGHT",
	"LEFT"
]

const nick = program.nick || ("Bot #" + random.integer(1, 100000));

let pos, id;

snake.on("init", () => {
	pos = undefined;
	id = undefined;
});

snake.on("cell.update", () => {

});

snake.on("map.update", () => {
	snake.go(go[random.integer(0, 3)]);
});


snake.on("ws.open", () => {
	snake.join(nick);
});
snake.connectTo(server);
