import { MdSearch } from "react-icons/md";

const Search = ({ placeholder }) => {
  return (
    <div className="flex items-center gap-2 bg-lightOlive p-2 rounded-lg w-max">
      <MdSearch />
      <input
        type="text"
        placeholder={placeholder}
        className="bg-transparent border-none outline-none"
      />
    </div>
  );
};

export default Search;
