import Navbar from "@/components/Navbar";
import { UserProvider } from "@/components/user-provider";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <Navbar />
      {children}
    </UserProvider>
  );
} 