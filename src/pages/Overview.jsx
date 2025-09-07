import { VisitorTrendsChart } from "../components/VisitorsTrendChart";
import { GenderDonutChart } from "../components/GenderDonutChart";
import { Top5AddressesChart } from "../components/Top5AddressesChart ";
import SummaryMatrix from "../components/SummaryMatrix";
export const Overview = () => {
  return (
    <div className="w-full flex flex-col gap-4">
    
      <SummaryMatrix />

      <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-3 [&>div]:h-[250px] md:[&>div]:h-[300px]">
        <div className="md:col-span-2">
          <VisitorTrendsChart />
        </div>
        <div>
          <GenderDonutChart />
        </div>
        <div>
          <Top5AddressesChart />
        </div>
      </div>
    </div>
  );
};
