import { Approval } from "../../api";

export interface ApprovalContributions {
  position: number;
  user: number;
  count: number;
  dates: Date[];
}

export const getApprovalContributors = (
  approvals?: Approval[]
): ApprovalContributions[] | null => {
  if (approvals == null) return null;
  const lookup: Map<number, ApprovalContributions> = new Map();
  for (const approval of approvals) {
    if (!approval.user_id) continue;
    if (!lookup.has(approval.user_id)) {
      lookup.set(approval.user_id, {
        position: 0,
        user: approval.user_id,
        count: 1,
        dates: [new Date(approval.updated_at)],
      });
    } else {
      const contribution = lookup.get(approval.user_id)!;
      contribution.count++;
      contribution.dates.push(new Date(approval.updated_at));
    }
  }
  const result = Array.from(lookup.values());
  result.sort((a, b) => b.count - a.count);
  result.forEach((contribution, index) => {
    contribution.position = index + 1;
  });
  return result;
};
