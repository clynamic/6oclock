import _ from "lodash";

import { PostVersion } from "../../api";

export interface UploaderSummary {
  user: number;
  count: number;
  dates: Date[];
}

export const getUploaders = (
  uploads?: PostVersion[]
): UploaderSummary[] | null => {
  if (_.isNil(uploads)) return null;
  return _.chain(uploads)
    .filter((upload) => upload.updater_id != null)
    .groupBy("updater_id")
    .map((group, updater_id) => ({
      user: Number(updater_id),
      count: group.length,
      dates: group.map((upload) => new Date(upload.updated_at)),
    }))
    .orderBy("count", "desc")
    .value();
};
