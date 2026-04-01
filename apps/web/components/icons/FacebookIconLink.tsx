import { Facebook } from "lucide-react";

export default function FacebookIconLink() {
  return (
    <a
      href="https://www.facebook.com/xena_nails_studio"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex size-10 items-center justify-center rounded-xl bg-gray-800 transition-colors hover:bg-pink-500"
      aria-label="Facebook"
    >
      <Facebook className="size-5" />
    </a>
  );
}
