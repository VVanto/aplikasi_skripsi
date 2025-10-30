import ForecastStockCard from "../ui/dashboard/card/ForecastStockCard";
import MonthlySalesCard from "../ui/dashboard/card/monthlyCard";
import TopProductCard from "../ui/dashboard/card/topCard";
import Chart from "../ui/dashboard/chart/chart";
import RightBar from "../ui/dashboard/rightBar/rightBar";
import Transaction from "./transaction/page";

const DashboardPage = () => {
  return (
    <div className="flex gap-5 mt-5">
      <div className="flex flex-[3] flex-col gap-5">
        <div className="flex gap-5 content-between">
          <TopProductCard />
          <MonthlySalesCard />
          <ForecastStockCard/>
        </div>
        <Chart />
      </div>
      <div className="flex-1">
        <RightBar />
      </div>
    </div>
  );
};

export default DashboardPage;
