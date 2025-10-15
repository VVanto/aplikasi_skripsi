"use client";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  {
    name: "Senin",
    visit: 400,
    click: 320,
  },
  {
    name: "Selasa",
    visit: 245,
    click: 452,
  },
  {
    name: "Rabu",
    visit: 563,
    click: 764,
  },
  {
    name: "Kamis",
    visit: 343,
    click: 534,
  },
  {
    name: "Jumat",
    visit: 243,
    click: 523,
  },
  {
    name: "Sabtu",
    visit: 325,
    click: 213,
  },
  {
    name: "Minggu",
    visit: 245,
    click: 321,
  },
];

const Chart = () => {
  return (
    <div className="h-[450] bg-olive text-cream rounded-lg p-5">
      <h2 className="mb-5">Recap minggu ini</h2>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip contentStyle={{background:"#000", border:"none"}}/>
          <Legend />
          <Line
            type="monotone"
            dataKey="visit"
            stroke="	#ed2788"
            activeDot={{ r: 8 }}
          />
          <Line type="monotone" dataKey="click" stroke="#006bff" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
