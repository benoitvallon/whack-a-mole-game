'use strict';

/*
 * Game class
 */
function Game() {
  this.defaultTimerLength = 6;
  this.defaultSimultaneousMoles = 5;
  this.defaultMoleVisibleTime = 2;
  this.defaultGridRows = 4;
  this.defaultGridColumns = 6;
  this.defaultGridWidth = 800;
  this.defaultGridHeight = 300;

  this.gameRunning = false;
  this.timer = new Timer(document.getElementById('timer'), this.defaultTimerLength);
  this.grid = new Grid(document.getElementById('grid'),
      this.defaultGridRows, this.defaultGridColumns,
      this.defaultSimultaneousMoles, this.defaultMoleVisibleTime,
      this.defaultGridWidth, this.defaultGridHeight);
  this.score = new Score(document.getElementById('score'));
  this.startButton = document.getElementById('start-game');

  this.grid.build();

  this.grid.element.addEventListener('click', this.clickOnCell.bind(this));
  this.startButton.addEventListener('click', this.start.bind(this));
}
Game.prototype.resetStartButton = function() {
  this.startButton.innerHTML = 'Start the game!';
};
Game.prototype.start = function() {
  if(!this.gameRunning) {
    this.startButton.innerHTML = 'Reset the game!';
    this.gameRunning = true;
    this.score.reset();
    this.grid.startMoles();

    // launch timer with a callback to be executed at the end of the timer
    var that = this;
    this.timer.start(function() {
      that.gameRunning = false;
      that.grid.stopMoles();
      that.resetStartButton();
    });
  } else {
    // case where the game was running, we need to cancel some actions
    this.gameRunning = false;
    this.grid.stopMoles();
    this.timer.stop();
    this.score.reset();
    this.resetStartButton();
  }
};
Game.prototype.clickOnCell = function(event) {
  var mole = this.grid.moles.indexOf(event.target);
  if(~mole) {
    event.target.style.backgroundColor = 'rgba(0, 0, 0, 0)';
    this.grid.moles.splice(mole, 1);
    this.score.increment();
  }
};

/*
 * Grid class
 */
function Grid(element, rows, columns, defaultSimultaneousMoles, defaultMoleVisibleTime, defaultGridWidth, defaultGridHeight) {
  this.defaultSimultaneousMoles = defaultSimultaneousMoles;
  this.defaultMoleVisibleTime = defaultMoleVisibleTime;
  this.defaultGridWidth = defaultGridWidth;
  this.defaultGridHeight = defaultGridHeight;
  this.element = element;
  this.rows = rows;
  this.columns = columns;
  this.moles = [];
}
Grid.prototype.build = function() {
  var table = document.createElement('table');
  for (var row = 0; row < this.rows; row++) {
    var tr = table.appendChild(document.createElement('tr'));
    for (var column = 0; column < this.columns; column++) {
      var cell = tr.appendChild(document.createElement('td'));
      cell.style.width = this.defaultGridWidth / this.columns + 'px';
      cell.style.height = this.defaultGridHeight / this.rows + 'px';
      cell.setAttribute('data-row', row);
      cell.setAttribute('data-column', column);
    }
  }
  this.element.appendChild(table);
};
Grid.prototype.startMoles = function() {
  var that = this;
  this.generateMoles();
  this.molesTimer = setInterval(function() {
    that.cleanMoles();
    that.generateMoles();
  }, that.defaultMoleVisibleTime * 1000);
};
Grid.prototype.generateMoles = function() {
  while(this.moles.length < this.defaultSimultaneousMoles) {
    this.generateMole();
  }
};
Grid.prototype.generateMole = function() {
  var randomRow = Math.floor(Math.random() * this.rows).toString();
  var randomColumn = Math.floor(Math.random() * this.columns).toString();

  var rows = this.element.getElementsByTagName('tr');
  for(var row = 0; row < rows.length; row++) {
    var columns = rows[row].children;
    for(var column = 0; column < columns.length; column++) {
      var element = columns[column];
      if(element.dataset.row === randomRow && element.dataset.column === randomColumn) {
        if(!~this.moles.indexOf(element)) {
          element.style.backgroundColor = 'red';
          this.moles.push(element);
        }
      }
    }
  }
};
Grid.prototype.cleanMoles = function() {
  for(var i = 0; i < this.moles.length; i++) {
    this.moles[i].style.backgroundColor = 'rgba(0, 0, 0, 0)';
  }
  this.moles = [];
};
Grid.prototype.stopMoles = function() {
  window.clearInterval(this.molesTimer);
  this.cleanMoles();
};

/*
 * Score class
 */
function Score(element) {
  this.score = 0;
  this.element = element;
}
Score.prototype.display = function() {
  this.element.innerHTML = this.score;
};
Score.prototype.reset = function() {
  this.score = 0;
  this.element.innerHTML = '0';
};
Score.prototype.increment = function() {
  this.score++;
  this.display();
};

/*
 * Timer class
 */
function Timer(element, defaultTimerLength) {
  this.element = element;
  this.defaultTimerLength = defaultTimerLength;
  this.display();
}
Timer.prototype.display = function(display) {
  if(display !== undefined) {
    this.element.innerHTML = display.toFixed(3);
  } else {
    this.element.innerHTML = this.defaultTimerLength.toFixed(3);
  }
};
Timer.prototype.start = function(callback) {
  var startDate = new Date();
  var that = this;

  this.timerId = setInterval(function() {
    var endDate = startDate.getTime() + that.defaultTimerLength * 1000;
    var diff = endDate - new Date();
    if(diff > 0) {
      that.display(diff / 1000);
    } else {
      window.clearInterval(that.timerId);
      that.display(0);
      callback();
    }
  }, 66);
};
Timer.prototype.stop = function() {
  window.clearInterval(this.timerId);
  this.display();
};

window.onload = function() {
  var game = new Game();
};
