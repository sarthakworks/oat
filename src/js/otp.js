/**
 * oat - OTP Input Component
 * Lightweight one-time-password input with configurable length and character mode.
 *
 * Usage:
 * <ot-otp length="6" type="numeric" name="otp"></ot-otp>
 * type: numeric | alphanumeric | any
 */

  class OtOTP extends OtBase {
  #inputs = [];
  #hidden;
  #baseId;

  init() {
    this.#baseId = this.id || `ot-otp-${this.uid()}`;
    this.#render();
    this.addEventListener('input', this);
    this.addEventListener('beforeinput', this);
    this.addEventListener('keydown', this);
    this.addEventListener('paste', this);
    this.addEventListener('focusin', this);
    this.#syncFromAttr();
  }

  static get observedAttributes() {
    return ['length', 'type', 'name', 'value', 'disabled'];
  }

  attributeChangedCallback(name) {
    if (!this.isConnected) return;

    if (name === 'length' || name === 'type' || name === 'name' || name === 'disabled') {
      this.#render();
      this.#syncFromAttr();
      return;
    }

    if (name === 'value') {
      this.#syncFromAttr();
    }
  }

  onfocusin(e) {
    if (e.target.matches('input[data-otp]')) {
      e.target.select();
    }
  }

  oninput(e) {
    const input = e.target.closest('input[data-otp]');
    if (!input) return;

    const index = Number(input.dataset.otpIndex || 0);
    const clean = this.#sanitize(input.value);

    if (!clean) {
      input.value = '';
      this.#sync();
      return;
    }

    if (clean.length > 1) {
      this.#fill(clean, index);
      return;
    }

    input.value = clean[0];
    this.#inputs[index + 1]?.focus();
    this.#inputs[index + 1]?.select();
    this.#sync();
  }

  onbeforeinput(e) {
    const input = e.target.closest('input[data-otp]');
    if (!input) return;

    const index = Number(input.dataset.otpIndex || 0);

    if (e.inputType === 'deleteContentBackward' && !input.value) {
      const prev = this.#inputs[index - 1];
      if (prev) {
        e.preventDefault();
        prev.value = '';
        prev.focus();
        this.#sync();
      }
      return;
    }

    if (e.inputType === 'deleteContentForward') {
      e.preventDefault();
      input.value = '';
      this.#sync();
    }
  }

  onkeydown(e) {
    const input = e.target.closest('input[data-otp]');
    if (!input) return;

    const index = Number(input.dataset.otpIndex || 0);

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.#inputs[index - 1]?.focus();
      this.#inputs[index - 1]?.select();
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.#inputs[index + 1]?.focus();
      this.#inputs[index + 1]?.select();
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();

      if (input.value) {
        input.value = '';
        this.#sync();
        return;
      }

      const prev = this.#inputs[index - 1];
      if (prev) {
        prev.value = '';
        prev.focus();
        this.#sync();
      }
      return;
    }

    if (e.key === 'Delete') {
      e.preventDefault();
      input.value = '';
      this.#sync();
    }
  }

  onpaste(e) {
    const input = e.target.closest('input[data-otp]');
    if (!input) return;

    e.preventDefault();

    const text = e.clipboardData?.getData('text') || '';
    const clean = this.#sanitize(text);
    if (!clean) return;

    const index = Number(input.dataset.otpIndex || 0);
    this.#fill(clean, index);
  }

  get value() {
    return this.#inputs.map(i => i.value).join('');
  }

  set value(next) {
    const clean = this.#sanitize(String(next || ''));
    this.#fill(clean, 0);
  }

  #render() {
    const length = this.#length;
    const name = this.getAttribute('name');
    const values = this.#inputs.map(i => i.value);

    this.innerHTML = '';
    this.#inputs = [];
    this.#hidden = null;

    if (name) {
      this.#hidden = document.createElement('input');
      this.#hidden.type = 'hidden';
      this.#hidden.name = name;
      this.appendChild(this.#hidden);
    }

    for (let i = 0; i < length; i++) {
      const input = document.createElement('input');
      const inputId = `${this.#baseId}-slot-${i + 1}`;
      input.type = 'text';
      input.inputMode = this.#inputMode;
      input.maxLength = 1;
      input.disabled = this.hasAttribute('disabled');
      input.autocomplete = i === 0 ? 'one-time-code' : 'off';
      input.id = inputId;
      input.name = name ? `${name}-${i + 1}` : `otp-${i + 1}`;
      input.dataset.otp = '';
      input.dataset.otpIndex = String(i);
      input.setAttribute('aria-label', `OTP digit ${i + 1}`);
      input.value = values[i] ? this.#sanitize(values[i]).slice(0, 1) : '';
      this.#inputs.push(input);
      this.appendChild(input);
    }

    this.#sync();
  }

  #fill(raw, startIndex = 0) {
    const clean = this.#sanitize(raw);
    if (!clean) return;

    let cursor = startIndex;
    for (let i = 0; i < clean.length && cursor < this.#inputs.length; i += 1) {
      this.#inputs[cursor].value = clean[i];
      cursor += 1;
    }

    this.#inputs[Math.min(cursor, this.#inputs.length - 1)]?.focus();
    this.#sync();
  }

  #syncFromAttr() {
    if (!this.hasAttribute('value')) return;
    this.value = this.getAttribute('value') || '';
  }

  #sync() {
    const value = this.value;
    if (this.#hidden) {
      this.#hidden.value = value;
    }

    this.emit('ot-otp-change', {
      value,
      complete: value.length === this.#length
    });
  }

  get #length() {
    const n = Number.parseInt(this.getAttribute('length') || '6', 10);
    return Number.isFinite(n) && n > 0 ? n : 6;
  }

  get #mode() {
    const type = (this.getAttribute('type') || 'numeric').toLowerCase();
    if (type === 'any' || type === 'alphanumeric' || type === 'numeric') {
      return type;
    }
    return 'numeric';
  }

  get #inputMode() {
    return this.#mode === 'numeric' ? 'numeric' : 'text';
  }

  #sanitize(raw) {
    const value = String(raw || '');
    if (this.#mode === 'numeric') {
      return value.replace(/[^0-9]/g, '');
    }
    if (this.#mode === 'alphanumeric') {
      return value.replace(/[^a-zA-Z0-9]/g, '');
    }
    return value;
  }
}

customElements.define('ot-otp', OtOTP);
