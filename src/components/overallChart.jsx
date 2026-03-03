import React from "react";
import { Bar } from "react-chartjs-2";

const OverallChart = ({ overallChartData }) => {
  const modifiedData = {
    ...overallChartData,
    datasets: overallChartData.datasets.map((dataset) => ({
      ...dataset,

      borderColor: "rgba(15, 23, 42, 0.18)",
      borderWidth: 1.5,
      borderRadius: 6,
    })),
  };

  return (
    <div className="w-full h-[320px] sm:h-[360px] rounded-xl border border-slate-200/80 bg-white/95 px-5 pt-4 pb-5 shadow-sm flex flex-col">
      <div className="mb-3 shrink-0">
        <h2 className="text-lg font-semibold text-slate-900">
          Overall Document Summary
        </h2>
        <p className="text-xs text-slate-500">Totals by document type</p>
      </div>
      <div className="flex-1 min-h-0">
        <Bar
          data={modifiedData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                title: {
                  display: true,
                  text: "Document Type",
                  color: "#334155",
                  font: { weight: "bold" },
                },
                grid: {
                  display: false,
                },
                ticks: { color: "#334155" },
              },
              y: {
                title: {
                  display: true,
                  text: "Total Count",
                  color: "#334155",
                  font: { weight: "bold" },
                },
                beginAtZero: true,
                ticks: { precision: 0, color: "#334155" },
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
    </div>
  );
};

export default OverallChart;
