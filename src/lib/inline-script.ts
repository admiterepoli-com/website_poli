/**
 * Build-time helper for scripts that must be inlined into the page as classic
 * (non-module) scripts: the cookie consent script, which has to run before
 * analytics, and the exam-gate safety net, which must work even when the
 * module bundle fails to load.
 *
 * Usage in a component:
 *   import source from '../scripts/cookie-consent.ts?raw';
 *   const code = compileInlineScript(source);
 *   <script is:inline set:html={code} />
 *
 * The source file is still type-checked by `tsc` like any other file. It must
 * be self-contained: no imports and no exports.
 */
import ts from 'typescript';

export function compileInlineScript(source: string): string {
  if (/^\s*(import|export)\s/m.test(source)) {
    throw new Error('Inline scripts must not use import or export.');
  }
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2019,
      module: ts.ModuleKind.ESNext,
      removeComments: true,
    },
  });
  return outputText.trim();
}
