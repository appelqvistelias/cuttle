<template>
  <div class="mode-selector-container">
    <v-btn
      color="surface-1"
      variant="outlined"
      class="mode-button"
      :class="{ 'active-mode': gameStore.isBeginnerMode }"
      @click="gameStore.setCurrentMode('beginner')"
    >
      <v-icon class="mr-2" size="medium" icon="mdi-school" />
      Beginner
    </v-btn>

    <v-btn
      color="surface-1"
      variant="outlined"
      class="mode-button"
      :class="{ 'active-mode': gameStore.isNormalMode }"
      @click="gameStore.setCurrentMode('normal')"
    >
      <v-icon class="mr-2" size="medium" icon="mdi-account" />
      Normal
    </v-btn>

    <v-btn
      color="surface-1"
      variant="outlined"
      class="mode-button"
      :class="{ 'active-mode': gameStore.isExpertMode }"
      @click="gameStore.setCurrentMode('expert')"
    >
      <v-icon class="mr-2" size="medium" icon="mdi-trophy" />
      Expert
    </v-btn>
  </div>
</template>

<script>
import { mapStores } from 'pinia';
import { useGameStore } from '@/stores/game';

export default {
  name: 'ModeSelector',
  computed: {
    ...mapStores(useGameStore),
  },
};
</script>

<style scoped>
.mode-selector-container {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  padding: 1rem;
}

.mode-button {
  flex: 1;
  min-width: 150px;
  max-width: 200px;
}

.active-mode {
  background-color: rgba(var(--v-theme-surface-1), 0.2) !important;
  border-width: 2px !important;
}
</style>
