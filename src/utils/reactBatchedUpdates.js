// This is a compatibility layer for react-redux which is looking for unstable_batchedUpdates
// In React 18, this function was removed or renamed, so we provide a simple implementation

// Default implementation that passes through the callback
export const unstable_batchedUpdates = callback => callback();

export default unstable_batchedUpdates; 