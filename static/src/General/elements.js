class NumberInput extends HTMLElement {
    constructor() {
        super();
        this.label = '';
        this._id = '';
        this.required = false;
        this.disabled = false;
    }
    // Observe changes to 'label-text' and 'custom-id' attributes
    static get observedAttributes() {
        return ['label-text', 'custom-id', 'value', 'required', 'disabled'];
    }
    // Called when the element is connected to the DOM
    connectedCallback() {
        // Initialize values when the element is connected to the DOM
        this.updateFromAttributes();
        this.render();
    }
    // Called when one of the observed attributes changes
    attributeChangedCallback(name, oldValue, newValue) {
        // Update internal properties based on the changed attribute
        if (name === 'label-text') {
            this.label = newValue || '';
        }
        if (name === 'custom-id') {
            this._id = newValue || '';
        }
        if (name === 'value') {
            this.value = Number(newValue);
        }
        this.required = this.hasAttribute('required');
        this.disabled = this.hasAttribute('disabled');
        this.render(); // Re-render when attributes change
    }
    // Initialize the properties from the attributes if available
    updateFromAttributes() {
        const labelText = this.getAttribute('label-text');
        const customId = this.getAttribute('custom-id');
        const value = this.getAttribute('value');
        if (labelText) {
            this.label = labelText;
        }
        if (customId) {
            this._id = customId;
        }
        if (value) {
            this.value = Number(value);
        }
        this.required = this.hasAttribute('required');
        this.disabled = this.hasAttribute('disabled');
    }
    // Method to render the input field with floating label
    render() {
        this.innerHTML = `
      <div class="form-floating">
          <input 
            type="number" 
            class="form-control" 
            id="${this._id}" ${this.value ? `value="${this.value}"` : ""}
            ${this.required == true ? ' required' : ''}
            ${this.disabled == true ? ' disabled' : ''}
            >
          <label for="${this._id}">${this.label}</label>
      </div>
      `;
    }
}
class TextInput extends HTMLElement {
    constructor() {
        super();
        this.label = '';
        this._id = '';
        this.value = '';
        this.required = false;
        this.disabled = false;
    }
    // Observe changes to 'label-text' and 'custom-id' attributes
    static get observedAttributes() {
        return ['label-text', 'custom-id', 'value', 'required', 'disabled'];
    }
    // Called when the element is connected to the DOM
    connectedCallback() {
        // Initialize values when the element is connected to the DOM
        this.updateFromAttributes();
        this.render();
    }
    // Called when one of the observed attributes changes
    attributeChangedCallback(name, oldValue, newValue) {
        // Update internal properties based on the changed attribute
        if (name === 'label-text') {
            this.label = newValue || '';
        }
        if (name === 'custom-id') {
            this._id = newValue || '';
        }
        if (name === 'value') {
            this.value = newValue;
        }
        this.required = this.hasAttribute('required');
        this.disabled = this.hasAttribute('disabled');
        this.render(); // Re-render when attributes change
    }
    // Initialize the properties from the attributes if available
    updateFromAttributes() {
        const labelText = this.getAttribute('label-text');
        const customId = this.getAttribute('custom-id');
        const value = this.getAttribute('value');
        if (labelText) {
            this.label = labelText;
        }
        if (customId) {
            this._id = customId;
        }
        if (value) {
            this.value = value;
        }
        this.required = this.hasAttribute('required');
        this.disabled = this.hasAttribute('disabled');
    }
    // Method to render the input field with floating label
    render() {
        this.innerHTML = `
      <div class="form-floating">
          <input 
            type="text" 
            class="form-control" 
            id="${this._id}" 
            ${this.value ? `value="${this.value}"` : ""}
            ${this.required == true ? ' required' : ''}
            ${this.disabled == true ? ' disabled' : ''}
            >
          <label for="${this._id}">${this.label}</label>
      </div>
      `;
    }
}
class ButtonTab extends HTMLElement {
    constructor() {
        super();
        this._id = '';
        this.label = '';
        this.controls = '';
        this.active = false;
    }
    static get observedAttributes() {
        return ['label-text', 'controls', 'active', 'custom-id'];
    }
    connectedCallback() {
        this.updateFromAttributes();
        this.render();
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name == 'custom-id') {
            this._id = newValue;
        }
        if (name == 'label-text') {
            this.label = newValue;
        }
        if (name == 'controls') {
            this.controls = newValue;
        }
        this.active = this.hasAttribute('active');
        this.render();
    }
    updateFromAttributes() {
        const labelText = this.getAttribute('label-text');
        const controls = this.getAttribute('controls');
        const active = this.getAttribute('active');
        const id = this.getAttribute('custom-id');
        if (id) {
            this._id = id;
        }
        if (labelText) {
            this.label = labelText;
        }
        if (controls) {
            this.controls = controls;
        }
        this.active = this.hasAttribute('active');
    }
    render() {
        this.innerHTML = `
    <button class="nav-link silver ${this.active == true ? 'active' : ''}" id="${this._id}" data-bs-toggle="tab"
      data-bs-target="#${this.controls}" type="button" role="tab" aria-selected="true" 
      aria-controls="${this.controls}">${this.label}</button>
    `;
    }
}
// Define the custom element
customElements.define('number-input', NumberInput);
customElements.define('text-input', TextInput);
customElements.define('button-tab', ButtonTab);
export {};
