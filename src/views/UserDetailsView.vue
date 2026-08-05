<template>
  <div class="flex flex-col gap-6 font-sans">
    <!-- Header with Back Button -->
    <div class="flex items-center gap-4">
      <button 
        @click="router.push('/users')"
        class="w-10 h-10 bg-surface-container-low border border-outline-variant rounded-xl flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface transition-colors cursor-pointer shadow-sm"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <div>
        <h1 class="text-2xl font-black text-on-surface tracking-tight">User Details</h1>
        <p class="text-sm text-on-surface-variant mt-1">Detailed profile and system access</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-12 flex justify-center">
      <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- User Profile Card -->
    <div v-else-if="user" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <!-- Left Column: Profile Summary -->
      <div class="md:col-span-1 flex flex-col gap-6">
        <div class="bg-surface rounded-2xl border border-outline-variant p-6 flex flex-col items-center text-center shadow-sm">
          <div class="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center mb-4 relative">
            <UserIcon class="w-10 h-10 text-primary" />
            <div 
              class="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-surface"
              :class="user.active ? 'bg-success' : 'bg-error'"
              :title="user.active ? 'Active' : 'Blocked'"
            ></div>
          </div>
          <h2 class="text-xl font-bold text-on-surface">{{ user.fullName }}</h2>
          <p class="text-sm text-on-surface-variant mt-1">{{ user.role.replace('_', ' ') }}</p>
          
          <div class="w-full mt-6 flex flex-col gap-3">
            <div class="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/50">
              <Phone class="w-4 h-4 text-on-surface-variant shrink-0" />
              <span class="text-sm text-on-surface font-medium">{{ user.phone }}</span>
            </div>
            <div class="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/50">
              <Store class="w-4 h-4 text-on-surface-variant shrink-0" />
              <span class="text-sm text-on-surface font-medium">{{ branchName || 'No Branch Assigned' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: System Details & Permissions -->
      <div class="md:col-span-2 flex flex-col gap-6">
        <!-- System Details Card -->
        <div class="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm">
          <h3 class="text-base font-bold text-on-surface mb-6 flex items-center gap-2">
            <ShieldCheck class="w-5 h-5 text-primary" />
            System Details
          </h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="flex flex-col gap-1.5">
              <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Account ID</span>
              <span class="text-sm font-mono text-on-surface bg-surface-container-lowest px-3 py-2 rounded-lg border border-outline-variant/50 truncate">{{ user.id }}</span>
            </div>
            <div class="flex flex-col gap-1.5">
              <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Store ID</span>
              <span class="text-sm font-mono text-on-surface bg-surface-container-lowest px-3 py-2 rounded-lg border border-outline-variant/50 truncate">{{ user.storeId || 'N/A' }}</span>
            </div>
            <div class="flex flex-col gap-1.5">
              <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Created At</span>
              <span class="text-sm text-on-surface">{{ formatDate(user.createdAt) }}</span>
            </div>
            <div class="flex flex-col gap-1.5">
              <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Last Login</span>
              <span class="text-sm text-on-surface">{{ user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never logged in' }}</span>
            </div>
          </div>
        </div>

        <!-- User Permissions Section -->
        <div class="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-on-surface flex items-center gap-2">
              <KeyRound class="w-5 h-5 text-primary" />
              User Permissions & Access
              <span v-if="userPermissions.length > 0" class="ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-container text-primary border border-primary/20">
                {{ userPermissions.length }}
              </span>
            </h3>
            <button 
              @click="openPermissionsModal"
              class="px-3.5 py-1.5 bg-primary text-on-primary rounded-xl font-bold text-xs hover:bg-opacity-95 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus class="w-4 h-4" />
              <span>{{ userPermissions.length > 0 ? 'Edit Permissions' : 'Add permission' }}</span>
            </button>
          </div>

          <!-- Loading state for permissions -->
          <div v-if="isPermissionsLoading" class="py-8 flex justify-center">
            <div class="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>

          <!-- Permissions Table (when permissions exist) -->
          <div v-else-if="userPermissions.length > 0" class="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="bg-surface-container-low text-xs uppercase text-on-surface-variant font-mono tracking-wider border-b border-outline-variant">
                <tr>
                  <th class="px-4 py-3">Permission Name</th>
                  <th class="px-4 py-3">Code</th>
                  <th class="px-4 py-3">Category</th>
                  <th class="px-4 py-3">Description</th>
                  <th class="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant">
                <tr v-for="perm in assignedPermissionObjects" :key="perm.code" class="hover:bg-surface-container/30 transition-colors">
                  <td class="px-4 py-3 font-semibold text-on-surface">
                    {{ perm.name }}
                  </td>
                  <td class="px-4 py-3">
                    <span class="font-mono text-xs text-primary bg-primary-container/20 px-2 py-1 rounded border border-primary/20">
                      {{ perm.code }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <span class="px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-surface-container-high text-on-surface-variant border border-outline-variant">
                      {{ perm.category }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-xs text-on-surface-variant max-w-xs truncate">
                    {{ perm.description || '-' }}
                  </td>
                  <td class="px-4 py-3 text-right">
                    <!-- Disable / hide delete for pos:checkout when user is CASHIER -->
                    <template v-if="user.role === 'CASHIER' && perm.code === 'pos:checkout'">
                      <span 
                        class="inline-flex items-center gap-1 text-[11px] font-bold text-on-surface-variant/70 bg-surface-container-high px-2.5 py-1 rounded-lg border border-outline-variant cursor-not-allowed"
                        title="Default Cashier role permission cannot be deleted"
                      >
                        <Lock class="w-3 h-3 text-primary" />
                        <span>Role Default</span>
                      </span>
                    </template>
                    <template v-else>
                      <button 
                        @click="promptRevokePermission(perm)"
                        title="Revoke Permission"
                        class="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty Permissions Table (when no permissions exist) -->
          <div v-else class="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="bg-surface-container-low text-xs uppercase text-on-surface-variant font-mono tracking-wider border-b border-outline-variant">
                <tr>
                  <th class="px-4 py-3">Permission Name</th>
                  <th class="px-4 py-3">Code</th>
                  <th class="px-4 py-3">Category</th>
                  <th class="px-4 py-3">Description</th>
                  <th class="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="5" class="py-12 px-4 text-center">
                    <div class="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div class="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-3">
                        <ShieldAlert class="w-6 h-6 text-on-surface-variant/60" />
                      </div>
                      <h4 class="text-sm font-bold text-on-surface">No permissions assigned</h4>
                      <p class="text-xs text-on-surface-variant mt-1 mb-4">This user currently has no explicit permissions assigned. Click below to assign permissions from the catalog.</p>
                      <button 
                        @click="openPermissionsModal"
                        class="px-4 py-2 bg-primary text-on-primary rounded-xl font-bold text-xs hover:bg-opacity-95 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                      >
                        <Plus class="w-4 h-4" />
                        <span>Add permission</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Shifts Log for Cashier / Activity Log Placeholder for non-Cashier -->
        <div class="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm flex-1 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-on-surface flex items-center gap-2">
              <Clock v-if="user.role === 'CASHIER'" class="w-5 h-5 text-primary" />
              <History v-else class="w-5 h-5 text-primary" />
              {{ user.role === 'CASHIER' ? 'Recent Shifts' : 'Recent Activity' }}
            </h3>
            <button 
              v-if="user.role === 'CASHIER'"
              @click="router.push(`/users/${user.id}/shifts`)"
              class="text-xs font-bold text-primary hover:bg-primary/10 transition-colors flex items-center gap-1.5 cursor-pointer bg-primary-container/20 px-3 py-1.5 rounded-lg border border-primary/20"
            >
              <span>View all Shifts</span>
              <ExternalLink class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Cashier Shifts Table -->
          <div v-if="user.role === 'CASHIER'" class="flex-1 flex flex-col">
            <div v-if="user.shifts && user.shifts.length > 0" class="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest">
              <table class="w-full text-left text-sm whitespace-nowrap">
                <thead class="bg-surface-container-low text-xs uppercase text-on-surface-variant font-mono tracking-wider border-b border-outline-variant">
                  <tr>
                    <th class="px-4 py-3">Opened At</th>
                    <th class="px-4 py-3">Status</th>
                    <th class="px-4 py-3 text-right">Opening Cash</th>
                    <th class="px-4 py-3 text-right">Total Sales</th>
                    <th class="px-4 py-3 text-right">Discrepancy</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-outline-variant">
                  <tr 
                    v-for="shift in user.shifts.slice(0, 5)" 
                    :key="shift.id" 
                    @click="router.push(`/shifts/${shift.id}`)"
                    class="hover:bg-primary-container/10 transition-colors cursor-pointer group"
                    title="Click to view shift details"
                  >
                    <td class="px-4 py-3 font-mono text-xs text-on-surface group-hover:text-primary transition-colors">
                      {{ formatDate(shift.openedAt) }}
                    </td>
                    <td class="px-4 py-3">
                      <span 
                        class="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border"
                        :class="shift.status === 'OPEN' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-surface-container-high text-on-surface-variant border-outline-variant'"
                      >
                        {{ shift.status }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right font-mono text-xs text-on-surface-variant">
                      {{ formatCurrency(shift.openingCash) }}
                    </td>
                    <td class="px-4 py-3 text-right font-mono text-xs font-bold text-primary">
                      {{ formatCurrency(shift.totalSales) }}
                    </td>
                    <td class="px-4 py-3 text-right font-mono text-xs font-bold">
                      <span v-if="shift.discrepancy != null" :class="shift.discrepancy === 0 ? 'text-success' : shift.discrepancy < 0 ? 'text-error' : 'text-warning'">
                        {{ formatCurrency(shift.discrepancy) }}
                      </span>
                      <span v-else class="text-on-surface-variant/40">-</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant">
              <Clock class="w-8 h-8 text-on-surface-variant/30 mb-2" />
              <p class="text-sm text-on-surface-variant font-medium">No shifts recorded for this cashier yet.</p>
            </div>
          </div>

          <!-- Non-Cashier Activity Log Placeholder -->
          <div v-else class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant">
            <History class="w-8 h-8 text-on-surface-variant/30 mb-2" />
            <p class="text-sm text-on-surface-variant font-medium">Activity logs are not available for this user.</p>
          </div>
        </div>
      </div>
      
    </div>

    <!-- Error State -->
    <div v-else class="py-12 flex flex-col items-center justify-center text-center bg-surface rounded-2xl border border-outline-variant">
      <div class="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center text-error mb-4">
        <UserIcon class="w-8 h-8" />
      </div>
      <h3 class="text-lg font-bold text-on-surface">User Not Found</h3>
      <p class="text-sm text-on-surface-variant mt-2 max-w-sm">The user you are looking for does not exist or you do not have permission to view their profile.</p>
      <button 
        @click="router.push('/users')"
        class="mt-6 px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm hover:bg-opacity-95 transition-colors cursor-pointer"
      >
        Return to Users
      </button>
    </div>

    <!-- Confirmation Modal for Revoking a Permission -->
    <Modal
      v-if="user && permissionToRevoke"
      :isOpen="showRevokeModal"
      title="Revoke Permission"
      subtitle="Confirm permission removal"
      :onClose="() => { showRevokeModal = false; permissionToRevoke = null; }"
      maxWidth="max-w-md"
    >
      <div class="flex flex-col gap-4">
        <div class="flex items-start gap-3 p-4 bg-error/10 text-error rounded-xl border border-error/20">
          <AlertTriangle class="w-5 h-5 shrink-0 mt-0.5" />
          <div class="text-xs space-y-1">
            <p class="font-bold text-sm">Are you sure you want to revoke this permission?</p>
            <p class="text-on-surface-variant">
              You are about to remove <strong>{{ permissionToRevoke.name }}</strong> (<code class="font-mono text-primary font-bold">{{ permissionToRevoke.code }}</code>) from <strong>{{ user.fullName }}</strong>.
            </p>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2 border-t border-outline-variant/60">
          <button 
            @click="showRevokeModal = false; permissionToRevoke = null;"
            class="px-4 py-2 bg-surface-container-high text-on-surface rounded-xl font-bold text-xs hover:bg-surface-container transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            @click="confirmRevokePermission"
            :disabled="isRevoking"
            class="px-4 py-2 bg-error text-on-error rounded-xl font-bold text-xs hover:bg-opacity-95 transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50 shadow-xs"
          >
            <div v-if="isRevoking" class="w-3.5 h-3.5 border-2 border-on-error border-t-transparent rounded-full animate-spin"></div>
            <span>Confirm Revoke</span>
          </button>
        </div>
      </div>
    </Modal>

    <!-- Permission Assignment Modal -->
    <Modal
      v-if="user"
      :isOpen="showPermissionsModal"
      :title="`Assign Permissions - ${user.fullName}`"
      subtitle="Select system permissions to grant access to this user"
      :onClose="() => showPermissionsModal = false"
      maxWidth="max-w-3xl"
    >
      <div class="flex flex-col gap-4 max-h-[75vh]">
        <!-- Search Controls -->
        <div class="relative">
          <Search class="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            v-model="permissionSearchQuery"
            type="text" 
            placeholder="Search permissions by name, code or description..."
            class="w-full pl-9 pr-4 py-2.5 text-sm bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <!-- Category Tabs -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 border-b border-outline-variant/60">
          <button 
            v-for="cat in availableCategories" 
            :key="cat"
            @click="activeCategoryTab = cat"
            class="px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            :class="activeCategoryTab === cat ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'"
          >
            {{ cat }}
          </button>
        </div>

        <!-- Permissions Catalog Selection Area -->
        <div class="overflow-y-auto pr-1 flex-1 space-y-6 max-h-[380px]">
          <div v-if="groupedFilteredCatalog.length === 0" class="py-12 text-center text-on-surface-variant text-sm">
            No permissions found matching your search.
          </div>

          <div 
            v-for="group in groupedFilteredCatalog" 
            :key="group.category"
            class="flex flex-col gap-2"
          >
            <!-- Category Header -->
            <div class="flex items-center justify-between bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/60">
              <span class="text-xs font-black uppercase tracking-wider text-on-surface font-mono">
                {{ group.category }} ({{ group.permissions.length }})
              </span>
              <div class="flex items-center gap-3 text-xs">
                <button 
                  @click="toggleGroupPermissions(group.permissions, true)"
                  class="text-primary font-bold hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <span class="text-outline-variant">|</span>
                <button 
                  @click="toggleGroupPermissions(group.permissions, false)"
                  class="text-on-surface-variant font-medium hover:underline cursor-pointer"
                >
                  Deselect All
                </button>
              </div>
            </div>

            <!-- Permission Items -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label 
                v-for="perm in group.permissions" 
                :key="perm.code"
                class="flex items-start gap-3 p-3 rounded-xl border transition-colors"
                :class="[
                  user.role === 'CASHIER' && perm.code === 'pos:checkout' ? 'opacity-75 bg-surface-container/50 border-outline-variant/60 cursor-not-allowed' : 'cursor-pointer hover:border-outline-variant',
                  selectedCodes.has(perm.code) ? 'border-primary bg-primary-container/10' : 'border-outline-variant/60 bg-surface-container-lowest'
                ]"
              >
                <input 
                  type="checkbox"
                  :checked="selectedCodes.has(perm.code) || (user.role === 'CASHIER' && perm.code === 'pos:checkout')"
                  :disabled="user.role === 'CASHIER' && perm.code === 'pos:checkout'"
                  @change="togglePermissionCode(perm.code)"
                  class="mt-0.5 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary accent-primary cursor-pointer disabled:cursor-not-allowed"
                />
                <div class="flex flex-col gap-0.5 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-bold text-on-surface truncate">{{ perm.name }}</span>
                    <span v-if="user.role === 'CASHIER' && perm.code === 'pos:checkout'" class="text-[10px] font-bold text-primary bg-primary-container/40 px-1.5 py-0.2 rounded border border-primary/20">Role Default</span>
                  </div>
                  <span class="font-mono text-[11px] text-primary font-semibold truncate">{{ perm.code }}</span>
                  <p v-if="perm.description" class="text-xs text-on-surface-variant/80 mt-1 line-clamp-2">
                    {{ perm.description }}
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Modal Footer Actions -->
        <div class="flex items-center justify-between pt-4 border-t border-outline-variant mt-2">
          <span class="text-xs font-medium text-on-surface-variant">
            Selected <strong class="text-primary font-bold">{{ selectedCodes.size }}</strong> permission(s)
          </span>
          <div class="flex items-center gap-3">
            <button 
              @click="showPermissionsModal = false"
              class="px-4 py-2 bg-surface-container-high text-on-surface rounded-xl font-bold text-xs hover:bg-surface-container transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              @click="savePermissions"
              :disabled="isSavingPermissions"
              class="px-5 py-2 bg-primary text-on-primary rounded-xl font-bold text-xs hover:bg-opacity-95 transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50 shadow-xs"
            >
              <div v-if="isSavingPermissions" class="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Save Permissions</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>

    <!-- All Shifts Modal for Cashier -->
    <Modal
      v-if="user && user.role === 'CASHIER'"
      :isOpen="showAllShiftsModal"
      :title="`Cashier Shifts - ${user.fullName}`"
      subtitle="Complete shift history and reconciliation details"
      :onClose="() => showAllShiftsModal = false"
      maxWidth="max-w-4xl"
    >
      <div class="flex flex-col gap-4">
        <div v-if="user.shifts && user.shifts.length > 0" class="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-surface-container-low text-xs uppercase text-on-surface-variant font-mono tracking-wider border-b border-outline-variant">
              <tr>
                <th class="px-4 py-3">Opened At</th>
                <th class="px-4 py-3">Closed At</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3 text-right">Opening Cash</th>
                <th class="px-4 py-3 text-right">Total Sales</th>
                <th class="px-4 py-3 text-right">Expected Cash</th>
                <th class="px-4 py-3 text-right">Actual Cash</th>
                <th class="px-4 py-3 text-right">Discrepancy</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant">
              <tr v-for="shift in user.shifts" :key="shift.id" class="hover:bg-surface-container/30 transition-colors">
                <td class="px-4 py-3 font-mono text-xs text-on-surface">
                  {{ formatDate(shift.openedAt) }}
                </td>
                <td class="px-4 py-3 font-mono text-xs text-on-surface-variant">
                  {{ shift.closedAt ? formatDate(shift.closedAt) : 'Still Open' }}
                </td>
                <td class="px-4 py-3">
                  <span 
                    class="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border"
                    :class="shift.status === 'OPEN' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-surface-container-high text-on-surface-variant border-outline-variant'"
                  >
                    {{ shift.status }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right font-mono text-xs text-on-surface-variant">
                  {{ formatCurrency(shift.openingCash) }}
                </td>
                <td class="px-4 py-3 text-right font-mono text-xs font-bold text-primary">
                  {{ formatCurrency(shift.totalSales) }}
                </td>
                <td class="px-4 py-3 text-right font-mono text-xs text-on-surface-variant">
                  {{ formatCurrency(shift.expectedCash) }}
                </td>
                <td class="px-4 py-3 text-right font-mono text-xs text-on-surface font-semibold">
                  {{ shift.actualCash != null ? formatCurrency(shift.actualCash) : '-' }}
                </td>
                <td class="px-4 py-3 text-right font-mono text-xs font-bold">
                  <span v-if="shift.discrepancy != null" :class="shift.discrepancy === 0 ? 'text-success' : shift.discrepancy < 0 ? 'text-error' : 'text-warning'">
                    {{ formatCurrency(shift.discrepancy) }}
                  </span>
                  <span v-else class="text-on-surface-variant/40">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="p-8 text-center bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant">
          <p class="text-sm text-on-surface-variant font-medium">No shifts recorded for this cashier yet.</p>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  ArrowLeft, 
  User as UserIcon, 
  Phone, 
  Store, 
  ShieldCheck, 
  History, 
  Clock, 
  ExternalLink,
  KeyRound,
  Plus,
  Search,
  Trash2,
  ShieldAlert,
  AlertTriangle,
  Lock
} from 'lucide-vue-next';
import { useUserViewModel } from '../viewmodels/useUserViewModel';
import type { AppUser, Permission } from '../models/types';
import { formatCurrency } from '../models/mockData';
import Modal from '../components/common/Modal.vue';

const route = useRoute();
const router = useRouter();
const { 
  fetchUserById, 
  fetchBranches, 
  fetchUserPermissions, 
  fetchPermissionsCatalog, 
  updateUserPermissions, 
  branches, 
  isLoading 
} = useUserViewModel();

const user = ref<AppUser | null>(null);
const showAllShiftsModal = ref(false);

// Permissions State
const userPermissions = ref<string[]>([]);
const catalog = ref<Permission[]>([]);
const isPermissionsLoading = ref(false);
const isSavingPermissions = ref(false);
const showPermissionsModal = ref(false);
const selectedCodes = ref<Set<string>>(new Set());
const permissionSearchQuery = ref('');
const activeCategoryTab = ref<string>('ALL');

// Revoke Confirmation State
const showRevokeModal = ref(false);
const permissionToRevoke = ref<Permission | null>(null);
const isRevoking = ref(false);

const branchName = computed(() => {
  if (!user.value || !user.value.branchId) return '';
  const branch = branches.value.find(b => b.id === user.value?.branchId);
  return branch ? branch.name : user.value.branchId;
});

// Map catalog permissions by code for quick lookup
const catalogMap = computed(() => {
  const map = new Map<string, Permission>();
  catalog.value.forEach(p => map.set(p.code, p));
  return map;
});

// Assigned permission objects formatted for display
const assignedPermissionObjects = computed(() => {
  return userPermissions.value.map(code => {
    const existing = catalogMap.value.get(code);
    if (existing) return existing;

    // Fallback if code isn't in catalog yet
    const formattedName = code.split(/[_:]/).map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
    return {
      code,
      name: formattedName,
      category: 'GENERAL',
      description: `Permission code: ${code}`
    } as Permission;
  });
});

// Available categories for tabs
const availableCategories = computed(() => {
  const cats = new Set<string>();
  catalog.value.forEach(p => {
    if (p.category) cats.add(p.category.toUpperCase());
  });
  return ['ALL', ...Array.from(cats)];
});

// Grouped and filtered permissions catalog for modal
const groupedFilteredCatalog = computed(() => {
  const query = permissionSearchQuery.value.trim().toLowerCase();
  const selectedCategory = activeCategoryTab.value;

  const filtered = catalog.value.filter(p => {
    const matchesCategory = selectedCategory === 'ALL' || (p.category && p.category.toUpperCase() === selectedCategory);
    const matchesSearch = !query || 
      p.code.toLowerCase().includes(query) || 
      p.name.toLowerCase().includes(query) || 
      (p.description && p.description.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  const groupMap = new Map<string, Permission[]>();
  filtered.forEach(p => {
    const cat = p.category ? p.category.toUpperCase() : 'GENERAL';
    if (!groupMap.has(cat)) groupMap.set(cat, []);
    groupMap.get(cat)!.push(p);
  });

  return Array.from(groupMap.entries()).map(([category, permissions]) => ({
    category,
    permissions
  }));
});

onMounted(async () => {
  const userId = route.params.id as string;
  if (userId) {
    const fetchedUser = await fetchUserById(userId);
    if (fetchedUser) {
      user.value = fetchedUser;
      if (branches.value.length === 0) {
        await fetchBranches();
      }
      await loadUserPermissions(userId);
    }
  }
});

const loadUserPermissions = async (userId: string) => {
  isPermissionsLoading.value = true;
  try {
    const perms = await fetchUserPermissions(userId);
    userPermissions.value = perms;
  } finally {
    isPermissionsLoading.value = false;
  }
};

const openPermissionsModal = async () => {
  if (catalog.value.length === 0) {
    catalog.value = await fetchPermissionsCatalog();
  }
  const codesSet = new Set(userPermissions.value);
  // Ensure pos:checkout is included for Cashiers
  if (user.value?.role === 'CASHIER') {
    codesSet.add('pos:checkout');
  }
  selectedCodes.value = codesSet;
  permissionSearchQuery.value = '';
  activeCategoryTab.value = 'ALL';
  showPermissionsModal.value = true;
};

const togglePermissionCode = (code: string) => {
  // pos:checkout cannot be toggled off for CASHIER users
  if (user.value?.role === 'CASHIER' && code === 'pos:checkout') return;

  const newSet = new Set(selectedCodes.value);
  if (newSet.has(code)) {
    newSet.delete(code);
  } else {
    newSet.add(code);
  }
  selectedCodes.value = newSet;
};

const toggleGroupPermissions = (permissions: Permission[], enable: boolean) => {
  const newSet = new Set(selectedCodes.value);
  permissions.forEach(p => {
    if (enable) {
      newSet.add(p.code);
    } else {
      if (user.value?.role === 'CASHIER' && p.code === 'pos:checkout') return;
      newSet.delete(p.code);
    }
  });
  selectedCodes.value = newSet;
};

const savePermissions = async () => {
  if (!user.value) return;
  isSavingPermissions.value = true;
  const newPermissions = Array.from(selectedCodes.value);
  const success = await updateUserPermissions(user.value.id, newPermissions);
  if (success) {
    userPermissions.value = newPermissions;
    showPermissionsModal.value = false;
  }
  isSavingPermissions.value = false;
};

const promptRevokePermission = (perm: Permission) => {
  // Prevent prompt for pos:checkout for CASHIER users
  if (user.value?.role === 'CASHIER' && perm.code === 'pos:checkout') return;

  permissionToRevoke.value = perm;
  showRevokeModal.value = true;
};

const confirmRevokePermission = async () => {
  if (!user.value || !permissionToRevoke.value) return;
  isRevoking.value = true;
  try {
    const codeToRevoke = permissionToRevoke.value.code;
    const updatedPermissions = userPermissions.value.filter(c => c !== codeToRevoke);
    const success = await updateUserPermissions(user.value.id, updatedPermissions);
    if (success) {
      userPermissions.value = updatedPermissions;
      showRevokeModal.value = false;
      permissionToRevoke.value = null;
    }
  } finally {
    isRevoking.value = false;
  }
};

const formatDate = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
};
</script>
