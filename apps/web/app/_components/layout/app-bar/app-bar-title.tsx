"use client";

import Image from "next/image";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { hasKey } from "~/_utils/object";

const segmentToTitleMap = {
  profile: "Profile",
  music: "Music",
};

export const AppBarTitle = () => {
  const segment = useSelectedLayoutSegment();
  const title = hasKey(segmentToTitleMap, segment)
    ? segmentToTitleMap[segment]
    : "Home";

  return (
    <div className="flex items-center">
      <Link href="/">
        <Image src="/favicon.png" alt="Logo" width={24} height={24} />
      </Link>
      <span className="ml-4 text-lg">{title}</span>
    </div>
  );
};
