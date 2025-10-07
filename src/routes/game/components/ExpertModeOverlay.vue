<template>
  <v-overlay
    id="move-choice-overlay"
    class="d-flex flex-column justify-center align-center"
    :model-value="modelValue"
  >
    <!-- Move choices -->
    <div id="options-wrapper" class="d-flex justify-space-between my-4">
      <MoveChoiceButton
        v-for="move in moveChoices"
        :key="move.displayName"
        :move-name="move.displayName"
        :event-name="move.eventName"
        :disabled="move.disabled"
        :disabled-explanation="move.disabledExplanation"
        :button-width="cardWidth"
        @choose-move="$emit(move.eventName, move)"
      />
    </div>
  </v-overlay>
</template>

<script>
import { useI18n } from 'vue-i18n';
import { mapStores } from 'pinia';
import { useGameStore } from '@/stores/game';
import MoveChoiceButton from './MoveChoiceButton.vue';

export default {
  name: 'ExpertModeOverlay',
  components: {
    MoveChoiceButton,
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    selectedCard: {
      type: Object,
      required: true,
    },
    isPlayersTurn: {
      type: Boolean,
      required: true,
    },
    opponentQueenCount: {
      type: Number,
      required: true,
    },
    frozenId: {
      type: Number,
      default: null,
    },
    playingFromDeck: {
      type: Boolean,
      required: true,
    },
    cardSelectedFromDeck: {
      type: Object,
      default: null,
    },
  },
  emits: [ 'points', 'faceCard', 'scuttle', 'jack', 'oneOff', 'targetedOneOff', 'cancel' ],
  setup() {
    const { t } = useI18n();
    return { t };
  },
  computed: {
    ...mapStores(useGameStore),
    // Determines if any moves are available
    allMovesAreDisabled() {
      return (
        !this.isPlayersTurn ||
        this.frozenId === this.selectedCard.id || this.selectedCard.isFrozen ||
        (this.playingFromDeck && !this.cardSelectedFromDeck)
      );
    },
    // Determines which disabled text to display
    disabledText() {
      if (this.playingFromDeck && !this.cardSelectedFromDeck) {
        return this.t('game.moves.disabledMove.topTwo');
      } else if (this.allMovesAreDisabled) {
        return this.t(!this.isPlayersTurn ? 'game.moves.disabledMove.notTurn' : 'game.moves.disabledMove.frozenCard');
      }
      return '';
    },
    pointsMove() {
      const pointsDescription = this.t('game.moves.points.description', { count: this.selectedCard.rank });
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
      // Check deck while playing 5 or 7
      const noTopCard = !this.gameStore.topCard;
      const playingTopCard = this.selectedCard?.id === this.gameStore.topCard?.id;
      const noSecondCard = !this.gameStore.secondCard;

      switch (this.selectedCard.rank) {
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
        moveDescription: this.t(`game.moves.effects[${this.selectedCard.rank}]`) ,
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
          oneOffDisabledExplanation = this.t('game.moves.disabledMove.multipleQueens', { rank: this.selectedCard.rank });
        } else {
          let validTargetExists;
          // Twos
          if (this.selectedCard.rank === 2) {
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
        moveDescription: this.t(`game.moves.effects[${this.selectedCard.rank}]`) ,
        disabled: oneOffDisabled,
        disabledExplanation: oneOffDisabledExplanation,
      };
    },
    jackMove() {
      let ableToJack = false;
      let disabledExplanation = '';
      if (!this.allMovesAreDisabled) {
        ableToJack = this.opponentQueenCount === 0;
        disabledExplanation = this.t('game.moves.jack.disabled');
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

    /**
     * Returns list of objects representing the available moves,
     * based on the selected card
     */
    moveChoices() {
      switch (this.selectedCard.rank) {
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
            // Glasses
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
              moveDescription: this.t(`game.moves.effects[${this.selectedCard.rank}]`) ,
              disabled: this.allMovesAreDisabled,
              disabledExplanation: this.disabledText,
            },
          ];
      }
      return [];
    },
    /**
     * @return boolean whether there is a legal scuttle using selected card
     */
    hasValidScuttleTarget() {
      // Can't scuttle with a royal
      if (this.selectedCard.rank >= 11) {
        return false;
      }
      // Return true iff at least one opponent point card is scuttleable w/ selected card
      return this.gameStore.opponent.points.some((opponentPointCard) => {
        return (
          this.selectedCard.rank > opponentPointCard.rank ||
          (this.selectedCard.rank === opponentPointCard.rank &&
            this.selectedCard.suit > opponentPointCard.suit)
        );
      });
    },
    cardWidth() {
      if (this.$vuetify.display.xs) {
        return '100%';
      }
      switch (this.moveChoices.length) {
        case 1:
          return '100%';
        case 2:
          return '50%';
        case 3:
        default:
          return '30%';
      }
    },
  }, // End computed{}
};
</script>

<style scoped lang="scss">
#move-choice-overlay {
  & #close-wrapper {
    width: 85%;
  }
}
@media (max-width: 600px) {
  #options-wrapper {
    flex-direction: column;
    align-items: center;
  }
}
</style>
