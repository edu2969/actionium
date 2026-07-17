import RegisterForm from "@/app/components/RegisterForm";
import { auth } from "@/app/utils/auth";
import { redirect } from "next/navigation";

export default async function Register() {
  const session = await auth();

  if (session) redirect("/dashboard");

  return <RegisterForm />;
}