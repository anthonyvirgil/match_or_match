const gameTimerValue = 100;

class AudioController {
    constructor() {
        this.flipSound = new Audio('assets/audio/flip-card.mp3');
        this.matchSound = new Audio('assets/audio/correct.mp3');
        this.bgMusic = new Audio('assets/audio/fancy.mp3');
        this.winSound = new Audio();
        this.gameOverSound = new Audio();
        this.bgMusic.volume = 0.1;
        this.bgMusic.loop = true;
    }

    startMusic() {
        this.bgMusic.play();
    }

    stopMusic() {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
    }

    flip() {
        this.flipSound.volume = 0.4;
        this.flipSound.play();
    }

    match() {
        this.matchSound.volume = 0.4;
        this.matchSound.play();
    }

    win() {
        this.stopMusic();
        this.winSound.play();
    }

    gameOver() {
        this.stopMusic();
        this.gameOverSound.play();
    }
}

class MatchGame {
    constructor(totalTime, cards) {
        this.cardsArray = cards;
        this.totalTime = totalTime;
        this.timeRemaining = totalTime;
        this.timer = document.getElementById('time-remaining');
        this.flips = document.getElementById('flips');
        this.audioController = new AudioController();
    }

    startGame() {
        this.currentCard = null;
        this.numFlips = 0;
        this.timeRemaining = this.totalTime;
        this.matchedCards = [];
        this.busy = true;

        setTimeout(() => {
            this.shuffleCards();
            this.countdown = this.startCountdown();
            this.audioController.startMusic();
            this.busy = false;
        }, 500);

        this.hideCards();
        this.timer.innerText = this.timeRemaining;
        this.flips.innerText = this.numFlips;
    }

    hideCards() {
        this.cardsArray.forEach(card => {
            card.classList.remove('visible');
            card.classList.remove('matched');
        });
    }

    canFlipCard(card) {
        return (!this.busy && !this.matchedCards.includes(card) && card !== this.currentCard);
    }

    flipCard(card) {
        if (this.canFlipCard(card)) {
            this.audioController.flip();
            this.numFlips++;
            this.flips.innerText = this.numFlips;
            card.classList.add('visible');

            if (this.currentCard) {
                this.checkForMatch(card);
            } else {
                this.currentCard = card;
            }
        }
    }

    checkForMatch(card) {
        if (this.getCardType(card) === this.getCardType(this.currentCard)) {
            this.cardMatch(card, this.currentCard);
        } else {
            this.cardMismatch(card, this.currentCard);
        }

        this.currentCard = null;
    }

    cardMatch(card, currentCard) {
        this.matchedCards.push(card);
        this.matchedCards.push(currentCard);
        card.classList.add('matched');
        currentCard.classList.add('matched');
        this.audioController.match();
        if (this.matchedCards.length === this.cardsArray.length) {
            this.win(); 
        }
    }

    cardMismatch(card, currentCard) {
        this.busy = true;
        setTimeout(() => {
            card.classList.remove('visible');
            currentCard.classList.remove('visible');
            this.busy = false;
        }, 1000);
    }

    getCardType(card) {
        return card.getElementsByClassName('card-value')[0].src;
    }

    startCountdown() {
        return setInterval(() => {
            this.timeRemaining--;
            this.timer.innerText = this.timeRemaining;
            if (this.timeRemaining === 0) {
                this.gameOver();
            }
        }, 1000);
    }

    gameOver() {
        clearInterval(this.countdown);
        this.audioController.gameOver();
        document.getElementById('game-over-title').classList.add('visible');
    }

    win() {
        clearInterval(this.countdown);
        this.audioController.win();
        document.getElementById('win-title').classList.add('visible');
    }

    shuffleCards() {
        for (let i = this.cardsArray.length - 1; i > 0; i--) {
            let randomIndex = Math.floor(Math.random() * (i+1));
            this.cardsArray[randomIndex].style.order = i;
            this.cardsArray[i].style.order = randomIndex;
        }
    }
}

function ready() {
    let overlays = Array.from(document.getElementsByClassName('overlay-text'));
    let cards = Array.from(document.getElementsByClassName('card'));
    let game = new MatchGame(gameTimerValue, cards);

    overlays.forEach(overlay => {
        overlay.addEventListener('click', () => {
            overlay.classList.remove('visible');
            game.startGame();
        });
    });

    cards.forEach(card => {
        card.addEventListener('click', () => {
            game.flipCard(card);
        });
    })
}

if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready());
} else {
    ready();
}