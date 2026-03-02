import React, { useRef, useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ chartData,  years, selectedYear, setSelectedYear  }) => {
  const chartRef = useRef(null);
  const [gradient, setGradient] = useState(null);

  useEffect(() => {
    if (chartRef.current) {
      const chart = chartRef.current;
      const ctx = chart.ctx;
      const gradientFill = ctx.createLinearGradient(0, 0, 0, 300);
      gradientFill.addColorStop(0, "#0071BC"); 
      gradientFill.addColorStop(1, "rgba(0, 113, 188, 0.1)"); 
      setGradient(gradientFill);
    }
  }, []);

  return (
    <div className=" w-[720px] bg-white p-5 shadow-md border border-gray-300 rounded-lg h-[380px] relative">
    <div className="flex flex-row justify-between">
    <h2 className="text-center text-lg font-bold mb-4 text-gray-900">
        Monthly Document Summary
      </h2>
      <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="p-2 border-gray-200 border rounded"
        >
          <option value="">Select Year</option>
          {years.map((year, index) => (
            <option key={index} value={year}>
              {year}
            </option>
          ))}
        </select>
    </div>

      <Bar
        ref={chartRef}
        data={{
          ...chartData,
          datasets: chartData.datasets.map((dataset) => ({
            ...dataset,
            backgroundColor:
              dataset.label === "Outgoing"
                ? "#0071BC"
                : dataset.label === "Incoming"
                ? "#4F4F4F"
                : gradient || "#A0A0A0",
            borderColor: "rgba(0, 0, 0, 0.2)",
            borderWidth: 2,
            borderRadius: 6,
          })),
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: "Months",
                color: "#333",
                font: { weight: "bold" },
              },
              grid: { display: false },
            },
            y: {
              title: {
                display: true,
                text: "Document Count",
                color: "#333",
                font: { weight: "bold" },
              },
              beginAtZero: true,
            },
          },
          plugins: {
            legend: {
              labels: {
                color: "#333",
                font: { size: 12, weight: "bold" },
              },
            },
          },
        }}
        className="w-full h-full"
      />
    </div>
  );
};

export default BarChart;
