import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";



export default function Home() {


  return (
    <>
      <h1 className="text-center">TokoToko</h1>
      <p className="text-center">ランダムなスポットを提案し、新しい発見を届ける</p>
      <Image
        src="/492.png"
        alt="都市の画像"
        width={600}
        height={400}
        priority
      />
      <Button asChild>
        <Link href="/auth/signin">Login</Link>
      </Button>
      <Button asChild>
        <Link href="/auth/signup">Sign Up</Link>
      </Button>
    </>
  );
}
