import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";



export default function Home() {


  return (
    <>
      <h1 className="">TokoToko</h1>
      <p>ランダムなスポットを提案し、新しい発見を届ける</p>
      <Image
        src="/492.png"
        alt="都市の画像"
        width={600}
        height={400}
        priority
      />
      <Button asChild>
        <Link href="/login">Login</Link>
      </Button>
      <button>Sign Up</button>
    </>
  );
}
