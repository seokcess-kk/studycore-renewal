import { redirect } from "next/navigation";

export default function GuidePage() {
  redirect("/manual?tab=onboarding");
}
