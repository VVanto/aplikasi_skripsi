import { MdSupervisedUserCircle } from "react-icons/md";

const Card = () => {
  return (
    <div className="bg-olive p-5 rounded-lg flex gap-5 cursor-pointer hover:bg-lightOlive">
      <MdSupervisedUserCircle size={48} />
      <div className="flex flex-col gap-3">
        <span className="">Total Users</span>
        <span className="text-2xl font-medium">2.610</span>
        <span className="text-base font-light">
          <span className="text-green-500">12% </span>lebih banyak dari minggu
          sebelumnya
        </span>
      </div>
    </div>
  );
};

export default Card;
