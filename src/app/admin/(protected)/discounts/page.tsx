import { listDiscounts } from "@/lib/discount";
import DiscountsClient from "./DiscountsClient";

export default async function DiscountsPage() {
  const codes = await listDiscounts();
  codes.sort((a, b) => a.code.localeCompare(b.code));
  return <DiscountsClient initialCodes={codes} />;
}
