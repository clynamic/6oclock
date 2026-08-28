// Upstream stores a failure as `error: <message>` in the status column itself.
export enum TagRelationshipStatus {
  active = 'active',
  deleted = 'deleted',
  pending = 'pending',
  processing = 'processing',
  queued = 'queued',
  retired = 'retired',
  error = 'error',
}

export interface TagRelationshipState {
  status: TagRelationshipStatus;
  errorMessage: string | null;
}

const ERROR_PREFIX = 'error: ';

export const parseTagRelationshipStatus = (
  raw: string,
): TagRelationshipState => {
  if (raw.startsWith(ERROR_PREFIX)) {
    return {
      status: TagRelationshipStatus.error,
      errorMessage: raw.slice(ERROR_PREFIX.length),
    };
  }

  if (!(raw in TagRelationshipStatus)) {
    throw new Error(`Unknown tag relationship status: ${raw}`);
  }

  return { status: raw as TagRelationshipStatus, errorMessage: null };
};
