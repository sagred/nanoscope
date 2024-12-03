import { TextOptions } from '@/components/ContextMenu/TextOptions';
import React from 'react';
import { createRoot } from 'react-dom/client';

console.log('Content script loaded');

const container = document.createElement('div');
container.id = 'text-modifier-extension-root';
// Create a shadow root for style isolation
const shadowRoot = container.attachShadow({ mode: 'open' });

// Add isolated styles
const style = document.createElement('style');
style.textContent = `
  .modal-container {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999999;
    isolation: isolate;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
      Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  }
  .modal-backdrop {
    position: fixed;
    inset: 0;
  }
  .modal-content {
    position: relative;
    width: 700px;
    min-height: 400px;
    max-height: 600px;
    background: #18181B;
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    font-size: 14px;
    line-height: 1.5;
    color: #f4f4f5;
    border: 1px solid rgba(255, 255, 255, 0.2);

  }
  * {
    font-family: inherit;
  }
  input, button {
    font-family: inherit;
    font-size: inherit;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes iconPop {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .option-button:hover {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
  }
  .action-button:hover {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
  }
  .loading-dots {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: 8px;
    height: 20px;
  }

  .loading-dots span {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: #22c55e;
    display: inline-block;
    animation: bounce 1.4s infinite ease-in-out both;
  }

  .loading-dots span:nth-child(1) {
    animation-delay: -0.32s;
  }

  .loading-dots span:nth-child(2) {
    animation-delay: -0.16s;
  }

  @keyframes bounce {
    0%, 80%, 100% { 
      transform: scale(0);
    } 
    40% { 
      transform: scale(1);
    }
  }
`;

shadowRoot.appendChild(style);
const rootContainer = document.createElement('div');
shadowRoot.appendChild(rootContainer);
document.body.appendChild(container);

const root = createRoot(rootContainer);

const showTextOptions = () => {
  const selection = window.getSelection();
  const text = selection?.toString().trim();
  
  root.render(
    React.createElement(TextOptions, {
      selectedText: text || undefined,
      onClose: () => root.render(null)
    })
  );
};

// Listen for keyboard shortcut
window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'm') {
    console.log('Keyboard shortcut detected');
    e.preventDefault();
    showTextOptions();
  }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message) => {
  console.log('Message received:', message);
  if (message.type === "SHOW_TEXT_OPTIONS") {
    showTextOptions();
  }
});

const handleOptionSelect = async (option: string, text: string) => {
  const response = await chrome.runtime.sendMessage({
    type: "MODIFY_TEXT",
    payload: { option, text }
  });
  
  if (response.success) {
    return response.modifiedText;
  } else {
    throw new Error('Failed to modify text');
  }
};