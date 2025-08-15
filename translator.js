// Modern Translation Widget - Reusable Component
class TranslatorWidget {
  constructor() {
    this.currentLang = 'en';
    this.originalTexts = null;
    this.isTranslating = false;
    this.init();
  }
  
  init() {
    this.injectCSS();
    this.createWidget();
    this.bindEvents();
  }
  
  injectCSS() {
    const style = document.createElement('style');
    style.textContent = `
      /* Modern Translator Widget */
      #translator-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        font-family: 'Arial', sans-serif;
      }

      .translator-container {
        background: linear-gradient(145deg, #667eea 0%, #764ba2 100%);
        border-radius: 50px;
        padding: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(102, 126, 234, 0.2);
        cursor: grab;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        user-select: none;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .translator-container:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15), 0 6px 20px rgba(102, 126, 234, 0.3);
      }

      .translator-toggle {
        background: rgba(255, 255, 255, 0.95);
        border: none;
        border-radius: 42px;
        padding: 12px 20px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        font-weight: 600;
        color: #4c63d2;
        transition: all 0.3s ease;
        min-width: 140px;
        justify-content: center;
      }

      .translator-dropdown {
        position: absolute;
        bottom: 100%;
        right: 0;
        margin-bottom: 10px;
        background: white;
        border-radius: 20px;
        min-width: 300px;
        max-height: 400px;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.2);
        opacity: 0;
        visibility: hidden;
        transform: translateY(10px) scale(0.95);
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      .translator-dropdown.active {
        opacity: 1;
        visibility: visible;
        transform: translateY(0) scale(1);
      }

      .translator-header {
        padding: 20px 25px 15px;
        border-bottom: 1px solid #f0f0f0;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .translator-header h4 {
        margin: 0;
        color: #333;
        font-size: 18px;
        font-weight: 700;
      }

      .languages-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        padding: 20px;
      }

      .language-btn {
        background: none;
        border: 2px solid transparent;
        padding: 12px 16px;
        border-radius: 12px;
        text-align: left;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
      }

      .language-btn:hover {
        background: #f8f9ff;
        border-color: #667eea;
        transform: translateX(2px);
      }

      .language-btn.active {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border-color: #667eea;
      }

      .translation-status {
        position: absolute;
        top: -50px;
        right: 0;
        background: #4CAF50;
        color: white;
        padding: 10px 20px;
        border-radius: 25px;
        font-size: 14px;
        font-weight: 600;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        white-space: nowrap;
      }

      .translation-status.show {
        opacity: 1;
        visibility: visible;
      }

      .translator-globe {
        font-size: 16px;
      }
      
      @media (max-width: 768px) {
        #translator-widget {
          bottom: 80px;
          right: 15px;
        }
        
        .translator-dropdown {
          min-width: 280px;
          right: -50px;
        }
        
        .languages-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  createWidget() {
    const widget = document.createElement('div');
    widget.id = 'translator-widget';
    widget.innerHTML = `
      <div class="translator-container" id="translator-container">
        <button class="translator-toggle" id="translator-toggle">
          <span class="translator-globe">🌐</span>
          <span id="current-lang">Translate</span>
        </button>
        
        <div class="translator-dropdown" id="translator-dropdown">
          <div class="translator-header">
            <span class="translator-globe">🌐</span>
            <h4>Choose Language</h4>
          </div>
          
          <div class="languages-grid">
            <button class="language-btn active" data-lang="en">🇺🇸 English</button>
            <button class="language-btn" data-lang="es">🇪🇸 Español</button>
            <button class="language-btn" data-lang="fr">🇫🇷 Français</button>
            <button class="language-btn" data-lang="de">🇩🇪 Deutsch</button>
            <button class="language-btn" data-lang="it">🇮🇹 Italiano</button>
            <button class="language-btn" data-lang="ar">🇸🇦 العربية</button>
            <button class="language-btn" data-lang="sw">🇰🇪 Kiswahili</button>
            <button class="language-btn" data-lang="zh">🇨🇳 中文</button>
            <button class="language-btn" data-lang="ja">🇯🇵 日本語</button>
            <button class="language-btn" data-lang="ru">🇷🇺 Русский</button>
            <button class="language-btn" data-lang="pt">🇧🇷 Português</button>
            <button class="language-btn" data-lang="hi">🇮🇳 हिन्दी</button>
          </div>
        </div>
        
        <div class="translation-status" id="translation-status">
          <span id="status-text">Translating...</span>
        </div>
      </div>
    `;
    
    document.body.appendChild(widget);
    
    this.container = document.getElementById('translator-container');
    this.toggle = document.getElementById('translator-toggle');
    this.dropdown = document.getElementById('translator-dropdown');
    this.currentLangSpan = document.getElementById('current-lang');
    this.statusDiv = document.getElementById('translation-status');
    this.statusText = document.getElementById('status-text');
  }
  
  bindEvents() {
    // Toggle dropdown
    this.toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      this.dropdown.classList.remove('active');
    });
    
    // Language selection
    this.dropdown.addEventListener('click', (e) => {
      if (e.target.classList.contains('language-btn')) {
        e.stopPropagation();
        const lang = e.target.dataset.lang;
        this.translateTo(lang);
        
        // Update active state
        this.dropdown.querySelectorAll('.language-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        // Update current language display
        this.currentLangSpan.textContent = e.target.textContent.split(' ')[1] || 'Translate';
        
        // Close dropdown
        this.dropdown.classList.remove('active');
      }
    });
    
    // Make draggable
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    
    this.container.addEventListener('mousedown', (e) => {
      isDragging = true;
      dragOffset.x = e.clientX - this.container.offsetLeft;
      dragOffset.y = e.clientY - this.container.offsetTop;
      this.container.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const widget = document.getElementById('translator-widget');
        widget.style.left = (e.clientX - dragOffset.x) + 'px';
        widget.style.top = (e.clientY - dragOffset.y) + 'px';
        widget.style.right = 'auto';
        widget.style.bottom = 'auto';
      }
    });
    
    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        this.container.style.cursor = 'grab';
      }
    });
  }
  
  async translateTo(lang) {
    if (this.isTranslating || lang === this.currentLang) return;
    
    this.isTranslating = true;
    this.showStatus('Translating...');
    
    try {
      if (lang === 'en') {
        this.restoreOriginalText();
      } else {
        if (!this.originalTexts) {
          this.saveOriginalTexts();
        }
        await this.performTranslation(lang);
      }
      
      this.currentLang = lang;
      this.showStatus('Translation complete!');
      
      setTimeout(() => {
        this.hideStatus();
      }, 2000);
      
    } catch (error) {
      console.error('Translation failed:', error);
      this.showStatus('Translation failed');
      setTimeout(() => {
        this.hideStatus();
      }, 3000);
    }
    
    this.isTranslating = false;
  }
  
  showStatus(text) {
    this.statusText.textContent = text;
    this.statusDiv.classList.add('show');
  }
  
  hideStatus() {
    this.statusDiv.classList.remove('show');
  }
  
  saveOriginalTexts() {
    this.originalTexts = [];
    const textNodes = this.getTextNodes(document.body);
    textNodes.forEach(node => {
      this.originalTexts.push({
        node: node,
        text: node.nodeValue
      });
    });
  }
  
  restoreOriginalText() {
    if (this.originalTexts) {
      this.originalTexts.forEach(item => {
        item.node.nodeValue = item.text;
      });
    }
  }
  
  async performTranslation(targetLang) {
    const textNodes = this.getTextNodes(document.body);
    const textsToTranslate = textNodes.map(node => node.nodeValue.trim()).filter(text => text.length > 0);
    
    if (textsToTranslate.length === 0) return;
    
    // Simple client-side translation (you could integrate with Google Translate API)
    const translations = await this.getTranslations(textsToTranslate, targetLang);
    
    textNodes.forEach((node, index) => {
      if (translations[index]) {
        node.nodeValue = translations[index];
      }
    });
  }
  
  async getTranslations(texts, targetLang) {
    // This is a simplified version. In production, you'd use Google Translate API
    // For now, return basic translations for common phrases
    const basicTranslations = {
      'sw': { // Kiswahili
        'Home': 'Nyumbani',
        'About': 'Kuhusu',
        'Contact': 'Wasiliana',
        'Book Tour': 'Hifadhi Safari',
        'Gallery': 'Picha',
        'Services': 'Huduma'
      },
      'es': { // Spanish
        'Home': 'Inicio',
        'About': 'Acerca de',
        'Contact': 'Contacto',
        'Book Tour': 'Reservar Tour',
        'Gallery': 'Galería',
        'Services': 'Servicios'
      },
      'fr': { // French
        'Home': 'Accueil',
        'About': 'À propos',
        'Contact': 'Contact',
        'Book Tour': 'Réserver',
        'Gallery': 'Galerie',
        'Services': 'Services'
      }
    };
    
    return texts.map(text => {
      const lang = basicTranslations[targetLang];
      return lang && lang[text] ? lang[text] : text;
    });
  }
  
  getTextNodes(node) {
    let nodes = [];
    
    // Skip translator widget and certain elements
    if (node.closest && (node.closest('#translator-widget') || 
        ['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE'].includes(node.nodeName))) {
      return nodes;
    }
    
    if (node.nodeType === 3 && node.nodeValue.trim()) {
      const text = node.nodeValue.trim();
      if (text.length > 2 && !/^\d+$/.test(text)) {
        nodes.push(node);
      }
    } else if (node.childNodes) {
      node.childNodes.forEach(child => {
        nodes.push(...this.getTextNodes(child));
      });
    }
    
    return nodes;
  }
}

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', () => {
  new TranslatorWidget();
});