import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import React, { useEffect, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const BarChart = ({ chartData, years, selectedYear, setSelectedYear }) => {
  const chartRef = useRef(null);
  const [gradient, setGradient] = useState(null);

  useEffect(() => {
    if (chartRef.current) {
      const chart = chartRef.current;
      const ctx = chart.ctx;
      const gradientFill = ctx.createLinearGradient(0, 0, 0, 300);
      gradientFill.addColorStop(0, "#0071BC");
      gradientFill.addColorStop(1, "rgba(0, 113, 188, 0.08)");
      setGradient(gradientFill);
    }
  }, []);

  return (
    <div className="w-full rounded-xl border border-slate-200/80 bg-white/95 p-5 shadow-sm h-[360px] sm:h-[380px]">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Monthly Document Summary
          </h2>
          <p className="text-xs text-slate-500">
            Incoming, Outgoing, and Incoming from RO per month
          </p>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="h-10 w-full sm:w-44 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
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
                  : dataset.label === "Incoming RO"
                    ? "#16A34A"
                    : gradient || "#A0A0A0",
            borderColor: "rgba(15, 23, 42, 0.18)",
            borderWidth: 1.5,
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
                color: "#334155",
                font: { weight: "bold" },
              },
              grid: { display: false },
            },
            y: {
              title: {
                display: true,
                text: "Document Count",
                color: "#334155",
                font: { weight: "bold" },
              },
              beginAtZero: true,
              ticks: { precision: 0 },
              grid: { color: "rgba(15, 23, 42, 0.06)" },
            },
          },
          plugins: {
            legend: {
              labels: {
                color: "#334155",
                font: { size: 12, weight: "bold" },
              },
            },
            tooltip: {
              backgroundColor: "rgba(15, 23, 42, 0.9)",
              titleColor: "#F8FAFC",
              bodyColor: "#F8FAFC",
              borderColor: "rgba(148, 163, 184, 0.3)",
              borderWidth: 1,
            },
          },
        }}
        className="w-full h-full"
      />
    </div>
  );
};

export default BarChart;
