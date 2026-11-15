/**
 * The single auth module loaded by `BaseLayout` on ported pages, in place of the legacy
 * `<script type="module" src="./firebase-auth.js">`.
 *
 * For now it only runs `legacy-auth.js`, a copy of `legacy/firebase-auth.js` whose CDN imports were
 * rewritten to the npm SDK and `./app`. The following issues extract typed modules from that file one
 * by one and import them here instead.
 */
import './legacy-auth.js';
