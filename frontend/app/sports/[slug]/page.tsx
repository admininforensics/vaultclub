import { redirect } from "next/navigation";

export default async function SportSlugRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/programs/sports/${slug}`);
}
