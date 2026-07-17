import LoginForm from "@/components/LoginForm";
import { auth } from "@/app/utils/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session) {
    console.log("SESSION", session);
    redirect("/modulos");
  }

  return (
    <>
      <LoginForm />
    </>
  );
}