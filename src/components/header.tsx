import Link from "next/link";

const imgLogo11 =
  "http://localhost:3845/assets/259ff4a42aa761a3b2dd596cd6e3a8274e8247ce.png";

export const Logo = () => {
  return (
    <div className="relative size-full">
      <div
        className="absolute bg-center bg-cover bg-no-repeat inset-0"
        style={{ backgroundImage: `url('${imgLogo11}')` }}
      />
    </div>
  );
};

export const Header = () => {
  return (
    <div className="bg-neutral-50 box-border flex flex-row items-center justify-between px-2 py-0 w-full">
      <div className="flex flex-row gap-4 items-center justify-start">
        <div className="flex flex-row gap-4 items-center justify-start px-2 py-0">
          <Link href="/" className="h-16 w-[87px]">
            <Logo />
          </Link>
        </div>
        <div className="flex flex-row gap-2 items-center justify-center p-2">
          <Link
            href="/ai-career"
            className="font-bold text-[20px] text-blue-800 whitespace-nowrap hover:text-blue-600 transition-colors"
          >
            AI커리어설계
          </Link>
        </div>
        <div className="flex flex-row gap-2 items-center justify-center p-2">
          <Link
            href="/explore"
            className="font-bold text-[20px] text-blue-800 whitespace-nowrap hover:text-blue-600 transition-colors"
          >
            둘러보기
          </Link>
        </div>
      </div>
      <div className="flex flex-row items-center justify-between gap-4">
        <Link href="/login">
          <button className="bg-blue-800 text-white font-bold text-[20px] px-4 py-2 rounded-[10px] hover:bg-blue-700 transition-colors">
            로그인
          </button>
        </Link>
        <Link href="/register">
          <button className="bg-gray-800 text-white font-bold text-[20px] px-4 py-2 rounded-[10px] hover:bg-gray-700 transition-colors">
            회원가입
          </button>
        </Link>
      </div>
    </div>
  );
};
