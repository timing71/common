import { types } from 'mobx-state-tree';

const ManifestModel = types.model({
  name: types.optional(types.string, ''),
  description: types.optional(types.string, ''),
  colSpec: types.array(types.frozen(types.array)),
  startTime: types.optional(types.Date, () => new Date())
});

export const Manifest = types.snapshotProcessor(ManifestModel, {
  preProcessor(snapshot) {
    if (!snapshot) return {};
    if (snapshot.startTime < 1e10) {
      // Unix-style timestamp without milliseconds; we expect a timestamp
      // with milliseconds to pass to `new Date()`
      snapshot.startTime = snapshot.startTime * 1000;
    }
    return snapshot;
  }
});
