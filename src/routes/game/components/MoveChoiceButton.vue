<template>
  <v-tooltip disabled="!disabledExplanation">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        ripple
        :disabled="disabled"
        :class="{ pointer: !disabled }"
        class="move-choice-button mx-4"
        :width="buttonWidth"
        :data-move-choice="eventName"
        :aria-label="`Choose Move: ${moveName}`"
        @click.stop="$emit('choose-move')"
      >
        <v-icon v-if="iconName" size="x-large" :icon="iconName" aria-hidden="true" />
      </v-btn>
    </template>
    {{ disabledExplanation }}
  </v-tooltip>
</template>

<script>
// I need the props for disabled
export default {
  name: 'MoveChoiceButton',
  props: {
    moveName: {
      type: String,
      required: true,
    },
    // Under-the-hood name for the move e.g. oneOff
    eventName: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    disabledExplanation: {
      type: String,
      default: '',
    },
    buttonWidth: {
      type: String,
      default: '30%',
    },
  },
  emits: ['choose-move'],
  computed: {
    /**
     * Returns string name of which icon to display
     */
    iconName() {
      switch (this.moveName) {
        case 'Points':
          return 'mdi-numeric';
        case 'Scuttle':
          return 'mdi-skull-crossbones';
        case 'One-Off':
          return 'mdi-delete';
        case 'Glasses':
          return 'mdi-sunglasses';
        case 'Royal':
          return 'mdi-crown';
        default:
          return null;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.pointer {
  cursor: pointer;
}
.move-choice-button {
  background-color: rgba(var(--v-theme-surface-1));
  color: rgba(var(--v-theme-surface-2)) !important;
  border: 2px solid rgba(var(--v-theme-surface-2));
  transition: all 0.5s ease;
  opacity: 0.95;
  border-radius: 5px;
}
.move-choice-button:hover {
  background-color: rgba(var(--v-theme-surface-2)) !important;
  color: rgba(var(--v-theme-surface-1)) !important;
}
p {
  text-align: center;
}

@media (max-width: 600px) {
  .move-choice-button {
    margin-bottom: 16px;
  }
}
</style>
