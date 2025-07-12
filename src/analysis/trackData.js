import { types } from 'mobx-state-tree';

const Datum = types.model({
  timestamp: types.Date,
  value: types.union(types.number, types.string, types.undefined)
});

const SeriesModel = types.model({
  label: types.string,
  unit: types.string,
  data: types.optional(types.array(Datum), [])
});

const Series = types.snapshotProcessor(SeriesModel, {
  preProcessor(snapshot) {
    return ({
      label: snapshot.label,
      unit: snapshot.unit,
      data: (snapshot.data || []).map(
        ([t, v]) => ({
          timestamp: t,
          value: v
        })
      )
    });
  },
  postProcessor(snapshot, node) {
    return ({
      label: snapshot.label,
      unit: snapshot.unit,
      data: node?.data?.map(d => ([d.timestamp.getTime(), d.value]))
    });
  }
});

export const TrackData = types.model({
  series: types.optional(types.map(Series), {})
}).actions(
  self => ({
    update(oldState, newState) {
      const labels = newState.manifest?.trackDataSpec || [];
      const values = newState.session?.trackData || [];
      const prevValues = oldState.session?.trackData || [];

      for (let i = 0; i < values.length; i++) {
        const label = labels[i];
        const value = values[i];
        const prevValue = prevValues[i];

        if (Array.isArray(value) && value.length === 2) {
          if (!self.series.get(label)) {
            const series = Series.create({
              label,
              unit: value[1],
              data: []
            });
            self.series.set(label, series);

            if (prevValue && prevValue[0] !== null) {
              series.data.push(Datum.create({
                timestamp: oldState.lastUpdated,
                value: prevValue[0]
              }));
            }
          }

          if (value[0] && (!prevValue || prevValue[0] !== value[0])) {
            // Value has changed! How exciting
            // console.log(label, prevValue[0], '==>', value[0]);
            self.series.get(label).data.push(Datum.create({
              timestamp: newState.lastUpdated,
              value: value[0]
            }));
          }
        }
      }
    }
  })
).views(
  self => ({
    get toArray() {
      return [...self.series.values()];
    }
  })
);
