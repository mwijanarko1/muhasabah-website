import { buildLlmsMarkdown, getLlmsDocumentByPath, getLlmsDocuments } from "@/lib/seo";

type RouteContext = {
  params: Promise<{
    document: string;
  }>;
};

export const dynamic = "force-static";

export function generateStaticParams() {
  return getLlmsDocuments().map((document) => ({
    document: document.llmsPath.replace("/llms/", ""),
  }));
}

export async function GET(_request: Request, { params }: RouteContext): Promise<Response> {
  const { document } = await params;
  const llmsDocument = getLlmsDocumentByPath(document);

  if (!llmsDocument) {
    return new Response("Not found\n", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  return new Response(buildLlmsMarkdown(llmsDocument), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "X-Robots-Tag": "noindex, follow",
    },
  });
}
