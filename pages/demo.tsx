export default function Demo() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6">
        Product Demo
      </h1>
      <p className="text-white/70 mb-6">
        This is a placeholder demo video. Swap the embed with your final
        recording when ready.
      </p>

      <div
        className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-black/40"
        style={{ paddingTop: "56.25%" }}
      >
        <iframe
          className="absolute inset-0 h-full w-full"
          src="https://www.youtube.com/embed/ysz5S6PUM-U?rel=0"
          title="SyncAI Demo"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  );
}
