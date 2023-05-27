import { apollosLocalMessage } from "./utils";

export class FifteenCard {
    private csrfToken: string;
    private parentElement: Element;
    private cardContainer: Element;
    private title: Element;
    private cardForm: Element;
    private radio1: Element;
    private radio2: Element;
    private textLabel: Element;
    private textOption: Element;
    private button: Element;
    private passwordLabel: Element;
    private password: Element;

    constructor(title: string, radio1: string, radio2: string, button: string, _element: Element, callback: Function, csrfToken: string, guest: boolean = true) {
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
        // this.cardForm.setAttribute('method', 'post');
        this.cardForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitForm();
        });

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
        if (button.toLowerCase() == 'join' || (button.toLowerCase() == 'create' && !guest)) {
            radRow.append(radCol2);
        }
        // Text option label
        this.textLabel = document.createElement('label');
        this.textLabel.setAttribute('for', `${button.toLowerCase()}TextOption`);
        this.textLabel.textContent = button.toLowerCase() == 'create' ? 'Password' : 'Lobby Number';
        this.textLabel.setAttribute('style', 'display: none;');
        this.textLabel.id = `${button.toLowerCase()}TextLabel`;

        // Text option
        this.textOption = document.createElement('input');
        this.textOption.setAttribute('style', 'display: none;');
        this.textOption.setAttribute('type', 'text');
        this.textOption.setAttribute('autocomplete', 'off');
        this.textOption.setAttribute('name', `${button.toLowerCase()}_option`);
        this.textOption.id = `${button.toLowerCase()}TextOption`;
        this.textOption.classList.add('mft-text');
        this.textOption.setAttribute('placeholder', button.toLowerCase() == 'create' ? 'Password' : 'Lobby Number');

        // Password label
        this.passwordLabel = document.createElement('label');
        this.passwordLabel.setAttribute('for', `${button.toLowerCase()}_password`);
        this.passwordLabel.textContent = 'Password';
        this.passwordLabel.setAttribute('style', 'display: none;');
        this.passwordLabel.id = `${button.toLowerCase()}_password_label`;

        // Password
        this.password = document.createElement('input');
        this.password.setAttribute('style', 'display: none;');
        this.password.setAttribute('type', 'password');
        this.password.setAttribute('name', 'password');
        this.password.id = `${button.toLowerCase()}_password`;
        this.password.classList.add('mft-text');

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
        this.cardForm.append(break1);
        this.cardForm.append(this.textLabel);
        this.cardForm.append(this.textOption);
        if (button.toLowerCase() == 'join' && !guest) {
            this.cardForm.append(break1);
            this.cardForm.append(this.passwordLabel)
            this.cardForm.append(this.password);
        }
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
        this.textLabel.setAttribute('style', 'display: inherit;');
        this.textOption.setAttribute('style', 'display: inherit;');
        this.passwordLabel.setAttribute('style', 'display: inherit;');
        this.password.setAttribute('style', 'display: inherit;');
    }

    hideText() {
        this.textLabel.setAttribute('style', 'display: none;');
        this.textOption.setAttribute('style', 'display: none;');
        this.passwordLabel.setAttribute('style', 'display: none;');
        this.password.setAttribute('style', 'display: none;');
    }

    addCsrfTokenToForm(formElement: Element) {
        const csrfInput = document.createElement("input");
        csrfInput.type = "hidden";
        csrfInput.name = "csrfmiddlewaretoken";
        csrfInput.value = this.csrfToken;

        formElement.appendChild(csrfInput);
    }

    submitForm() {
        const formData = new FormData(this.cardForm as HTMLFormElement);
        fetch(this.cardForm.getAttribute('action')!, {
            method: 'POST',
            body: formData,
        }).then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error);
                });
            }
        }).catch(error => {
            apollosLocalMessage(error.message, 'error');
            document.getElementById('message_close')!.addEventListener('click', () => {
                document.getElementById('messageModal')!.setAttribute('style', 'display: none;');
            });
        });
    }

}