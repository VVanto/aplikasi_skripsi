"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { MdSearch } from "react-icons/md";
import { useDebouncedCallback } from "use-debounce";

const Search = ({ placeholder }) => {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();

  const handleSearch = useDebouncedCallback((e) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams);

    // Reset ke halaman 1
    params.set("page", "1");

    if (value) {
      if (value.length > 2) {
        params.set("q", value);
      }
    } else {
      params.delete("q");
    }

    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="flex items-center gap-2 bg-lightOlive p-2 rounded-lg w-max min-w-[200px]">
      <MdSearch className="text-cream" />
      <input
        type="text"
        placeholder={placeholder}
        className="bg-transparent border-none outline-none text-cream placeholder-cream/60 w-full"
        onChange={handleSearch}
        defaultValue={searchParams.get("q") || ""}
      />
    </div>
  );
};

export default Search;