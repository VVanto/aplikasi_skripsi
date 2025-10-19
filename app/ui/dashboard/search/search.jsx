"use client";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

import { MdSearch } from "react-icons/md";

const Search = ({ placeholder }) => {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathName = usePathname();

  const handleSearch = (e) => {
    const params = new URLSearchParams(searchParams);

    if (e.target.value) {
      params.set("q", e.target.value);
    } else {
      params.delete("q");
    }

    replace(`${pathName}?${params}`);
  };

  return (
    <div className="flex items-center gap-2 bg-lightOlive p-2 rounded-lg w-max">
      <MdSearch />
      <input
        type="text"
        placeholder={placeholder}
        className="bg-transparent border-none outline-none"
        onChange={handleSearch}
      />
    </div>
  );
};

export default Search;
