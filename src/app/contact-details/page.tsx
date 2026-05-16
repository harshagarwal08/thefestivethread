import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Details — The Festive Thread by Kavita",
  description: "Public contact information for The Festive Thread by Kavita.",
};

export default function ContactDetailsPage() {
  return (
    <div className="pt-16 min-h-dvh bg-[#F9F5EF]">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <span className="text-[0.62rem] tracking-[0.22em] uppercase text-[#B5541E] block mb-3">Contact Information</span>
        <h1 className="font-display font-light text-[#1C1009] text-4xl mb-10">Contact Details</h1>

        <div className="flex flex-col gap-6 text-[#4A2C1A]">
          <div>
            <p className="text-[0.62rem] tracking-[0.16em] uppercase text-[#8A7968] mb-1">Business Name</p>
            <p className="text-base">The Festive Thread by Kavita</p>
          </div>
          <div>
            <p className="text-[0.62rem] tracking-[0.16em] uppercase text-[#8A7968] mb-1">Owner</p>
            <p className="text-base">Kavita</p>
          </div>
          <div>
            <p className="text-[0.62rem] tracking-[0.16em] uppercase text-[#8A7968] mb-1">Phone</p>
            <p className="text-base">+91 98830 88575</p>
          </div>
          <div>
            <p className="text-[0.62rem] tracking-[0.16em] uppercase text-[#8A7968] mb-1">Location</p>
            <p className="text-base">Howrah, West Bengal, India</p>
          </div>
          <div>
            <p className="text-[0.62rem] tracking-[0.16em] uppercase text-[#8A7968] mb-1">Instagram</p>
            <a
              href="https://instagram.com/thefestivethread"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base text-[#B5541E] hover:underline"
            >
              @thefestivethread
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
