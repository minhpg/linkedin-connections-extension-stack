import { getProviders } from "next-auth/react";
import Logo from "./dashboard/components/Logo.component";
import { Card } from "@tremor/react";
import ProvidersList from "./components/ProvidersList.component";
import Footer from "./dashboard/components/Footer.component";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function Home() {

  const session = await getServerAuthSession()
  if(session) redirect("/dashboard")

  const providers = (await getProviders()) ?? [];
  return (
    <main className="flex h-screen flex-col">
      <div className="flex-1">
        <div className="flex flex-col h-full justify-center">
          <div className="flex justify-center">
            <Card className="max-w-lg self-center m-10">
                <div>
                  <Logo />
                </div>
              <ProvidersList providers={providers} />
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
