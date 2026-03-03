import axios from "axios";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { FileInput, FileOutput, Files } from "lucide-react";
import moment from "moment";
import React, { useEffect, useState } from "react";
import "../../App.css";
import AdminBG from "../../assets/bg2.jpg";
import BarChart from "../../components/barChart";
import OverallChart from "../../components/overallChart";
import DasboardLayout from "./dashboardLayout";

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
  const incomingRoApi = `${API_BASE_URL}/api/incoming-ro/get-document`;
  const [documents, setDocuments] = useState([]);
  const [total, setTotal] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [incomingRo, setIncomingRo] = useState([]);
  const [topAgencies, setTopAgencies] = useState([]);
  const [overallChartData, setOverallChartData] = useState({
    labels: ["Incoming", "Outgoing", "Incoming RO"],
    datasets: [
      {
        label: "Total Documents",
        data: [0, 0, 0],
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
      {
        label: "Incoming RO",
        data: [],
      },
    ],
  });
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");

  const fetchDocument = async () => {
    try {
      const [docsRes, incomingRoRes] = await Promise.all([
        axios.get(api),
        axios.get(incomingRoApi),
      ]);

      const allDocs = docsRes.data || [];
      const allIncomingRo = incomingRoRes.data || [];

      const uniqueYears = [
        ...new Set([
          ...allDocs.map((doc) => moment(doc.date).format("YYYY")),
          ...allIncomingRo.map((doc) =>
            moment(doc.dateReceived).format("YYYY"),
          ),
        ]),
      ].filter(Boolean);

      setYears(uniqueYears);
      setDocuments(allDocs);
      setIncomingRo(allIncomingRo);

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
      const totalIncomingRo = allIncomingRo.length;

      setOverallChartData({
        labels: ["Incoming", "Outgoing", "Incoming RO"],
        datasets: [
          {
            label: "Total Documents",
            data: [totalIncoming, totalOutgoing, totalIncomingRo],
            backgroundColor: [
              "#4F4F4F", // Green for Incoming
              "#0071BC", // DOST Blue for Outgoing
              "#16A34A", // Incoming RO
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
    const incomingRoFiltered = incomingRo.filter(
      (doc) => moment(doc.dateReceived).format("YYYY") === selectedYear,
    );
    const incomingRoCounts = months.map(
      (_, index) =>
        incomingRoFiltered.filter(
          (doc) => moment(doc.dateReceived).month() === index,
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
        {
          label: "Incoming RO",
          data: incomingRoCounts,
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
  }, [documents, incomingRo, selectedYear]);

  return (
    <DasboardLayout>
      <div
        className="min-h-full flex flex-col bg-cover bg-center relative p-2 sm:p-4"
        style={{ backgroundImage: `url(${AdminBG})` }}
      >
        <div className="absolute inset-0 bg-blue-950 opacity-85"></div>
        <div className="relative mx-auto w-full max-w-7xl px-1 sm:px-2">
          <div className="flex flex-col gap-1 px-3 pt-4 sm:px-4">
            <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white">
              Document Dashboard
            </h1>
            <p className="text-sm text-slate-200/80">
              Overview of monthly activity and totals
            </p>
          </div>

          <div className="relative flex flex-col gap-4 p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
              <div className="rounded-xl border border-white/10 bg-white/10 backdrop-blur-md shadow-sm">
                <div className="flex items-start justify-between p-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-200/80">
                      Incoming Documents
                    </p>
                    <p className="mt-2 text-4xl font-semibold text-white">
                      {incoming.length}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/10 p-2 text-white">
                    <FileInput />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/10 backdrop-blur-md shadow-sm">
                <div className="flex items-start justify-between p-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-200/80">
                      Outgoing Documents
                    </p>
                    <p className="mt-2 text-4xl font-semibold text-white">
                      {outgoing.length}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/10 p-2 text-white">
                    <FileOutput />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/10 backdrop-blur-md shadow-sm">
                <div className="flex items-start justify-between p-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-200/80">
                      Incoming from RO
                    </p>
                    <p className="mt-2 text-4xl font-semibold text-white">
                      {incomingRo.length}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/10 p-2 text-white">
                    <FileInput />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/10 backdrop-blur-md shadow-sm">
                <div className="flex items-start justify-between p-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-200/80">
                      Total Documents
                    </p>
                    <p className="mt-2 text-4xl font-semibold text-white">
                      {total.length}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/10 p-2 text-white">
                    <Files />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
              <div className="xl:col-span-2">
                <BarChart
                  chartData={chartData}
                  years={years}
                  selectedYear={selectedYear}
                  setSelectedYear={setSelectedYear}
                />
              </div>

              <div className="space-y-4">
                <OverallChart overallChartData={overallChartData} />

                <div className="w-full rounded-xl border border-slate-200/80 bg-white/95 p-5 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Top Agencies
                  </h2>
                  <p className="text-xs text-slate-500">
                    Top 3 agencies by document volume
                  </p>

                  <div className="mt-4 space-y-2">
                    {topAgencies?.length > 0 ? (
                      topAgencies.map(([agency, count], index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {agency}
                            </p>
                            <p className="text-xs text-slate-500">
                              Total documents
                            </p>
                          </div>
                          <div className="ml-3 rounded-md bg-white px-2 py-1 text-sm font-semibold text-slate-900 shadow-sm border border-slate-200">
                            {count}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="mt-4 text-sm text-slate-500">
                        No agency data available
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DasboardLayout>
  );
};

export default Dashboard;
