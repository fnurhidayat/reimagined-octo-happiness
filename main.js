function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

class Game {
  winner = null;
  loser = null;
  isGameOver = false;
  isDraw = false;
  playerChoice = null;
  computerChoice = null;
  playerChoicables = [];
  computerChoicables = [];
  createdAt = new Date();
  gameOverAt = null;

  static histories = [];
  static restartButton = document.getElementById('restart');
  static vsText = document.getElementById('vs');
  static overContainer = document.getElementById('over-container');
  static overText = document.getElementById('over');
  static choiceElements = document.querySelectorAll('.choice-item');

  static showVersusText() {
    this.vsText.style.display = 'unset';
  }

  static hideVersusText() {
    this.vsText.style.display = 'none';
  }

  static showOver(state, bgClass) {
    this.overContainer.style.display = 'flex';
    this.overContainer.classList.add(bgClass);
    this.overText.innerHTML = state;
  }

  static hideOver() {
    this.overContainer.style.display = 'none';
    this.overContainer.classList.remove('bg-success');
    this.overContainer.classList.remove('bg-danger');
    this.overText.innerHTML = null;
  }

  static start = () => {
    const game = new this();

    this.showVersusText();
    this.restartButton.onclick = this.#restart(game);
    this.choiceElements.forEach(this.#setup(game));
  }

  static spinRestartButton() {
    this.restartButton.classList.add('spin');
  }

  static stopRestartButtonSpinningAnimation() {
    this.restartButton.classList.remove('spin');
  }

  static #getKlass = function(element) {
    switch(element.parentNode.dataset.choiceFor) {
      case Player.name:
        return Player;
      case Computer.name:
        return Computer;
    }
  }

  static #restart = (game) => () => {
    if (!game.isGameOver) return;
    game.onRestart();
    this.hideOver();
    this.stopRestartButtonSpinningAnimation();
    this.start();
  }

  static #setup = (game) => (element) => {
    const klass = this.#getKlass(element);
    new klass(game, element);
  }

  #onFinish() {
    this.constructor.histories.push(this);
    this.constructor.spinRestartButton();
    this.constructor.hideVersusText();
    this.constructor.showOver(this.#computeState(), this.#computeBGClass());
  }

  onPlayerPick(choice) {
    this.#blockChoicesInput();
    this.#play(choice);
  }

  onRestart() {
    this.playerChoice.reset();
    this.computerChoice.reset();
  }

  #getRandomComputerChoice() {
    return getRandomItem(this.computerChoicables);
  }

  #blockChoicesInput() {
    this.playerChoicables.forEach(i => i.block());
  }

  #play(choice) {
    this.playerChoice = choice;
    this.computerChoice = this.#getRandomComputerChoice();
    this.isGameOver = true;
    this.gameOverAt = new Date();

    this.computerChoice.displayAsChoosen();
    this.#computeResult();
    this.#onFinish();
  }

  #computeBGClass() {
    return this.isDraw ? 'bg-dark-success' : 'bg-success'; 
  }

  #computeResult() {
    switch (this.computerChoice.choiceType) {
      case this.playerChoice.superiorType:
        this.winner = this.computerChoice.constructor.displayName;
        this.looser = this.playerChoice.constructor.displayName;
        break;
      case this.playerChoice.inferiorType:
        this.winner = this.playerChoice.constructor.displayName;
        this.looser = this.computerChoice.constructor.displayName;
        break;
      default:
        this.isDraw = true;
        break;
    }
  }

  #computeState() {
    return this.isDraw ? 'DRAW' : `${this.winner}<br>WIN`;
  }
}

class Choice {
  choiceType = null;
  superiorType = null;
  inferiorType = null;

  static get value() {
    return this.name.toUpperCase();
  }

  static get displayName() {
    return this.name.toUpperCase();
  }

  static choiceType = {
    ROCK: "ROCK",
    PAPER: "PAPER",
    SCISSOR: "SCISSOR",
  };

  constructor(game, element) {
    this.game = game;
    this.element = element;
    this.choiceType = element.dataset.choiceType;

    this.insertGameElements();
    this.setRelation();
  }

  insertGameElements() {
    this.game[`${this.constructor.name.toLowerCase()}Choicables`].push(this);
  }

  displayAsChoosen = () => {
    this.untilt();
    this.element.classList.add('active');
    this.tilt();
  }

  tilt() {
    this.element.firstElementChild.classList.add('tilt');
  }

  untilt() {
    this.element.firstElementChild.classList.remove('tilt');
  }

  setRelation() {
    switch(this.choiceType) {
      case this.constructor.choiceType.ROCK:
        this.superiorType = this.constructor.choiceType.PAPER;
        this.inferiorType = this.constructor.choiceType.SCISSOR;
        break;
      case this.constructor.choiceType.PAPER:
        this.superiorType = this.constructor.choiceType.SCISSOR;
        this.inferiorType = this.constructor.choiceType.ROCK;
        break;
      case this.constructor.choiceType.SCISSOR:
        this.superiorType = this.constructor.choiceType.ROCK;
        this.inferiorType = this.constructor.choiceType.PAPER;
        break;
    }
  }

  reset() {
    this.untilt();
    this.element.classList.remove('active');
  }
}

class Player extends Choice {
  static displayName = "PLAYER 1";

  constructor(game, element) {
    super(game, element);
    this.setup();
  }

  setup() {
    this.element.style['cursor'] = 'pointer';
    this.element.onclick = this.onclick;
    this.element.onmouseover = this.onmouseover;
    this.element.onmouseleave = this.onmouseleave;
  }

  block() {
    this.element.style['cursor'] = 'not-allowed';
    this.element.onmouseover = undefined;
    this.element.onmouseleave = undefined;
    this.element.onclick = undefined;
  }

  // Use arrow function to bypass this binding for `onclick` function
  onclick = () => {
    this.displayAsChoosen();
    this.game.onPlayerPick(this);
  }

  onmouseover = () => this.tilt();
  onmouseleave = () => this.untilt();
}

class Computer extends Choice {
  static displayName = "COM";
}

window.onload = Game.start;
