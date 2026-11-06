<template>
  <div class="flex flex-col gap-6 w-full animate-fade-in font-sans relative select-none">
    <!-- Toast Notification -->
    <Toast 
      :message="toastMessage" 
      :type="toastType" 
      @close="toastMessage = null" 
    />

    <!-- HEADER BAR -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Tags class="w-4.5 h-4.5" />
          </div>
          <h1 class="text-2xl md:text-3xl font-black text-primary tracking-tight">
            {{ $t('categories.title') }}
          </h1>
        </div>
        <p class="text-sm text-on-surface-variant font-medium mt-1">
          {{ $t('categories.subtitle') }}
        </p>
      </div>

      <div class="flex items-center gap-2.5 shrink-0 flex-wrap">
        <!-- Reset to Defaults Button -->
        <button 
          v-if="canManage"
          @click="showResetModal = true"
          class="h-11 px-4 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container-high active:scale-[0.98] font-bold text-sm flex items-center gap-2 cursor-pointer transition-all bg-surface-container-lowest shadow-2xs"
          :title="$t('categories.resetDefaults')"
        >
          <RotateCcw class="w-4 h-4 text-outline" />
          <span class="hidden sm:inline">{{ $t('categories.resetDefaults') }}</span>
        </button>

        <!-- Add Category Button -->
        <button 
          v-if="canCreate"
          @click="openAddModal"
          class="h-11 px-5 rounded-xl bg-primary text-on-primary hover:bg-opacity-95 active:scale-[0.98] font-bold text-sm flex items-center gap-2 cursor-pointer transition-all shadow-sm"
        >
          <Plus class="w-4 h-4" />
          <span>{{ $t('categories.addNewCategory') }}</span>
        </button>
      </div>
    </div>

    <!-- STATS CARDS -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-outline uppercase tracking-wider">{{ $t('categories.totalCategories') }}</p>
          <p class="text-2xl font-black text-on-surface mt-1">{{ totalCategoriesCount }}</p>
        </div>
        <div class="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Tags class="w-5 h-5" />
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-outline uppercase tracking-wider">{{ $t('categories.activeCategories') }}</p>
          <p class="text-2xl font-black text-emerald-600 mt-1">{{ activeCategoriesCount }}</p>
        </div>
        <div class="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 class="w-5 h-5" />
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-outline uppercase tracking-wider">{{ $t('categories.totalProducts') }}</p>
          <p class="text-2xl font-black text-blue-600 mt-1">{{ totalCategorizedProducts }}</p>
        </div>
        <div class="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Package class="w-5 h-5" />
        </div>
      </div>
    </div>

    <!-- SEARCH & FILTER BAR -->
    <div class="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant flex flex-col md:flex-row items-center gap-3 shadow-xs">
      <div class="relative w-full md:flex-1">
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 w-4.5 h-4.5" />
        <input 
          type="text"
          v-model="searchQuery"
          :placeholder="$t('categories.searchPlaceholder')"
          class="w-full h-11 pl-10 pr-4 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm font-medium transition-all text-on-surface placeholder:text-on-surface-variant/40"
        />
      </div>

      <div class="flex items-center gap-2.5 w-full md:w-auto">
        <!-- Status Filter -->
        <div class="relative w-full sm:w-44 shrink-0">
          <select
            v-model="statusFilter"
            class="w-full h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-xs font-bold appearance-none cursor-pointer text-on-surface"
          >
            <option value="ALL">{{ $t('categories.allStatus') }}</option>
            <option value="ACTIVE">{{ $t('common.active') }}</option>
            <option value="INACTIVE">{{ $t('common.inactive') }}</option>
          </select>
          <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/60 text-xs font-bold font-mono">▼</div>
        </div>

        <!-- Refresh Button -->
        <button
          @click="fetchCategories"
          :disabled="loading"
          class="h-11 w-11 rounded-xl border border-outline-variant bg-surface hover:bg-surface-container-high flex items-center justify-center text-outline hover:text-primary transition-colors cursor-pointer shrink-0"
          title="Refresh categories"
        >
          <RotateCcw class="w-4 h-4" :class="loading ? 'animate-spin text-primary' : ''" />
        </button>
      </div>
    </div>

    <!-- CATEGORIES TABLE -->
    <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden shadow-xs">
      <div v-if="loading && categories.length === 0" class="py-20 flex flex-col items-center justify-center gap-3">
        <div class="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p class="text-xs font-bold text-outline">Loading categories...</p>
      </div>

      <div v-else-if="filteredCategories.length === 0" class="py-20 px-4 text-center flex flex-col items-center justify-center max-w-md mx-auto">
        <div class="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center text-outline mb-3">
          <Tags class="w-7 h-7" />
        </div>
        <h3 class="text-base font-bold text-on-surface">{{ $t('categories.emptyTitle') }}</h3>
        <p class="text-xs text-on-surface-variant mt-1 leading-relaxed">{{ $t('categories.emptySubtitle') }}</p>
        <div class="flex items-center gap-3 mt-4">
          <button 
            v-if="canManage"
            @click="showResetModal = true"
            class="px-4 py-2 rounded-xl border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            {{ $t('categories.resetDefaults') }}
          </button>
          <button 
            v-if="canCreate"
            @click="openAddModal"
            class="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-opacity-90 transition-colors cursor-pointer"
          >
            {{ $t('categories.addNewCategory') }}
          </button>
        </div>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="border-b border-outline-variant bg-surface-container-low text-on-surface-variant font-bold uppercase tracking-wider text-[11px]">
              <th class="py-3 px-4">{{ $t('categories.colOrder') }}</th>
              <th class="py-3 px-4">{{ $t('categories.colName') }}</th>
              <th class="py-3 px-4">{{ $t('categories.colCode') }}</th>
              <th class="py-3 px-4">{{ $t('categories.colDescription') }}</th>
              <th class="py-3 px-4 text-center">{{ $t('categories.colProducts') }}</th>
              <th class="py-3 px-4 text-center">{{ $t('categories.colStatus') }}</th>
              <th class="py-3 px-4 text-right">{{ $t('categories.colActions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/60">
            <tr 
              v-for="cat in filteredCategories" 
              :key="cat.id" 
              class="hover:bg-surface-container-low/40 transition-colors group"
            >
              <!-- Order -->
              <td class="py-3 px-4 font-mono font-bold text-outline w-16">
                #{{ cat.displayOrder ?? '-' }}
              </td>

              <!-- Name & Color -->
              <td class="py-3 px-4">
                <div class="flex items-center gap-2.5">
                  <span 
                    class="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs border border-black/10" 
                    :style="{ backgroundColor: cat.color || '#6B7280' }"
                    :title="cat.color || '#6B7280'"
                  ></span>
                  <span class="font-bold text-on-surface text-sm">{{ cat.name }}</span>
                </div>
              </td>

              <!-- Code -->
              <td class="py-3 px-4">
                <span v-if="cat.code" class="px-2 py-0.5 rounded-md font-mono font-bold text-[10px] bg-surface-container-high text-on-surface border border-outline-variant uppercase">
                  {{ cat.code }}
                </span>
                <span v-else class="text-outline/60 italic text-[11px]">-</span>
              </td>

              <!-- Description -->
              <td class="py-3 px-4 max-w-xs">
                <p class="truncate text-on-surface-variant" :title="cat.description || ''">
                  {{ cat.description || '-' }}
                </p>
              </td>

              <!-- Products Count -->
              <td class="py-3 px-4 text-center">
                <router-link
                  v-if="(cat.productCount ?? 0) > 0"
                  :to="`/inventory`"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  :title="$t('categories.viewProducts')"
                >
                  <Package class="w-3 h-3" />
                  <span>{{ cat.productCount }}</span>
                </router-link>
                <span v-else class="inline-flex items-center px-2 py-0.5 rounded-full font-medium text-outline text-[11px] bg-surface-container-high">
                  0
                </span>
              </td>

              <!-- Status -->
              <td class="py-3 px-4 text-center">
                <span 
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider"
                  :class="cat.isActive !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-surface-container-high text-outline border border-outline-variant'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="cat.isActive !== false ? 'bg-emerald-500' : 'bg-outline'"></span>
                  {{ cat.isActive !== false ? $t('common.active') : $t('common.inactive') }}
                </span>
              </td>

              <!-- Actions -->
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button 
                    v-if="canEdit"
                    @click="openEditModal(cat)"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer"
                    :title="$t('categories.editCategory')"
                  >
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button 
                    v-if="canDelete"
                    @click="openDeleteModal(cat)"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    :title="$t('categories.deleteCategory')"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ADD / EDIT CATEGORY MODAL -->
    <div 
      v-if="showAddModal || showEditModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
      @click.self="closeFormModal"
    >
      <div class="w-full max-w-lg bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <!-- Modal Header -->
        <div class="px-5 py-4 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-low">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Tags class="w-4 h-4" />
            </div>
            <h3 class="text-base font-black text-on-surface">
              {{ showEditModal ? $t('categories.editCategory') : $t('categories.addNewCategory') }}
            </h3>
          </div>
          <button 
            @click="closeFormModal"
            class="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <X class="w-4.5 h-4.5" />
          </button>
        </div>

        <!-- Modal Body Form -->
        <form @submit.prevent="submitForm" class="p-5 overflow-y-auto flex flex-col gap-4">
          <!-- Name Field (Required) -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
              <span>{{ $t('categories.categoryName') }}</span>
              <span class="text-rose-500">*</span>
            </label>
            <input 
              type="text"
              v-model="form.name"
              required
              :placeholder="$t('categories.categoryNamePlaceholder')"
              class="w-full h-10 px-3 rounded-xl border border-outline-variant bg-surface text-sm font-medium text-on-surface outline-none focus:border-primary transition-all placeholder:text-on-surface-variant/40"
            />
          </div>

          <!-- Code & Display Order Row -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {{ $t('categories.categoryCode') }}
              </label>
              <input 
                type="text"
                v-model="form.code"
                maxlength="50"
                :placeholder="$t('categories.categoryCodePlaceholder')"
                class="w-full h-10 px-3 rounded-xl border border-outline-variant bg-surface text-sm font-mono uppercase text-on-surface outline-none focus:border-primary transition-all placeholder:text-on-surface-variant/40"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {{ $t('categories.displayOrder') }}
              </label>
              <input 
                type="number"
                v-model.number="form.displayOrder"
                min="0"
                class="w-full h-10 px-3 rounded-xl border border-outline-variant bg-surface text-sm font-mono text-on-surface outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <!-- Color Swatch Palette -->
          <div class="flex flex-col gap-2">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center justify-between">
              <span>{{ $t('categories.color') }}</span>
              <span class="font-mono text-[11px] text-outline">{{ form.color }}</span>
            </label>
            
            <div class="flex items-center gap-2 flex-wrap">
              <button
                v-for="color in presetColors"
                :key="color"
                type="button"
                @click="form.color = color"
                class="w-7 h-7 rounded-full border-2 transition-transform cursor-pointer relative"
                :style="{ backgroundColor: color }"
                :class="form.color.toLowerCase() === color.toLowerCase() ? 'scale-115 border-white shadow-md ring-2 ring-primary' : 'border-transparent hover:scale-105'"
              >
              </button>

              <!-- Native color picker -->
              <div class="relative w-7 h-7 rounded-full overflow-hidden border border-outline-variant flex items-center justify-center cursor-pointer hover:scale-105 transition-transform" title="Custom color">
                <input 
                  type="color" 
                  v-model="form.color" 
                  class="absolute -inset-2 w-12 h-12 cursor-pointer opacity-0"
                />
                <Palette class="w-4 h-4 text-outline pointer-events-none" />
              </div>
            </div>
          </div>

          <!-- Description Field -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              {{ $t('categories.description') }}
            </label>
            <textarea 
              v-model="form.description"
              rows="3"
              maxlength="255"
              :placeholder="$t('categories.descriptionPlaceholder')"
              class="w-full p-3 rounded-xl border border-outline-variant bg-surface text-xs font-medium text-on-surface outline-none focus:border-primary transition-all resize-none placeholder:text-on-surface-variant/40"
            ></textarea>
          </div>

          <!-- Active Toggle -->
          <div class="p-3.5 rounded-xl border border-outline-variant bg-surface-container-low flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-on-surface">{{ $t('categories.isActive') }}</p>
              <p class="text-[11px] text-outline font-medium mt-0.5">{{ $t('categories.isActiveDesc') }}</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="form.isActive" class="sr-only peer">
              <div class="w-10 h-6 bg-outline-variant/60 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <!-- Modal Footer Actions -->
          <div class="pt-3 border-t border-outline-variant/60 flex items-center justify-end gap-2.5">
            <button 
              type="button" 
              @click="closeFormModal"
              class="px-4 py-2.5 rounded-xl border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              {{ $t('common.cancel') }}
            </button>
            <button 
              type="submit"
              :disabled="isSubmitting || !form.name.trim()"
              class="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-opacity-95 transition-all cursor-pointer flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isSubmitting" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>{{ showEditModal ? $t('categories.updateCategory') : $t('categories.saveCategory') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- DELETE CATEGORY CONFIRMATION MODAL -->
    <div 
      v-if="showDeleteModal && categoryToDelete"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
      @click.self="showDeleteModal = false"
    >
      <div class="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-2xl overflow-hidden p-6 flex flex-col gap-4">
        <div class="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <Trash2 class="w-6 h-6" />
        </div>

        <div>
          <h3 class="text-base font-black text-on-surface">
            {{ $t('categories.deleteCategoryConfirmTitle', { name: categoryToDelete.name }) }}
          </h3>
          <p class="text-xs text-on-surface-variant mt-1 leading-relaxed">
            {{ $t('categories.deleteCategoryConfirmDesc') }}
          </p>
        </div>

        <!-- Warning if products are assigned -->
        <div 
          v-if="(categoryToDelete.productCount ?? 0) > 0"
          class="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 leading-relaxed"
        >
          <AlertTriangle class="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
          <span>{{ $t('categories.cannotDeleteWithProducts', { count: categoryToDelete.productCount ?? 0 }) }}</span>
        </div>

        <!-- Backend Error Banner if any -->
        <div 
          v-if="deleteError"
          class="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 leading-relaxed"
        >
          <AlertTriangle class="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
          <span>{{ deleteError }}</span>
        </div>

        <div class="pt-2 flex items-center justify-end gap-2.5">
          <button 
            @click="showDeleteModal = false"
            class="px-4 py-2.5 rounded-xl border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            {{ $t('common.cancel') }}
          </button>
          <button 
            @click="confirmDelete"
            :disabled="isDeleting || (categoryToDelete.productCount ?? 0) > 0"
            class="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-all cursor-pointer flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isDeleting" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span>{{ $t('categories.deleteCategory') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- RESET TO DEFAULTS CONFIRMATION MODAL -->
    <div 
      v-if="showResetModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
      @click.self="showResetModal = false"
    >
      <div class="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-2xl overflow-hidden p-6 flex flex-col gap-4">
        <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <RotateCcw class="w-6 h-6" />
        </div>

        <div>
          <h3 class="text-base font-black text-on-surface">
            {{ $t('categories.resetDefaultsConfirmTitle') }}
          </h3>
          <p class="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
            {{ $t('categories.resetDefaultsConfirmDesc') }}
          </p>
        </div>

        <div class="pt-2 flex items-center justify-end gap-2.5">
          <button 
            @click="showResetModal = false"
            class="px-4 py-2.5 rounded-xl border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            {{ $t('common.cancel') }}
          </button>
          <button 
            @click="confirmResetDefaults"
            :disabled="isResetting"
            class="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-opacity-95 transition-all cursor-pointer flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isResetting" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span>{{ $t('categories.resetDefaults') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  Tags, 
  Plus, 
  RotateCcw, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  Package, 
  Palette, 
  X, 
  AlertTriangle 
} from 'lucide-vue-next';
import Toast from '@/components/common/Toast.vue';
import { useAppViewModel } from '@/viewmodels/useAppViewModel';
import { t } from '@/i18n';
import { 
  productCategoryService, 
  type ProductCategory, 
  type ProductCategoryCreateRequest,
  type ProductCategoryUpdateRequest 
} from '@/services/productCategoryService';

const vm = useAppViewModel();

const categories = ref<ProductCategory[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const statusFilter = ref<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

// Modals
const showAddModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const showResetModal = ref(false);

const categoryToDelete = ref<ProductCategory | null>(null);
const categoryToEdit = ref<ProductCategory | null>(null);
const deleteError = ref<string | null>(null);

const isSubmitting = ref(false);
const isDeleting = ref(false);
const isResetting = ref(false);

// Toast
const toastMessage = ref<string | null>(null);
const toastType = ref<'success' | 'error' | 'info'>('success');

const showFeedback = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
  toastMessage.value = msg;
  toastType.value = type;
};

// Preset colors for quick styling
const presetColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#6B7280'  // Gray
];

// Form state
const form = ref({
  name: '',
  code: '',
  description: '',
  color: '#3B82F6',
  displayOrder: 1,
  isActive: true
});

// Permissions
const canCreate = computed(() => 
  vm.userRole.value === 'ADMIN' || vm.userRole.value === 'SUPER_ADMIN' || vm.hasPermission('inventory:create')
);
const canEdit = computed(() => 
  vm.userRole.value === 'ADMIN' || vm.userRole.value === 'SUPER_ADMIN' || vm.hasPermission('inventory:edit')
);
const canDelete = computed(() => 
  vm.userRole.value === 'ADMIN' || vm.userRole.value === 'SUPER_ADMIN' || vm.hasPermission('inventory:delete')
);
const canManage = computed(() => 
  canCreate.value || canEdit.value || canDelete.value
);

// Stats
const totalCategoriesCount = computed(() => categories.value.length);
const activeCategoriesCount = computed(() => categories.value.filter(c => c.isActive !== false).length);
const totalCategorizedProducts = computed(() => 
  categories.value.reduce((acc, c) => acc + Number(c.productCount || 0), 0)
);

// Filtering
const filteredCategories = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return categories.value.filter(cat => {
    // Status filter
    if (statusFilter.value === 'ACTIVE' && cat.isActive === false) return false;
    if (statusFilter.value === 'INACTIVE' && cat.isActive !== false) return false;

    // Search query
    if (!q) return true;
    const nameMatch = (cat.name || '').toLowerCase().includes(q);
    const codeMatch = (cat.code || '').toLowerCase().includes(q);
    const descMatch = (cat.description || '').toLowerCase().includes(q);
    return nameMatch || codeMatch || descMatch;
  });
});

const fetchCategories = async () => {
  loading.value = true;
  try {
    const list = await productCategoryService.getCategories();
    categories.value = list || [];
  } catch (err: any) {
    showFeedback(err.message || 'Failed to fetch categories', 'error');
  } finally {
    loading.value = false;
  }
};

const openAddModal = () => {
  form.value = {
    name: '',
    code: '',
    description: '',
    color: presetColors[categories.value.length % presetColors.length] || '#3B82F6',
    displayOrder: categories.value.length + 1,
    isActive: true
  };
  showAddModal.value = true;
};

const openEditModal = (cat: ProductCategory) => {
  categoryToEdit.value = cat;
  form.value = {
    name: cat.name || '',
    code: cat.code || '',
    description: cat.description || '',
    color: cat.color || '#3B82F6',
    displayOrder: cat.displayOrder ?? 1,
    isActive: cat.isActive !== false
  };
  showEditModal.value = true;
};

const closeFormModal = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  categoryToEdit.value = null;
};

const submitForm = async () => {
  const name = form.value.name.trim();
  if (!name) return;

  isSubmitting.value = true;
  try {
    if (showEditModal.value && categoryToEdit.value) {
      const updatePayload: ProductCategoryUpdateRequest = {
        name,
        code: form.value.code.trim().toUpperCase() || undefined,
        description: form.value.description.trim() || undefined,
        color: form.value.color.trim() || undefined,
        displayOrder: form.value.displayOrder,
        isActive: form.value.isActive
      };
      await productCategoryService.updateCategory(categoryToEdit.value.id, updatePayload);
      showFeedback(t('categories.categoryUpdatedSuccess'), 'success');
    } else {
      const createPayload: ProductCategoryCreateRequest = {
        name,
        code: form.value.code.trim().toUpperCase() || undefined,
        description: form.value.description.trim() || undefined,
        color: form.value.color.trim() || undefined,
        displayOrder: form.value.displayOrder,
        isActive: form.value.isActive
      };
      await productCategoryService.createCategory(createPayload);
      showFeedback(t('categories.categoryCreatedSuccess'), 'success');
    }
    closeFormModal();
    await fetchCategories();
  } catch (err: any) {
    showFeedback(err.message || 'Operation failed', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const openDeleteModal = (cat: ProductCategory) => {
  categoryToDelete.value = cat;
  deleteError.value = null;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (!categoryToDelete.value) return;

  isDeleting.value = true;
  deleteError.value = null;
  try {
    await productCategoryService.deleteCategory(categoryToDelete.value.id);
    showFeedback(t('categories.categoryDeletedSuccess'), 'success');
    showDeleteModal.value = false;
    categoryToDelete.value = null;
    await fetchCategories();
  } catch (err: any) {
    deleteError.value = err.message || 'Cannot delete category';
  } finally {
    isDeleting.value = false;
  }
};

const confirmResetDefaults = async () => {
  isResetting.value = true;
  try {
    await productCategoryService.resetDefaults();
    showFeedback(t('categories.defaultsResetSuccess'), 'success');
    showResetModal.value = false;
    await fetchCategories();
  } catch (err: any) {
    showFeedback(err.message || 'Failed to reset categories', 'error');
  } finally {
    isResetting.value = false;
  }
};

onMounted(() => {
  fetchCategories();
});
</script>
