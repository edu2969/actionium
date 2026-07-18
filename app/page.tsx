import LoginForm from "@/app/components/LoginForm";
import { redirect } from "next/navigation";
import { auth } from "@/app/utils/auth"

export default async function Home() {
  const session = await auth();

  if (session) {
    console.log("SESSION", session);
    redirect("/");
  }

  return (
    <>
      <LoginForm />
    </>
  );
}