<template>
  <header class="bg-primary text-white p-4 shadow-lg">
    <div class="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
      <h1 class="text-2xl font-bold">Cuevana PY</h1>
      
      <div class="flex flex-wrap justify-center gap-2 sm:gap-4 w-full sm:w-auto">
        <!-- Botón Exportar - Cambiamos a ícono en móvil -->
        <button
          @click="$emit('exportToCSV')"
          class="px-3 py-2 sm:px-4 bg-white text-primary rounded-lg hover:bg-opacity-90 transition flex items-center gap-1"
          aria-label="Exportar a CSV"
        >
          <span class="hidden sm:inline">📊 Exportar</span>
          <span class="sm:hidden">📊</span>
        </button>
        
        <!-- Botón Modo Oscuro/Claro - Cambiamos a ícono en móvil -->
        <button
          @click="$emit('toggleDarkMode')"
          class="px-3 py-2 sm:px-4 bg-white text-primary rounded-lg hover:bg-opacity-90 transition flex items-center gap-1"
          aria-label="Cambiar modo de color"
        >
          <span class="hidden sm:inline">{{ darkMode ? '☀️ Claro' : '🌙 Oscuro' }}</span>
          <span class="sm:hidden">{{ darkMode ? '☀️' : '🌙' }}</span>
        </button>
        
        <!-- Botón Cambiar Vista - Cambiamos a ícono en móvil -->
        <button
          @click="$emit('toggleView')"
          class="px-3 py-2 sm:px-4 bg-white text-primary rounded-lg hover:bg-opacity-90 transition flex items-center gap-1"
          aria-label="Cambiar vista"
        >
          <span class="hidden sm:inline">{{ viewMode === 'cards' ? '📋 Tabla' : '🗂️ Tarjetas' }}</span>
          <span class="sm:hidden">{{ viewMode === 'cards' ? '📋' : '🗂️' }}</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({ 
  darkMode: Boolean,
  viewMode: String // 'cards' o 'table'
})
defineEmits(['toggleDarkMode', 'exportToCSV', 'toggleView'])
</script>

<style scoped>
/* Estilos adicionales para mejor comportamiento en móvil */
@media (max-width: 640px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  button {
    min-width: 40px; /* Asegura que los íconos tengan espacio */
  }
}
</style>