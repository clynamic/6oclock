import { Upload } from "../../api";
import _ from "lodash";

export interface UploaderSummary {
  user: number;
  count: number;
  dates: Date[];
}

export const getUploaders = (uploads?: Upload[]): UploaderSummary[] | null => {
  if (_.isNil(uploads)) return null;
  return _.chain(uploads)
    .filter((upload) => upload.uploader_id != null)
    .groupBy("uploader_id")
    .map((group, uploader_id) => ({
      user: Number(uploader_id),
      count: group.length,
      dates: group.map((upload) => new Date(upload.updated_at)),
    }))
    .orderBy("count", "desc")
    .value();
};
