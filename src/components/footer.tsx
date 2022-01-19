import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-100">
      <div className="bg-gray-100 container mx-auto px-6 pt-10 pb-6">
        <p>© Copyright 2022 Prices.tf</p>
        <p className="text-xs">
          Powered by{' '}
          <Link href="https://steampowered.com">
            <a target="_blank" className="no-underline hover:underline">
              Steam
            </a>
          </Link>{' '}
          and{' '}
          <Link href="https://backpack.tf">
            <a target="_blank" className="no-underline hover:underline">
              backpack.tf
            </a>
          </Link>
          . Made by{' '}
          <Link href="https://steamcommunity.com/id/Nicklason">
            <a target="_blank" className="no-underline hover:underline">
              Nicklason
            </a>
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
