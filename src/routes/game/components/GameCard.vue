<template>
  <v-card
    class="mx-1 player-card"
    :class="{
      selected: isSelected,
      glasses: isGlasses,
      jack: isJack,
      frozen: isFrozen,
    }"
    :elevation="elevation"
  >
    <v-icon
      v-if="isFrozen"
      class="player-card-icon mr-1 mt-1"
      color="#00a5ff"
      icon="mdi-snowflake"
      aria-label="snowflake icon (card is frozen)"
      aria-hidden="false"
      role="img"
    />
    <v-overlay :model-value="isValidTarget" contained class="valid-move target-overlay" />
    <Transition :name="scuttledByTransition">
      <template v-if="scuttledBy">
        <img :class="scuttledByClass" :src="`/img/cards/card-${scuttledBy.suit}-${scuttledBy.rank}.svg`">
      </template>
    </Transition>
    <Transition name="card-flip">
      <img
        v-if="isGlasses"
        :src="`/img/cards/glasses-${suitName.toLowerCase()}.png`"
        :alt="`Glasses - $${cardName}`"
      >
      <img
        v-else-if="isBack"
        src="/img/cards/card-back.png"
        class="opponent-card-back"
        alt="card back"
      >
      <img
        v-else
        :src="`/img/cards/card-${suit}-${rank}.svg`"
        :alt="cardName"
        class="face-card"
      >
    </Transition>


    <div v-if="isHandCard && showMoveButtons && moveChoices.length > 0" class="card-action-buttons">
      <v-tooltip 
        v-for="move in moveChoices"
        :key="move.eventName"
        :disabled="!move.disabledExplanation"
        location="top"  
      >
        <template #activator="{ props }">
          <span v-bind="props">
            <v-btn
              :key="move.eventName"
              size="x-small"
              icon
              variant="flat"
              :color="move.disabled ? 'grey-darken-2' : 'newPrimary'"
              :disabled="move.disabled"
              :aria-label="`Choose move: ${move.displayName}`"
              @click.stop="handleMoveClick(move)"
            >
              <v-icon v-if="iconForMove(move.eventName)" size="large" :icon="iconForMove(move.eventName)" />
            </v-btn>
          </span>
        </template>
        {{ move.disabledExplanation }}
      </v-tooltip>
    </div>
  </v-card>
</template>

<script>
import { useI18n } from 'vue-i18n';
import { mapStores } from 'pinia';
import { useGameStore } from '@/stores/game';

export default {
  name: 'GameCard',
  props: {
    suit: {
      type: Number,
      default: undefined,
    },
    rank: {
      type: Number,
      default: undefined,
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
    isValidTarget: {
      type: Boolean,
      default: false,
    },
    isGlasses: {
      type: Boolean,
      default: false,
    },
    isJack: {
      type: Boolean,
      default: false,
    },
    jacks: {
      type: Array,
      default: null,
    },
    isFrozen: {
      type: Boolean,
      default: false,
    },
    scuttledBy: {
      type: Object,
      default: null,
    },
    controlledBy: {
      type: String,
      default: '',
      validator: (val) => [ '', 'player', 'opponent' ].includes(val),
    },
    highElevation: {
      type: Boolean,
      default: false,
    },
    isHandCard: {
      type: Boolean,
      default: false,
    },
    showMoveButtons: {
      type: Boolean,
      default: false,
    },
    // New props to enable the buttons to be pressed on the card
    isPlayersTurn: {
      type: Boolean,
      default: true,
    },
    opponentQueenCount: {
      type: Number,
      default: 0,
    },
    frozenId: {
      type: Number,
      default: null,
    },
    playingFromDeck: {
      type: Boolean,
      default: false,
    },
    cardSelectedFromDeck: {
      type: Object,
      default: null,
    },
    cardId: {
      type: String,
      default: null,
    },
  },
  emits: [ 'points', 'faceCard', 'scuttle', 'jack', 'oneOff', 'targetedOneOff' ],
  setup() {
    const { t } = useI18n();
    return { t };
  },
  computed: {
    ...mapStores(useGameStore),
    suitName() {
      switch (this.suit) {
        case 0:
          return 'Clubs';
        case 1:
          return 'Diamonds';
        case 2:
          return 'Hearts';
        case 3:
          return 'Spades';
        default:
          return 'Invalid Suit Error';
      }
    },
    rankName() {
      switch (this.rank) {
        case 1:
          return 'Ace';
        case 2:
          return 'Two';
        case 3:
          return 'Three';
        case 4:
          return 'Four';
        case 5:
          return 'Five';
        case 6:
          return 'Six';
        case 7:
          return 'Seven';
        case 8:
          return 'Eight';
        case 9:
          return 'Nine';
        case 10:
          return 'Ten';
        case 11:
          return 'Jack';
        case 12:
          return 'Queen';
        case 13:
          return 'King';
        default:
          return 'Invalid Rank Error';
      }
    },
    cardName() {
      return `${this.rankName} of ${this.suitName}`;
    },
    elevation() {
      if (this.isGlasses) {
        return '0';
      }
      if (this.highElevation) {
        return '7';
      }
      return '1';
    },
    isBack() {
      return !this.suit && !this.rank;
    },
    scuttledByTransition() {
      switch (this.controlledBy) {
        case 'player':
          return 'slide-above';
        case 'opponent':
          return 'slide-below';
        default:
          return '';
      }
    },
    scuttledByClass() {
      switch (this.controlledBy) {
        case 'player':
          return 'scuttled-by-card scuttled-by-opponent';
        case 'opponent':
          return 'scuttled-by-card scuttled-by-player';
        default:
          return '';
      }
    },

    allMovesAreDisabled() {
      return (
        !this.isPlayersTurn ||
        this.frozenId === this.cardId ||
        this.isFrozen ||
        (this.playingFromDeck && !this.cardSelectedFromDeck)
      );
    },
    disabledText() {
      if (this.playingFromDeck && !this.cardSelectedFromDeck) {
        return this.t('game.moves.disabledMove.topTwo');
      } else if (this.allMovesAreDisabled) {
        return this.t(
          !this.isPlayersTurn ? 'game.moves.disabledMove.notTurn' : 'game.moves.disabledMove.frozenCard',
        );
      }
      return '';
    },
    pointsMove() {
      const pointsDescription = this.t('game.moves.points.description', { count: this.rank });
      return {
        displayName: this.t('game.moves.points.displayName'),
        eventName: 'points',
        moveDescription: pointsDescription,
        disabled: this.allMovesAreDisabled,
        disabledExplanation: this.disabledText,
      };
    },
    scuttleMove() {
      const scuttleDisabled = this.allMovesAreDisabled || !this.hasValidScuttleTarget;
      let scuttleDisabledExplanation = this.t('game.moves.scuttle.disabled');
      if (this.gameStore.opponent.points.length === 0) {
        scuttleDisabledExplanation = this.t('game.moves.scuttle.disabledNoPoints');
      }
      if (this.allMovesAreDisabled) {
        scuttleDisabledExplanation = this.disabledText;
      }
      return {
        displayName: 'Scuttle',
        eventName: 'scuttle',
        moveDescription: this.t('game.moves.scuttle.description'),
        disabled: scuttleDisabled,
        disabledExplanation: scuttleDisabledExplanation,
      };
    },
    oneOffMove() {
      let oneOffDisabled = this.allMovesAreDisabled;
      let oneOffDisabledExplanation = this.disabledText;
      const noTopCard = !this.gameStore.topCard;
      const playingTopCard = this.cardId === this.gameStore.topCard?.id;
      const noSecondCard = !this.gameStore.secondCard;

      switch (this.rank) {
        case 5:
          if (noTopCard) {
            oneOffDisabled = true;
            oneOffDisabledExplanation = this.t('game.moves.disabledMove.emptyDeck');
          }
          break;
        case 7:
          if (noTopCard || (playingTopCard && noSecondCard)) {
            oneOffDisabled = true;
            oneOffDisabledExplanation = this.t('game.moves.disabledMove.emptyDeck');
          }
          break;
      }

      return {
        displayName: 'One-Off',
        eventName: 'oneOff',
        moveDescription: this.t(`game.moves.effects[${this.rank}]`),
        disabled: oneOffDisabled,
        disabledExplanation: oneOffDisabledExplanation,
      };
    },
    targetedOneOffMove() {
      let oneOffDisabled = this.allMovesAreDisabled;
      let oneOffDisabledExplanation = this.disabledText;
      if (!this.allMovesAreDisabled) {
        if (this.opponentQueenCount >= 2) {
          oneOffDisabled = true;
          oneOffDisabledExplanation = this.t('game.moves.disabledMove.multipleQueens', {
            rank: this.rank,
          });
        } else {
          let validTargetExists;
          if (this.rank === 2) {
            const numOpFaceCards = this.gameStore.opponent.faceCards.length;
            const numOpJacks = this.gameStore.opponent.points.reduce((jackCount, pointCard) => {
              return jackCount + pointCard.attachments.length;
            }, 0);
            const numTotalTargets = numOpFaceCards + numOpJacks;
            validTargetExists = numTotalTargets >= 1;
            if (!validTargetExists) {
              oneOffDisabled = true;
              oneOffDisabledExplanation = this.t('game.moves.disabledMove.noRoyals');
            }
          } else {
            const numValidTargets =
              this.gameStore.opponent.points.length + this.gameStore.opponent.faceCards.length;
            if (numValidTargets === 0) {
              oneOffDisabled = true;
              oneOffDisabledExplanation = this.t('game.moves.disabledMove.noRoyalsOrPoints');
            }
          }
        }
      }
      return {
        displayName: 'One-Off',
        eventName: 'targetedOneOff',
        moveDescription: this.t(`game.moves.effects[${this.rank}]`),
        disabled: oneOffDisabled,
        disabledExplanation: oneOffDisabledExplanation,
      };
    },
    jackMove() {
      let ableToJack = false;
      let disabledExplanation = '';
      if (!this.allMovesAreDisabled) {
        ableToJack = this.opponentQueenCount === 0 && this.gameStore.opponent.points.length > 0;
        if (this.gameStore.opponent.points.length === 0) {
          disabledExplanation = this.t('game.moves.jack.disabled');
        }
      } else {
        disabledExplanation = this.disabledText;
      }
      return {
        displayName: this.t('game.moves.royal.displayName'),
        eventName: 'jack',
        moveDescription: this.t('game.moves.jack.description'),
        disabled: !ableToJack || this.allMovesAreDisabled,
        disabledExplanation,
      };
    },
    moveChoices() {
      if (!this.rank) {return [];}

      switch (this.rank) {
        case 1:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
          return [ this.pointsMove, this.scuttleMove, this.oneOffMove ];
        case 2:
        case 9:
          return [ this.pointsMove, this.scuttleMove, this.targetedOneOffMove ];
        case 8:
          return [
            this.pointsMove,
            this.scuttleMove,
            {
              displayName: this.t('game.moves.glasses.displayName'),
              eventName: 'faceCard',
              moveDescription: this.t('game.moves.glasses.description'),
              disabled: this.allMovesAreDisabled,
              disabledExplanation: this.disabledText,
            },
          ];
        case 10:
          return [ this.pointsMove, this.scuttleMove ];
        case 11:
          return [ this.jackMove ];
        case 12:
        case 13:
          return [
            {
              displayName: this.t('game.moves.royal.displayName'),
              eventName: 'faceCard',
              moveDescription: this.t(`game.moves.effects[${this.rank}]`),
              disabled: this.allMovesAreDisabled,
              disabledExplanation: this.disabledText,
            },
          ];
      }
      return [];
    },
    hasValidScuttleTarget() {
      if (this.rank >= 11) {
        return false;
      }
      return this.gameStore.opponent.points.some((opponentPointCard) => {
        return (
          this.rank > opponentPointCard.rank ||
          (this.rank === opponentPointCard.rank && this.suit > opponentPointCard.suit)
        );
      });
    },
    iconForMove() {
      return (action) => {
        switch (action) {
          case 'points':
            return 'mdi-numeric';
          case 'scuttle':
            return 'mdi-skull-crossbones';
          case 'oneOff':
            return 'mdi-delete';
          case 'targetedOneOff':
            return 'mdi-target';
          case 'faceCard':
            return 'mdi-crown-outline';
          case 'jack':
            return 'mdi-shield-sword';
          default:
            return null;
        }
      };
    },
  },
  methods: {
    handleMoveClick(move) {
      if (move.disabled) {return;}

      // Emita eventet med move.eventName
      this.$emit(move.eventName);
    },
  },
};
</script>

<style scoped lang="scss">
.player-card {
  position: relative;
  max-height: 20vh;
  max-width: calc(20vh / 1.45);
  width: 100%;
  background: transparent;
  flex-grow: 1;
  overflow: visible;

  & img {
    width: 100%;
    display: block;
    position: relative;
  }

  &.glasses {
    max-width: 20vh;
    height: calc(20vh / 1.45);
  }

  & .scuttled-by-card {
    height: 95%;
    left: 16px;
    transition: all 1s ease;
    position: absolute;
    z-index: 1;
    &.scuttled-by-opponent {
      top: -42px;
    }
    &.scuttled-by-player {
      bottom: -32px;
    }
  }
}



.card-action-buttons {
  position: absolute;
  bottom: 35%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 2%; 
  z-index: 20;
  justify-content: center;
  width: 90%; 
  padding: 3% 2%;
  background: rgba(0, 0, 0, 0.85);
  box-sizing: border-box;
  border-radius: 5px;
}

:deep(.v-btn) {
  min-width: max(20%, 28px) !important; 
  width: max(20%, 28px) !important;
  max-width: 40px !important; 
  aspect-ratio: 1 !important;
  padding: 0 !important;
  border-radius: 4px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;

  &:not(:disabled) {
    &:hover {
      transform: scale(1.1);
      transition: transform 0.2s ease;
    }
  }

  &:disabled {
    opacity: 0.5;
  }
}
.player-card-icon {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
}

.opponent-card-back {
  border-radius: 5px;
}

.selected {
  img {
    border: 3px solid rgba(var(--v-theme-accent-lighten1));
    border-radius: 10px;
  }
}

.jack {
  height: 50%;
  margin-bottom: -50%;
  width: 50%;
  overflow: visible;
  display: flex;
  position: relative;

  & img {
    height: 100%;
    width: 100%;
    background-size: cover;
    display: block;
    position: relative;
  }
}

.target-overlay {
  cursor: pointer;
  background-color: rgb(var(--v-theme-accent-lighten1));
  opacity: 0.6;
}

span {
  display: flex;
flex-direction: column;
  width: fit-content;
  align-items: center;

}

.frozen {
  &:after {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(#00a5ff, 0.25);
    opacity: 1;
    transition: all 0.3s linear;
  }

  &:hover:after {
    opacity: 0;
  }
}

.slide-below-leave-active,
.slide-above-leave-active,
.in-below-out-left-leave-active {
  position: absolute;
}

.slide-below-enter-from,
.slide-below-leave-to {
  opacity: 0;
  transform: translateY(32px);
}

.slide-above-enter-from,
.slide-above-leave-to {
  opacity: 0;
  transform: translateY(-32px);
}

.card-flip-enter-active {
  transition: all 1s;
}

.card-flip-enter-from {
  transform: rotateY(-90deg);
}

.card-flip-enter-to {
  transform: rotateY(0deg);
}

@media (max-width: 600px) {
  .player-card {
    max-height: 10vh;
    width: calc(10vh / 1.45);
    &.glasses {
      max-width: 10vh;
      height: calc(10vh / 1.45);
    }
  }

  .jack {
    margin-bottom: -60%;
    width: calc(10vh / 1.85);
  }

  .card-action-buttons {
    bottom: 30%;
    gap: 2px;
    padding: 4px 2px;
  }

  :deep(.v-btn) {
    min-width: 24px !important;
    width: 24px !important;
    height: 24px !important;
  }
}
</style>
