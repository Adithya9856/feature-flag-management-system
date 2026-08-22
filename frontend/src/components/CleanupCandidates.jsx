import { useState } from "react";

import { getCleanupCandidates } from "../services/api";


function CleanupCandidates() {
    const [days, setDays] = useState(30);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searched, setSearched] = useState(false);


    const handleSearch = async () => {
        try {
            setLoading(true);
            setError("");
            setSearched(false);

            const data =
                await getCleanupCandidates(days);

            setCandidates(
                data.candidates || []
            );

            setSearched(true);
        } catch (err) {
            console.error(
                "Failed to load cleanup candidates:",
                err
            );

            setError(
                err?.response?.data?.detail ||
                "Unable to load cleanup candidates."
            );
        } finally {
            setLoading(false);
        }
    };


    return (
        <section className="cleanup-panel">

            <div className="cleanup-header">

                <div>
                    <h2>
                        Cleanup Candidates
                    </h2>

                    <p>
                        Find feature flags that may
                        no longer be actively used.
                    </p>
                </div>

            </div>


            <div className="cleanup-controls">

                <div>
                    <label htmlFor="cleanup-days">
                        Days
                    </label>

                    <input
                        id="cleanup-days"
                        type="number"
                        min="1"
                        value={days}
                        onChange={(event) =>
                            setDays(
                                Number(
                                    event.target
                                        .value
                                )
                            )
                        }
                    />
                </div>


                <button
                    className="cleanup-search-button"
                    onClick={handleSearch}
                    disabled={
                        loading || days < 1
                    }
                >
                    {loading
                        ? "Checking..."
                        : "Find Candidates"}
                </button>

            </div>


            {error && (
                <div className="cleanup-error">
                    {error}
                </div>
            )}


            {searched && !loading && (
                <>
                    <div className="cleanup-summary">

                        <strong>
                            {candidates.length}
                        </strong>

                        <span>
                            candidate
                            {candidates.length !== 1
                                ? "s"
                                : ""}{" "}
                            found
                        </span>

                    </div>


                    {candidates.length === 0 ? (
                        <div className="cleanup-empty">

                            <h3>
                                No cleanup candidates
                            </h3>

                            <p>
                                No potentially unused
                                feature flags were found
                                for the selected period.
                            </p>

                        </div>
                    ) : (
                        <div className="cleanup-table-wrapper">

                            <table className="cleanup-table">

                                <thead>
                                    <tr>
                                        <th>
                                            Flag
                                        </th>

                                        <th>
                                            Environment
                                        </th>

                                        <th>
                                            Last Evaluation
                                        </th>

                                        <th>
                                            Evaluation Count
                                        </th>
                                    </tr>
                                </thead>


                                <tbody>

                                    {candidates.map(
                                        (
                                            candidate,
                                            index
                                        ) => (
                                            <tr
                                                key={
                                                    candidate.id ||
                                                    `${candidate.flag_key}-${candidate.environment_name}-${index}`
                                                }
                                            >

                                                <td>
                                                    {
                                                        candidate.flag_key
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        candidate.environment_name
                                                    }
                                                </td>

                                                <td>
                                                    {candidate.last_evaluation
                                                        ? new Date(
                                                              candidate.last_evaluation
                                                          ).toLocaleString()
                                                        : "Never"}
                                                </td>

                                                <td>
                                                    {
                                                        candidate.evaluation_count
                                                    }
                                                </td>

                                            </tr>
                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>
                    )}

                </>
            )}

        </section>
    );
}


export default CleanupCandidates;