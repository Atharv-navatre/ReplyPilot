// Button Injector Utility
// Handles injecting the ReplyPilot generate button into pages

import type { InjectionResult } from "../adapters/types"

export interface InjectButtonOptions {
  buttonId: string
  container: HTMLElement
  onButtonClick: () => void
}

// Inject the generate button into the page
export function injectGenerateButton(options: InjectButtonOptions): InjectionResult {
  const { buttonId, container, onButtonClick } = options

  // Check for duplicate
  if (document.getElementById(buttonId)) {
    return { 
      success: false, 
      error: "Button already exists" 
    }
  }

  try {
    // Create button element
    const button = createStyledButton(buttonId)
    
    // Add click handler
    button.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()
      onButtonClick()
    })

    // Find the best position to inject
    // Try to inject near the message input actions
    const actionsContainer = container.querySelector('div.msg-form__left-actions')
    
    if (actionsContainer) {
      // Insert at the beginning of actions
      actionsContainer.insertBefore(button, actionsContainer.firstChild)
    } else {
      // Fallback: create a wrapper and prepend to container
      const wrapper = document.createElement("div")
      wrapper.style.cssText = "display: flex; align-items: center; padding: 8px 12px;"
      wrapper.appendChild(button)
      
      // Insert at the top of the form
      const form = container.querySelector('form.msg-form')
      if (form) {
        form.insertBefore(wrapper, form.firstChild)
      } else {
        container.insertBefore(wrapper, container.firstChild)
      }
    }

    return { 
      success: true, 
      buttonElement: button 
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}

// Remove the button from the page
export function removeGenerateButton(buttonId: string): boolean {
  const button = document.getElementById(buttonId)
  if (button) {
    // Remove wrapper if it exists
    const wrapper = button.parentElement
    if (wrapper && wrapper.children.length === 1) {
      wrapper.remove()
    } else {
      button.remove()
    }
    return true
  }
  return false
}

// Create a styled button element
function createStyledButton(buttonId: string): HTMLButtonElement {
  const button = document.createElement("button")
  button.id = buttonId
  button.type = "button"
  button.innerHTML = '✨ Generate Reply'
  
  // Apply inline styles for isolation from LinkedIn's CSS
  button.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    color: white;
    font-size: 13px;
    font-weight: 600;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);
    white-space: nowrap;
    z-index: 1000;
    margin-right: 8px;
  `

  // Add hover effect
  button.addEventListener("mouseenter", () => {
    button.style.transform = "scale(1.02)"
    button.style.boxShadow = "0 4px 12px rgba(14, 165, 233, 0.4)"
  })
  
  button.addEventListener("mouseleave", () => {
    button.style.transform = "scale(1)"
    button.style.boxShadow = "0 2px 8px rgba(14, 165, 233, 0.3)"
  })

  // Active state
  button.addEventListener("mousedown", () => {
    button.style.transform = "scale(0.98)"
  })
  
  button.addEventListener("mouseup", () => {
    button.style.transform = "scale(1.02)"
  })

  return button
}
