import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { KnowledgeClient } from "./knowledge-client";

export default async function KnowledgePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  return <KnowledgeClient />;
}
