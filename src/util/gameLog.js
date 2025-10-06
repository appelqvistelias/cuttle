import { useI18n } from 'vue-i18n';
import MoveType from '../../utils/MoveType.json';

export function buildLogEntry(gameState, gameStore) {
  const { t } = useI18n();

  const player = gameStore.players[gameState.playedBy]?.username;
  const opponent = gameStore.players[(gameState.playedBy + 1) % 2]?.username;
  const playedCard = gameState.playedCardName || '';
  const targetCard = gameState.targetCardName || '';
  const resolvedCard = gameState.resolvedCardName || '';
  const discardedCards = gameState.discardedCards || [];
  const numCardsDrawn = gameState.numCardsDrawn || 0;

  switch (gameState.moveType) {
    case MoveType.DEAL:
      return t('game.log.deal', { player, opponent });
    case MoveType.DRAW:
      return t('game.log.draw', { player });
    case MoveType.POINTS:
      return t('game.log.points', { player, card: playedCard });
    case MoveType.SCUTTLE:
      return t('game.log.scuttle', { player, opponent, playedCard, targetCard });
    case MoveType.FACE_CARD:
      return t('game.log.face_card', { player, card: playedCard });
    case MoveType.JACK:
      return t('game.log.jack', { player, opponent, playedCard, targetCard });
    case MoveType.ONE_OFF:
      return t('game.log.one_off', { player, card: playedCard, targetCard });
    case MoveType.COUNTER:
      return t('game.log.counter', { player, card: playedCard, targetCard });
    case MoveType.FIZZLE:
      return t('game.log.fizzle', { card: resolvedCard });
    case MoveType.RESOLVE:
      return t('game.log.resolve', { player, opponent, card: resolvedCard, targetCard });
    case MoveType.RESOLVE_THREE:
      return t('game.log.resolve_three', { player, targetCard });
    case MoveType.RESOLVE_FOUR:
      return t('game.log.resolve_four', { player, discardedCard: playedCard, discardedCards });
    case MoveType.RESOLVE_FIVE:
      return t('game.log.resolve_five', { player, discardedCard: playedCard, numCardsDrawn });
    case MoveType.SEVEN_POINTS:
      return t('game.log.seven_points', { player, card: playedCard });
    case MoveType.SEVEN_SCUTTLE:
      return t('game.log.seven_scuttle', { player, opponent, playedCard, targetCard });
    case MoveType.SEVEN_FACE_CARD:
      return t('game.log.seven_face_card', { player, card: playedCard });
    case MoveType.SEVEN_JACK:
      return t('game.log.seven_jack', { player, opponent, playedCard, targetCard });
    case MoveType.SEVEN_DISCARD:
      return t('game.log.seven_discard', { player, card: playedCard });
    case MoveType.SEVEN_ONE_OFF:
      return t('game.log.seven_one_off', { player, card: playedCard });
    case MoveType.PASS:
      return t('game.log.pass', { player });
    case MoveType.CONCEDE:
      return t('game.log.concede', { player });
    case MoveType.STALEMATE_REQUEST:
      return t('game.log.stalemate_request', { player });
    case MoveType.STALEMATE_ACCEPT:
      return t('game.log.stalemate_accept', { player, opponent });
    case MoveType.STALEMATE_REJECT:
      return t('game.log.stalemate_reject', { player, opponent });
    case MoveType.LOADFIXTURE:
      return t('game.log.load_fixture', { player });
    default:
      return t('game.log.unknown');
  }
}
