import React, { useState, useEffect } from "react";
import axios from "axios";
import DasboardLayout from "./dashboardLayout";
import AdminBG from "../../assets/bg2.jpg";
import "../../App.css";
import { FileInput, FileOutput, Files } from "lucide-react";
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
import moment from "moment";
import BarChart from "../../components/barChart";
import OverallChart from "../../components/overallChart";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `http://${window.location.hostname}:5000`;

const Dashboard = () => {
  const api = `${API_BASE_URL}/api/document/get-document`;
  const [documents, setDocuments] = useState([]);
  const [total, setTotal] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [topAgencies, setTopAgencies] = useState([]);
  const [overallChartData, setOverallChartData] = useState({
    labels: ["Incoming", "Outgoing"],
    datasets: [
      {
        label: "Total Documents",
        data: [0, 0],
        borderWidth: 1,
      },
    ],
  });

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Incoming Documents",
        data: [],
        backgroundColor: "blue",
        borderColor: "blue",
        borderWidth: 1,
      },
      {
        label: "Outgoing Documents",
        data: [],
      },
    ],
  });
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");

  const fetchDocument = async () => {
    try {
      const response = await axios.get(api);
      const allDocs = response.data;

      const uniqueYears = [
        ...new Set(allDocs.map((doc) => moment(doc.date).format("YYYY"))),
      ];

      setYears(uniqueYears);
      setDocuments(allDocs);

      const currentYear = moment().format("YYYY");
      setSelectedYear(currentYear);

      const agencyCounts = allDocs.reduce((acc, doc) => {
        acc[doc.agency] = (acc[doc.agency] || 0) + 1;
        return acc;
      }, {});
      const sortedAgencies = Object.entries(agencyCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      setTopAgencies(sortedAgencies);

      const totalIncoming = allDocs.filter(
        (doc) => doc.type === "incoming",
      ).length;
      const totalOutgoing = allDocs.filter(
        (doc) => doc.type === "outgoing",
      ).length;

      setOverallChartData({
        labels: ["Incoming", "Outgoing"],
        datasets: [
          {
            label: "Total Documents",
            data: [totalIncoming, totalOutgoing],
            backgroundColor: [
              "#4F4F4F", // Green for Incoming
              "#0071BC", // DOST Blue for Outgoing
            ],
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const filterDocumentsByYear = () => {
    if (!documents.length) return;

    const filteredDocs = documents.filter(
      (doc) => moment(doc.date).format("YYYY") === selectedYear,
    );

    const incomingDocs = filteredDocs.filter((doc) => doc.type === "incoming");
    const outgoingDocs = filteredDocs.filter((doc) => doc.type === "outgoing");

    setTotal(filteredDocs);
    setIncoming(incomingDocs);
    setOutgoing(outgoingDocs);

    const months = moment.monthsShort();
    const incomingCounts = months.map(
      (_, index) =>
        filteredDocs.filter(
          (doc) =>
            moment(doc.date).month() === index && doc.type === "incoming",
        ).length,
    );
    const outgoingCounts = months.map(
      (_, index) =>
        filteredDocs.filter(
          (doc) =>
            moment(doc.date).month() === index && doc.type === "outgoing",
        ).length,
    );

    setChartData({
      labels: months,
      datasets: [
        {
          label: "Incoming",
          data: incomingCounts,
          backgroundColor: "blue",
          borderColor: "blue",
          borderWidth: 1,
        },
        {
          label: "Outgoing",
          data: outgoingCounts,
          borderWidth: 1,
        },
      ],
    });
  };

  useEffect(() => {
    fetchDocument();
  }, []);

  useEffect(() => {
    filterDocumentsByYear();
  }, [documents, selectedYear]);

  return (
    <DasboardLayout>
      <div
        className="h-screen flex flex-col bg-cover bg-center relative overflow-hidden p-2"
        style={{ backgroundImage: `url(${AdminBG})` }}
      >
        <div className="absolute inset-0 bg-blue-950 opacity-85"></div>
        <h1 className="relative text-4xl font-bold text-white flex self-start p-4">
          Document Dashboard
        </h1>

        <div className="flex flex-row space-x-4 p-4">
          <div className="flex flex-col w-2/3 space-y-4">
            <div className="flex flex-row space-x-2 w-full">
              <div className="bg-blue-400 relative w-1/3 h-40 rounded-md">
                <p className="p-4 font-medium text-lg text-white flex flex-row items-center justify-between">
                  Incoming Documents
                  <FileInput />
                </p>
                <p className="text-center text-white font-medium text-4xl">
                  {incoming.length}
                </p>
              </div>

              <div className="bg-blue-500 relative w-1/3 h-40 rounded-md">
                <p className="p-4 font-medium text-lg text-white flex flex-row items-center justify-between">
                  Outgoing Documents
                  <FileOutput />
                </p>
                <p className="text-center text-white font-medium text-4xl">
                  {outgoing.length}
                </p>
              </div>

              <div className="bg-blue-600 relative w-1/3 h-40 rounded-md">
                <p className="p-4 font-medium text-lg text-white flex flex-row items-center justify-between">
                  Total Documents
                  <Files />
                </p>
                <p className="text-center text-white font-medium text-4xl">
                  {total.length}
                </p>
              </div>
            </div>

            <div className="flex flex-col">
              <BarChart
                chartData={chartData}
                years={years}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
              />
            </div>
          </div>

          <div className="w-1/2 space-y-4">
            <div className="rounded-md">
              <OverallChart overallChartData={overallChartData} />
            </div>

            <div className=" w-[490px] bg-white pb-6 pt-4 px-4 shadow-lg rounded-lg h-[290px] relative">
              <h2 className="text-2xl font-bold">Top Agency</h2>

              {topAgencies?.length > 0 ? (
                topAgencies.map(([agency, count], index) => (
                  <div key={index} className="bg-gray-100 p-2 my-2 rounded-md">
                    <h3 className="font-bold text-lg">{agency}</h3>
                    <p>Total Documents: {count}</p>
                  </div>
                ))
              ) : (
                <p>No agency data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DasboardLayout>
  );
};

export default Dashboard;
