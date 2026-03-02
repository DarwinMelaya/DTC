import React from "react";
import { Bar } from "react-chartjs-2";

const OverallChart = ({ overallChartData }) => {
  const modifiedData = {
    ...overallChartData,
    datasets: overallChartData.datasets.map((dataset) => ({
      ...dataset,

      borderColor: "rgba(0, 0, 0, 0.2)",
      borderWidth: 2,
      borderRadius: 6,
    })),
  };

  return (
    <div className="w-[490px] bg-white pb-6 pt-4 px-4 shadow-lg rounded-lg h-[250px] relative">
      <h2 className="text-center text-lg font-bold mb-4">Overall Document Summary</h2>
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
              },
              grid: {
                display: false,
              },
            },
            y: {
              title: {
                display: true,
                text: "Total Count",
              },
              beginAtZero: true,
            },
          },
        }}
        className="w-full h-full"
      />
    </div>
  );
};

export default OverallChart;
