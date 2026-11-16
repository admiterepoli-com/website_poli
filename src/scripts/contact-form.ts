/**
 * Contact form on `contact` (the "Contact Form" block of the legacy main.js).
 *
 * The form (`#contact-form`) is posted as JSON to Web3Forms. SweetAlert2
 * shows a short "sending" dialog, then a success or error dialog. The form is
 * reset after every attempt, whatever the result.
 *
 * Validation is left to the browser: the fields carry `required` and
 * `type="email"` in the markup, so `submit` only fires for a valid form. The
 * legacy script never disabled or relabelled the submit button, so neither
 * does this one.
 */
import Swal from 'sweetalert2';

const FORM_ID = 'contact-form';
const ENDPOINT = 'https://api.web3forms.com/submit';
const ACCESS_KEY = '6eaadb1c-89a0-4ec2-8e96-acb65cf36873';
const RECIPIENT = 'admiterepoli@gmail.com';

const BUTTON_COLOR = '#555879';
const DEFAULT_ERROR = 'A apărut o eroare la trimitere!';

/** JSON body sent to Web3Forms: the form fields plus the access key. */
export interface Web3FormsRequest {
  [field: string]: string;
  access_key: string;
  to: string;
}

/** The part of the Web3Forms response the form relies on. */
export interface Web3FormsResponse {
  success: boolean;
  message?: string;
}

function isWeb3FormsResponse(value: unknown): value is Web3FormsResponse {
  if (typeof value !== 'object' || value === null) return false;
  if (!('success' in value) || typeof value.success !== 'boolean') return false;
  return !('message' in value) || value.message === undefined || typeof value.message === 'string';
}

/**
 * Builds the request body like the legacy `Object.fromEntries(formData)` after
 * appending `access_key` and `to`: same keys, same order.
 */
export function buildRequest(formData: FormData): Web3FormsRequest {
  const body: Record<string, string> = {};
  formData.forEach((value, key) => {
    // Formularul are doar câmpuri text; un fișier ar fi serializat ca "{}" de JSON.stringify.
    body[key] = typeof value === 'string' ? value : '';
  });
  return { ...body, access_key: ACCESS_KEY, to: RECIPIENT };
}

function showSending(): void {
  void Swal.fire({
    title: 'Se trimite mesajul...',
    timer: 1000,
    didOpen: () => {
      Swal.showLoading();
    },
  });
}

function showSuccess(): void {
  void Swal.fire({
    title: 'Succes!',
    text: 'Mesaj trimis cu succes!',
    icon: 'success',
    confirmButtonText: 'OK',
    confirmButtonColor: BUTTON_COLOR,
  });
}

function showError(text: string): void {
  void Swal.fire({
    title: 'Oops!',
    text,
    icon: 'error',
    confirmButtonText: 'OK',
    confirmButtonColor: BUTTON_COLOR,
  });
}

async function submit(form: HTMLFormElement): Promise<void> {
  const request = buildRequest(new FormData(form));

  showSending();

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(request),
    });
    const data: unknown = await res.json();

    if (isWeb3FormsResponse(data) && data.success) {
      showSuccess();
    } else {
      // Ca în legacy: mesajul serverului dacă există, altfel textul implicit.
      const message = isWeb3FormsResponse(data) ? data.message : undefined;
      showError(message || DEFAULT_ERROR);
    }
  } catch (error) {
    console.log(error);
    showError(DEFAULT_ERROR);
  } finally {
    form.reset();
  }
}

export function initContactForm(): void {
  const form = document.getElementById(FORM_ID);
  if (!(form instanceof HTMLFormElement)) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    void submit(form);
  });
}
