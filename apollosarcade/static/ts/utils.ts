export function apollosLocalMessage(message: string, type: string) {
    let modal = document.getElementById("messageModal");
    let container = document.getElementById("modalContainer");
    let content = document.getElementById("messageContent");
    let closeButton = document.getElementById("message_close");
    if (modal && content && container && closeButton != null) {
        content.textContent = message;
        container.classList.add(`alert-${type}`);
        modal.style.display = 'block';
        closeButton.replaceWith(closeButton.cloneNode(true));
        if (type == 'error') {
            closeButton.addEventListener('click', () => {
                window.location.reload();
            });
        }
    }
}

export function apollosServerMessage(message: string, type: string, data: any) {
    let userIdRegex = /User:\s*(\d+)/;
    let matchedUserId = message.match(userIdRegex);
    let userIdFromMessage = matchedUserId ? parseInt(matchedUserId[1]) : null;

    let errorMessageRegex = /Error:\s*([^\n]+)/;
    let matchedErrorMessage = message.match(errorMessageRegex);
    let errorMessage = matchedErrorMessage ? matchedErrorMessage[1] : null;

    // Want to only show alert to the user who made the error
    if (userIdFromMessage === getCurrentUserId(data) && errorMessage) {
        apollosLocalMessage(errorMessage, type);
    }
}

export function getCurrentUserId(data: any) {
    // let appElement = document.getElementById('mpApp');
    let id = (data.current)?.toString();
    if (id) {
        return parseInt(id);
    } else {
        throw new Error('User id not found');
    }
}

export function addCsrfTokenToForm(form: HTMLFormElement, _csrfToken: string) {
    const csrfToken = document.createElement('input');
    csrfToken.setAttribute('type', 'hidden');
    csrfToken.setAttribute('name', 'csrfmiddlewaretoken');
    csrfToken.setAttribute('value', _csrfToken);
    form.append(csrfToken);
}