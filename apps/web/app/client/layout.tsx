import ClientHeader from "./_components/ClientHeader";
import ClientNav from "./_components/ClientNav";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <ClientHeader />
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        <ClientNav />
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
