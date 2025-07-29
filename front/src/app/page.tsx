import Image from "next/image";



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
      <button>Login</button>
      <button>Sign Up</button>
    </>
  );
}
