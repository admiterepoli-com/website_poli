/**
 * Year / session dropdowns on `subiecte` and `simulari` (the legacy
 * `SimpleDropdown` class from main.js).
 *
 * A header (`.subiecte-box[data-set="X"]`) toggles the section with the id
 * `dropdown-X`. Only one section is open at a time; Escape or a click outside
 * closes everything. The open/close animation is pure CSS, driven by the
 * `show` class on the section and the `active` class on the header.
 */
const HEADER_SELECTOR = '.subiecte-box, .subiecte-box-info';
const SECTION_SELECTOR = '.dropdown-section';
const SECTION_ID_PREFIX = 'dropdown-';

let initialised = false;

export function initDropdowns(): void {
  // Componenta apare de mai multe ori pe pagină; legăm handler-ele o singură dată.
  if (initialised) return;
  initialised = true;

  let activeDropdown: HTMLElement | null = null;

  function openDropdown(dropdown: HTMLElement, header: HTMLElement): void {
    dropdown.classList.add('show');
    header.classList.add('active');
    activeDropdown = dropdown;

    console.log('Deschis dropdown pentru:', dropdown.id);
  }

  function closeDropdown(dropdown: HTMLElement): void {
    const header = document.querySelector(`[data-set="${dropdown.id.replace(SECTION_ID_PREFIX, '')}"]`);

    dropdown.classList.remove('show');
    header?.classList.remove('active');

    if (activeDropdown === dropdown) activeDropdown = null;
  }

  function closeAllDropdowns(): void {
    document.querySelectorAll<HTMLElement>(SECTION_SELECTOR).forEach(closeDropdown);
  }

  function toggleDropdown(event: Event, header: HTMLElement): void {
    event.preventDefault();
    event.stopPropagation();

    const dropdown = document.getElementById(`${SECTION_ID_PREFIX}${header.getAttribute('data-set')}`);
    if (!dropdown) return;

    // Închide alte dropdown-uri deschise
    if (activeDropdown && activeDropdown !== dropdown) closeDropdown(activeDropdown);

    // Toggle dropdown-ul curent
    if (dropdown.classList.contains('show')) {
      closeDropdown(dropdown);
    } else {
      openDropdown(dropdown, header);
    }
  }

  // Event listeners pentru textele Set (clickabile)
  document.querySelectorAll<HTMLElement>(HEADER_SELECTOR).forEach((header) => {
    header.addEventListener('click', (event) => toggleDropdown(event, header));
  });

  // Închide dropdown cu Escape
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAllDropdowns();
  });

  // Închide dropdown când faci click în afara lui
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (!target.closest('.set-container') && !target.closest(HEADER_SELECTOR)) closeAllDropdowns();
  });
}
