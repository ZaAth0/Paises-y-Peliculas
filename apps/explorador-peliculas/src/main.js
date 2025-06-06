import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

// Registra todos los módulos comunitarios
ModuleRegistry.registerModules([AllCommunityModule]);

createApp(App).mount('#app')