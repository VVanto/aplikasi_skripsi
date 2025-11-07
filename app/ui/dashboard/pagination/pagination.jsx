"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";

const Pagination = ({ count }) => {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathName = usePathname();

  const page = searchParams.get("page") || 1;
  const params = new URLSearchParams(searchParams);
  const ITEM_PER_PAGE = 10; // SESUAI LIMIT DI API

  const hasPrev = ITEM_PER_PAGE * (parseInt(page) - 1) > 0;
  const hasNext = ITEM_PER_PAGE * (parseInt(page) - 1) + ITEM_PER_PAGE < count;

  const handleChangePage = (type) => {
    type === "prev"
      ? params.set("page", parseInt(page) - 1)
      : params.set("page", parseInt(page) + 1);
    replace(`${pathName}?${params}`);
  };

  return (
    <div className="flex p-3 justify-end gap-3">
      <button
        onClick={() => handleChangePage("prev")}
        disabled={!hasPrev}
        className="py-1 px-3 rounded-lg cursor-pointer bg-lightOlive disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
      >
        Sebelum
      </button>
      <button
        onClick={() => handleChangePage("next")}
        disabled={!hasNext}
        className="py-1 px-3 rounded-lg cursor-pointer bg-lightOlive disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
      >
        Sesudah
      </button>
    </div>
  );
};

export default Pagination;