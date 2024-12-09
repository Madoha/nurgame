import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const XPProgressGraph = () => {
    const data = {
        labels: ["M", "Tu", "W", "Th", "F", "Sa", "Su"], // Days of the week
        datasets: [
            {
                label: "XP Progress",
                data: [0, 0, 0, 0, 0, 10, 20], // Your XP data points
                borderColor: "#ffd700",
                backgroundColor: "#ffd700",
                tension: 0.4, // Smooth curves
                pointBorderColor: "#ffd700",
                pointBackgroundColor: "#fff",
                pointRadius: 5,
                pointHoverRadius: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }, // Hides the label "XP Progress"
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 5 },
                max: 20, // Set maximum Y-axis value
            },
        },
    };

    return (
        <div style={{ height: "200px", width: "100%" }}>
            <Line data={data} options={options} />
        </div>
    );
};

export default XPProgressGraph;
