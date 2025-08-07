import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold mb-8">TokoToko</h1>
      <p className="text-lg mb-6">
        ランダムなスポットを提案し、<br />
        新しい発見を届ける
      </p>

      <Image
        src="/492.png"
        alt="都市の画像"
        width={600}
        height={400}
        className="mx-auto mb-3"
      />

      <div className="flex flex-col items-center gap-4 w-full max-w-60 ">
        <Button asChild className="w-full text-white bg-orange-400 rounded-2xl hover:bg-orange-500">
          <Link href="/auth/signin">Login</Link>
        </Button>
        <Button asChild className="w-full text-white bg-amber-400 rounded-2xl hover:bg-amber-300">
          <Link href="/auth/signup">Sign Up</Link>
        </Button>
      </div>
    </div>
  );
}
