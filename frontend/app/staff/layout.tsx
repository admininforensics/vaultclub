import { StaffChrome } from "@/components/StaffChrome";
import { StaffGuard } from "@/components/StaffGuard";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StaffGuard>
      <StaffChrome>{children}</StaffChrome>
    </StaffGuard>
  );
}
