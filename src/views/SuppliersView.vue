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
        <h1 class="text-2xl md:text-3xl font-black text-primary tracking-tight">Supplier Directory</h1>
        <p class="text-sm text-on-surface-variant font-medium mt-1">
          Manage your global vendor relationships and procurement history.
        </p>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <button 
          @click="handleExportCSV"
          class="h-11 px-5 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container-high active:scale-[0.98] font-bold text-sm flex items-center gap-2 cursor-pointer transition-all bg-white"
        >
          <Download class="w-4 h-4" />
          <span>Export</span>
        </button>
        
        <button 
          @click="showAddModal = true"
          class="h-11 px-5 rounded-xl bg-primary text-on-primary hover:bg-opacity-95 active:scale-[0.98] font-bold text-sm flex items-center gap-2 cursor-pointer transition-all shadow-sm"
        >
          <Plus class="w-4 h-4" />
          <span>Add New Supplier</span>
        </button>
      </div>
    </div>

    <!-- SEARCH & FILTERS CONTAINER -->
    <div class="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant flex flex-col md:flex-row items-center gap-4 shadow-xs">
      <div class="relative w-full md:flex-1">
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 w-5 h-5" />
        <input 
          type="text"
          v-model="searchQuery"
          placeholder="Search by name, contact or phone..."
          class="w-full h-11 pl-11 pr-4 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm transition-all text-on-surface placeholder:text-on-surface-variant/40"
        />
      </div>

      <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        <!-- Category Dropdown -->
        <div class="relative w-full sm:w-44 shrink-0">
          <select
            v-model="selectedCategory"
            class="w-full h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm font-semibold appearance-none cursor-pointer text-on-surface"
          >
            <option value="All">All Categories</option>
            <option v-for="cat in categoriesList" :key="cat" :value="cat">{{ cat }}</option>
          </select>
          <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/60 text-xs font-bold font-mono">▼</div>
        </div>

        <!-- Status Dropdown -->
        <div class="relative w-full sm:w-36 shrink-0">
          <select
            v-model="selectedStatus"
            class="w-full h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm font-semibold appearance-none cursor-pointer text-on-surface"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/60 text-xs font-bold font-mono">▼</div>
        </div>

        <!-- Reset Filters button -->
        <button
          v-if="searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All'"
          @click="resetFilters"
          class="h-11 px-4 rounded-xl text-primary border border-primary/20 hover:bg-primary/5 text-sm font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-all bg-white"
          title="Reset Filters"
        >
          <FilterIcon class="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>
    </div>

    <!-- SUPPLIERS TABLE -->
    <div class="rounded-2xl border border-outline-variant bg-surface-container-lowest overflow-hidden shadow-xs">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-low border-b border-outline-variant text-[11px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">
              <th class="py-4.5 px-6 min-w-[220px]">Supplier Name</th>
              <th class="py-4.5 px-6 min-w-[150px]">Contact Person</th>
              <th class="py-4.5 px-6 min-w-[220px]">Phone & Email</th>
              <th class="py-4.5 px-6 min-w-[120px]">Category</th>
              <th class="py-4.5 px-6 min-w-[160px]">Outstanding Balance</th>
              <th class="py-4.5 px-6 min-w-[110px]">Status</th>
              <th class="py-4.5 px-6 w-[80px] text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/60">
            <tr 
              v-for="supplier in paginatedSuppliers"
              :key="supplier.id"
              class="hover:bg-surface-container-low/50 transition-colors duration-150 text-sm align-middle"
            >
              <!-- Supplier Name & Badge -->
              <td class="py-4 px-6">
                <div class="flex items-center gap-3.5">
                  <div class="w-10 h-10 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-xs" :class="getAvatarColor(supplier.name)">
                    {{ getInitials(supplier.name) }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold text-on-surface leading-snug truncate">{{ supplier.name }}</p>
                    <p class="text-[10px] font-mono font-semibold text-on-surface-variant/60 uppercase tracking-widest mt-0.5">{{ supplier.code }}</p>
                  </div>
                </div>
              </td>

              <!-- Contact Person -->
              <td class="py-4 px-6 text-on-surface font-medium">
                {{ supplier.contactPerson }}
              </td>

              <!-- Phone & Email -->
              <td class="py-4 px-6">
                <p class="font-semibold text-on-surface font-mono text-[13px]">{{ supplier.phone }}</p>
                <p class="text-xs text-on-surface-variant/70 mt-0.5 truncate max-w-[200px]" :title="supplier.email">{{ supplier.email }}</p>
              </td>

              <!-- Category Pill -->
              <td class="py-4 px-6">
                <span class="inline-flex items-center px-2.5 py-0.8 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface border border-outline-variant/30 select-none">
                  {{ supplier.category }}
                </span>
              </td>

              <!-- Outstanding Balance -->
              <td class="py-4 px-6 font-mono">
                <div class="flex flex-col">
                  <span class="text-[13px] font-bold" :class="supplier.balance > 100000 ? 'text-error' : 'text-on-surface'">
                    TZS {{ supplier.balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                  </span>
                  <span v-if="supplier.balance > 100000" class="text-[9px] text-error font-extrabold tracking-wider uppercase mt-0.5">
                    High Balance
                  </span>
                </div>
              </td>

              <!-- Status badge -->
              <td class="py-4 px-6">
                <span 
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border select-none"
                  :class="supplier.status === 'Active'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                    : 'bg-surface-container-high text-on-surface-variant/60 border-outline-variant/40'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="supplier.status === 'Active' ? 'bg-emerald-500' : 'bg-on-surface-variant/40'" />
                  <span>{{ supplier.status }}</span>
                </span>
              </td>

              <!-- Actions -->
              <td class="py-4 px-6 text-center">
                <div class="flex items-center justify-center gap-1">
                  <button
                    @click="handleOpenHistoryModal(supplier)"
                    class="p-2 rounded-lg text-on-surface-variant/70 hover:text-primary hover:bg-surface-container-high active:scale-95 transition-all cursor-pointer bg-transparent border-0"
                    title="View Procurement History"
                  >
                    <FileText class="w-4.5 h-4.5" />
                  </button>

                  <button
                    @click="handleOpenEditModal(supplier)"
                    class="p-2 rounded-lg text-on-surface-variant/70 hover:text-primary hover:bg-surface-container-high active:scale-95 transition-all cursor-pointer bg-transparent border-0"
                    title="Edit Supplier"
                  >
                    <Pencil class="w-4.5 h-4.5" />
                  </button>

                  <button
                    @click="handleOpenPayModal(supplier)"
                    class="p-2 rounded-lg text-on-surface-variant/70 hover:text-emerald-600 hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer bg-transparent border-0"
                    title="Pay Balance"
                  >
                    <Banknote class="w-4.5 h-4.5" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredSuppliers.length === 0">
              <td colSpan="7" class="py-12 px-6 text-center">
                <div class="flex flex-col items-center justify-center gap-2">
                  <AlertCircle class="w-8 h-8 text-on-surface-variant/30" />
                  <p class="text-sm font-bold text-on-surface-variant">No suppliers found</p>
                  <p class="text-xs text-on-surface-variant/60">Try adjusting your filters or search query</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINATION FOOTER -->
      <div v-if="filteredSuppliers.length > 0" class="py-4 px-6 border-t border-outline-variant bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
        <span class="text-xs font-semibold text-on-surface-variant">
          Showing {{ Math.min(filteredSuppliers.length, (currentPage - 1) * itemsPerPage + 1) }}-{{ Math.min(filteredSuppliers.length, currentPage * itemsPerPage) }} of {{ filteredSuppliers.length }} suppliers
        </span>

        <div class="flex items-center gap-1.5">
          <button
            :disabled="currentPage === 1"
            @click="currentPage = Math.max(1, currentPage - 1)"
            class="p-1.5 rounded-lg border border-outline-variant hover:bg-surface-container-high disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer bg-white"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>

          <button
            v-for="pageNum in totalPages"
            :key="pageNum"
            @click="currentPage = pageNum"
            class="min-w-8 h-8 rounded-lg text-xs font-bold border transition-all cursor-pointer"
            :class="currentPage === pageNum 
              ? 'bg-primary text-on-primary border-primary' 
              : 'border-outline-variant hover:bg-surface-container-high text-on-surface bg-white'"
          >
            {{ pageNum }}
          </button>

          <button
            :disabled="currentPage === totalPages"
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            class="p-1.5 rounded-lg border border-outline-variant hover:bg-surface-container-high disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer bg-white"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL: ADD NEW SUPPLIER -->
    <Modal
      :isOpen="showAddModal"
      @close="showAddModal = false"
      title="Add New Supplier"
      subtitle="Register a new vendor and configure initial billing."
    >
      <form id="add-supplier-form" @submit.prevent="handleAddSupplier" class="flex flex-col gap-4">
        <!-- Supplier Name -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Supplier Name *</label>
          <input
            type="text"
            required
            v-model="newSupplierName"
            placeholder="N/A"
            class="h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm text-on-surface"
          />
        </div>

        <!-- Contact Person -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Contact Person *</label>
          <input
            type="text"
            required
            v-model="newContactPerson"
            placeholder="N/A"
            class="h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm text-on-surface"
          />
        </div>

        <!-- Grid for Contact Info -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Phone -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Phone Number *</label>
            <input
              type="text"
              required
              v-model="newPhone"
              placeholder="N/A"
              class="h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm font-mono text-on-surface"
            />
          </div>

          <!-- Email -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email Address *</label>
            <input
              type="email"
              required
              v-model="newEmail"
              placeholder="N/A"
              class="h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm text-on-surface"
            />
          </div>
        </div>

        <!-- Grid for settings -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Category Select -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Category *</label>
            <div class="relative">
              <select
                v-model="newCategory"
                class="w-full h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm font-semibold appearance-none cursor-pointer text-on-surface"
              >
                <option value="Beverage">Beverage</option>
                <option value="Wholesale">Wholesale</option>
                <option value="FMCG">FMCG</option>
                <option value="Electronics">Electronics</option>
                <option value="Bakery">Bakery</option>
                <option value="Grocery">Grocery</option>
                <option value="Household">Household</option>
                <option value="Dairy Products">Dairy Products</option>
              </select>
              <div class="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/60 text-[10px]">▼</div>
            </div>
          </div>

          <!-- Status Select -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status *</label>
            <div class="relative">
              <select
                v-model="newStatus"
                class="w-full h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm font-semibold appearance-none cursor-pointer text-on-surface"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <div class="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/60 text-[10px]">▼</div>
            </div>
          </div>
        </div>

        <!-- Initial Outstanding Balance -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Initial Outstanding Balance (TZS)</label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-on-surface-variant/50">TZS</span>
            <input
              type="number"
              step="0.01"
              min="0"
              v-model="newBalance"
              placeholder="0.00"
              class="w-full h-11 pl-12 pr-4 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm font-mono text-on-surface"
            />
          </div>
        </div>
      </form>
      <template #footer>
        <button
          type="button"
          @click="showAddModal = false"
          class="h-11 px-5 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container-high font-bold text-sm cursor-pointer transition-all active:scale-[0.98] bg-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="add-supplier-form"
          class="h-11 px-6 bg-primary text-on-primary hover:bg-opacity-95 font-bold text-sm rounded-xl cursor-pointer transition-all active:scale-[0.98] shadow-sm border-0"
        >
          Save Supplier
        </button>
      </template>
    </Modal>

    <!-- MODAL: PROCUREMENT HISTORY / PURCHASE ORDERS -->
    <Modal
      v-if="selectedSupplierForHistory"
      :isOpen="showHistoryModal"
      @close="showHistoryModal = false"
      :title="selectedSupplierForHistory.name"
      :subtitle="`Procurement Log & outstanding purchase contracts • ${selectedSupplierForHistory.code}`"
      maxWidth="max-w-2xl"
    >
      <div class="flex flex-col gap-5">
        <!-- Financial Snapshot Card -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="p-4 rounded-xl border border-outline-variant/60 bg-surface-container-low/50 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Outstanding Balance</p>
              <p class="text-base font-bold font-mono text-on-surface mt-0.5">TZS {{ selectedSupplierForHistory.balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</p>
            </div>
          </div>
          
          <div class="p-4 rounded-xl border border-outline-variant/60 bg-surface-container-low/50 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Total Contract Value</p>
              <p class="text-base font-bold font-mono text-emerald-800 mt-0.5">TZS {{ (selectedSupplierForHistory.balance * 2.3 + 120000).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</p>
            </div>
          </div>
        </div>

        <!-- Purchase Orders List -->
        <div>
          <h4 class="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-3">Procurement Purchase Orders</h4>
          
          <div class="border border-outline-variant rounded-xl overflow-hidden bg-surface-container-lowest">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-surface-container-low border-b border-outline-variant text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">
                  <th class="py-3 px-4">PO Code</th>
                  <th class="py-3 px-4">Date</th>
                  <th class="py-3 px-4 text-center">Items</th>
                  <th class="py-3 px-4">Contract Cost</th>
                  <th class="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant/50">
                <tr v-for="po in mockPurchaseOrders" :key="po.id" class="hover:bg-surface-container-low/30 transition-colors font-medium text-on-surface align-middle">
                  <td class="py-3 px-4 font-bold font-mono">{{ po.poNumber }}</td>
                  <td class="py-3 px-4 font-mono text-on-surface-variant/85">{{ po.date }}</td>
                  <td class="py-3 px-4 text-center font-mono">{{ po.itemsCount }}</td>
                  <td class="py-3 px-4 font-bold font-mono">TZS {{ po.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</td>
                  <td class="py-3 px-4 text-center">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold select-none animate-fade-in" :class="getPoStatusClass(po.status)">
                      {{ po.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <template #footer>
        <button
          type="button"
          @click="showHistoryModal = false"
          class="h-10 px-5 rounded-lg bg-primary text-on-primary hover:bg-opacity-95 font-bold text-xs cursor-pointer transition-all active:scale-[0.98] border-0"
        >
          Close Logs
        </button>
      </template>
    </Modal>

    <!-- MODAL: EDIT SUPPLIER -->
    <Modal
      v-if="selectedSupplierForEdit"
      :isOpen="showEditModal"
      @close="showEditModal = false"
      title="Edit Supplier"
      subtitle="Update vendor credentials and status information."
    >
      <form id="edit-supplier-form" @submit.prevent="handleEditSupplier" class="flex flex-col gap-4">
        <!-- Supplier Name -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Supplier Name *</label>
          <input
            type="text"
            required
            v-model="editSupplierName"
            placeholder="N/A"
            class="h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm text-on-surface"
          />
        </div>

        <!-- Contact Person -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Contact Person *</label>
          <input
            type="text"
            required
            v-model="editContactPerson"
            placeholder="N/A"
            class="h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm text-on-surface"
          />
        </div>

        <!-- Grid for Contact Info -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Phone -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Phone Number *</label>
            <input
              type="text"
              required
              v-model="editPhone"
              placeholder="N/A"
              class="h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm font-mono text-on-surface"
            />
          </div>

          <!-- Email -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email Address *</label>
            <input
              type="email"
              required
              v-model="editEmail"
              placeholder="N/A"
              class="h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm text-on-surface"
            />
          </div>
        </div>

        <!-- Grid for settings -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Category Select -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Category *</label>
            <div class="relative">
              <select
                v-model="editCategory"
                class="w-full h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm font-semibold appearance-none cursor-pointer text-on-surface"
              >
                <option value="Beverage">Beverage</option>
                <option value="Wholesale">Wholesale</option>
                <option value="FMCG">FMCG</option>
                <option value="Electronics">Electronics</option>
                <option value="Bakery">Bakery</option>
                <option value="Grocery">Grocery</option>
                <option value="Household">Household</option>
                <option value="Dairy Products">Dairy Products</option>
              </select>
              <div class="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/60 text-[10px]">▼</div>
            </div>
          </div>

          <!-- Status Select -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status *</label>
            <div class="relative">
              <select
                v-model="editStatus"
                class="w-full h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm font-semibold appearance-none cursor-pointer text-on-surface"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <div class="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/60 text-[10px]">▼</div>
            </div>
          </div>
        </div>
      </form>
      <template #footer>
        <button
          type="button"
          @click="showEditModal = false"
          class="h-11 px-5 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container-high font-bold text-sm cursor-pointer transition-all active:scale-[0.98] bg-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="edit-supplier-form"
          class="h-11 px-6 bg-primary text-on-primary hover:bg-opacity-95 font-bold text-sm rounded-xl cursor-pointer transition-all active:scale-[0.98] shadow-sm border-0"
        >
          Update Supplier
        </button>
      </template>
    </Modal>

    <!-- MODAL: PAY OUTSTANDING BALANCE -->
    <Modal
      v-if="selectedSupplierForPay"
      :isOpen="showPayModal"
      @close="showPayModal = false"
      title="Record Payment to Supplier"
      :subtitle="`Deduct payment amount from outstanding balance for ${selectedSupplierForPay.name}.`"
    >
      <form id="pay-supplier-form" @submit.prevent="handlePaySupplier" class="flex flex-col gap-4">
        <!-- Outstanding Balance Display -->
        <div class="p-4 rounded-xl border border-outline-variant/60 bg-surface-container-low/50">
          <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Current Outstanding Balance</p>
          <p class="text-xl font-bold font-mono text-error mt-0.5">TZS {{ selectedSupplierForPay.balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</p>
        </div>

        <!-- Payment Amount input -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Payment Amount (TZS) *</label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-on-surface-variant/50">TZS</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              :max="selectedSupplierForPay.balance"
              required
              v-model="paymentAmount"
              placeholder="0.00"
              class="w-full h-11 pl-12 pr-4 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm font-mono text-on-surface"
            />
          </div>
          <div class="flex gap-2 mt-1">
            <button
              type="button"
              @click="paymentAmount = String(selectedSupplierForPay.balance)"
              class="px-3 py-1 rounded-lg border border-outline-variant hover:bg-surface-container-high text-xs font-bold cursor-pointer transition-all bg-white"
            >
              Pay Full Balance
            </button>
            <button
              type="button"
              @click="paymentAmount = String((selectedSupplierForPay.balance / 2).toFixed(2))"
              class="px-3 py-1 rounded-lg border border-outline-variant hover:bg-surface-container-high text-xs font-bold cursor-pointer transition-all bg-white"
            >
              Pay Half
            </button>
          </div>
        </div>
      </form>
      <template #footer>
        <button
          type="button"
          @click="showPayModal = false"
          class="h-11 px-5 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container-high font-bold text-sm cursor-pointer transition-all active:scale-[0.98] bg-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="pay-supplier-form"
          class="h-11 px-6 bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-sm rounded-xl cursor-pointer transition-all active:scale-[0.98] shadow-sm border-0"
        >
          Record Payment
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAppViewModel } from '../viewmodels/useAppViewModel';
import type { Supplier } from '../models/types';
import Modal from '../components/common/Modal.vue';
import Toast from '../components/common/Toast.vue';
import { api } from '../services/api';
import { 
  Search, 
  Filter as FilterIcon, 
  Download, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  TrendingUp,
  Coins,
  AlertCircle,
  Pencil,
  Banknote
} from 'lucide-vue-next';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  date: string;
  totalAmount: number;
  itemsCount: number;
  status: 'Received' | 'Pending' | 'Shipped';
}

const vm = useAppViewModel();

const searchQuery = ref('');
const selectedCategory = ref('All');
const selectedStatus = ref('All');
const currentPage = ref(1);
const itemsPerPage = 5;

// Modal triggers
const showAddModal = ref(false);
const showHistoryModal = ref(false);
const selectedSupplierForHistory = ref<Supplier | null>(null);

const showEditModal = ref(false);
const selectedSupplierForEdit = ref<Supplier | null>(null);

const editSupplierName = ref('');
const editContactPerson = ref('');
const editPhone = ref('');
const editEmail = ref('');
const editCategory = ref('Beverage');
const editStatus = ref<'Active' | 'Inactive'>('Active');
const editBalance = ref(0);
const editCode = ref('');

const showPayModal = ref(false);
const selectedSupplierForPay = ref<Supplier | null>(null);
const paymentAmount = ref('');

// Form variables
const newSupplierName = ref('');
const newContactPerson = ref('');
const newPhone = ref('');
const newEmail = ref('');
const newCategory = ref('Beverage');
const newBalance = ref('');
const newStatus = ref<'Active' | 'Inactive'>('Active');

// Toast notifications
const toastMessage = ref<string | null>(null);
const toastType = ref<'success' | 'error'>('success');

const suppliers = computed(() => vm.suppliers.value);

onMounted(() => {
  vm.fetchSuppliers();
});

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = message;
  toastType.value = type;
};

const categoriesList = computed(() => {
  const list = Array.from(new Set(suppliers.value.map(s => s.category).filter(Boolean)));
  return list;
});

const filteredSuppliers = computed(() => {
  return suppliers.value.filter(s => {
    const matchesSearch = 
      (s.name || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (s.contactPerson || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (s.phone || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (s.code || '').toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesCategory = selectedCategory.value === 'All' || s.category === selectedCategory.value;
    const matchesStatus = selectedStatus.value === 'All' || s.status === selectedStatus.value;

    return matchesSearch && matchesCategory && matchesStatus;
  });
});

const totalPages = computed(() => Math.ceil(filteredSuppliers.value.length / itemsPerPage) || 1);

const paginatedSuppliers = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  return filteredSuppliers.value.slice(startIndex, startIndex + itemsPerPage);
});

const resetFilters = () => {
  searchQuery.value = '';
  selectedCategory.value = 'All';
  selectedStatus.value = 'All';
  currentPage.value = 1;
};

const getInitials = (name: string = '') => {
  const parts = (name || '').trim().split(/\s+/);
  if (parts.length >= 2) {
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
  }
  return ((name || '').substring(0, 2) || '').toUpperCase();
};

const getAvatarColor = (name: string = '') => {
  const colors = [
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-emerald-100 text-emerald-800 border-emerald-200',
    'bg-rose-100 text-rose-800 border-rose-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-amber-100 text-amber-800 border-amber-200',
    'bg-teal-100 text-teal-800 border-teal-200',
  ];
  let hash = 0;
  const cleanName = name || '';
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index] || colors[0];
};

const mockPurchaseOrders = computed((): PurchaseOrder[] => {
  return [];
});

const getPoStatusClass = (status: string) => {
  if (status === 'Received') return 'bg-emerald-50 text-emerald-800';
  if (status === 'Pending') return 'bg-amber-50 text-amber-800';
  return 'bg-blue-50 text-blue-800';
};

const handleExportCSV = () => {
  try {
    const headers = ['Code', 'Supplier Name', 'Contact Person', 'Phone', 'Email', 'Category', 'Outstanding Balance', 'Status'];
    const rows = filteredSuppliers.value.map(s => [
      s.code,
      s.name,
      s.contactPerson,
      s.phone,
      s.email,
      s.category,
      s.balance.toFixed(2),
      s.status
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(val => `"${val}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `suppliers_directory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Successfully exported ${filteredSuppliers.value.length} suppliers to CSV`);
  } catch (err) {
    showToast('Failed to export suppliers data', 'error');
  }
};

const handleAddSupplier = async () => {
  if (!newSupplierName.value.trim() || !newContactPerson.value.trim() || !newPhone.value.trim() || !newEmail.value.trim()) {
    showToast('Please fill in all required fields', 'error');
    return;
  }

  const numbers = suppliers.value.map(s => {
    const match = s.code.match(/SUP-(\d+)/);
    return match ? parseInt(match[1] || '0', 10) : 0;
  });
  const maxNum = Math.max(...numbers, 0);
  const nextCode = `SUP-${String(maxNum + 1).padStart(4, '0')}`;

  const balanceNum = parseFloat(newBalance.value) || 0;

  try {
    const storeId = localStorage.getItem('storeId');
    if (!storeId) {
      showToast('Error: Store ID is missing. Please log in again.', 'error');
      return;
    }

    const createdVm = await api.post('/api/suppliers', {
      storeId,
      code: nextCode,
      name: newSupplierName.value,
      contactPerson: newContactPerson.value,
      phone: newPhone.value,
      email: newEmail.value,
      category: newCategory.value,
      balance: balanceNum,
      status: newStatus.value
    });

    const newSupplier: Supplier = {
      id: createdVm.id,
      code: createdVm.code,
      name: createdVm.name,
      contactPerson: createdVm.contactPerson || '',
      phone: createdVm.phone || '',
      email: createdVm.email || '',
      category: createdVm.category || 'Wholesale',
      balance: Number(createdVm.balance) || 0,
      status: (createdVm.status || 'Active') as 'Active' | 'Inactive'
    };

    vm.suppliers.value = [newSupplier, ...vm.suppliers.value];
    showToast(`Supplier ${newSupplier.name} added successfully with code ${newSupplier.code}`);
    
    // Reset form
    newSupplierName.value = '';
    newContactPerson.value = '';
    newPhone.value = '';
    newEmail.value = '';
    newCategory.value = 'Beverage';
    newBalance.value = '';
    newStatus.value = 'Active';
    
    showAddModal.value = false;
  } catch (err: any) {
    showToast('Failed to add supplier: ' + (err.message || err), 'error');
  }
};

const handleOpenHistoryModal = (supplier: Supplier) => {
  selectedSupplierForHistory.value = supplier;
  showHistoryModal.value = true;
};

const handleOpenEditModal = (supplier: Supplier) => {
  selectedSupplierForEdit.value = supplier;
  editSupplierName.value = supplier.name;
  editContactPerson.value = supplier.contactPerson;
  editPhone.value = supplier.phone;
  editEmail.value = supplier.email;
  editCategory.value = supplier.category;
  editStatus.value = supplier.status;
  editBalance.value = supplier.balance;
  editCode.value = supplier.code;
  showEditModal.value = true;
};

const handleEditSupplier = async () => {
  if (!selectedSupplierForEdit.value) return;
  if (!editSupplierName.value.trim() || !editContactPerson.value.trim() || !editPhone.value.trim() || !editEmail.value.trim()) {
    showToast('Please fill in all required fields', 'error');
    return;
  }

  try {
    const storeId = localStorage.getItem('storeId');
    if (!storeId) {
      showToast('Error: Store ID is missing. Please log in again.', 'error');
      return;
    }

    const updatedVm = await api.put(`/api/suppliers/${selectedSupplierForEdit.value.id}`, {
      storeId,
      code: editCode.value,
      name: editSupplierName.value,
      contactPerson: editContactPerson.value,
      phone: editPhone.value,
      email: editEmail.value,
      category: editCategory.value,
      balance: editBalance.value,
      status: editStatus.value
    });

    const index = vm.suppliers.value.findIndex(s => s.id === selectedSupplierForEdit.value?.id);
    if (index !== -1 && vm.suppliers.value[index]) {
      vm.suppliers.value[index] = {
        id: updatedVm.id,
        code: updatedVm.code,
        name: updatedVm.name,
        contactPerson: updatedVm.contactPerson || '',
        phone: updatedVm.phone || '',
        email: updatedVm.email || '',
        category: updatedVm.category || 'Wholesale',
        balance: Number(updatedVm.balance) || 0,
        status: (updatedVm.status || 'Active') as 'Active' | 'Inactive'
      };
    }

    showToast(`Supplier ${updatedVm.name} updated successfully`);
    showEditModal.value = false;
  } catch (err: any) {
    showToast('Failed to update supplier: ' + (err.message || err), 'error');
  }
};

const handleOpenPayModal = (supplier: Supplier) => {
  selectedSupplierForPay.value = supplier;
  paymentAmount.value = '';
  showPayModal.value = true;
};

const handlePaySupplier = async () => {
  if (!selectedSupplierForPay.value) return;
  const payVal = parseFloat(paymentAmount.value) || 0;
  if (payVal <= 0) {
    showToast('Please enter a valid payment amount', 'error');
    return;
  }
  if (payVal > selectedSupplierForPay.value.balance) {
    showToast('Payment cannot exceed current outstanding balance', 'error');
    return;
  }

  const newBalance = Math.max(0, selectedSupplierForPay.value.balance - payVal);

  try {
    const storeId = localStorage.getItem('storeId');
    if (!storeId) {
      showToast('Error: Store ID is missing. Please log in again.', 'error');
      return;
    }

    const updatedVm = await api.put(`/api/suppliers/${selectedSupplierForPay.value.id}`, {
      storeId,
      code: selectedSupplierForPay.value.code,
      name: selectedSupplierForPay.value.name,
      contactPerson: selectedSupplierForPay.value.contactPerson,
      phone: selectedSupplierForPay.value.phone,
      email: selectedSupplierForPay.value.email,
      category: selectedSupplierForPay.value.category,
      balance: newBalance,
      status: selectedSupplierForPay.value.status
    });

    const index = vm.suppliers.value.findIndex(s => s.id === selectedSupplierForPay.value?.id);
    if (index !== -1 && vm.suppliers.value[index]) {
      vm.suppliers.value[index] = {
        ...vm.suppliers.value[index],
        balance: Number(updatedVm.balance) || 0
      };
    }

    showToast(`Recorded payment of TZS ${payVal.toLocaleString()} for ${updatedVm.name}. Remaining balance: TZS ${newBalance.toLocaleString()}`);
    showPayModal.value = false;
  } catch (err: any) {
    showToast('Failed to record payment: ' + (err.message || err), 'error');
  }
};
</script>
