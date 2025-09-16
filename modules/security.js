/**
 * Security Module
 * Handles input sanitization and safe DOM manipulation
 */

class SecurityManager {
    constructor() {
        this.initializeDOMPurify();
    }

    // Initialize DOMPurify with configuration
    initializeDOMPurify() {
        if (typeof DOMPurify !== 'undefined') {
            this.domPurify = DOMPurify;
            this.configureDOMPurify();
        } else {
            console.warn('DOMPurify not available - using basic sanitization');
            this.domPurify = null;
        }
    }

    // Configure DOMPurify with safe options
    configureDOMPurify() {
        if (this.domPurify) {
            this.domPurify.setConfig({
                ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em',
                              'ul', 'ol', 'li', 'span', 'div', 'a', 'code', 'pre', 'blockquote'],
                ALLOWED_ATTR: ['class', 'id', 'href', 'target', 'rel'],
                ALLOW_DATA_ATTR: false,
                FORBID_SCRIPT: true,
                FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'button']
            });
        }
    }

    // Configure marked.js for safe markdown parsing
    configureMarked() {
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                sanitize: false, // We'll use DOMPurify instead
                headerIds: false,
                mangle: false,
                gfm: true,
                breaks: false
            });
        }
    }

    // Sanitize HTML content
    sanitizeHTML(html) {
        if (this.domPurify) {
            return this.domPurify.sanitize(html);
        }

        // Fallback sanitization if DOMPurify not available
        return html
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    // Safely parse markdown to sanitized HTML
    parseMarkdownSafely(markdown) {
        if (typeof marked === 'undefined') {
            return this.sanitizeHTML(markdown);
        }

        const rawHTML = marked.parse(markdown);
        return this.sanitizeHTML(rawHTML);
    }

    // Sanitize user input
    sanitizeInput(input) {
        if (typeof input !== 'string') return '';

        return input
            .replace(/[<>]/g, '') // Remove angle brackets
            .trim()
            .substring(0, 100); // Limit length
    }

    // Sanitize text content for display
    sanitizeText(text) {
        if (typeof text !== 'string') return '';

        return text
            .replace(/[<>&"']/g, (char) => {
                const entities = {
                    '<': '&lt;',
                    '>': '&gt;',
                    '&': '&amp;',
                    '"': '&quot;',
                    "'": '&#x27;'
                };
                return entities[char] || char;
            })
            .substring(0, 500); // Reasonable length limit
    }

    // Validate URL for safety
    isValidURL(url) {
        if (!url || typeof url !== 'string') return false;

        // Block dangerous protocols
        const dangerousProtocols = /^(javascript:|data:text\/html|vbscript:|file:|ftp:)/i;
        if (dangerousProtocols.test(url)) return false;

        // Allow only http, https, and relative URLs
        const allowedProtocols = /^(https?:\/\/|\/|\.\/|#)/;
        return allowedProtocols.test(url);
    }

    // Safe element creation with sanitized content
    createSafeElement(tag, className, content, isHTML = false) {
        const element = document.createElement(tag);

        if (className) element.className = className;

        if (content) {
            if (isHTML) {
                element.innerHTML = this.sanitizeHTML(content);
            } else {
                element.textContent = content;
            }
        }

        return element;
    }

    // Set safe innerHTML
    setSafeHTML(element, html) {
        if (element) {
            element.innerHTML = this.sanitizeHTML(html);
        }
    }

    // Set safe text content
    setSafeText(element, text) {
        if (element) {
            element.textContent = this.sanitizeText(text);
        }
    }
}

// Export singleton instance
const securityManager = new SecurityManager();
export default securityManager;