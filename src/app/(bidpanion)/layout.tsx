import { BidpanionShell } from "@/components/bidpanion/BidpanionShell";

export default function BidpanionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BidpanionShell>{children}</BidpanionShell>;
}
