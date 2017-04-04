var readlineSync = require('readline-sync');

var Game = require('./game.js');
var ComputerPlayer = require('./player/computer-player.js');
var TerminalPlayer = require('./player/terminal-player.js');
var ConsoleGameInterface = require('./game-interface/console-game-interface.js');

var name = readlineSync.question('Please enter your name: ')
var game = new Game(new ConsoleGameInterface(), new TerminalPlayer(name), new ComputerPlayer());

game.start();
