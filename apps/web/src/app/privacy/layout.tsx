import { Suspense } from "react";
import Loading from "../loading";
import Navbar from "../components/Navbar.component";
import Footer from "../components/Footer.component";

export default async function PrivacyPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex h-screen max-w-2xl flex-col px-6 sm:px-8">
      <Navbar />
      <main className="my-6 flex-1">
        <Suspense fallback={<Loading />}>{children}</Suspense>
      </main>
      <Footer />
    </div>
  );
}
