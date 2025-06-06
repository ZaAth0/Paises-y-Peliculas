<template>
  <div class="min-h-screen" :class="{ 'dark': darkMode }">
    <div class="bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col">
      <HeaderComponent
        :dark-mode="darkMode"
        :view-mode="viewMode"
        @toggleDarkMode="toggleDarkMode"
        @exportToCSV="exportToCSV"
        @toggleView="toggleView"
      />

      <main class="container mx-auto p-4 flex flex-col flex-1 overflow-hidden">
        <MovieFilterBar
          :search-query="searchQuery"
          :current-filter="currentFilter" 
          :selected-genre="selectedGenre"
          :genres="genres"
          :selected-year="selectedYear" 
          @update:search-query="searchQuery = $event; filterMovies()"
          @update:current-filter="currentFilter = $event; fetchMovies()"
          @update:selected-genre="selectedGenre = $event; filterByGenre()"
          @update:selected-year="selectedYear = $event; filterMovies()"
        />

        <template v-if="viewMode === 'cards'">
          <!-- Vista Tarjetas -->
          <div v-if="filteredMovies.length === 0 && !loadingMovies" class="text-center py-8 flex-1">
            <p class="text-gray-600 dark:text-gray-300">No se encontraron películas</p>
            <button 
              @click="clearFilters"
              class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Mostrar todas
            </button>
          </div>

          <div v-else-if="loadingMovies" class="text-center py-8 text-gray-600 dark:text-gray-300 flex-1">
            Cargando películas...
          </div>

          <div v-else class="overflow-y-auto flex-1 pr-1">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-4">
              <div 
                v-for="movie in paginatedMovies" 
                :key="movie.id"
                class="relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                :style="{ cursor: 'default' }"
              >
                <div class="relative w-full h-64 overflow-hidden">
                  <img  
                    v-if="movie.poster_path"
                    :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"  
                    :alt="movie.title"
                    class="w-full h-full object-cover"
                    @error="handleImageError"
                  >
                  <div v-else class="w-full h-64 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span class="text-gray-500 dark:text-gray-400">Sin imagen</span>
                  </div>
                  <div class="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-start 
                        text-white p-4 opacity-0 transition-opacity duration-300 hover:opacity-100 overflow-y-auto max-h-full">
                    <p class="text-sm text-center">{{ movie.overview ? movie.overview : 'Descripción no disponible' }}</p>
                  </div>
                </div>
                <div class="p-4">
                  <h3 class="font-bold text-lg mb-2 text-gray-800 dark:text-white">{{ movie.title }}</h3>
                  <div class="flex items-center mb-2 text-sm text-gray-600 dark:text-gray-300">
                    <span class="text-yellow-500">★</span>
                    <span class="ml-1">{{ movie.vote_average?.toFixed(1) || 'N/A' }}</span>
                    <span class="mx-2 text-gray-400">|</span>
                    <span>{{ movie.release_date?.substring(0, 4) || 'N/A' }}</span>
                  </div>
                  <div class="flex flex-wrap gap-1">
                    <span  
                      v-for="genreId in movie.genre_ids"  
                      :key="genreId"
                      class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                    >
                      {{ getGenreName(genreId) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <!-- Vista Tabla AG Grid -->
          <div class="ag-theme-alpine" :class="{ 'ag-theme-alpine-dark': darkMode }" style="width: 100%; height: 600px;">
            <ag-grid-vue
                v-if="!loadingMovies"
                :rowData="paginatedMovies"
                :columnDefs="columnDefs"
                :defaultColDef="defaultColDef"
                :pagination="false"
                :suppressCellFocus="true"
                :domLayout="'normal'"
                style="height: 100%; width: 100%;"
                :getRowHeight="getRowHeight"
                @grid-ready="onGridReady"
                @cell-clicked="onCellClicked"
              />
            <div v-if="loadingMovies" class="flex items-center justify-center h-full text-gray-500">
              Cargando datos...
            </div>
            <div v-else-if="!paginatedMovies.length" class="flex items-center justify-center h-full text-gray-500">
              No hay datos para mostrar
            </div>
          </div>
        </template>

        <!-- Paginación -->
        <div class="pagination-container">
          <button @click="goToPage(1)" :disabled="pagination.currentPage === 1" class="pagination-button">
            « Primera
          </button>
          <button 
            v-for="page in visiblePages" 
            :key="page" 
            @click="goToPage(page)" 
            :class="['pagination-button', pagination.currentPage === page ? 'active' : '']">
            {{ page }}
          </button>
          <button @click="goToPage(totalPages)" :disabled="pagination.currentPage === totalPages" class="pagination-button">
            Última »
          </button>
        </div>

        <!-- Modal Detalle -->
        <div v-if="selectedMovie && viewMode === 'table'" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
              <div class="flex justify-between items-start mb-4">
                <h2 class="text-2xl font-bold text-gray-800 dark:text-white">{{ selectedMovie.title }}</h2>
                <button 
                  @click="selectedMovie = null"
                  class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="col-span-1">
                  <img 
                    v-if="selectedMovie.poster_path"
                    :src="`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`" 
                    :alt="`Poster de ${selectedMovie.title}`"
                    class="w-full rounded-lg shadow-md"
                  >
                  <div v-else class="bg-gray-200 dark:bg-gray-700 h-full w-full flex items-center justify-center rounded-lg">
                    <span class="text-gray-500 dark:text-gray-300">Imagen no disponible</span>
                  </div>
                </div>

                <div class="col-span-1 md:col-span-2 space-y-4">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200">Información General</h3>
                    <div class="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Fecha de lanzamiento</p>
                        <p class="text-gray-800 dark:text-gray-100">{{ selectedMovie.release_date || 'N/A' }}</p>
                      </div>
                      <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Calificación</p>
                        <p 
                          class="font-bold"
                          :class="{
                            'text-green-600 dark:text-green-400': selectedMovie.vote_average >= 7,
                            'text-yellow-500 dark:text-yellow-400': selectedMovie.vote_average >= 5 && selectedMovie.vote_average < 7,
                            'text-red-500 dark:text-red-400': selectedMovie.vote_average < 5
                          }"
                        >
                          {{ selectedMovie.vote_average?.toFixed(1) || 'N/A' }} / 10
                        </p>
                      </div>
                      <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Popularidad</p>
                        <p class="text-gray-800 dark:text-gray-100">{{ selectedMovie.popularity?.toFixed(0) || 'N/A' }}</p>
                      </div>
                      <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Idioma original</p>
                        <p class="text-gray-800 dark:text-gray-100">{{ selectedMovie.original_language || 'N/A' }}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200">Géneros</h3>
                    <div class="flex flex-wrap gap-2 mt-2">
                      <span 
                        v-for="genreId in selectedMovie.genre_ids"
                        :key="genreId"
                        class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs rounded-full"
                      >
                        {{ getGenreName(genreId) }}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200">Sinopsis</h3>
                    <p class="text-gray-800 dark:text-gray-100 mt-2">{{ selectedMovie.overview || 'No disponible' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import HeaderComponent from '../components/HeaderComponent.vue'
import MovieFilterBar from '../components/MovieFilterBar.vue'
import api from '../services/api'

// Estado
const darkMode = ref(false)
const viewMode = ref('cards') // 'cards' o 'table'
const movies = ref([])
const filteredMovies = ref([])
const genres = ref([])
const loadingMovies = ref(true)
const searchQuery = ref('')
const currentFilter = ref('all')
const selectedGenre = ref('')
const selectedYear = ref('') // Agrega el estado para el año
const allMoviesLoaded = ref(false)
const selectedMovie = ref(null)
const gridApi = ref(null)
const paginationPageSize = 20

const pagination = ref({
  currentPage: 1,
  pageSize: 20
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredMovies.value.length / pagination.value.pageSize)))

const paginatedMovies = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  return filteredMovies.value.slice(start, start + pagination.value.pageSize)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisiblePages = 5
  const startPage = Math.max(1, pagination.value.currentPage - Math.floor(maxVisiblePages / 2))
  const endPage = Math.min(totalPages.value, startPage + maxVisiblePages - 1)
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  if (pages.length === 0) pages.push(1)
  return pages
})

const goToPage = (page) => {
  if (typeof page === "number" && page >= 1 && page <= totalPages.value) {
    pagination.value.currentPage = page
  }
}

// Configuración de AG Grid
const defaultColDef = {
  sortable: true,
  resizable: true,
  filter: true,
  flex: 1,
  minWidth: 100,
  maxWidth: 500
}

const columnDefs = computed(() => [
  {
    headerName: 'Poster',
    field: 'poster_path',
    cellRenderer: (params) => 
      params.value 
        ? `<img src="https://image.tmdb.org/t/p/w300${params.value}" alt="Poster" style="height: 200px; width: auto; border-radius: 8px;"/>`
        : '<div style="height: 200px; display: flex; align-items: center; justify-content: center; color: var(--ag-secondary-foreground-color, #888);">No image</div>',
    width: 150,
    sortable: false,
    filter: false,
    cellStyle: { 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }
  },
  {
    headerName: 'Título',
    field: 'title',
    cellStyle: { 
      fontWeight: 'bold',
      whiteSpace: 'normal',
      display: 'flex',
      alignItems: 'center'
    },
    flex: 1,
    minWidth: 200
  },
  {
    headerName: 'Año',
    field: 'release_date',
    valueFormatter: (params) => 
      params.value ? new Date(params.value).getFullYear() : 'N/A',
    width: 100,
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  },
  {
     headerName: 'Rating',
    field: 'vote_average',
    valueFormatter: (params) => params.value?.toFixed(1) || 'N/A',
    width: 100,
    cellStyle: (params) => ({
      'color': params.value >= 7 ? 'green' : params.value >= 5 ? 'orange' : 'red',
      'font-weight': 'bold',
      'display': 'flex',
      'align-items': 'center',
      'justify-content': 'center'
    })
  },
  {
    headerName: 'Géneros',
    field: 'genre_ids',
    valueFormatter: (params) => {
      const ids = params.value
      if (!ids || !Array.isArray(ids)) return ''
      return ids
        .map(id => genres.value.find(g => g.id === id)?.name)
        .filter(Boolean)
        .join(', ')
    },
    cellStyle: {
      whiteSpace: 'normal',
      display: 'flex',
      alignItems: 'center'
    },
    flex: 1,
    minWidth: 200
  }
])

const getRowHeight = () => 220

const onGridReady = (params) => {
  gridApi.value = params.api;
  nextTick(() => {
    params.api.sizeColumnsToFit();
    
    // Agrega un listener para redimensionar cuando cambie el tamaño de la ventana
    window.addEventListener('resize', () => {
      setTimeout(() => params.api.sizeColumnsToFit(), 200);
    });
  });
}

// Ya NO uses setRowData en ningún lado

const onCellClicked = (params) => {
  if (params.column && params.data) {
    selectedMovie.value = params.data
  }
}

watch([filteredMovies, totalPages], () => {
  if (pagination.value.currentPage > totalPages.value) {
    pagination.value.currentPage = totalPages.value
  }
  if (pagination.value.currentPage < 1) {
    pagination.value.currentPage = 1
  }
})

onMounted(() => {
  fetchGenres().then(fetchMovies)
})

// Métodos
const exportToCSV = () => {
  if (viewMode.value === 'cards') {
    if (!filteredMovies.value.length) return alert('No hay datos para exportar')
    const headers = ['Título', 'Año', 'Rating', 'Géneros', 'Descripción']
    const data = filteredMovies.value.map(movie => [
      `"${movie.title}"`,
      movie.release_date?.substring(0, 4) || 'N/A',
      movie.vote_average?.toFixed(1) || 'N/A',
      `"${movie.genre_ids.map(id => getGenreName(id)).join(', ')}"`,
      `"${movie.overview?.replace(/"/g, '""') || 'Descripción no disponible'}"`
    ])
    const csvContent = [headers.join(','), ...data.map(row => row.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'peliculas.csv'
    link.click()
  } else {
    if (gridApi.value) {
      gridApi.value.exportDataAsCsv({
        fileName: 'peliculas.csv',
        columnSeparator: ',',
        processCellCallback: (params) => {
          if (params.column.getColDef().field === 'genre_ids') {
            return params.value?.map(id => 
              genres.value.find(g => g.id === id)?.name
            ).filter(Boolean).join(', ') || ''
          }
          return params.value
        }
      })
    }
  }
}

const fetchAllPossibleMovies = async () => {
  try {
    loadingMovies.value = true
    const moviesData = await api.getAllMovies(200)
    if (!moviesData || moviesData.length === 0) {
      console.warn("No se recibieron datos de películas.")
      return
    }
    movies.value = [...new Map(moviesData.map(m => [m.id, m])).values()]
    filteredMovies.value = [...movies.value]
  } catch (e) {
    console.error("Error al obtener películas:", e)
  } finally {
    loadingMovies.value = false
  }
}

const fetchMovies = async () => {
  if (currentFilter.value === 'all') return fetchAllPossibleMovies()
  try {
    loadingMovies.value = true
    let response
    switch (currentFilter.value) {
      case 'top_rated':
        response = await api.getTopRatedMovies(); break
      case 'upcoming':
        response = await api.getUpcomingMovies(); break
      case 'now_playing':
        response = await api.getNowPlayingMovies(); break
      default:
        response = await api.getPopularMovies()
    }
    movies.value = response.data.results
    filteredMovies.value = [...movies.value]
    allMoviesLoaded.value = true
  } catch (e) {
    console.error(e)
  } finally {
    loadingMovies.value = false
  }
}

const normalizeText = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

const filterMovies = () => {
  let results = [...movies.value]
  if (searchQuery.value) {
    const normalizedSearch = normalizeText(searchQuery.value)
    results = results.filter(movie => 
      normalizeText(movie.title).includes(normalizedSearch)
    )
  }
  if (selectedGenre.value) {
    results = results.filter(movie => movie.genre_ids.includes(parseInt(selectedGenre.value)))
  }
  if (selectedYear.value) { // Aplica el filtro por año
    results = results.filter(movie => 
      movie.release_date && movie.release_date.startsWith(selectedYear.value)
    )
  }
  filteredMovies.value = results
  resetPagination()
}

const filterByGenre = () => filterMovies()
const clearFilters = () => { searchQuery.value = ''; selectedGenre.value = ''; filterMovies() }
const resetPagination = () => { pagination.value.currentPage = 1 }
const nextPage = () => { if (pagination.value.currentPage < totalPages.value) pagination.value.currentPage++ }
const prevPage = () => { if (pagination.value.currentPage > 1) pagination.value.currentPage-- }
const loadMoreMovies = async () => { totalPagesToLoad.value += 3; await fetchAllPossibleMovies() }

const handleImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/500x750?text=Poster+no+disponible'
}

const fetchGenres = async () => {
  try {
    const response = await api.getGenres()
    genres.value = response.data.genres
  } catch (e) {
    console.error(e)
  }
}

const getGenreName = (id) => genres.value.find(g => g.id === id)?.name || 'Desconocido'
const toggleDarkMode = () => { darkMode.value = !darkMode.value }
const toggleView = () => { viewMode.value = viewMode.value === 'cards' ? 'table' : 'cards' }

</script>

<style>
.dark {
  color-scheme: dark;
}

.pagination-container {
  @apply flex justify-center items-center gap-2 mt-8;
}

.pagination-button {
  @apply px-4 py-2 rounded-md transition-colors;
  @apply bg-gray-200 text-gray-800 hover:bg-gray-300;
  @apply dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600;
}

.pagination-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.pagination-button.active {
  @apply bg-blue-500 text-white dark:bg-blue-600;
}

.ag-theme-alpine, .ag-theme-alpine-dark {
  --ag-font-size: 14px;
  --ag-grid-size: 8px;
  --ag-list-item-height: 24px;
}

.ag-theme-alpine-dark {
  --ag-background-color: theme('colors.gray.900');
  --ag-foreground-color: theme('colors.gray.100');
  --ag-header-background-color: theme('colors.gray.800');
  --ag-row-hover-color: theme('colors.gray.700');
  --ag-border-color: theme('colors.gray.600');
}

.ag-theme-alpine {
  --ag-background-color: theme('colors.white');
  --ag-foreground-color: theme('colors.gray.800');
  --ag-header-background-color: theme('colors.gray.100');
  --ag-row-hover-color: theme('colors.gray.50');
  --ag-border-color: theme('colors.gray.200');
}

.ag-theme-alpine-dark .ag-cell {
    background-color: #1a1d2e;
    color: white;
}

.ag-theme-alpine-dark .ag-row-hover {
    background-color: #bbbbbb;
}

.ag-theme-alpine-dark .ag-header {
    background-color: #0B0B45; 
    color: white;
}

.ag-theme-alpine-dark .ag-header-cell {
    background-color: #0B0B45;
    color: white;
    border-bottom: 1px solid #02075d; 
}

.ag-theme-alpine-dark .ag-header-cell-label {
    font-weight: bold;
    text-transform: uppercase;
}

/* Estilos normales */
.scroll-container {
  background-color: white;
  color: black;
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .scroll-container {
    background-color: #222;
    color: white;
  }

  /* Personalizar el scrollbar */
  .scroll-container::-webkit-scrollbar {
    background-color: #333; /* Color del fondo del scrollbar */
  }

  .scroll-container::-webkit-scrollbar-thumb {
    background-color: #666; /* Color del "pulgar" del scrollbar */
  }
}
</style>