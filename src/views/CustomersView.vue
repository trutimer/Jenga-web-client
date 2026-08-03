<template>
  <div class="flex flex-col gap-6 w-full animate-fade-in font-sans relative select-none">
    <!-- Toast Notification -->
    <Toast 
      :message="toastMessage" 
      :type="toastType" 
      :onClose="() => toastMessage = null" 
    />

    <!-- HEADER BAR -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl md:text-3xl font-black text-primary tracking-tight">Customer Management</h1>
        <p class="text-sm text-on-surface-variant font-medium mt-1">
          Manage customer accounts, credit terms, contact persons, payments, and financial statements.
        </p>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <button 
          @click="handleExportCSV"
          class="h-11 px-5 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container-high active:scale-[0.98] font-bold text-sm flex items-center gap-2 cursor-pointer transition-all bg-white shadow-xs"
        >
          <Download class="w-4 h-4" />
          <span>Export</span>
        </button>

        <button 
          @click="openRecordPaymentModal()"
          class="h-11 px-5 rounded-xl border border-primary/30 text-primary hover:bg-primary/5 active:scale-[0.98] font-bold text-sm flex items-center gap-2 cursor-pointer transition-all bg-white shadow-xs"
        >
          <CreditCard class="w-4 h-4" />
          <span>Record Payment</span>
        </button>

        <button 
          @click="openAddModal()"
          class="h-11 px-5 rounded-xl bg-primary text-on-primary hover:bg-opacity-95 active:scale-[0.98] font-bold text-sm flex items-center gap-2 cursor-pointer transition-all shadow-sm"
        >
          <Plus class="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>
    </div>

    <!-- METRICS CARDS -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Customers</span>
          <div class="p-2 rounded-xl bg-primary/10 text-primary">
            <Users class="w-5 h-5" />
          </div>
        </div>
        <div class="mt-3">
          <span class="text-2xl font-black text-primary">{{ stats.totalCount }}</span>
          <span class="text-xs font-semibold text-on-surface-variant/70 ml-2">({{ stats.activeCount }} Active)</span>
        </div>
      </div>

      <div class="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Outstanding</span>
          <div class="p-2 rounded-xl bg-error/10 text-error">
            <DollarSign class="w-5 h-5" />
          </div>
        </div>
        <div class="mt-3">
          <span class="text-2xl font-black text-error">{{ formatCurrency(stats.totalOutstanding) }}</span>
        </div>
      </div>

      <div class="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Credit Limit</span>
          <div class="p-2 rounded-xl bg-tertiary/10 text-tertiary">
            <ShieldCheck class="w-5 h-5" />
          </div>
        </div>
        <div class="mt-3">
          <span class="text-2xl font-black text-on-surface">{{ formatCurrency(stats.totalCreditLimit) }}</span>
        </div>
      </div>

      <div class="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Company Accounts</span>
          <div class="p-2 rounded-xl bg-secondary/10 text-secondary">
            <Building2 class="w-5 h-5" />
          </div>
        </div>
        <div class="mt-3">
          <span class="text-2xl font-black text-secondary">{{ stats.companyCount }}</span>
        </div>
      </div>
    </div>

    <!-- SEARCH & FILTERS CONTAINER -->
    <div class="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant flex flex-col md:flex-row items-center gap-4 shadow-xs">
      <div class="relative w-full md:flex-1">
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 w-5 h-5" />
        <input 
          type="text"
          v-model="searchQuery"
          @input="debouncedFetch"
          placeholder="Search by name, code, phone, email, TIN..."
          class="w-full h-11 pl-11 pr-4 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm transition-all text-on-surface placeholder:text-on-surface-variant/40"
        />
      </div>

      <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        <!-- Type Dropdown -->
        <div class="relative w-full sm:w-44 shrink-0">
          <select
            v-model="selectedType"
            @change="fetchCustomers"
            class="w-full h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm font-semibold appearance-none cursor-pointer text-on-surface"
          >
            <option value="ALL">All Types</option>
            <option value="PERSON">Person / Individual</option>
            <option value="COMPANY">Company</option>
          </select>
          <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/60 text-xs font-bold font-mono">▼</div>
        </div>

        <!-- Status Dropdown -->
        <div class="relative w-full sm:w-36 shrink-0">
          <select
            v-model="selectedStatus"
            @change="fetchCustomers"
            class="w-full h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm font-semibold appearance-none cursor-pointer text-on-surface"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/60 text-xs font-bold font-mono">▼</div>
        </div>

        <!-- Reset Filters button -->
        <button
          v-if="searchQuery || selectedType !== 'ALL' || selectedStatus !== 'ALL'"
          @click="resetFilters"
          class="h-11 px-4 rounded-xl text-primary border border-primary/20 hover:bg-primary/5 text-sm font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-all bg-white"
          title="Reset Filters"
        >
          <FilterIcon class="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>
    </div>

    <!-- CUSTOMERS TABLE -->
    <div class="rounded-2xl border border-outline-variant bg-surface-container-lowest overflow-hidden shadow-xs">
      <div v-if="isLoading" class="p-12 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
        <p class="mt-3 text-sm font-bold text-on-surface-variant">Loading customers...</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-low border-b border-outline-variant text-[11px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">
              <th class="py-4.5 px-6 min-w-[220px]">Customer</th>
              <th class="py-4.5 px-6 min-w-[120px]">Type</th>
              <th class="py-4.5 px-6 min-w-[200px]">Contact Info</th>
              <th class="py-4.5 px-6 min-w-[140px]">TIN / VRN</th>
              <th class="py-4.5 px-6 min-w-[150px]">Credit Limit</th>
              <th class="py-4.5 px-6 min-w-[160px]">Outstanding Balance</th>
              <th class="py-4.5 px-6 min-w-[100px]">Status</th>
              <th class="py-4.5 px-6 text-right min-w-[140px]">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/60">
            <tr 
              v-for="customer in customers" 
              :key="customer.id"
              class="hover:bg-surface-container-low/60 transition-colors"
            >
              <!-- Customer -->
              <td class="py-4 px-6">
                <div>
                  <div class="font-bold text-sm text-primary flex items-center gap-2">
                    <span>{{ customer.displayName || (customer.firstName ? `${customer.firstName} ${customer.lastName || ''}` : customer.companyName) }}</span>
                  </div>
                  <div class="text-xs font-mono text-on-surface-variant/70 mt-0.5 flex items-center gap-2">
                    <span>Code: {{ customer.code || 'N/A' }}</span>
                    <span v-if="customer.companyName && customer.customerType === 'COMPANY'" class="text-[10px] font-sans bg-surface-container-high px-1.5 py-0.5 rounded text-on-surface-variant">
                      {{ customer.companyName }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- Type -->
              <td class="py-4 px-6">
                <span 
                  class="px-2.5 py-1 rounded-full text-xs font-extrabold inline-flex items-center gap-1"
                  :class="getTypeBadgeClass(customer.customerType)"
                >
                  {{ customer.customerType }}
                </span>
              </td>

              <!-- Contact Info -->
              <td class="py-4 px-6">
                <div class="text-xs space-y-1">
                  <div v-if="customer.phone" class="flex items-center gap-1.5 text-on-surface">
                    <Phone class="w-3.5 h-3.5 text-on-surface-variant shrink-0" />
                    <span>{{ customer.phone }}</span>
                  </div>
                  <div v-if="customer.email" class="flex items-center gap-1.5 text-on-surface-variant">
                    <Mail class="w-3.5 h-3.5 text-on-surface-variant shrink-0" />
                    <span class="truncate max-w-[160px]">{{ customer.email }}</span>
                  </div>
                  <div v-if="!customer.phone && !customer.email" class="text-on-surface-variant/50 italic">
                    No contact info
                  </div>
                </div>
              </td>

              <!-- TIN / VRN -->
              <td class="py-4 px-6">
                <div class="text-xs font-mono">
                  <div v-if="customer.tinNumber" class="text-on-surface font-semibold">TIN: {{ customer.tinNumber }}</div>
                  <div v-if="customer.vrnNumber" class="text-on-surface-variant">VRN: {{ customer.vrnNumber }}</div>
                  <div v-if="!customer.tinNumber && !customer.vrnNumber" class="text-on-surface-variant/50 font-sans italic">-</div>
                </div>
              </td>

              <!-- Credit Limit -->
              <td class="py-4 px-6 font-mono text-sm font-semibold text-on-surface">
                {{ formatCurrency(customer.creditLimit || 0) }}
              </td>

              <!-- Outstanding Balance -->
              <td class="py-4 px-6 font-mono text-sm font-bold">
                <span :class="(customer.outstandingBalance || 0) > 0 ? 'text-error' : 'text-success'">
                  {{ formatCurrency(customer.outstandingBalance || 0) }}
                </span>
              </td>

              <!-- Status -->
              <td class="py-4 px-6">
                <span 
                  class="px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1"
                  :class="customer.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-on-surface-variant/10 text-on-surface-variant'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="customer.status === 'ACTIVE' ? 'bg-success' : 'bg-on-surface-variant'"></span>
                  {{ customer.status }}
                </span>
              </td>

              <!-- Actions -->
              <td class="py-4 px-6 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    @click="openDetailsModal(customer)"
                    class="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-all cursor-pointer"
                    title="View Details & Statement"
                  >
                    <Eye class="w-4 h-4" />
                  </button>

                  <button
                    @click="openRecordPaymentModal(customer)"
                    class="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-success transition-all cursor-pointer"
                    title="Record Payment"
                  >
                    <CreditCard class="w-4 h-4" />
                  </button>

                  <button
                    @click="openEditModal(customer)"
                    class="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-all cursor-pointer"
                    title="Edit Customer"
                  >
                    <Pencil class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="customers.length === 0">
              <td colspan="8" class="py-12 text-center">
                <div class="flex flex-col items-center justify-center gap-2">
                  <Users class="w-10 h-10 text-on-surface-variant/30" />
                  <p class="text-sm font-bold text-on-surface-variant">No customers found</p>
                  <p class="text-xs text-on-surface-variant/60">Try adjusting your filters or add a new customer</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINATION FOOTER -->
      <div v-if="totalElements > 0" class="py-4 px-6 border-t border-outline-variant bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
        <span class="text-xs font-semibold text-on-surface-variant">
          Showing {{ currentPage * pageSize + 1 }}-{{ Math.min((currentPage + 1) * pageSize, totalElements) }} of {{ totalElements }} customers
        </span>

        <div class="flex items-center gap-1.5">
          <button
            :disabled="currentPage === 0"
            @click="goToPage(currentPage - 1)"
            class="p-1.5 rounded-lg border border-outline-variant hover:bg-surface-container-high disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer bg-white"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>

          <button
            v-for="p in totalPages"
            :key="p"
            @click="goToPage(p - 1)"
            class="min-w-8 h-8 rounded-lg text-xs font-bold border transition-all cursor-pointer"
            :class="currentPage === (p - 1)
              ? 'bg-primary text-on-primary border-primary' 
              : 'border-outline-variant hover:bg-surface-container-high text-on-surface bg-white'"
          >
            {{ p }}
          </button>

          <button
            :disabled="currentPage >= totalPages - 1"
            @click="goToPage(currentPage + 1)"
            class="p-1.5 rounded-lg border border-outline-variant hover:bg-surface-container-high disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer bg-white"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL: ADD / EDIT CUSTOMER -->
    <Modal
      :isOpen="showCustomerModal"
      :onClose="() => showCustomerModal = false"
      :title="isEditing ? 'Edit Customer' : 'Add New Customer'"
      subtitle="Fill in the customer information below."
      maxWidth="max-w-2xl"
    >
      <form @submit.prevent="saveCustomer" novalidate class="space-y-4">
        <!-- Customer Type Selection -->
        <div>
          <label class="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1.5">Customer Type *</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              v-for="t in [
                { key: 'PERSON', label: 'Person / Individual' },
                { key: 'COMPANY', label: 'Company' }
              ]"
              :key="t.key"
              @click="setCustomerType(t.key as CustomerType)"
              class="py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center"
              :class="customerForm.customerType === t.key ? 'bg-primary text-on-primary border-primary shadow-xs' : 'border-outline-variant hover:bg-surface-container-high text-on-surface'"
            >
              {{ t.label }}
            </button>
          </div>
        </div>

        <!-- Name Fields (Person vs Company) -->
        <div v-if="customerForm.customerType === 'PERSON'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">First Name *</label>
            <input 
              type="text"
              v-model="customerForm.firstName"
              @input="validateField('firstName')"
              @blur="validateField('firstName')"
              placeholder="e.g. John"
              class="w-full h-10 px-3 rounded-xl border bg-surface focus:outline-none text-sm transition-colors"
              :class="formErrors.firstName ? 'border-error focus:border-error ring-1 ring-error/30' : 'border-outline-variant focus:border-primary'"
            />
            <p v-if="formErrors.firstName" class="text-xs text-error font-semibold mt-1 flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5 shrink-0" /> {{ formErrors.firstName }}
            </p>
          </div>
          <div>
            <label class="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Last Name *</label>
            <input 
              type="text"
              v-model="customerForm.lastName"
              @input="validateField('lastName')"
              @blur="validateField('lastName')"
              placeholder="e.g. Doe"
              class="w-full h-10 px-3 rounded-xl border bg-surface focus:outline-none text-sm transition-colors"
              :class="formErrors.lastName ? 'border-error focus:border-error ring-1 ring-error/30' : 'border-outline-variant focus:border-primary'"
            />
            <p v-if="formErrors.lastName" class="text-xs text-error font-semibold mt-1 flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5 shrink-0" /> {{ formErrors.lastName }}
            </p>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Company Name *</label>
            <input 
              type="text"
              v-model="customerForm.companyName"
              @input="validateField('companyName')"
              @blur="validateField('companyName')"
              placeholder="e.g. Acme Tanzania Ltd"
              class="w-full h-10 px-3 rounded-xl border bg-surface focus:outline-none text-sm transition-colors"
              :class="formErrors.companyName ? 'border-error focus:border-error ring-1 ring-error/30' : 'border-outline-variant focus:border-primary'"
            />
            <p v-if="formErrors.companyName" class="text-xs text-error font-semibold mt-1 flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5 shrink-0" /> {{ formErrors.companyName }}
            </p>
          </div>
          <div>
            <label class="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Display Name</label>
            <input 
              type="text"
              v-model="customerForm.displayName"
              placeholder="Display name override (optional)"
              class="w-full h-10 px-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm"
            />
          </div>
        </div>

        <!-- Contact Info -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Phone Number *</label>
            <input 
              type="text"
              v-model="customerForm.phone"
              @input="validateField('phone')"
              @blur="validateField('phone')"
              placeholder="e.g. +255 700 000 000"
              class="w-full h-10 px-3 rounded-xl border bg-surface focus:outline-none text-sm transition-colors"
              :class="formErrors.phone ? 'border-error focus:border-error ring-1 ring-error/30' : 'border-outline-variant focus:border-primary'"
            />
            <p v-if="formErrors.phone" class="text-xs text-error font-semibold mt-1 flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5 shrink-0" /> {{ formErrors.phone }}
            </p>
          </div>
          <div>
            <label class="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">
              Email Address <span v-if="isCompany" class="text-error">*</span>
            </label>
            <input 
              type="email"
              v-model="customerForm.email"
              @input="validateField('email')"
              @blur="validateField('email')"
              placeholder="e.g. info@company.co.tz"
              class="w-full h-10 px-3 rounded-xl border bg-surface focus:outline-none text-sm transition-colors"
              :class="formErrors.email ? 'border-error focus:border-error ring-1 ring-error/30' : 'border-outline-variant focus:border-primary'"
            />
            <p v-if="formErrors.email" class="text-xs text-error font-semibold mt-1 flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5 shrink-0" /> {{ formErrors.email }}
            </p>
          </div>
        </div>

        <!-- Tax & Business Identifiers -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">
              TIN Number <span v-if="isCompany" class="text-error">*</span>
            </label>
            <input 
              type="text"
              v-model="customerForm.tinNumber"
              @input="validateField('tinNumber')"
              @blur="validateField('tinNumber')"
              placeholder="e.g. 123-456-789"
              class="w-full h-10 px-3 rounded-xl border bg-surface focus:outline-none text-sm font-mono transition-colors"
              :class="formErrors.tinNumber ? 'border-error focus:border-error ring-1 ring-error/30' : 'border-outline-variant focus:border-primary'"
            />
            <p v-if="formErrors.tinNumber" class="text-xs text-error font-semibold mt-1 flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5 shrink-0" /> {{ formErrors.tinNumber }}
            </p>
          </div>
          <div>
            <label class="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">
              VRN Number <span v-if="isCompany" class="text-error">*</span>
            </label>
            <input 
              type="text"
              v-model="customerForm.vrnNumber"
              @input="validateField('vrnNumber')"
              @blur="validateField('vrnNumber')"
              placeholder="VAT Registration Number"
              class="w-full h-10 px-3 rounded-xl border bg-surface focus:outline-none text-sm font-mono transition-colors"
              :class="formErrors.vrnNumber ? 'border-error focus:border-error ring-1 ring-error/30' : 'border-outline-variant focus:border-primary'"
            />
            <p v-if="formErrors.vrnNumber" class="text-xs text-error font-semibold mt-1 flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5 shrink-0" /> {{ formErrors.vrnNumber }}
            </p>
          </div>
        </div>

        <!-- Address & Credit -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Physical Address *</label>
            <input 
              type="text"
              v-model="customerForm.address"
              @input="validateField('address')"
              @blur="validateField('address')"
              placeholder="e.g. Samora Avenue, Dar es Salaam"
              class="w-full h-10 px-3 rounded-xl border bg-surface focus:outline-none text-sm transition-colors"
              :class="formErrors.address ? 'border-error focus:border-error ring-1 ring-error/30' : 'border-outline-variant focus:border-primary'"
            />
            <p v-if="formErrors.address" class="text-xs text-error font-semibold mt-1 flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5 shrink-0" /> {{ formErrors.address }}
            </p>
          </div>
          <div>
            <label class="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Credit Limit (TZS) *</label>
            <input 
              type="number"
              v-model.number="customerForm.creditLimit"
              @input="validateField('creditLimit')"
              @blur="validateField('creditLimit')"
              min="1"
              step="1000"
              placeholder="0.00"
              class="w-full h-10 px-3 rounded-xl border bg-surface focus:outline-none text-sm font-mono transition-colors"
              :class="formErrors.creditLimit ? 'border-error focus:border-error ring-1 ring-error/30' : 'border-outline-variant focus:border-primary'"
            />
            <p v-if="formErrors.creditLimit" class="text-xs text-error font-semibold mt-1 flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5 shrink-0" /> {{ formErrors.creditLimit }}
            </p>
          </div>
        </div>

        <!-- Status -->
        <div>
          <label class="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Status</label>
          <select 
            v-model="customerForm.status"
            class="w-full h-10 px-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm font-semibold"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <div class="pt-4 border-t border-outline-variant flex justify-end gap-3">
          <button 
            type="button" 
            @click="showCustomerModal = false"
            class="h-10 px-4 rounded-xl border border-outline-variant text-sm font-bold hover:bg-surface-container-high cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            :disabled="isSubmitting"
            class="h-10 px-5 rounded-xl bg-primary text-on-primary text-sm font-bold hover:bg-opacity-90 disabled:opacity-50 cursor-pointer"
          >
            {{ isSubmitting ? 'Saving...' : (isEditing ? 'Update Customer' : 'Create Customer') }}
          </button>
        </div>
      </form>
    </Modal>

    <!-- MODAL: RECORD PAYMENT -->
    <Modal
      :isOpen="showPaymentModal"
      :onClose="() => showPaymentModal = false"
      title="Record Customer Payment"
      subtitle="Record payment received from a customer."
      maxWidth="max-w-lg"
    >
      <form @submit.prevent="savePayment" class="space-y-4">
        <!-- Customer Select -->
        <div>
          <label class="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Customer *</label>
          <select 
            v-model="paymentForm.customerId"
            required
            @change="onPaymentCustomerChange"
            class="w-full h-10 px-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm font-semibold"
          >
            <option value="" disabled>Select Customer</option>
            <option v-for="c in customers" :key="c.id" :value="c.id">
              {{ c.displayName || c.companyName || (c.firstName + ' ' + (c.lastName || '')) }} (Bal: {{ formatCurrency(c.outstandingBalance || 0) }})
            </option>
          </select>
        </div>

        <!-- Optional Invoice Select -->
        <div v-if="customerInvoices.length > 0">
          <label class="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Invoice (Optional)</label>
          <select 
            v-model="paymentForm.invoiceId"
            class="w-full h-10 px-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm font-semibold"
          >
            <option value="">General Account Payment</option>
            <option v-for="inv in customerInvoices" :key="inv.id" :value="inv.id">
              Invoice #{{ inv.invoiceNumber }} - Due: {{ formatCurrency(inv.dueAmount) }} (Status: {{ inv.status }})
            </option>
          </select>
        </div>

        <!-- Amount & Payment Method -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Amount (TZS) *</label>
            <input 
              type="number"
              v-model.number="paymentForm.amount"
              required
              min="1"
              step="100"
              placeholder="0.00"
              class="w-full h-10 px-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm font-mono font-bold"
            />
          </div>

          <div>
            <label class="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Payment Method *</label>
            <select 
              v-model="paymentForm.paymentMethod"
              required
              class="w-full h-10 px-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm font-semibold"
            >
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="MOBILE_MONEY">Mobile Money</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CHEQUE">Cheque</option>
            </select>
          </div>
        </div>

        <!-- Reference Number -->
        <div>
          <label class="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Reference Number / Transaction ID</label>
          <input 
            type="text"
            v-model="paymentForm.referenceNumber"
            placeholder="e.g. M-PESA ref: QXK12389 or Cheque #1029"
            class="w-full h-10 px-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm font-mono"
          />
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Notes</label>
          <textarea 
            v-model="paymentForm.notes"
            rows="2"
            placeholder="Optional payment notes..."
            class="w-full p-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm"
          ></textarea>
        </div>

        <div class="pt-4 border-t border-outline-variant flex justify-end gap-3">
          <button 
            type="button" 
            @click="showPaymentModal = false"
            class="h-10 px-4 rounded-xl border border-outline-variant text-sm font-bold hover:bg-surface-container-high cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            :disabled="isSubmitting"
            class="h-10 px-5 rounded-xl bg-success text-white text-sm font-bold hover:bg-opacity-90 disabled:opacity-50 cursor-pointer"
          >
            {{ isSubmitting ? 'Recording...' : 'Record Payment' }}
          </button>
        </div>
      </form>
    </Modal>

    <!-- MODAL: CUSTOMER DETAILS & STATEMENT DRAWER -->
    <Modal
      :isOpen="showDetailsModal"
      :onClose="() => showDetailsModal = false"
      :title="selectedCustomer ? (selectedCustomer.displayName || selectedCustomer.companyName || (selectedCustomer.firstName + ' ' + (selectedCustomer.lastName || ''))) : 'Customer Details'"
      :subtitle="`Code: ${selectedCustomer?.code || 'N/A'} | Type: ${selectedCustomer?.customerType || ''}`"
      maxWidth="max-w-4xl"
    >
      <div v-if="selectedCustomer" class="space-y-6">
        <!-- DETAIL TABS NAV -->
        <div class="flex items-center border-b border-outline-variant gap-2 overflow-x-auto">
          <button 
            v-for="tab in [
              { id: 'overview', label: 'Overview', icon: Building2 },
              { id: 'contacts', label: 'Contact Persons', icon: UserCheck },
              { id: 'invoices', label: 'Invoices', icon: FileText },
              { id: 'payments', label: 'Payments', icon: CreditCard },
              { id: 'statement', label: 'Financial Statement', icon: PieChart }
            ]"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap"
            :class="activeTab === tab.id ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-on-surface-variant hover:text-on-surface'"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <!-- TAB 1: OVERVIEW -->
        <div v-if="activeTab === 'overview'" class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant">
            <div>
              <span class="text-[11px] font-mono font-bold text-on-surface-variant uppercase">Credit Limit</span>
              <p class="text-lg font-black text-on-surface font-mono">{{ formatCurrency(selectedCustomer.creditLimit || 0) }}</p>
            </div>
            <div>
              <span class="text-[11px] font-mono font-bold text-on-surface-variant uppercase">Outstanding Balance</span>
              <p class="text-lg font-black font-mono" :class="(selectedCustomer.outstandingBalance || 0) > 0 ? 'text-error' : 'text-success'">
                {{ formatCurrency(selectedCustomer.outstandingBalance || 0) }}
              </p>
            </div>
            <div>
              <span class="text-[11px] font-mono font-bold text-on-surface-variant uppercase">Account Status</span>
              <p class="mt-1">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold inline-block" :class="selectedCustomer.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-on-surface-variant/10 text-on-surface-variant'">
                  {{ selectedCustomer.status }}
                </span>
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div class="p-4 rounded-xl border border-outline-variant space-y-2">
              <h4 class="font-bold text-xs font-mono text-on-surface-variant uppercase">Basic Details</h4>
              <p><span class="text-on-surface-variant">Full Name:</span> <strong class="text-on-surface">{{ selectedCustomer.firstName }} {{ selectedCustomer.lastName }}</strong></p>
              <p><span class="text-on-surface-variant">Company:</span> <strong class="text-on-surface">{{ selectedCustomer.companyName || '-' }}</strong></p>
              <p><span class="text-on-surface-variant">Registered Branch:</span> <strong class="text-on-surface">{{ selectedCustomer.registeredBranchName || 'Main' }}</strong></p>
            </div>

            <div class="p-4 rounded-xl border border-outline-variant space-y-2">
              <h4 class="font-bold text-xs font-mono text-on-surface-variant uppercase">Tax & Location</h4>
              <p><span class="text-on-surface-variant">TIN Number:</span> <strong class="font-mono text-on-surface">{{ selectedCustomer.tinNumber || '-' }}</strong></p>
              <p><span class="text-on-surface-variant">VRN Number:</span> <strong class="font-mono text-on-surface">{{ selectedCustomer.vrnNumber || '-' }}</strong></p>
              <p><span class="text-on-surface-variant">Address:</span> <strong class="text-on-surface">{{ selectedCustomer.address || '-' }}</strong></p>
            </div>
          </div>
        </div>

        <!-- TAB 2: CONTACT PERSONS -->
        <div v-if="activeTab === 'contacts'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-sm text-primary">Key Contact Persons</h4>
            <button 
              @click="openAddContactModal"
              class="h-9 px-3 rounded-lg bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Add Contact Person</span>
            </button>
          </div>

          <div v-if="selectedCustomer.contactPersons && selectedCustomer.contactPersons.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div 
              v-for="contact in selectedCustomer.contactPersons" 
              :key="contact.id"
              class="p-4 rounded-xl border border-outline-variant bg-surface-container-low flex flex-col justify-between"
            >
              <div>
                <div class="flex items-center justify-between">
                  <h5 class="font-bold text-sm text-on-surface">{{ contact.fullName }}</h5>
                  <span v-if="contact.primary" class="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase">Primary</span>
                </div>
                <p class="text-xs text-on-surface-variant mt-0.5">{{ contact.designation || 'Contact Person' }}</p>
                <div class="mt-3 text-xs space-y-1">
                  <p v-if="contact.phone" class="flex items-center gap-1.5"><Phone class="w-3.5 h-3.5 text-on-surface-variant" /> {{ contact.phone }}</p>
                  <p v-if="contact.email" class="flex items-center gap-1.5"><Mail class="w-3.5 h-3.5 text-on-surface-variant" /> {{ contact.email }}</p>
                </div>
              </div>
              <div class="mt-4 pt-2 border-t border-outline-variant/40 flex justify-end gap-2">
                <button 
                  @click="deleteContactPerson(contact.id!)"
                  class="text-xs text-error font-semibold hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>

          <div v-else class="py-8 text-center border border-dashed border-outline-variant rounded-xl">
            <p class="text-xs font-semibold text-on-surface-variant">No contact persons recorded for this customer.</p>
          </div>
        </div>

        <!-- TAB 3: INVOICES -->
        <div v-if="activeTab === 'invoices'" class="space-y-4">
          <div class="overflow-x-auto rounded-xl border border-outline-variant">
            <table class="w-full text-left text-xs">
              <thead class="bg-surface-container-low border-b border-outline-variant font-mono font-bold text-on-surface-variant">
                <tr>
                  <th class="p-3">Invoice #</th>
                  <th class="p-3">Total</th>
                  <th class="p-3">Paid</th>
                  <th class="p-3">Due</th>
                  <th class="p-3">Status</th>
                  <th class="p-3">Created</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant">
                <tr v-for="inv in customerInvoices" :key="inv.id" class="hover:bg-surface-container-low/40">
                  <td class="p-3 font-mono font-bold text-primary">{{ inv.invoiceNumber }}</td>
                  <td class="p-3 font-mono font-semibold">{{ formatCurrency(inv.totalAmount) }}</td>
                  <td class="p-3 font-mono text-success">{{ formatCurrency(inv.paidAmount) }}</td>
                  <td class="p-3 font-mono text-error font-bold">{{ formatCurrency(inv.dueAmount) }}</td>
                  <td class="p-3">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold" :class="getInvoiceStatusBadge(inv.status)">
                      {{ inv.status }}
                    </span>
                  </td>
                  <td class="p-3 text-on-surface-variant">{{ inv.createdAt ? formatDate(inv.createdAt) : '-' }}</td>
                </tr>
                <tr v-if="customerInvoices.length === 0">
                  <td colspan="6" class="p-6 text-center text-on-surface-variant">No invoices found for this customer.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB 4: PAYMENTS -->
        <div v-if="activeTab === 'payments'" class="space-y-4">
          <div class="overflow-x-auto rounded-xl border border-outline-variant">
            <table class="w-full text-left text-xs">
              <thead class="bg-surface-container-low border-b border-outline-variant font-mono font-bold text-on-surface-variant">
                <tr>
                  <th class="p-3">Payment #</th>
                  <th class="p-3">Amount</th>
                  <th class="p-3">Method</th>
                  <th class="p-3">Reference</th>
                  <th class="p-3">Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant">
                <tr v-for="pmt in customerPayments" :key="pmt.id" class="hover:bg-surface-container-low/40">
                  <td class="p-3 font-mono font-bold text-success">{{ pmt.paymentNumber || '-' }}</td>
                  <td class="p-3 font-mono font-bold text-on-surface">{{ formatCurrency(pmt.amount) }}</td>
                  <td class="p-3"><span class="px-2 py-0.5 rounded bg-surface-container-high font-bold text-[10px]">{{ pmt.paymentMethod }}</span></td>
                  <td class="p-3 font-mono text-on-surface-variant">{{ pmt.referenceNumber || '-' }}</td>
                  <td class="p-3 text-on-surface-variant">{{ pmt.paymentDate ? formatDate(pmt.paymentDate) : '-' }}</td>
                </tr>
                <tr v-if="customerPayments.length === 0">
                  <td colspan="5" class="p-6 text-center text-on-surface-variant">No payment records found for this customer.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB 5: STATEMENT -->
        <div v-if="activeTab === 'statement'" class="space-y-4">
          <div v-if="customerStatement" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant">
              <div>
                <span class="text-xs font-mono font-bold text-on-surface-variant uppercase">Total Billed</span>
                <p class="text-xl font-black text-on-surface font-mono">{{ formatCurrency(customerStatement.totalBilled) }}</p>
              </div>
              <div>
                <span class="text-xs font-mono font-bold text-on-surface-variant uppercase">Total Paid</span>
                <p class="text-xl font-black text-success font-mono">{{ formatCurrency(customerStatement.totalPaid) }}</p>
              </div>
              <div>
                <span class="text-xs font-mono font-bold text-on-surface-variant uppercase">Outstanding Balance</span>
                <p class="text-xl font-black text-error font-mono">{{ formatCurrency(customerStatement.outstandingBalance) }}</p>
              </div>
            </div>

            <div class="flex justify-end">
              <button 
                @click="printStatement"
                class="h-9 px-4 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer class="w-3.5 h-3.5" />
                <span>Print Statement</span>
              </button>
            </div>
          </div>
          <div v-else class="p-6 text-center text-on-surface-variant">
            Loading statement...
          </div>
        </div>
      </div>
    </Modal>

    <!-- MODAL: ADD CONTACT PERSON -->
    <Modal
      :isOpen="showContactModal"
      :onClose="() => showContactModal = false"
      title="Add Contact Person"
      subtitle="Add a new contact person for this customer."
      maxWidth="max-w-md"
    >
      <form @submit.prevent="saveContactPerson" class="space-y-4">
        <div>
          <label class="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Full Name *</label>
          <input 
            type="text"
            v-model="contactForm.fullName"
            required
            placeholder="e.g. Jane Smith"
            class="w-full h-10 px-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm"
          />
        </div>

        <div>
          <label class="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Designation</label>
          <input 
            type="text"
            v-model="contactForm.designation"
            placeholder="e.g. Finance Manager"
            class="w-full h-10 px-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm"
          />
        </div>

        <div>
          <label class="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Phone</label>
          <input 
            type="text"
            v-model="contactForm.phone"
            placeholder="e.g. +255 712 345 678"
            class="w-full h-10 px-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm"
          />
        </div>

        <div>
          <label class="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Email</label>
          <input 
            type="email"
            v-model="contactForm.email"
            placeholder="e.g. jane@company.com"
            class="w-full h-10 px-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm"
          />
        </div>

        <div class="flex items-center gap-2">
          <input 
            type="checkbox"
            id="primaryContact"
            v-model="contactForm.primary"
            class="w-4 h-4 text-primary rounded border-outline-variant cursor-pointer"
          />
          <label for="primaryContact" class="text-sm font-semibold text-on-surface cursor-pointer">Set as Primary Contact</label>
        </div>

        <div class="pt-4 border-t border-outline-variant flex justify-end gap-3">
          <button 
            type="button" 
            @click="showContactModal = false"
            class="h-10 px-4 rounded-xl border border-outline-variant text-sm font-bold hover:bg-surface-container-high cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            :disabled="isSubmitting"
            class="h-10 px-5 rounded-xl bg-primary text-on-primary text-sm font-bold hover:bg-opacity-90 disabled:opacity-50 cursor-pointer"
          >
            Save Contact
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { 
  Users, 
  Search, 
  Plus, 
  Download, 
  CreditCard, 
  Eye, 
  Pencil, 
  Filter as FilterIcon,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Building2,
  UserCheck,
  FileText,
  PieChart,
  DollarSign,
  ShieldCheck,
  Printer,
  AlertCircle
} from 'lucide-vue-next';
import Toast from '../components/common/Toast.vue';
import Modal from '../components/common/Modal.vue';
import { customerService } from '../services/customerService';
import type { 
  Customer, 
  CustomerType, 
  CustomerStatus, 
  CustomerPayment, 
  Invoice, 
  CustomerStatement,
  CustomerContactPerson,
  PaymentMethod
} from '../models/types';

// Toast state
const toastMessage = ref<string | null>(null);
const toastType = ref<'success' | 'error'>('success');

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = message;
  toastType.value = type;
};

// Data State
const customers = ref<Customer[]>([]);
const isLoading = ref<boolean>(false);
const isSubmitting = ref<boolean>(false);

// Search & Pagination
const searchQuery = ref<string>('');
const selectedType = ref<string>('ALL');
const selectedStatus = ref<string>('ALL');
const currentPage = ref<number>(0);
const pageSize = ref<number>(10);
const totalElements = ref<number>(0);
const totalPages = ref<number>(0);

// Debounce timer
let debounceTimer: any = null;

// Stats
const stats = computed(() => {
  const totalCount = totalElements.value;
  const activeCount = customers.value.filter(c => c.status === 'ACTIVE').length;
  const companyCount = customers.value.filter(c => c.customerType === 'COMPANY').length;
  const totalOutstanding = customers.value.reduce((acc, c) => acc + (c.outstandingBalance || 0), 0);
  const totalCreditLimit = customers.value.reduce((acc, c) => acc + (c.creditLimit || 0), 0);

  return { totalCount, activeCount, companyCount, totalOutstanding, totalCreditLimit };
});

// Modals State
const showCustomerModal = ref<boolean>(false);
const isEditing = ref<boolean>(false);
const editingCustomerId = ref<string | null>(null);

const customerForm = ref<{
  customerType: CustomerType;
  firstName: string;
  lastName: string;
  companyName: string;
  displayName: string;
  tinNumber: string;
  vrnNumber: string;
  phone: string;
  email: string;
  address: string;
  creditLimit: number;
  status: CustomerStatus;
}>({
  customerType: 'PERSON',
  firstName: '',
  lastName: '',
  companyName: '',
  displayName: '',
  tinNumber: '',
  vrnNumber: '',
  phone: '',
  email: '',
  address: '',
  creditLimit: 0,
  status: 'ACTIVE'
});

// Record Payment Modal State
const showPaymentModal = ref<boolean>(false);
const paymentForm = ref<{
  customerId: string;
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  notes: string;
}>({
  customerId: '',
  invoiceId: '',
  amount: 0,
  paymentMethod: 'CASH',
  referenceNumber: '',
  notes: ''
});

// Customer Details Modal State
const showDetailsModal = ref<boolean>(false);
const selectedCustomer = ref<Customer | null>(null);
const activeTab = ref<string>('overview');
const customerInvoices = ref<Invoice[]>([]);
const customerPayments = ref<CustomerPayment[]>([]);
const customerStatement = ref<CustomerStatement | null>(null);

// Contact Person Modal State
const showContactModal = ref<boolean>(false);
const contactForm = ref<{
  fullName: string;
  designation: string;
  phone: string;
  email: string;
  primary: boolean;
}>({
  fullName: '',
  designation: '',
  phone: '',
  email: '',
  primary: false
});

// Methods
const fetchCustomers = async () => {
  isLoading.value = true;
  try {
    const res = await customerService.getAllCustomers({
      search: searchQuery.value || undefined,
      type: selectedType.value !== 'ALL' ? (selectedType.value as CustomerType) : undefined,
      page: currentPage.value,
      size: pageSize.value
    });

    customers.value = res.content || [];
    totalElements.value = res.totalElements || 0;
    totalPages.value = res.totalPages || 0;
  } catch (err: any) {
    showToast(err.message || 'Failed to fetch customers', 'error');
  } finally {
    isLoading.value = false;
  }
};

const debouncedFetch = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    currentPage.value = 0;
    fetchCustomers();
  }, 350);
};

const resetFilters = () => {
  searchQuery.value = '';
  selectedType.value = 'ALL';
  selectedStatus.value = 'ALL';
  currentPage.value = 0;
  fetchCustomers();
};

const goToPage = (page: number) => {
  if (page >= 0 && page < totalPages.value) {
    currentPage.value = page;
    fetchCustomers();
  }
};

// Validation State
const formErrors = ref<Record<string, string>>({});

const isCompany = computed(() => {
  return customerForm.value.customerType === 'COMPANY';
});

const validateField = (field: string) => {
  const errors: Record<string, string> = { ...formErrors.value };
  const isComp = isCompany.value;

  if (field === 'firstName') {
    if (customerForm.value.customerType === 'PERSON') {
      const val = (customerForm.value.firstName || '').trim();
      if (!val) {
        errors.firstName = 'First name is required.';
      } else if (val.length < 2) {
        errors.firstName = 'First name must be at least 2 characters.';
      } else if (!/^[a-zA-Z\s'\-]+$/.test(val)) {
        errors.firstName = 'First name contains invalid characters.';
      } else {
        delete errors.firstName;
      }
    } else {
      delete errors.firstName;
    }
  }

  if (field === 'lastName') {
    if (customerForm.value.customerType === 'PERSON') {
      const val = (customerForm.value.lastName || '').trim();
      if (!val) {
        errors.lastName = 'Last name is required.';
      } else if (val.length < 2) {
        errors.lastName = 'Last name must be at least 2 characters.';
      } else if (!/^[a-zA-Z\s'\-]+$/.test(val)) {
        errors.lastName = 'Last name contains invalid characters.';
      } else {
        delete errors.lastName;
      }
    } else {
      delete errors.lastName;
    }
  }

  if (field === 'companyName') {
    if (isComp) {
      const val = (customerForm.value.companyName || '').trim();
      if (!val) {
        errors.companyName = 'Company name is required.';
      } else if (val.length < 2) {
        errors.companyName = 'Company name must be at least 2 characters.';
      } else {
        delete errors.companyName;
      }
    } else {
      delete errors.companyName;
    }
  }

  if (field === 'phone') {
    const val = (customerForm.value.phone || '').trim();
    if (!val) {
      errors.phone = 'Phone number is required.';
    } else if (!/^\+?[0-9\s\-\(\)]{7,15}$/.test(val)) {
      errors.phone = 'Invalid phone number (7-15 digits, e.g. +255 700 000 000).';
    } else {
      delete errors.phone;
    }
  }

  if (field === 'address') {
    const val = (customerForm.value.address || '').trim();
    if (!val) {
      errors.address = 'Physical address is required.';
    } else if (val.length < 3) {
      errors.address = 'Physical address must be at least 3 characters.';
    } else {
      delete errors.address;
    }
  }

  if (field === 'email') {
    const val = (customerForm.value.email || '').trim();
    if (isComp && !val) {
      errors.email = 'Email address is required for Company customers.';
    } else if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      errors.email = 'Invalid email address format (e.g. info@company.co.tz).';
    } else {
      delete errors.email;
    }
  }

  if (field === 'tinNumber') {
    const val = (customerForm.value.tinNumber || '').trim();
    if (isComp && !val) {
      errors.tinNumber = 'TIN number is required for Company customers.';
    } else if (val) {
      const cleanTIN = val.replace(/-/g, '');
      if (!/^\d{9}$/.test(cleanTIN)) {
        errors.tinNumber = 'TIN must be 9 digits (e.g. 123-456-789 or 123456789).';
      } else {
        delete errors.tinNumber;
      }
    } else {
      delete errors.tinNumber;
    }
  }

  if (field === 'vrnNumber') {
    const val = (customerForm.value.vrnNumber || '').trim();
    if (isComp && !val) {
      errors.vrnNumber = 'VRN number is required for Company customers.';
    } else if (val) {
      if (!/^[A-Za-z0-9\-\s]{6,20}$/.test(val)) {
        errors.vrnNumber = 'VRN must be 6-20 alphanumeric characters.';
      } else {
        delete errors.vrnNumber;
      }
    } else {
      delete errors.vrnNumber;
    }
  }

  if (field === 'creditLimit') {
    const cl = customerForm.value.creditLimit;
    if (cl === null || cl === undefined || isNaN(cl) || cl <= 0) {
      errors.creditLimit = 'Credit limit must be greater than zero.';
    } else {
      delete errors.creditLimit;
    }
  }

  formErrors.value = errors;
};

const setCustomerType = (type: CustomerType) => {
  customerForm.value.customerType = type;
  formErrors.value = {};
};

const validateCustomerForm = (): boolean => {
  const fields = ['firstName', 'lastName', 'companyName', 'phone', 'address', 'email', 'tinNumber', 'vrnNumber', 'creditLimit'];
  fields.forEach(f => validateField(f));
  return Object.keys(formErrors.value).length === 0;
};

const openAddModal = () => {
  isEditing.value = false;
  editingCustomerId.value = null;
  formErrors.value = {};
  customerForm.value = {
    customerType: 'PERSON',
    firstName: '',
    lastName: '',
    companyName: '',
    displayName: '',
    tinNumber: '',
    vrnNumber: '',
    phone: '',
    email: '',
    address: '',
    creditLimit: 0,
    status: 'ACTIVE'
  };
  showCustomerModal.value = true;
};

const openEditModal = (c: Customer) => {
  isEditing.value = true;
  editingCustomerId.value = c.id || null;
  formErrors.value = {};
  customerForm.value = {
    customerType: c.customerType || 'PERSON',
    firstName: c.firstName || '',
    lastName: c.lastName || '',
    companyName: c.companyName || '',
    displayName: c.displayName || '',
    tinNumber: c.tinNumber || '',
    vrnNumber: c.vrnNumber || '',
    phone: c.phone || '',
    email: c.email || '',
    address: c.address || '',
    creditLimit: c.creditLimit || 0,
    status: c.status || 'ACTIVE'
  };
  showCustomerModal.value = true;
};

const saveCustomer = async () => {
  if (!validateCustomerForm()) {
    showToast('Please fix the validation errors before saving.', 'error');
    return;
  }

  isSubmitting.value = true;
  try {
    const payload: Customer = {
      customerType: customerForm.value.customerType,
      firstName: customerForm.value.firstName,
      lastName: customerForm.value.lastName,
      companyName: customerForm.value.companyName,
      displayName: customerForm.value.displayName || (customerForm.value.firstName ? `${customerForm.value.firstName} ${customerForm.value.lastName || ''}`.trim() : customerForm.value.companyName),
      tinNumber: customerForm.value.tinNumber,
      vrnNumber: customerForm.value.vrnNumber,
      phone: customerForm.value.phone,
      email: customerForm.value.email,
      address: customerForm.value.address,
      creditLimit: customerForm.value.creditLimit,
      status: customerForm.value.status
    };

    if (isEditing.value && editingCustomerId.value) {
      await customerService.updateCustomer(editingCustomerId.value, payload);
      showToast('Customer updated successfully', 'success');
    } else {
      await customerService.createCustomer(payload);
      showToast('Customer created successfully', 'success');
    }

    showCustomerModal.value = false;
    fetchCustomers();
  } catch (err: any) {
    showToast(err.message || 'Failed to save customer', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const openRecordPaymentModal = (c?: Customer) => {
  paymentForm.value = {
    customerId: c?.id || (customers.value[0]?.id || ''),
    invoiceId: '',
    amount: c?.outstandingBalance || 0,
    paymentMethod: 'CASH',
    referenceNumber: '',
    notes: ''
  };
  if (c?.id) {
    onPaymentCustomerChange();
  }
  showPaymentModal.value = true;
};

const onPaymentCustomerChange = async () => {
  if (!paymentForm.value.customerId) return;
  try {
    const res = await customerService.getAllInvoices({
      customerId: paymentForm.value.customerId,
      size: 20
    });
    customerInvoices.value = res.content || [];
  } catch (err) {
    console.error('Failed to load customer invoices for payment', err);
  }
};

const savePayment = async () => {
  if (!paymentForm.value.customerId || paymentForm.value.amount <= 0) {
    showToast('Please enter a valid customer and payment amount', 'error');
    return;
  }

  isSubmitting.value = true;
  try {
    await customerService.recordPayment({
      customerId: paymentForm.value.customerId,
      invoiceId: paymentForm.value.invoiceId || undefined,
      amount: paymentForm.value.amount,
      paymentMethod: paymentForm.value.paymentMethod,
      referenceNumber: paymentForm.value.referenceNumber,
      notes: paymentForm.value.notes
    });

    showToast('Customer payment recorded successfully', 'success');
    showPaymentModal.value = false;
    fetchCustomers();
  } catch (err: any) {
    showToast(err.message || 'Failed to record payment', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const openDetailsModal = async (c: Customer) => {
  selectedCustomer.value = c;
  activeTab.value = 'overview';
  showDetailsModal.value = true;

  if (c.id) {
    try {
      // Fetch fresh details, statement, invoices, payments concurrently
      const [fresh, stmt, invs, pmts] = await Promise.all([
        customerService.getCustomerById(c.id).catch(() => c),
        customerService.getCustomerStatement(c.id).catch(() => null),
        customerService.getAllInvoices({ customerId: c.id, size: 50 }).catch(() => ({ content: [] })),
        customerService.getAllPayments({ customerId: c.id, size: 50 }).catch(() => ({ content: [] }))
      ]);

      selectedCustomer.value = fresh;
      customerStatement.value = stmt;
      customerInvoices.value = invs.content || [];
      customerPayments.value = pmts.content || [];
    } catch (err) {
      console.error('Error fetching customer details drawer data', err);
    }
  }
};

const openAddContactModal = () => {
  contactForm.value = {
    fullName: '',
    designation: '',
    phone: '',
    email: '',
    primary: false
  };
  showContactModal.value = true;
};

const saveContactPerson = async () => {
  if (!selectedCustomer.value?.id) return;
  isSubmitting.value = true;

  try {
    const created = await customerService.addContactPerson(selectedCustomer.value.id, {
      fullName: contactForm.value.fullName,
      designation: contactForm.value.designation,
      phone: contactForm.value.phone,
      email: contactForm.value.email,
      primary: contactForm.value.primary
    });

    if (!selectedCustomer.value.contactPersons) {
      selectedCustomer.value.contactPersons = [];
    }
    selectedCustomer.value.contactPersons.push(created);
    showToast('Contact person added', 'success');
    showContactModal.value = false;
  } catch (err: any) {
    showToast(err.message || 'Failed to add contact person', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const deleteContactPerson = async (contactId: string) => {
  if (!selectedCustomer.value?.id) return;
  if (!confirm('Are you sure you want to delete this contact person?')) return;

  try {
    await customerService.deleteContactPerson(selectedCustomer.value.id, contactId);
    selectedCustomer.value.contactPersons = (selectedCustomer.value.contactPersons || []).filter(cp => cp.id !== contactId);
    showToast('Contact person removed', 'success');
  } catch (err: any) {
    showToast(err.message || 'Failed to remove contact person', 'error');
  }
};

const printStatement = () => {
  window.print();
};

const handleExportCSV = () => {
  if (customers.value.length === 0) {
    showToast('No customer records to export', 'error');
    return;
  }

  const headers = ['Code', 'Display Name', 'Type', 'Phone', 'Email', 'TIN', 'Credit Limit', 'Outstanding Balance', 'Status'];
  const rows = customers.value.map(c => [
    `"${c.code || ''}"`,
    `"${c.displayName || c.companyName || (c.firstName + ' ' + (c.lastName || ''))}"`,
    `"${c.customerType}"`,
    `"${c.phone || ''}"`,
    `"${c.email || ''}"`,
    `"${c.tinNumber || ''}"`,
    c.creditLimit || 0,
    c.outstandingBalance || 0,
    `"${c.status}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `customers_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Customers exported to CSV', 'success');
};

// Utilities
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val || 0);
};

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

const getTypeBadgeClass = (type: CustomerType) => {
  switch (type) {
    case 'COMPANY':
      return 'bg-secondary/10 text-secondary border border-secondary/20';
    case 'PERSON':
    default:
      return 'bg-primary/10 text-primary border border-primary/20';
  }
};

const getInvoiceStatusBadge = (status: string) => {
  switch (status) {
    case 'PAID':
      return 'bg-success/10 text-success';
    case 'PARTIALLY_PAID':
      return 'bg-warning/10 text-warning';
    case 'UNPAID':
    case 'OVERDUE':
      return 'bg-error/10 text-error';
    default:
      return 'bg-surface-container-high text-on-surface-variant';
  }
};

// Lifecycle
onMounted(() => {
  fetchCustomers();
});
</script>
