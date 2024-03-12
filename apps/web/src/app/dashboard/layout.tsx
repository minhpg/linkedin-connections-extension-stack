import { Suspense } from "react";
import Loading from "../loading";
import Navbar from "./components/Navbar.component";
import Footer from "./components/Footer.component";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession()
  if(!session) redirect("/")

  return (
    <div className="mx-auto flex h-screen max-w-7xl flex-col px-6 sm:px-8">
      <Navbar />
      <main className="my-6 flex-1">
        <Suspense fallback={<Loading />}>{children}</Suspense>
      </main>
      <Footer />
    </div>
  );
}
