This folder will host per-business-type form overrides.

Structure proposal:

- Generic fields in `client/src/utils/formConfig.js` remain the source of truth
- Optional per-type form wrappers can live here, e.g. `HVACJobForm.js`, `PlumberJobForm.js`
- A small index can export a resolver that picks a specific component by business type, otherwise falls back to the generic `JobForm`

Initial placeholder to be replaced when first custom form is needed.


