import Card from "../ui/dashboard/card/card";
import Chart from "../ui/dashboard/chart/chart";
import RightBar from "../ui/dashboard/rightBar/rightBar";
import Transaction from "./transaction/page";

const DashboardPage = () => {
  return (
    <div className="flex gap-5 mt-5">
      <div className="flex flex-[3] flex-col gap-5">
        <div className="flex gap-5 content-between">
          <Card />
          <Card />
          <Card />
        </div>
        <Transaction />
        <Chart />
      </div>
      <div className="flex-1">
        <RightBar />
      </div>
    </div>
  );
};

export default DashboardPage;
