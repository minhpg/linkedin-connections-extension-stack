import { getProviders, signIn } from "next-auth/react";
import Logo from "./dashboard/components/Logo.component";
import { Button, Card, Divider, TextInput, Title } from "@tremor/react";
import ProvidersList from "./components/ProvidersList.component";
import Footer from "./dashboard/components/Footer.component";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerAuthSession();
  if (session) redirect("/dashboard");

  const providers = (await getProviders()) ?? [];
  return (
    <main className="flex h-screen flex-col">
      <div className="flex-1">
        <div className="flex h-full flex-col justify-center">
          <div className="flex justify-center">
            <Card className="m-10 max-w-lg self-center">
              <div>
                <Logo />
              </div>
              <div className="mt-6">
                <Title>Sign in to your account</Title>
              </div>
              <form action="#" className="mt-6">
                <label
                  htmlFor="email"
                  className="text-tremor-default text-tremor-content-strong dark:text-dark-tremor-content-strong font-medium"
                >
                  Email
                </label>
                <TextInput
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  placeholder="john@company.com"
                  className="mt-2"
                />
              <Button className="w-full mt-6">Sign in</Button>
              </form>
              <Divider>or with</Divider>
              <ProvidersList providers={providers} />
              <p className="text-tremor-label text-tremor-content dark:text-dark-tremor-content mt-4">
                By signing in, you agree to our{" "}
                <a href="#" className="underline underline-offset-4">
                  terms of service
                </a>{" "}
                and{" "}
                <a href="#" className="underline underline-offset-4">
                  privacy policy
                </a>
                .
              </p>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
