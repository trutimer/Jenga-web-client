<template>
  <Teleport to="body">
    <!-- Backdrop Overlay -->
    <Transition name="fade">
      <div 
        v-if="isOpen" 
        @click="handleBackdropClick"
        class="fixed inset-0 bg-black/45 backdrop-blur-xs z-40 transition-opacity"
      ></div>
    </Transition>

    <!-- Main Drawer / Fullscreen Immersion Panel -->
    <Transition name="drawer">
      <div 
        v-if="isOpen"
        class="fixed top-0 right-0 h-full z-50 bg-surface-container-lowest border-outline-variant shadow-2xl flex flex-col font-sans transition-all duration-300 select-text"
        :class="isFullscreen 
          ? 'w-full inset-0 rounded-none border-0' 
          : 'w-full sm:w-[540px] md:w-[620px] border-l'"
      >
        <!-- Header -->
        <div class="px-5 py-4 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-low shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-amber-500 text-white flex items-center justify-center shadow-sm">
              <Sparkles class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-extrabold text-on-surface text-base tracking-tight">Jenga AI Assistant</h3>
                <span class="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active
                </span>
              </div>
              <p class="text-[11px] text-on-surface-variant font-medium">Progressive Analytics & Investigation Engine</p>
            </div>
          </div>

          <!-- Header Actions -->
          <div class="flex items-center gap-1.5">
            <!-- Reset / Clear Chat -->
            <button 
              type="button"
              v-if="messages.length > 0"
              @click="clearChat"
              class="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer transition-colors border-0 bg-transparent"
              title="Reset conversation"
            >
              <RotateCcw class="w-4 h-4" />
            </button>

            <!-- Fullscreen Immersion Toggle Icon -->
            <button 
              type="button"
              @click="isFullscreen = !isFullscreen"
              class="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container cursor-pointer transition-colors border-0 bg-transparent"
              :title="isFullscreen ? 'Exit full screen' : 'Full screen immersion'"
            >
              <Minimize2 v-if="isFullscreen" class="w-4.5 h-4.5" />
              <Maximize2 v-else class="w-4.5 h-4.5" />
            </button>

            <!-- Close Button -->
            <button 
              type="button"
              @click="close"
              class="p-2 rounded-xl text-on-surface-variant hover:text-error hover:bg-error/10 cursor-pointer transition-colors border-0 bg-transparent ml-1"
              title="Close"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Chat Scrollable Body -->
        <div 
          ref="chatScrollContainer"
          class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5"
          :class="isFullscreen ? 'max-w-4xl mx-auto w-full' : ''"
        >
          <!-- Welcome Hero (Empty State) -->
          <div v-if="messages.length === 0" class="py-6 sm:py-10 space-y-6 text-center animate-fade-in">
            <div class="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto shadow-sm">
              <Bot class="w-8 h-8" />
            </div>

            <div class="max-w-md mx-auto space-y-2">
              <h4 class="text-lg font-bold text-on-surface">How can Jenga AI help your store today?</h4>
              <p class="text-xs text-on-surface-variant leading-relaxed">
                Ask open-ended business questions. Jenga AI analyzes your sales, margins, operating expenses, supplier pricing, and inventory runways to give you actionable advice.
              </p>
            </div>

            <!-- Quick Suggestion Starter Chips -->
            <div class="space-y-2 pt-2 text-left max-w-md mx-auto">
              <span class="text-[11px] font-bold text-outline uppercase tracking-wider block text-center">Suggested Inquiries</span>
              <div class="grid grid-cols-1 gap-2">
                <button 
                  v-for="(prompt, idx) in quickPrompts" 
                  :key="idx"
                  type="button"
                  @click="sendPrompt(prompt.text)"
                  class="w-full text-left p-3 rounded-xl border border-outline-variant/60 bg-surface-container-low hover:bg-surface-container hover:border-primary/50 text-xs font-semibold text-on-surface transition-all flex items-center justify-between cursor-pointer group shadow-2xs"
                >
                  <div class="flex items-center gap-2.5">
                    <span class="text-base">{{ prompt.icon }}</span>
                    <span>{{ prompt.text }}</span>
                  </div>
                  <ArrowRight class="w-3.5 h-3.5 text-outline group-hover:text-primary transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>

          <!-- Messages Stream -->
          <div v-for="msg in messages" :key="msg.id" class="space-y-2">
            <!-- User Message -->
            <div v-if="msg.sender === 'user'" class="flex justify-end">
              <div class="max-w-[85%] bg-primary text-white rounded-2xl rounded-tr-xs px-4.5 py-3 shadow-xs font-medium text-xs sm:text-sm">
                {{ msg.text }}
              </div>
            </div>

            <!-- Assistant Message -->
            <div v-else class="flex gap-3 justify-start items-start">
              <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <Sparkles class="w-4 h-4" />
              </div>

              <div class="flex-1 max-w-[90%] space-y-2">
                <!-- Answer Content Box -->
                <div 
                  class="p-4 rounded-2xl rounded-tl-xs border text-xs sm:text-[13.5px] leading-relaxed shadow-xs"
                  :class="msg.isError 
                    ? 'bg-error-container/20 border-error/30 text-error' 
                    : 'bg-surface-container-lowest border-outline-variant/60 text-on-surface'"
                >
                  <div class="prose-content" v-html="formatMarkdown(msg.text)"></div>
                </div>

                <!-- Timestamp -->
                <span class="text-[10px] font-mono text-outline block pl-1">
                  {{ formatTime(msg.timestamp) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Behind the Scenes Plain English Status -->
          <div v-if="isLoading" class="flex gap-3 justify-start items-start animate-fade-in">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
              <Sparkles class="w-4 h-4" />
            </div>
            <div class="p-4 rounded-2xl rounded-tl-xs bg-surface-container-lowest border border-primary/20 text-xs text-on-surface shadow-xs space-y-2.5 max-w-[85%] sm:max-w-md">
              <div class="flex items-center gap-2 text-primary font-bold text-xs sm:text-sm">
                <span class="relative flex h-2.5 w-2.5">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                </span>
                <span>Jenga AI is analyzing your store...</span>
              </div>

              <!-- Animated Plain English Behind-the-Scenes Step -->
              <div class="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 flex items-center gap-2.5 transition-all duration-300">
                <Loader2 class="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
                <span class="text-xs font-medium text-on-surface">
                  {{ currentBehindTheScenesStep }}
                </span>
              </div>

              <p class="text-[11px] text-on-surface-variant/75 leading-tight">
                Reviewing verified store records behind the scenes to formulate practical advice.
              </p>
            </div>
          </div>
        </div>

        <!-- Footer / Input Box -->
        <div class="p-4 border-t border-outline-variant/60 bg-surface-container-low shrink-0">
          <div :class="isFullscreen ? 'max-w-4xl mx-auto w-full' : ''" class="space-y-2">
            <form @submit.prevent="handleSend" class="relative flex items-center gap-2">
              <input 
                ref="inputField"
                type="text"
                v-model="inputQuery"
                :disabled="isLoading"
                placeholder="Ask Jenga AI about sales, profits, expenses, suppliers... / Uliza kwa Kiswahili..."
                class="w-full bg-surface-container-lowest pl-4 pr-12 py-3 rounded-xl border border-outline-variant text-xs sm:text-sm outline-none text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium disabled:opacity-50 placeholder:text-outline shadow-2xs"
              />
              <button 
                type="submit"
                :disabled="isLoading || !inputQuery.trim()"
                class="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary text-white hover:opacity-95 disabled:opacity-40 cursor-pointer transition-all border-0 flex items-center justify-center shadow-xs"
                title="Send inquiry"
              >
                <Send class="w-4 h-4" />
              </button>
            </form>

            <div class="flex items-center justify-between text-[10.5px] text-outline font-medium px-1">
              <span>Grounded in your real store sales & inventory data.</span>
              <span class="hidden sm:inline">Press Enter to send</span>
            </div>
          </div>
        </div>

      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted } from 'vue';
import { 
  Sparkles, 
  X, 
  Send, 
  Maximize2, 
  Minimize2, 
  Bot, 
  RotateCcw, 
  ArrowRight,
  Loader2
} from 'lucide-vue-next';
import { aiCopilotService, type ChatMessage, type ChatHistoryItem } from '../../services/aiCopilotService';

const props = defineProps<{
  isOpen: boolean;
  storeBranchId?: string | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const isFullscreen = ref(false);
const inputQuery = ref('');
const isLoading = ref(false);
const messages = ref<ChatMessage[]>([]);
const chatScrollContainer = ref<HTMLDivElement | null>(null);
const inputField = ref<HTMLInputElement | null>(null);

// Plain English Behind-the-Scenes Progress Stages
const behindTheScenesStages = [
  'Auditing recent sales performance and transaction trends...',
  'Inspecting profit margins across your products...',
  'Reviewing operating expenses and supplier purchases...',
  'Checking inventory health, low stock, and restock needs...',
  'Synthesizing practical insights and recommendations...'
];

const currentStageIndex = ref(0);
const currentBehindTheScenesStep = computed(() => behindTheScenesStages[currentStageIndex.value]);

let stageInterval: any = null;

const startStageCycle = () => {
  currentStageIndex.value = 0;
  if (stageInterval) clearInterval(stageInterval);
  stageInterval = setInterval(() => {
    currentStageIndex.value = (currentStageIndex.value + 1) % behindTheScenesStages.length;
  }, 2200);
};

const stopStageCycle = () => {
  if (stageInterval) {
    clearInterval(stageInterval);
    stageInterval = null;
  }
};

onUnmounted(() => {
  stopStageCycle();
});

const quickPrompts = [
  { icon: '🔍', text: 'What is wrong with my business?' },
  { icon: '📊', text: 'Audit my store health and top priorities today' },
  { icon: '📦', text: 'Which products need restock this week?' },
  { icon: '💸', text: 'Are my supplier purchase costs increasing?' },
  { icon: '📉', text: 'Which products have low or compressed profit margins?' },
  { icon: '🇹🇿', text: 'Nipe ushauri jinsi duka langu linavyoendelea wiki hii' }
];

const close = () => {
  emit('close');
};

const handleBackdropClick = () => {
  if (!isFullscreen.value) {
    close();
  }
};

const clearChat = () => {
  messages.value = [];
};

const scrollToBottom = async () => {
  await nextTick();
  if (chatScrollContainer.value) {
    chatScrollContainer.value.scrollTop = chatScrollContainer.value.scrollHeight;
  }
};

const sendPrompt = (text: string) => {
  inputQuery.value = text;
  handleSend();
};

const handleSend = async () => {
  const query = inputQuery.value.trim();
  if (!query || isLoading.value) return;

  // Extract up to the last 3-4 messages for multi-turn conversational context
  const history: ChatHistoryItem[] = messages.value
    .slice(-4)
    .filter(m => !m.isError && m.text)
    .map(m => ({
      sender: m.sender,
      text: m.text.length > 2000 ? m.text.slice(0, 2000) + '...' : m.text
    }));

  const userMsgId = 'msg-' + Date.now();
  messages.value.push({
    id: userMsgId,
    sender: 'user',
    text: query,
    timestamp: new Date()
  });

  inputQuery.value = '';
  isLoading.value = true;
  startStageCycle();
  await scrollToBottom();

  try {
    const res = await aiCopilotService.ask(query, props.storeBranchId, history);
    
    // Sanitize any raw backend or third-party error text into friendly, polished plain English
    let cleanAnswer = res.answer || '';
    if (cleanAnswer.includes('Status 503') || cleanAnswer.includes('high demand') || cleanAnswer.includes('503')) {
      cleanAnswer = "⚠️ Jenga AI is currently experiencing high inquiry volume. Please wait a few moments and try your question again.";
    } else if (cleanAnswer.includes('GEMINI_API_KEY')) {
      cleanAnswer = "⚠️ Jenga AI Assistant configuration is being finalized. Please contact the administrator.";
    } else if (cleanAnswer.includes('Status 400') || cleanAnswer.includes('Role')) {
      cleanAnswer = "⚠️ Jenga AI encountered a temporary format issue. Please ask your question again.";
    }

    const botMsgId = 'bot-' + Date.now();
    messages.value.push({
      id: botMsgId,
      sender: 'assistant',
      text: cleanAnswer,
      timestamp: new Date()
    });
  } catch (err: any) {
    console.error('Failed to get Jenga AI response:', err);
    messages.value.push({
      id: 'err-' + Date.now(),
      sender: 'assistant',
      text: '⚠️ Unable to connect to Jenga AI Assistant right now. Please check your connection and try again.',
      timestamp: new Date(),
      isError: true
    });
  } finally {
    stopStageCycle();
    isLoading.value = false;
    await scrollToBottom();
  }
};

// Focus input on open
watch(() => props.isOpen, (open) => {
  if (open) {
    nextTick(() => {
      inputField.value?.focus();
      scrollToBottom();
    });
  }
});

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(date);
};

// Lightweight safe markdown formatter
const formatMarkdown = (content: string): string => {
  if (!content) return '';
  
  let formatted = content
    // Escape HTML brackets
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-on-surface">$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    // Headers (### Header)
    .replace(/^### (.*$)/gim, '<h4 class="font-extrabold text-sm text-on-surface mt-3 mb-1">$1</h4>')
    .replace(/^## (.*$)/gim, '<h3 class="font-black text-sm sm:text-base text-on-surface mt-3.5 mb-1.5">$1</h3>')
    // Bullet points (- or *)
    .replace(/^\s*[-*]\s+(.*$)/gim, '<li class="ml-4 list-disc text-on-surface/90 my-0.5">$1</li>')
    // Numbered lists (1. 2.)
    .replace(/^\s*(\d+)\.\s+(.*$)/gim, '<li class="ml-4 list-decimal text-on-surface/90 my-0.5">$2</li>')
    // Paragraph double line breaks
    .replace(/\n\n/g, '<br/><br/>')
    // Single line break
    .replace(/\n/g, '<br/>');

  return formatted;
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}

.prose-content :deep(strong) {
  color: var(--color-on-surface);
}

.prose-content :deep(li) {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}
</style>
