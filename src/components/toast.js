// Toast Notification System for Cinematron

export function initToast(container) {
  window.addEventListener('cinematron:toast', (e) => {
    const { message, type = 'info' } = e.detail;

    const toast = document.createElement('div');
    toast.className = `cinematron-toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-indicator"></span>
        <span class="toast-message">${message}</span>
      </div>
    `;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.add('visible');
    });

    // Auto dismiss after 3.2 seconds
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => {
        toast.remove();
      }, 400);
    }, 3200);
  });
}
