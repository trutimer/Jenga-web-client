<template>
  <div class="max-w-7xl mx-auto py-2 font-sans select-none animate-fade-up">
    
    <!-- HEADER SECTION -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-surface">
      <div>
        <h1 class="text-[32px] font-bold text-on-surface tracking-tight leading-tight">Product Inventory</h1>
        <p class="text-sm text-on-surface-variant mt-1">Manage catalog, pricing, and stock levels across branches.</p>
      </div>
      
      <!-- ACTION BUTTONS -->
      <div class="flex items-center gap-3">
        <button 
          @click="showImportModal = true"
          class="h-10 px-4 rounded-lg border border-outline hover:bg-surface-container-low text-on-surface-variant font-medium text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm text-center bg-surface-container-lowest"
        >
          <Upload class="w-4 h-4 text-on-surface-variant" />
          <span>Bulk Import</span>
        </button>
        
        <button 
          @click="alertExport"
          class="h-10 px-4 rounded-lg border border-outline hover:bg-surface-container-low text-on-surface-variant font-medium text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm text-center bg-surface-container-lowest"
        >
          <Download class="w-4 h-4 text-on-surface-variant" />
          <span>Export</span>
        </button>
        
        <button 
          @click="showAddModal = true"
          class="h-10 px-4.5 rounded-lg font-bold text-sm text-white flex items-center gap-2 transition-all cursor-pointer shadow-sm text-center border-0 bg-primary text-on-primary bg-primary text-on-primary">
          <Plus class="w-4.5 h-4.5 text-on-primary" />
          <span>Add Product</span>
        </button>
      </div>
    </div>

    <!-- MAIN SPLIT PANEL LAYOUT -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8 items-start border-t border-outline-variant/50 pt-7">
      
      <!-- LEFT COLUMN: FILTERS SECTION -->
      <div class="md:col-span-1 pr-2 space-y-7">
        <div class="flex justify-between items-center mb-1">
          <h2 class="text-xl font-bold text-on-surface">Filters</h2>
          <button 
            @click="handleResetFilters"
            class="text-sm font-semibold hover:opacity-80 cursor-pointer bg-transparent border-0 text-primary"
          >
            Reset
          </button>
        </div>

        <!-- FILTER: CATEGORY -->
        <div class="space-y-3.5">
          <span class="block text-[11px] font-bold text-outline uppercase tracking-widest">Category</span>
          
          <div class="space-y-2.5">
            <!-- Beverages Category line -->
            <label class="flex items-center gap-3 text-[13px] font-semibold text-on-surface-variant cursor-pointer">
              <div 
                @click="toggleCategory('Beverages')"
                class="w-5 h-5 rounded-md border flex items-center justify-center transition-all bg-surface-container-lowest"
                :class="selectedCategories.includes('Beverages') ? 'border-0 bg-primary text-on-primary' : 'border-outline bg-surface-container-lowest text-transparent'"
              >
                <Check v-if="selectedCategories.includes('Beverages')" class="w-3.5 h-3.5 text-white" />
              </div>
              <span>Beverages ({{ countByCategory['Beverages'] || 0 }})</span>
            </label>

            <!-- Snacks Category line -->
            <label class="flex items-center gap-3 text-[13px] font-semibold text-on-surface-variant cursor-pointer">
              <div 
                @click="toggleCategory('Snacks')"
                class="w-5 h-5 rounded-md border flex items-center justify-center transition-all bg-surface-container-lowest"
                :class="selectedCategories.includes('Snacks') ? 'border-0 bg-primary text-on-primary' : 'border-outline bg-surface-container-lowest text-transparent'"
              >
                <Check v-if="selectedCategories.includes('Snacks')" class="w-3.5 h-3.5 text-white" />
              </div>
              <span>Snacks ({{ countByCategory['Snacks'] || 0 }})</span>
            </label>

            <!-- Dairy Category line -->
            <label class="flex items-center gap-3 text-[13px] font-semibold text-on-surface-variant cursor-pointer">
              <div 
                @click="toggleCategory('Dairy Products')"
                class="w-5 h-5 rounded-md border flex items-center justify-center transition-all bg-surface-container-lowest"
                :class="selectedCategories.includes('Dairy Products') ? 'border-0 bg-primary text-on-primary' : 'border-outline bg-surface-container-lowest text-transparent'"
              >
                <Check v-if="selectedCategories.includes('Dairy Products')" class="w-3.5 h-3.5 text-white" />
              </div>
              <span>Dairy & Fresh ({{ countByCategory['Dairy Products'] || 0 }})</span>
            </label>

            <!-- Household Category line -->
            <label class="flex items-center gap-3 text-[13px] font-semibold text-on-surface-variant cursor-pointer">
              <div 
                @click="toggleCategory('Household')"
                class="w-5 h-5 rounded-md border flex items-center justify-center transition-all bg-surface-container-lowest"
                :class="selectedCategories.includes('Household') ? 'border-0 bg-primary text-on-primary' : 'border-outline bg-surface-container-lowest text-transparent'"
              >
                <Check v-if="selectedCategories.includes('Household')" class="w-3.5 h-3.5 text-white" />
              </div>
              <span>Household ({{ countByCategory['Household'] || 0 }})</span>
            </label>

            <!-- Show Extra categories if any -->
            <template v-if="showAllCategories">
              <label 
                v-for="cat in extraCategories" 
                :key="cat" 
                class="flex items-center gap-3 text-[13px] font-semibold text-on-surface-variant cursor-pointer animate-fade-in"
              >
                <div 
                  @click="toggleCategory(cat)"
                  class="w-5 h-5 rounded-md border flex items-center justify-center transition-all bg-surface-container-lowest"
                  :class="selectedCategories.includes(cat) ? 'border-0 bg-primary text-on-primary' : 'border-outline bg-surface-container-lowest text-transparent'"
                >
                  <Check v-if="selectedCategories.includes(cat)" class="w-3.5 h-3.5 text-white" />
                </div>
                <span>{{ cat }} ({{ countByCategory[cat] || 0 }})</span>
              </label>
            </template>

            <button 
              type="button" 
              @click="showAllCategories = !showAllCategories"
              class="text-[12px] font-bold text-on-surface-variant hover:text-on-surface flex items-center gap-1 mt-1 cursor-pointer bg-transparent border-0"
            >
              <span>{{ showAllCategories ? 'Show less' : 'Show all' }}</span>
              <ChevronDown class="w-3.5 h-3.5 transition-transform" :class="showAllCategories ? 'rotate-180' : ''" />
            </button>
          </div>
        </div>

        <hr class="border-outline-variant/65" />

        <!-- FILTER: STOCK STATUS -->
        <div class="space-y-3.5">
          <span class="block text-[11px] font-bold text-outline uppercase tracking-widest">Stock Status</span>
          
          <div class="space-y-3">
            <label 
              v-for="st in stockStatuses"
              :key="st.value"
              @click="selectStockStatus(st.value)"
              class="flex items-center gap-3 text-[13px] font-semibold cursor-pointer"
              :class="st.highlight ? 'text-error hover:text-error hover:text-error' : 'text-on-surface-variant hover:text-on-surface'"
            >
              <div class="w-5 h-5 rounded-full border border-outline flex items-center justify-center relative bg-surface-container-lowest">
                <div 
                  v-if="stockStatus === st.value"
                  class="w-2.5 h-2.5 rounded-full bg-primary text-on-primary"
                />
              </div>
              <span>{{ st.label }}</span>
            </label>
          </div>
        </div>

        <hr class="border-outline-variant/65" />

        <!-- FILTER: SUPPLIER SEARCH -->
        <div class="space-y-4">
          <span class="block text-[11px] font-bold text-outline uppercase tracking-widest">Supplier</span>
          
          <div class="relative">
            <Search class="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              v-model="supplierSearch"
              placeholder="Find supplier..."
              class="w-full bg-surface-container-low pl-9 pr-3 py-2 border border-outline-variant rounded-lg text-xs outline-none focus:border-primary transition-all font-semibold placeholder:text-outline text-on-surface"
            />
          </div>

          <div class="space-y-2.5 max-h-36 overflow-y-auto pr-1">
            <label 
              v-for="sup in suppliersList" 
              :key="sup" 
              class="flex items-center gap-3 text-[13px] font-semibold text-on-surface-variant cursor-pointer"
            >
              <div 
                @click="toggleSupplier(sup)"
                class="w-5 h-5 rounded-md border flex items-center justify-center transition-all bg-surface-container-lowest"
                :class="selectedSuppliers.includes(sup) ? 'border-0 bg-primary text-on-primary' : 'border-outline bg-surface-container-lowest text-transparent'"
              >
                <Check v-if="selectedSuppliers.includes(sup)" class="w-3.5 h-3.5 text-white" />
              </div>
              <span class="truncate">{{ sup }}</span>
            </label>

            <span v-if="suppliersList.length === 0" class="text-[11px] text-outline italic font-medium block">
              No suppliers match
            </span>
          </div>
        </div>

      </div>

      <!-- RIGHT COLUMN: LISTING AREA -->
      <div class="md:col-span-3 border-l border-outline-variant/50 pl-2 md:pl-8 space-y-5">
        
        <!-- ACTIVE FILTER BADGES ROW -->
        <div class="flex items-center gap-3 text-sm select-none">
          <span class="text-on-surface-variant font-medium">Active:</span>
          
          <div class="flex flex-wrap gap-2">
            <div 
              v-for="cat in selectedCategories" 
              :key="cat" 
              class="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container text-on-surface-variant rounded-full text-xs font-bold border border-outline-variant/50"
            >
              <span>Category: {{ cat }}</span>
              <button 
                @click="toggleCategory(cat)"
                class="text-outline hover:text-on-surface-variant cursor-pointer ml-0.5 bg-transparent border-0"
              >
                <X class="w-3 h-3 stroke-[2.5px]" />
              </button>
            </div>

            <div 
              v-if="stockStatus !== 'All'" 
              class="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container text-on-surface-variant rounded-full text-xs font-bold border border-outline-variant/50"
            >
              <span>Status: {{ stockStatus }}</span>
              <button 
                @click="selectStockStatus('All')"
                class="text-outline hover:text-on-surface-variant cursor-pointer ml-0.5 bg-transparent border-0"
              >
                <X class="w-3 h-3 stroke-[2.5px]" />
              </button>
            </div>

            <div 
              v-for="sup in selectedSuppliers" 
              :key="sup" 
              class="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container text-on-surface-variant rounded-full text-xs font-bold border border-outline-variant/50"
            >
              <span class="truncate max-w-[120px]">Supplier: {{ sup }}</span>
              <button 
                @click="toggleSupplier(sup)"
                class="text-outline hover:text-on-surface-variant cursor-pointer ml-0.5 bg-transparent border-0"
              >
                <X class="w-3 h-3 stroke-[2.5px]" />
              </button>
            </div>

            <span 
              v-if="selectedCategories.length === 0 && stockStatus === 'All' && selectedSuppliers.length === 0" 
              class="text-xs text-outline font-medium italic"
            >
              No active filter overlays
            </span>
          </div>
        </div>

        <!-- TABLE CONTAINER CARD -->
        <div class="border border-outline-variant rounded-xl overflow-hidden shadow-sm bg-surface-container-lowest">
          <table class="w-full text-left border-collapse text-[13px] select-all">
            <thead class="bg-surface-container-lowest border-b border-outline-variant text-on-surface-variant font-mono text-[11px] uppercase select-none">
              <tr>
                <th class="p-4 pl-5 w-12 text-center">
                  <div class="w-[18px] h-[18px] rounded border border-outline flex items-center justify-center cursor-pointer bg-surface-container-lowest" />
                </th>
                <th class="p-4 pl-2 font-bold">Product Name & Barcode</th>
                <th class="p-4 font-bold">Category</th>
                <th class="p-4 text-center font-bold">QTY</th>
                <th class="p-4 text-center font-bold">Cost ({{ currency }})</th>
                <th class="p-4 text-center font-bold">Price ({{ currency }})</th>
                <th class="p-4 text-center font-bold">Wholesale ({{ currency }})</th>
                <th class="p-4 text-center font-bold">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr 
                v-for="p in paginatedProducts" 
                :key="p.id" 
                class="hover:bg-surface-container-low transition-all font-sans"
                :class="p.stock === 0 ? 'opacity-85 bg-surface-container/40 text-outline' : ''"
              >
                <!-- Checkbox -->
                <td class="p-4 pl-5 text-center select-none">
                  <div class="w-[18px] h-[18px] rounded border border-outline flex items-center justify-center cursor-pointer bg-surface-container-lowest" />
                </td>

                <!-- Product Name & SKU Barcode -->
                <td class="p-4 pl-2">
                  <span 
                    class="font-semibold text-on-surface block leading-snug"
                    :class="p.stock === 0 ? 'line-through text-outline/90' : ''"
                  >
                    {{ p.name }}
                  </span>
                  <span class="font-mono text-xs text-outline block mt-1">{{ p.barcode }}</span>
                </td>

                <!-- Category -->
                <td class="p-4 text-on-surface-variant font-medium">
                  {{ p.category }}
                </td>

                <!-- Quantity (QTY) -->
                <td class="p-4 text-center select-none">
                  <span 
                    class="px-2.5 py-1 rounded-full text-xs font-bold font-mono"
                    :class="p.stock === 0 ? 'bg-error-container text-error' : (p.stock <= p.minStock ? 'bg-warning-container text-warning' : 'bg-primary-container text-on-primary-container')"
                  >
                    {{ p.stock }}
                  </span>
                </td>

                <!-- Cost -->
                <td class="p-4 text-center font-mono select-all">
                  <span class="text-[13px] text-on-surface-variant block font-semibold">{{ formatCurrencyWithoutSymbol(p.cost, currency) }}</span>
                </td>

                <!-- Price -->
                <td class="p-4 text-center font-mono select-all">
                  <span 
                    class="text-[14px] block font-extrabold"
                    :class="p.stock === 0 ? 'text-outline' : 'text-primary'"
                  >
                    {{ formatCurrencyWithoutSymbol(p.price, currency) }}
                  </span>
                </td>

                <!-- Wholesale Price -->
                <td class="p-4 text-center font-mono select-all">
                  <span class="text-[13px] text-on-surface-variant block font-semibold">
                    {{ p.wholesalePrice ? formatCurrencyWithoutSymbol(p.wholesalePrice, currency) : 'N/A' }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="p-4 text-center select-none whitespace-nowrap">
                  <div class="flex items-center justify-center gap-2">
                    <button 
                      @click.stop="openEditModal(p)"
                      class="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-primary-container transition-colors cursor-pointer border-0 bg-transparent"
                      title="Edit Product"
                    >
                      <Pencil class="w-4.5 h-4.5" />
                    </button>
                    <button 
                      @click.stop="openRestockModal(p)"
                      class="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-primary-container transition-colors cursor-pointer border-0 bg-transparent"
                      title="Restock Inventory"
                    >
                      <PlusCircle class="w-4.5 h-4.5" />
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="filteredProducts.length === 0">
                <td colSpan="8" class="py-20 text-center select-none text-outline">
                  <ImageOff class="w-10 h-10 mx-auto text-outline-variant mb-2 stroke-[1.5px]" />
                  <p class="font-medium">No inventory rows match chosen conditions</p>
                  <button 
                    @click="handleResetFilters"
                    class="text-sm font-semibold underline mt-1 cursor-pointer bg-transparent border-0 text-primary"
                  >
                    Clear active filtering rows
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- BOTTOM PAGINATION CONTROLLER CARD -->
          <div class="p-4 bg-surface-container-lowest border-t border-outline-variant/50 flex flex-col sm:flex-row justify-between items-center gap-4 select-none">
            <div class="text-sm text-on-surface-variant font-medium">
              Showing {{ filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1 }} to
              {{ Math.min(currentPage * itemsPerPage, filteredProducts.length) }} of {{ filteredProducts.length }} entries
            </div>

            <!-- Pagination buttons -->
            <div class="flex items-center gap-1.5 font-sans">
              <button 
                :disabled="currentPage === 1"
                @click="currentPage = Math.max(1, currentPage - 1)"
                class="w-8 h-8 rounded border border-outline-variant flex items-center justify-center hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer bg-surface-container-lowest"
              >
                <ChevronLeft class="w-4 h-4 text-on-surface-variant" />
              </button>

              <button
                v-for="pg in totalPages"
                :key="pg"
                @click="currentPage = pg"
                class="w-8 h-8 rounded border flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
                :class="currentPage === pg ? 'bg-primary border-primary text-on-primary' : 'bg-transparent border-outline-variant text-on-surface-variant'"
              >
                {{ pg }}
              </button>

              <button 
                :disabled="currentPage === totalPages"
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                class="w-8 h-8 rounded border border-outline-variant flex items-center justify-center hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer bg-surface-container-lowest"
              >
                <ChevronRight class="w-4 h-4 text-on-surface-variant" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>

    <!-- MODAL 1: ADD PRODUCT FORM -->
    <div v-if="showAddModal" class="fixed inset-0 bg-surface-container-highest/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div class="w-full max-w-lg bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/50 overflow-hidden font-sans">
        <div class="px-6 py-4.5 border-b border-outline-variant/50 flex justify-between items-center">
          <h2 class="text-[17px] font-bold text-on-surface">Add New Product Catalog</h2>
          <button 
            @click="showAddModal = false"
            class="text-outline hover:text-on-surface-variant cursor-pointer bg-transparent border-0"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleAddProduct" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5 col-span-2">
              <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Product Display Title *</label>
              <input 
                type="text"
                required
                v-model="newProdName"
                placeholder="Ex. Premium Potato Chips"
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm font-medium outline-none text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Barcode SKU Code</label>
              <input 
                type="text"
                v-model="newProdBarcode"
                placeholder="Ex. 847291038472"
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm font-mono outline-none text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Category Segment</label>
              <select 
                v-model="newProdCategory"
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm font-medium outline-none text-on-surface cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary/20"
              >
                <option value="Snacks">Snacks</option>
                <option value="Beverages">Beverages</option>
                <option value="Dairy Products">Dairy Products</option>
                <option value="Household">Household</option>
                <option value="Grocery">Grocery</option>
                <option value="Bakery">Bakery</option>
              </select>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Buy cost (Whole) ({{ currency }}) *</label>
              <input 
                type="number"
                step="0.01"
                required
                v-model="newProdCost"
                placeholder="Cost price"
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none font-mono text-on-surface focus:border-primary"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Retail selling ({{ currency }}) *</label>
              <input 
                type="number"
                step="0.01"
                required
                v-model="newProdPrice"
                placeholder="Selling price"
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none font-mono text-on-surface focus:border-primary"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Wholesale Price ({{ currency }})</label>
              <input 
                type="number"
                step="0.01"
                v-model="newProdWholesalePrice"
                placeholder="Wholesale price"
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none font-mono text-on-surface focus:border-primary"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Initial Stock Units</label>
              <input 
                type="number"
                v-model="newProdStock"
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none font-mono text-on-surface focus:border-primary"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Minimum Stock Alert</label>
              <input 
                type="number"
                v-model="newProdMinStock"
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none font-mono text-on-surface focus:border-primary"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Unit of Measure *</label>
              <select 
                v-model="newProdUnitOfMeasure"
                required
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm font-medium outline-none text-on-surface cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary/20"
              >
                <option value="PCS">PCS (Pieces)</option>
                <option value="KG">KG (Kilograms)</option>
                <option value="LTR">LTR (Liters)</option>
              </select>
            </div>

            <div class="flex flex-col gap-1.5 col-span-2">
              <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Assigned Supplier</label>
              <input 
                type="text"
                v-model="newProdSupplier"
                placeholder="E.g. Unilever Tanzania"
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none text-on-surface focus:border-primary focus:ring-1"
              />
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/50">
            <button 
              type="button"
              @click="showAddModal = false"
              class="px-4.5 py-2.5 rounded-lg border border-outline font-bold hover:bg-surface-container-low text-xs cursor-pointer text-on-surface-variant text-center bg-surface-container-lowest"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="px-5 py-2.5 rounded-lg font-bold text-xs text-white transition-all cursor-pointer text-center border-0 shadow-sm bg-primary text-on-primary"
            >
              Save Product Record
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 2: BULK IMPORT FORM -->
    <div v-if="showImportModal" class="fixed inset-0 bg-surface-container-highest/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div class="w-full max-w-xl bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/50 overflow-hidden font-sans">
        <div class="px-6 py-4.5 border-b border-outline-variant/50 flex justify-between items-center">
          <h2 class="text-[17px] font-bold text-on-surface">Bulk Import Products Database</h2>
          <button 
            @click="showImportModal = false"
            class="text-outline hover:text-on-surface-variant cursor-pointer bg-transparent border-0"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleBulkImport" class="p-6 space-y-4">
          <div class="p-4 bg-primary-container border border-primary/20 rounded-xl">
            <h4 class="text-xs font-bold text-primary uppercase tracking-wide mb-1">CSV/Data Layout Format Guide:</h4>
            <p class="text-xs text-primary leading-normal">
              Paste comma-separated items. Format sequence must follow:<br />
              <code class="font-mono bg-surface-container-lowest/60 px-1 py-0.5 rounded font-semibold text-[11px]">Name,Barcode,Category,Cost,Price,Stock,MinStock,Supplier</code>
            </p>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">CSV Raw Datastream Text</label>
            <textarea 
              rows="7"
              required
              v-model="rawCsvText"
              placeholder="Premium Cashews,847229,Beverages,1500,2800,45,15,Unga Tanzania Group&#10;Safari Drink Premium,99281,Beverages,900,1400,120,20,Tanzania Bottlers Ltd"
              class="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 font-mono text-xs outline-none text-on-surface focus:border-primary"
            />
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/50">
            <button 
              type="button"
              @click="showImportModal = false"
              class="px-4.5 py-2.5 rounded-lg border border-outline font-bold hover:bg-surface-container-low text-xs cursor-pointer text-on-surface-variant bg-surface-container-lowest"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="px-5 py-2.5 rounded-lg font-bold text-xs text-white transition-all cursor-pointer border-0 shadow-sm bg-primary text-on-primary"
            >
              Process Bulk Import
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>

  <!-- MODAL 3: EDIT PRODUCT FORM -->
  <Modal 
    :isOpen="showEditModal" 
    title="Edit Product Catalog" 
    subtitle="Modify store product metadata" 
    :onClose="() => showEditModal = false"
    maxWidth="max-w-lg"
  >
    <form @submit.prevent="handleEditProduct" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5 col-span-2">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Product Display Title *</label>
          <input 
            type="text"
            required
            v-model="editProdName"
            placeholder="Ex. Premium Potato Chips"
            class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm font-medium outline-none text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Barcode SKU Code</label>
          <input 
            type="text"
            v-model="editProdBarcode"
            placeholder="Ex. 847291038472"
            class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm font-mono outline-none text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Category Segment</label>
          <select 
            v-model="editProdCategory"
            class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm font-medium outline-none text-on-surface cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary/20"
          >
            <option value="Snacks">Snacks</option>
            <option value="Beverages">Beverages</option>
            <option value="Dairy Products">Dairy Products</option>
            <option value="Household">Household</option>
            <option value="Grocery">Grocery</option>
            <option value="Bakery">Bakery</option>
          </select>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Buy cost (Whole) ({{ currency }}) *</label>
          <input 
            type="number"
            step="0.01"
            required
            v-model="editProdCost"
            placeholder="Cost price"
            class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none font-mono text-on-surface focus:border-primary"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Retail selling ({{ currency }}) *</label>
          <input 
            type="number"
            step="0.01"
            required
            v-model="editProdPrice"
            placeholder="Selling price"
            class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none font-mono text-on-surface focus:border-primary"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Wholesale Price ({{ currency }})</label>
          <input 
            type="number"
            step="0.01"
            v-model="editProdWholesalePrice"
            placeholder="Wholesale price"
            class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none font-mono text-on-surface focus:border-primary"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Minimum Stock Alert</label>
          <input 
            type="number"
            v-model="editProdMinStock"
            class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none font-mono text-on-surface focus:border-primary"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Unit of Measure *</label>
          <select 
            v-model="editProdUnitOfMeasure"
            required
            class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm font-medium outline-none text-on-surface cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary/20"
          >
            <option value="PCS">PCS (Pieces)</option>
            <option value="KG">KG (Kilograms)</option>
            <option value="LTR">LTR (Liters)</option>
          </select>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Assigned Supplier</label>
          <input 
            type="text"
            v-model="editProdSupplier"
            placeholder="E.g. Unilever Tanzania"
            class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none text-on-surface focus:border-primary focus:ring-1"
          />
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/50">
        <button 
          type="button"
          @click="showEditModal = false"
          class="px-4.5 py-2.5 rounded-lg border border-outline font-bold hover:bg-surface-container-low text-xs cursor-pointer text-on-surface-variant text-center bg-surface-container-lowest"
        >
          Cancel
        </button>
        <button 
          type="submit"
          class="px-5 py-2.5 rounded-lg font-bold text-xs text-white transition-all cursor-pointer text-center border-0 shadow-sm bg-primary text-on-primary"
        >
          Save Changes
        </button>
      </div>
    </form>
  </Modal>

  <!-- MODAL 4: RESTOCK PRODUCT FORM -->
  <Modal 
    :isOpen="showRestockModal" 
    title="Restock Inventory" 
    subtitle="Add stock units to existing catalog item" 
    :onClose="() => showRestockModal = false"
    maxWidth="max-w-md"
  >
    <form @submit.prevent="handleRestockProduct" class="space-y-4" v-if="restockingProduct">
      <div class="bg-surface-container-low p-4.5 rounded-xl border border-outline-variant/50 space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-on-surface-variant font-medium">Product Name:</span>
          <span class="font-bold text-on-surface">{{ restockingProduct.name }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-on-surface-variant font-medium">Current Stock Level:</span>
          <span class="font-mono font-bold text-on-surface bg-surface-container-high px-2 py-0.5 rounded text-xs">{{ restockingProduct.stock }} units</span>
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">New Stock Units to Add *</label>
        <input 
          type="number"
          required
          min="1"
          v-model="restockQty"
          placeholder="E.g. 50"
          class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 text-sm font-mono outline-none text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Restock Type / Reason *</label>
        <select 
          v-model="restockType"
          class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 text-sm font-medium outline-none text-on-surface cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary/20"
        >
          <option value="PURCHASE">Purchase (New Stock)</option>
          <option value="SALE">Sale (Deduction)</option>
          <option value="ADJUSTMENT">Adjustment (Stock Correction)</option>
          <option value="RETURN">Return (Customer Return)</option>
        </select>
      </div>

      <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/50">
        <button 
          type="button"
          @click="showRestockModal = false"
          class="px-4.5 py-2.5 rounded-lg border border-outline font-bold hover:bg-surface-container-low text-xs cursor-pointer text-on-surface-variant text-center bg-surface-container-lowest"
        >
          Cancel
        </button>
        <button 
          type="submit"
          class="px-5 py-2.5 rounded-lg font-bold text-xs text-white transition-all cursor-pointer text-center border-0 shadow-sm bg-primary text-on-primary"
        >
          Add to Stock
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAppViewModel } from '../viewmodels/useAppViewModel';
import { showToast } from '../services/toastService';
import type { Product } from '../models/types';
import { formatCurrencyWithoutSymbol } from '../models/mockData';
import { api } from '../services/api';
import Modal from '../components/common/Modal.vue';
import { 
  Plus, 
  Upload, 
  Download, 
  ImageOff, 
  Search, 
  X, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Check,
  Pencil,
  PlusCircle
} from 'lucide-vue-next';

const vm = useAppViewModel();

const brandGreen = '#004d40';
const categories = ref<any[]>([]);

// Filter States
const selectedCategories = ref<string[]>([]);
const stockStatus = ref<string>('All');
const supplierSearch = ref('');
const selectedSuppliers = ref<string[]>([]);
const showAllCategories = ref(false);

// Pagination
const currentPage = ref(1);
const itemsPerPage = 8;

// Add Modal States
const showAddModal = ref(false);
const newProdName = ref('');
const newProdBarcode = ref('');
const newProdCategory = ref('Snacks');
const newProdCost = ref('');
const newProdPrice = ref('');
const newProdWholesalePrice = ref('');
const newProdUnitOfMeasure = ref<'PCS' | 'KG' | 'LTR'>('PCS');
const newProdStock = ref('20');
const newProdMinStock = ref('10');
const newProdSupplier = ref('');

// Import Modal States
const showImportModal = ref(false);
const rawCsvText = ref('');

const products = computed(() => vm.products.value);
const currency = computed(() => vm.settings.value.currency);

onMounted(async () => {
  try {
    const catsData = await api.get('/api/product-categories');
    categories.value = catsData || [];
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
  vm.fetchProducts();
  vm.fetchSuppliers();
});

const countByCategory = computed(() => {
  const counts: Record<string, number> = {};
  products.value.forEach(p => {
    counts[p.category] = (counts[p.category] || 0) + 1;
  });
  return counts;
});

const uniqueCategories = computed(() => {
  return Array.from(new Set(products.value.map(p => p.category)));
});

const extraCategories = computed(() => {
  const baseList = ['Beverages', 'Snacks', 'Dairy Products', 'Household'];
  return uniqueCategories.value.filter(c => !baseList.includes(c));
});

const suppliersList = computed(() => {
  const list = Array.from(new Set(products.value.map(p => p.supplier).filter(Boolean))) as string[];
  return list.filter(sup => sup.toLowerCase().includes(supplierSearch.value.toLowerCase()));
});

const toggleCategory = (cat: string) => {
  if (selectedCategories.value.includes(cat)) {
    selectedCategories.value = selectedCategories.value.filter(c => c !== cat);
  } else {
    selectedCategories.value.push(cat);
  }
  currentPage.value = 1;
};

const toggleSupplier = (sup: string) => {
  if (selectedSuppliers.value.includes(sup)) {
    selectedSuppliers.value = selectedSuppliers.value.filter(s => s !== sup);
  } else {
    selectedSuppliers.value.push(sup);
  }
  currentPage.value = 1;
};

const selectStockStatus = (status: string) => {
  stockStatus.value = status;
  currentPage.value = 1;
};

const handleResetFilters = () => {
  selectedCategories.value = [];
  stockStatus.value = 'All';
  selectedSuppliers.value = [];
  supplierSearch.value = '';
  currentPage.value = 1;
};

const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const matchesCategory = selectedCategories.value.length === 0 || selectedCategories.value.includes(p.category);
    
    let matchesStock = true;
    if (stockStatus.value === 'In Stock') {
      matchesStock = p.stock > p.minStock;
    } else if (stockStatus.value === 'Low Stock') {
      matchesStock = p.stock > 0 && p.stock <= p.minStock;
    } else if (stockStatus.value === 'Out of Stock') {
      matchesStock = p.stock === 0;
    }

    const matchesSupplier = selectedSuppliers.value.length === 0 || selectedSuppliers.value.includes(p.supplier || '');

    return matchesCategory && matchesStock && matchesSupplier;
  });
});

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage) || 1);

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredProducts.value.slice(start, start + itemsPerPage);
});

const handleAddProduct = async () => {
  if (!newProdName.value || !newProdCost.value || !newProdPrice.value) {
    showToast('Please fill out all required fields', 'error');
    return;
  }

  const priceNum = parseFloat(newProdPrice.value);
  const costNum = parseFloat(newProdCost.value);
  const stockNum = parseInt(newProdStock.value) || 0;
  const minStockNum = parseInt(newProdMinStock.value) || 10;

  try {
    const branchId = localStorage.getItem('branchId');
    if (!branchId) {
      showToast('Error: Store branch ID is missing. Please log in again.', 'error');
      return;
    }

    let cat = categories.value.find(c => c.name.toLowerCase() === newProdCategory.value.toLowerCase());
    if (!cat) {
      cat = await api.post('/api/product-categories', { name: newProdCategory.value });
      categories.value.push(cat);
    }

    const payload: any = {
      name: newProdName.value,
      barcode: newProdBarcode.value,
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      categoryId: cat.id,
      storeBranchId: branchId,
      costPrice: costNum,
      sellingPrice: priceNum,
      reorderLevel: minStockNum,
      stock: stockNum,
      isActive: true,
      UnitOfMeasure: newProdUnitOfMeasure.value
    };

    if (newProdWholesalePrice.value !== null && newProdWholesalePrice.value !== undefined && String(newProdWholesalePrice.value).trim() !== '') {
      payload.wholesalePrice = parseFloat(String(newProdWholesalePrice.value));
    }

    const createdVm = await api.post('/api/products', payload);

    const newProduct: Product = {
      id: createdVm.id,
      name: createdVm.name,
      barcode: createdVm.barcode || '',
      category: createdVm.categoryName || 'General',
      cost: Number(createdVm.costPrice) || 0,
      price: Number(createdVm.sellingPrice) || 0,
      stock: Number(createdVm.stock) || 0,
      minStock: createdVm.reorderLevel || 10,
      status: createdVm.stock === 0 ? 'Out of Stock' : (createdVm.stock <= createdVm.reorderLevel ? 'Low Stock' : 'In Stock'),
      supplier: newProdSupplier.value || 'Bakhresa Group',
      unitOfMeasure: createdVm.unitOfMeasure || createdVm.UnitOfMeasure || newProdUnitOfMeasure.value
    };

    vm.products.value = [newProduct, ...vm.products.value];
    showAddModal.value = false;

    // Reset
    newProdName.value = '';
    newProdBarcode.value = '';
    newProdCategory.value = 'Snacks';
    newProdCost.value = '';
    newProdPrice.value = '';
    newProdWholesalePrice.value = '';
    newProdUnitOfMeasure.value = 'PCS';
    newProdStock.value = '20';
    newProdMinStock.value = '10';
    newProdSupplier.value = '';
  } catch (err: any) {
    showToast('Failed to add product: ' + (err.message || err), 'error');
  }
};

const handleBulkImport = async () => {
  if (!rawCsvText.value.trim()) return;

  try {
    const vms = await api.postRaw('/api/products/bulk', rawCsvText.value);
    const addedProducts: Product[] = vms.map((vm: any) => ({
      id: vm.id,
      name: vm.name,
      barcode: vm.barcode || '',
      category: vm.categoryName || 'General',
      cost: Number(vm.costPrice) || 0,
      price: Number(vm.sellingPrice) || 0,
      stock: Number(vm.stock) || 0,
      minStock: vm.reorderLevel || 10,
      status: vm.stock === 0 ? 'Out of Stock' : (vm.stock <= vm.reorderLevel ? 'Low Stock' : 'In Stock'),
      supplier: 'Bakhresa Group'
    }));

    if (addedProducts.length > 0) {
      vm.products.value = [...addedProducts, ...vm.products.value];
      alert(`Successfully imported ${addedProducts.length} items to database!`);
      showImportModal.value = false;
      rawCsvText.value = '';
    } else {
      showToast('Could not find any readable rows. Please check the CSV format.', 'error');
    }
  } catch (err: any) {
    showToast('An error occurred while importing products: ' + (err.message || err), 'error');
  }
};

const alertExport = () => {
  alert('Exporting all product rows as Excel CSV...');
};

const stockStatuses = [
  { label: 'All Statuses', value: 'All' },
  { label: 'In Stock', value: 'In Stock' },
  { label: 'Low Stock', value: 'Low Stock', highlight: true },
  { label: 'Out of Stock', value: 'Out of Stock' }
];
// Edit Modal States
const showEditModal = ref(false);
const editingProduct = ref<Product | null>(null);
const editProdName = ref('');
const editProdBarcode = ref('');
const editProdCategory = ref('Snacks');
const editProdCost = ref('');
const editProdPrice = ref('');
const editProdWholesalePrice = ref('');
const editProdUnitOfMeasure = ref<'PCS' | 'KG' | 'LTR'>('PCS');
const editProdMinStock = ref('10');
const editProdSupplier = ref('');

// Restock Modal States
const showRestockModal = ref(false);
const restockingProduct = ref<Product | null>(null);
const restockQty = ref('10');
const restockType = ref<'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'RETURN'>('PURCHASE');

// Edit Modal Actions
const openEditModal = (p: Product) => {
  editingProduct.value = p;
  editProdName.value = p.name;
  editProdBarcode.value = p.barcode;
  editProdCategory.value = p.category;
  editProdCost.value = p.cost.toString();
  editProdPrice.value = p.price.toString();
  editProdWholesalePrice.value = p.wholesalePrice ? p.wholesalePrice.toString() : '';
  editProdUnitOfMeasure.value = p.unitOfMeasure || 'PCS';
  editProdMinStock.value = p.minStock.toString();
  editProdSupplier.value = p.supplier;
  showEditModal.value = true;
};

const handleEditProduct = async () => {
  if (!editingProduct.value) return;
  if (!editProdName.value || !editProdCost.value || !editProdPrice.value) {
    showToast('Please fill out all required fields', 'error');
    return;
  }

  const priceNum = parseFloat(editProdPrice.value);
  const costNum = parseFloat(editProdCost.value);
  const minStockNum = parseInt(editProdMinStock.value) || 10;

  try {
    let cat = categories.value.find(c => c.name.toLowerCase() === editProdCategory.value.toLowerCase());
    if (!cat) {
      cat = await api.post('/api/product-categories', { name: editProdCategory.value });
      categories.value.push(cat);
    }

    const payload: any = {
      id: editingProduct.value.id,
      name: editProdName.value,
      barcode: editProdBarcode.value,
      sku: editingProduct.value.sku || `SKU-${Date.now().toString().slice(-6)}`,
      categoryId: cat.id,
      costPrice: costNum,
      sellingPrice: priceNum,
      reorderLevel: minStockNum,
      stock: editingProduct.value.stock, // Preserve current stock
      isActive: true,
      UnitOfMeasure: editProdUnitOfMeasure.value
    };

    if (editProdWholesalePrice.value !== null && editProdWholesalePrice.value !== undefined && String(editProdWholesalePrice.value).trim() !== '') {
      payload.wholesalePrice = parseFloat(String(editProdWholesalePrice.value));
    }

    const updatedVm = await api.put(`/api/products/${editingProduct.value.id}`, payload);

    // Update state
    const index = vm.products.value.findIndex(p => p.id === editingProduct.value?.id);
    if (index !== -1) {
      const existingProduct = vm.products.value[index]!;
      vm.products.value[index] = {
        ...existingProduct,
        name: updatedVm.name,
        barcode: updatedVm.barcode || '',
        category: updatedVm.categoryName || 'General',
        cost: Number(updatedVm.costPrice) || 0,
        price: Number(updatedVm.sellingPrice) || 0,
        minStock: updatedVm.reorderLevel || 10,
        status: updatedVm.stock === 0 ? 'Out of Stock' : (updatedVm.stock <= updatedVm.reorderLevel ? 'Low Stock' : 'In Stock'),
        supplier: editProdSupplier.value || 'Bakhresa Group',
        sku: updatedVm.sku || '',
        wholesalePrice: updatedVm.wholesalePrice ? Number(updatedVm.wholesalePrice) : undefined,
        unitOfMeasure: updatedVm.unitOfMeasure || updatedVm.UnitOfMeasure || editProdUnitOfMeasure.value
      };
    }

    showEditModal.value = false;
  } catch (err: any) {
    showToast('Failed to update product: ' + (err.message || err), 'error');
  }
};

// Restock Modal Actions
const openRestockModal = (p: Product) => {
  restockingProduct.value = p;
  restockQty.value = '10';
  restockType.value = 'PURCHASE';
  showRestockModal.value = true;
};

const handleRestockProduct = async () => {
  if (!restockingProduct.value) return;
  const addedQty = parseInt(restockQty.value) || 0;
  if (addedQty <= 0) {
    showToast('Please enter a valid stock quantity to add', 'error');
    return;
  }

  try {
    await api.post(`/api/products/${restockingProduct.value.id}/stock-movement`, {
      type: restockType.value,
      quantity: addedQty
    });

    // Update local state
    const index = vm.products.value.findIndex(p => p.id === restockingProduct.value?.id);
    if (index !== -1) {
      const existingProduct = vm.products.value[index]!;
      const change = (restockType.value === 'SALE') ? -addedQty : addedQty;
      const newStock = existingProduct.stock + change;
      vm.products.value[index] = {
        ...existingProduct,
        stock: newStock,
        status: newStock === 0 ? 'Out of Stock' : (newStock <= existingProduct.minStock ? 'Low Stock' : 'In Stock')
      };
    }

    // Fetch fresh values from API to ensure database integrity
    vm.fetchProducts();

    showRestockModal.value = false;
  } catch (err: any) {
    showToast('Failed to submit stock movement: ' + (err.message || err), 'error');
  }
};
</script>
