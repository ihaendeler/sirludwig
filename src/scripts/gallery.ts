const viewer = document.querySelector<HTMLDialogElement>('[data-photo-viewer]');
const image = viewer?.querySelector<HTMLImageElement>('[data-photo-image]');
const caption = viewer?.querySelector<HTMLElement>('[data-photo-caption]');
const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-gallery-open]')];
let current = 0;
let galleryOpener: HTMLAnchorElement | undefined;
function show(index: number) {
  if (!image || !caption || !links.length) return;
  current = (index + links.length) % links.length;
  const link = links[current];
  image.src = link.href;
  image.alt = link.querySelector('img')?.alt ?? '';
  caption.textContent = `${link.dataset.caption ?? ''} · ${current + 1} / ${links.length}`;
}
for (const [index, link] of links.entries()) {
  link.addEventListener('click', (event) => {
    if (!viewer || typeof viewer.showModal !== 'function' || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    galleryOpener = link;
    show(index);
    viewer.showModal();
  });
}
viewer?.querySelector('[data-photo-close]')?.addEventListener('click', () => viewer.close());
viewer?.querySelector('[data-photo-previous]')?.addEventListener('click', () => show(current - 1));
viewer?.querySelector('[data-photo-next]')?.addEventListener('click', () => show(current + 1));
viewer?.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    show(current + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
viewer?.addEventListener('click', (event) => {
  if (event.target === viewer || event.target === viewer.querySelector('.photo-viewer__stage')) viewer.close();
});
viewer?.addEventListener('close', () => galleryOpener?.focus());

export {};
