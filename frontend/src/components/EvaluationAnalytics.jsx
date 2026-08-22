import { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import { getEvaluationAnalytics } from "../services/api";


function EvaluationAnalytics() {
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getEvaluationAnalytics();

            setAnalytics(data);
        } catch (err) {
            console.error("Failed to load evaluation analytics:", err);

            setError(
                "Unable to load evaluation analytics."
            );
        } finally {
            setLoading(false);
        }
    };

    const chartData = analytics.map((item) => ({
        name: item.flag_key,
        environment: item.environment_name,
        evaluations: item.evaluation_count,
        hour: new Date(
            item.evaluation_hour
        ).toLocaleString(),
    }));

    return (
        <section className="analytics-panel">
            <div className="analytics-header">
                <div>
                    <h2>Evaluation Analytics</h2>

                    <p>
                        Feature flag evaluation activity
                        by environment and flag.
                    </p>
                </div>

                <button
                    className="refresh-button"
                    onClick={loadAnalytics}
                >
                    Refresh
                </button>
            </div>

            {loading && (
                <p className="analytics-message">
                    Loading analytics...
                </p>
            )}

            {error && (
                <p className="analytics-error">
                    {error}
                </p>
            )}

            {!loading &&
                !error &&
                analytics.length === 0 && (
                    <p className="analytics-message">
                        No evaluation analytics available.
                    </p>
                )}

            {!loading &&
                !error &&
                analytics.length > 0 && (
                    <>
                        <div className="analytics-chart">
                            <ResponsiveContainer
                                width="100%"
                                height={350}
                            >
                                <BarChart
                                    data={chartData}
                                    margin={{
                                        top: 20,
                                        right: 30,
                                        left: 10,
                                        bottom: 20,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                    />

                                    <XAxis
                                        dataKey="name"
                                    />

                                    <YAxis
                                        allowDecimals={false}
                                    />

                                    <Tooltip
                                        formatter={(
                                            value
                                        ) => [
                                            value,
                                            "Evaluations",
                                        ]}
                                        labelFormatter={(
                                            label,
                                            payload
                                        ) => {
                                            if (
                                                payload &&
                                                payload.length
                                            ) {
                                                const item =
                                                    payload[0]
                                                        .payload;

                                                return `${label} (${item.environment})`;
                                            }

                                            return label;
                                        }}
                                    />

                                    <Bar
                                        dataKey="evaluations"
                                        name="Evaluations"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="analytics-table">
                            <h3>Evaluation Details</h3>

                            <div className="analytics-table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Flag</th>
                                            <th>Environment</th>
                                            <th>Hour</th>
                                            <th>Evaluations</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {analytics.map(
                                            (item) => (
                                                <tr
                                                    key={
                                                        item.id
                                                    }
                                                >
                                                    <td>
                                                        {
                                                            item.flag_key
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            item.environment_name
                                                        }
                                                    </td>

                                                    <td>
                                                        {new Date(
                                                            item.evaluation_hour
                                                        ).toLocaleString()}
                                                    </td>

                                                    <td>
                                                        {
                                                            item.evaluation_count
                                                        }
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
        </section>
    );
}

export default EvaluationAnalytics;