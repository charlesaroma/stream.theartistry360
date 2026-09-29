/* Membership */
import PurchasesPanel from "./PurchasesPanel";
import SubscriptionPanel from "./SubscriptionPanel";

/** Plan, films bought and payment history on one page, like other streaming services. */
export default function MembershipPanel() {
  return (
    <div className="flex flex-col gap-6">
      <SubscriptionPanel />
      <PurchasesPanel />
    </div>
  );
}
