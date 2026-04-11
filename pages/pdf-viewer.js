import { useRouter } from "next/router";

export default function PdfViewer() {
  const router = useRouter();
  const { url } = router.query;

  if (!url) return null;

  return (
    <div style={{ height: "100vh" }}>
      <button
        className="btn"
        style={{ margin: 10 }}
        onClick={() => router.back()}
      >
        Back
      </button>

      <iframe
        src={`https://docs.google.com/gview?url=${url}&embedded=true`}
        style={{ width: "100%", height: "90%", border: "none" }}
      />
    </div>
  );
}