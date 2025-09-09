// Modul za zamjenu react-dom/unstable_batchedUpdates
// koji nedostaje u React 18

export function unstable_batchedUpdates(callback) {
  return callback();
}

export default unstable_batchedUpdates; 