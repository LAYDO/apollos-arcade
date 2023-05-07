"use strict";
class FifteenCard {
    constructor(title, radio1, radio2, button, _element, callback, csrfToken) {
        this.csrfToken = csrfToken;
        // Parent and card container, taking on apollos-container styling
        this.parentElement = _element;
        this.cardContainer = document.createElement('div');
        this.cardContainer.classList.add('apollos-container');
        // Typical title for apollos-container
        this.title = document.createElement('div');
        this.title.classList.add('container-title');
        this.title.textContent = title;
        // Form
        this.cardForm = document.createElement('form');
        this.cardForm.classList.add('mft-col');
        this.cardForm.setAttribute('action', button.toLowerCase());
        this.cardForm.setAttribute('method', 'post');
        // Radio row
        let radRow = document.createElement('div');
        radRow.classList.add('mft-row-b');
        // Radio columns
        let radCol1 = document.createElement('div');
        radCol1.classList.add('mft-col');
        radCol1.setAttribute('style', 'margin-right:1rem;'); // For a little space between the lads
        let radCol2 = document.createElement('div');
        radCol2.classList.add('mft-col');
        // Radio options
        this.radio1 = document.createElement('input');
        this.radio1.setAttribute('type', 'radio');
        this.radio1.id = radio1.toLowerCase();
        this.radio1.setAttribute('name', button.toLowerCase());
        this.radio1.setAttribute('value', radio1);
        this.radio1.addEventListener('click', () => {
            this.hideText();
        });
        let r1 = document.createElement('label');
        r1.setAttribute('for', radio1.toLowerCase());
        r1.textContent = radio1;
        radCol1.append(r1);
        radCol1.append(this.radio1);
        let break1 = document.createElement('br');
        this.radio2 = document.createElement('input');
        this.radio2.setAttribute('type', 'radio');
        this.radio2.id = radio2.toLowerCase();
        this.radio2.setAttribute('name', button.toLowerCase());
        this.radio2.setAttribute('value', radio2);
        this.radio2.addEventListener('click', () => {
            this.showText();
        });
        let r2 = document.createElement('label');
        r2.setAttribute('for', radio2.toLowerCase());
        r2.textContent = radio2;
        radCol2.append(r2);
        radCol2.append(this.radio2);
        radRow.append(radCol1);
        radRow.append(radCol2);
        this.textOption = document.createElement('input');
        this.textOption.setAttribute('style', 'visibility: hidden;');
        this.textOption.setAttribute('type', 'text');
        this.textOption.setAttribute('name', `${button.toLowerCase()}_option`);
        this.textOption.id = `${button.toLowerCase()}TextOption`;
        this.textOption.classList.add('mft-text');
        this.textOption.setAttribute('placeholder', button.toLowerCase() == 'create' ? 'Password' : 'Lobby Number');
        let buttRow = document.createElement('div');
        buttRow.classList.add('mft-row-b');
        this.button = document.createElement('input');
        this.button.classList.add('mft-button');
        this.button.setAttribute('type', 'submit');
        this.button.setAttribute('value', button);
        let cancel = document.createElement('div');
        cancel.classList.add('mft-button');
        cancel.textContent = 'CANCEL';
        cancel.addEventListener('click', () => {
            callback();
        });
        buttRow.append(this.button);
        buttRow.append(cancel);
        this.cardForm.append(radRow);
        this.cardForm.append(break1);
        this.cardForm.append(this.textOption);
        this.cardForm.append(break1);
        this.cardForm.append(break1);
        this.cardForm.append(buttRow);
        this.addCsrfTokenToForm(this.cardForm);
        this.cardContainer.append(this.title);
        this.cardContainer.append(this.cardForm);
        this.parentElement.append(this.cardContainer);
    }
    show() {
        this.parentElement.setAttribute('style', 'display:block;');
    }
    hide() {
        this.parentElement.setAttribute('style', 'display:none;');
    }
    showText() {
        this.textOption.setAttribute('style', 'visibility: show;');
    }
    hideText() {
        this.textOption.setAttribute('style', 'visibility: hidden;');
    }
    addCsrfTokenToForm(formElement) {
        const csrfInput = document.createElement("input");
        csrfInput.type = "hidden";
        csrfInput.name = "csrfmiddlewaretoken";
        csrfInput.value = this.csrfToken;
        formElement.appendChild(csrfInput);
    }
}
