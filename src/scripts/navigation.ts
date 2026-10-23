export {};

const header = document.querySelector<HTMLElement>('[data-site-header]');
const opener = document.querySelector<HTMLButtonElement>('.nav-toggle--open');
const closer = document.querySelector<HTMLButtonElement>('.nav-toggle--close');
const nav = document.getElementById('site-nav');
const overlay = document.querySelector<HTMLElement>('[data-nav-overlay]');
const desktop = matchMedia('(min-width: 72rem)');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let hideTimer: number | undefined;
let open = false;

function setMenu(next: boolean, restoreFocus = true) {
	if (!header || !opener || !nav || !overlay) return;
	clearTimeout(hideTimer);
	open = next && !desktop.matches;
	opener.setAttribute('aria-expanded', String(open));
	header.classList.toggle('is-menu-open', open);
	document.body.style.overflow = open ? 'hidden' : '';
	for (const element of document.querySelectorAll<HTMLElement>('main, footer, .skip-link')) element.inert = open;
	if (open) {
		nav.hidden = false; overlay.hidden = false;
		nav.classList.add('is-open'); overlay.classList.add('is-visible');
		closer?.focus();
	} else {
		nav.classList.remove('is-open'); overlay.classList.remove('is-visible');
		if (restoreFocus && !desktop.matches) opener.focus();
		const hide = () => { if (!open && !desktop.matches) nav.hidden = true; overlay.hidden = true; };
		if (desktop.matches) { nav.hidden = false; overlay.hidden = true; }
		else if (reduced.matches) hide();
		else hideTimer = window.setTimeout(hide, 380);
	}
}

opener?.addEventListener('click', () => setMenu(!open));
closer?.addEventListener('click', () => setMenu(false));
overlay?.addEventListener('click', () => setMenu(false));
nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => { if (open) setMenu(false, false); }));
document.addEventListener('keydown', (event) => {
	if (!open || !nav) return;
	if (event.key === 'Escape') { event.preventDefault(); setMenu(false); return; }
	if (event.key !== 'Tab') return;
	const focusable = [...nav.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')].filter((el) => el.getClientRects().length);
	const first = focusable[0]; const last = focusable[focusable.length - 1];
	if (event.shiftKey && (document.activeElement === first || !nav.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
	else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
});
desktop.addEventListener('change', () => setMenu(false, false));
setMenu(false, false);
