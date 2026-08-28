import {
  TagRelationshipStatus,
  parseTagRelationshipStatus,
} from './tag-relationship';

describe('parseTagRelationshipStatus', () => {
  it.each(['active', 'deleted', 'pending', 'processing', 'queued', 'retired'])(
    'leaves %s without an error message',
    (raw) => {
      expect(parseTagRelationshipStatus(raw)).toEqual({
        status: raw,
        errorMessage: null,
      });
    },
  );

  it('splits the message off an errored status', () => {
    expect(
      parseTagRelationshipStatus('error: circular implication detected'),
    ).toEqual({
      status: TagRelationshipStatus.error,
      errorMessage: 'circular implication detected',
    });
  });

  // Upstream interpolates an exception, which carries its own colons.
  it('keeps a message that contains the separator', () => {
    expect(
      parseTagRelationshipStatus('error: PG::UniqueViolation: duplicate key'),
    ).toEqual({
      status: TagRelationshipStatus.error,
      errorMessage: 'PG::UniqueViolation: duplicate key',
    });
  });

  it('reads a bare error, which is the shape upstream would send once split', () => {
    expect(parseTagRelationshipStatus('error')).toEqual({
      status: TagRelationshipStatus.error,
      errorMessage: null,
    });
  });

  it('rejects a status it does not know', () => {
    expect(() => parseTagRelationshipStatus('approved')).toThrow(
      'Unknown tag relationship status: approved',
    );
  });

  // Only `error` is suffixed, so a suffix on anything else is not a shape
  // upstream can produce.
  it('rejects a suffix on a status that does not take one', () => {
    expect(() => parseTagRelationshipStatus('pending: whatever')).toThrow(
      'Unknown tag relationship status: pending: whatever',
    );
  });
});
