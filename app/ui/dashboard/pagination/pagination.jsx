const Pagination = () => {
  return (
    <div className="flex p-3 justify-end gap-3">
      <button className="py-1 px-3 rounded-lg cursor-pointer bg-lightOlive disabled:bg-gray-700 disabled:text-gray-500">
        Sebelum
      </button>
      <button className="py-1 px-3 rounded-lg cursor-pointer bg-lightOlive disabled:bg-gray-700 disabled:text-gray-500">
        Sesudah
      </button>
    </div>
  );
};

export default Pagination;
