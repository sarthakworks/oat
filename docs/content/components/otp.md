+++
title = "OTP Input"
weight = 125
description = "One-time-password input with configurable length, type, and paste handling."

[extra]
webcomponent = true
+++

Use `<ot-otp>` for OTP / PIN entry. It supports customizable length and character type.

{% demo() %}
```html
<ot-otp length="6" type="numeric" name="otp"></ot-otp>
```
{% end %}

### Character mode

Set `type` to control accepted characters.

#### Numeric mode (`type="numeric"`) | Length : 4

{% demo() %}
```html
<ot-otp length="4" type="numeric"></ot-otp>
```
{% end %}

#### Alphanumeric mode (`type="alphanumeric"`) | Length : 6

{% demo() %}
```html
<ot-otp length="6" type="alphanumeric"></ot-otp> 
```
{% end %}

#### Any mode (`type="any"`) | Length : 4

{% demo() %}
```html
<ot-otp length="4" type="any"></ot-otp>
```
{% end %}

### Length

Set `length` to any positive number. Common values:

```html
<ot-otp length="4" type="numeric"></ot-otp>
<ot-otp length="6" type="numeric"></ot-otp>
```

### Behavior

- Typing moves to the next field automatically.
- Backspace clears current field; if empty, moves backward and clears previous field.
- Delete clears current field.
- Arrow keys move left/right between fields.
- Pasting fills fields in sequence from the current position.
- Extra pasted characters are ignored; shorter paste fills available leading fields.

### Events

The component emits `ot-otp-change` on every change.

```js
document.querySelector('ot-otp').addEventListener('ot-otp-change', (e) => {
  console.log(e.detail.value);    // current OTP string
  console.log(e.detail.complete); // true when value length reaches configured length
});
```
