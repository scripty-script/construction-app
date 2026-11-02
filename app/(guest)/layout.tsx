import Image from "next/image";
import Link from "next/link";

interface Layout {
  children: React.ReactNode;
}

export default function Layout({ children }: Layout) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex items-center size-8 justify-center rounded-full bg-primary text-primary-foreground">
              <Image
                className="dark:invert"
                src="/vercel.svg"
                alt="Next.js logo"
                width={16}
                height={16}
                style={{
                  width: "16px",
                  height: "16px",
                }}
                priority
              />
            </div>
            Construction App
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
      </div>
      <div className="relative lg:flex lg:flex-col lg:items-center lg:justify-center hidden bg-muted ">
        <Image
          src="/next.svg"
          alt="Next.js logo"
          width={200}
          height={40}
          style={{
            width: "200px",
            height: "40px",
          }}
          priority
        />
      </div>
    </div>
  );
}
