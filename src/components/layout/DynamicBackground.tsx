"use client";

export default function DynamicBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 overflow-hidden transition-colors duration-700"
      style={{ background: "var(--bg-base)" }}
    >
      <div
        className="absolute -top-40 -left-40 h-[34rem] w-[34rem] rounded-full blur-[110px] animate-drift transition-[background-color,opacity] duration-700 will-change-transform"
        style={{
          backgroundColor: "var(--blob-1)",
          opacity: "var(--blob-opacity)",
          animationDuration: "24s",
        }}
      />
      <div
        className="absolute top-1/3 -right-32 h-[30rem] w-[30rem] rounded-full blur-[110px] animate-drift-slow transition-[background-color,opacity] duration-700 will-change-transform"
        style={{
          backgroundColor: "var(--blob-2)",
          opacity: "var(--blob-opacity)",
          animationDuration: "31s",
          animationDelay: "-6s",
        }}
      />
      <div
        className="absolute bottom-[-10rem] left-1/3 h-[28rem] w-[28rem] rounded-full blur-[110px] animate-drift transition-[background-color,opacity] duration-700 will-change-transform"
        style={{
          backgroundColor: "var(--blob-3)",
          opacity: "var(--blob-opacity)",
          animationDuration: "27s",
          animationDelay: "-13s",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.25)_100%)]" />
    </div>
  );
}
