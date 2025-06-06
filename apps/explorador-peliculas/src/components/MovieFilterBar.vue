<template>
  <section class="mb-8">
    <div class="flex flex-col md:flex-row justify-end items-start md:items-center mb-4 gap-4">
      <!-- Contenedor principal del buscador y filtros alineados a la derecha -->
      <div class="flex flex-col md:flex-row md:items-center gap-4 w-full justify-end">
        <!-- Cuadro de búsqueda moderno con iconos -->
        <div class="relative flex-1 w-full md:max-w-lg">
          <!-- Icono de lupa (izquierda) -->
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- Input -->
          <input
            v-model="search"
            @input="$emit('update:search-query', search)"
            @keyup.enter="$emit('trigger-search')"
            type="text"
            placeholder="Buscar películas..."
            class="pl-10 pr-12 py-2 w-full rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

           <!-- Botón con flecha triangular minimalista (derecha) -->
          <button 
            @click="$emit('trigger-search')"
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
          >
            <!-- Flecha triangular con bordes redondeados -->
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <!-- Contenedor de filtros (derecha) -->
        <div class="flex flex-wrap gap-2 md:ml-auto">
          <select
            v-model="filter"
            @change="$emit('update:current-filter', filter)"
            class="px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm"
          >
            <option value="all">Todas</option>
            <option value="popular">Populares</option>
            <option value="top_rated">Mejor valoradas</option>
            <option value="upcoming">Próximos estrenos</option>
            <option value="now_playing">En cines</option>
          </select>

          <select
            v-model="genre"
            @change="$emit('update:selected-genre', genre)"
            class="px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm"
          >
            <option value="">Todos los géneros</option>
            <option v-for="g in genres" :key="g.id" :value="g.id">{{ g.name }}</option>
          </select>

          <!-- Nuevo filtro de año -->
          <select
            v-model="year"
            @change="$emit('update:selected-year', year)"
            :disabled="filter === 'upcoming'"
            class="px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm"
          >
            <option value="">Todos los años</option>
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps(['searchQuery', 'currentFilter', 'selectedGenre', 'genres', 'selectedYear'])
const emit = defineEmits(['update:search-query', 'update:current-filter', 'update:selected-genre', 'update:selected-year'])

const search = ref(props.searchQuery)
const filter = ref(props.currentFilter)
const genre = ref(props.selectedGenre)
const year = ref(props.selectedYear)

watch(() => props.searchQuery, val => search.value = val)
watch(() => props.currentFilter, val => filter.value = val)
watch(() => props.selectedGenre, val => genre.value = val)
watch(() => props.selectedYear, val => year.value = val)

// Nuevo watcher para limpiar el año si el filtro es "upcoming"
watch(filter, (newVal) => {
  if (newVal === 'upcoming' && year.value !== '') {
    year.value = ''
    emit('update:selected-year', '')
  }
})

// Genera los años desde 1950 hasta el año actual
const currentYear = new Date().getFullYear()
const years = computed(() => {
  const arr = []
  for (let y = currentYear; y >= 1950; y--) arr.push(y)
  return arr
})
</script>