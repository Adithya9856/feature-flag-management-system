import { useEffect, useMemo, useState } from "react";

import { getAuditLogs } from "../services/api";


function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [actionFilter, setActionFilter] =
        useState("ALL");

    const [tableFilter, setTableFilter] =
        useState("ALL");

    const [actorFilter, setActorFilter] =
        useState("ALL");

    const [flagFilter, setFlagFilter] =
        useState("ALL");


    useEffect(() => {
        loadAuditLogs();
    }, []);


    const loadAuditLogs = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAuditLogs();

            setLogs(data);
        } catch (err) {
            console.error(
                "Failed to load audit logs:",
                err
            );

            setError(
                "Unable to load audit logs."
            );
        } finally {
            setLoading(false);
        }
    };


    const actions = useMemo(() => {
        return [
            "ALL",
            ...new Set(
                logs.map(
                    (log) => log.action
                )
            ),
        ];
    }, [logs]);


    const tables = useMemo(() => {
        return [
            "ALL",
            ...new Set(
                logs.map(
                    (log) => log.table_name
                )
            ),
        ];
    }, [logs]);


    const actors = useMemo(() => {
        return [
            "ALL",
            ...new Set(
                logs
                    .map(
                        (log) => log.actor
                    )
                    .filter(Boolean)
            ),
        ];
    }, [logs]);


    const flags = useMemo(() => {
        return [
            "ALL",
            ...new Set(
                logs
                    .map(
                        (log) => log.flag_key
                    )
                    .filter(Boolean)
            ),
        ];
    }, [logs]);


    const filteredLogs = useMemo(() => {
        return logs.filter((log) => {

            const actionMatches =
                actionFilter === "ALL" ||
                log.action === actionFilter;


            const tableMatches =
                tableFilter === "ALL" ||
                log.table_name === tableFilter;


            const actorMatches =
                actorFilter === "ALL" ||
                log.actor === actorFilter;


            const flagMatches =
                flagFilter === "ALL" ||
                log.flag_key === flagFilter;


            return (
                actionMatches &&
                tableMatches &&
                actorMatches &&
                flagMatches
            );
        });
    }, [
        logs,
        actionFilter,
        tableFilter,
        actorFilter,
        flagFilter,
    ]);


    const formatDate = (timestamp) => {
        return new Date(
            timestamp
        ).toLocaleString();
    };


    const formatJson = (value) => {
        if (!value) {
            return null;
        }

        try {
            const parsed =
                typeof value === "string"
                    ? JSON.parse(value)
                    : value;

            return JSON.stringify(
                parsed,
                null,
                2
            );
        } catch {
            return String(value);
        }
    };


    return (
        <section className="audit-panel">

            <div className="audit-header">

                <div>
                    <h2>
                        Audit Logs
                    </h2>

                    <p>
                        Track changes made to
                        feature flags and
                        targeting rules.
                    </p>
                </div>


                <button
                    className="refresh-button"
                    onClick={loadAuditLogs}
                >
                    Refresh
                </button>

            </div>


            <div className="audit-filters">

                {/* Action */}

                <div>
                    <label>
                        Action
                    </label>

                    <select
                        value={actionFilter}
                        onChange={(event) =>
                            setActionFilter(
                                event.target.value
                            )
                        }
                    >
                        {actions.map(
                            (action) => (
                                <option
                                    key={action}
                                    value={action}
                                >
                                    {action ===
                                    "ALL"
                                        ? "All Actions"
                                        : action}
                                </option>
                            )
                        )}
                    </select>
                </div>


                {/* Table */}

                <div>
                    <label>
                        Table
                    </label>

                    <select
                        value={tableFilter}
                        onChange={(event) =>
                            setTableFilter(
                                event.target.value
                            )
                        }
                    >
                        {tables.map(
                            (table) => (
                                <option
                                    key={table}
                                    value={table}
                                >
                                    {table ===
                                    "ALL"
                                        ? "All Tables"
                                        : table}
                                </option>
                            )
                        )}
                    </select>
                </div>


                {/* Actor */}

                <div>
                    <label>
                        Actor
                    </label>

                    <select
                        value={actorFilter}
                        onChange={(event) =>
                            setActorFilter(
                                event.target.value
                            )
                        }
                    >
                        {actors.map(
                            (actor) => (
                                <option
                                    key={actor}
                                    value={actor}
                                >
                                    {actor ===
                                    "ALL"
                                        ? "All Actors"
                                        : actor}
                                </option>
                            )
                        )}
                    </select>
                </div>


                {/* Flag */}

                <div>
                    <label>
                        Flag
                    </label>

                    <select
                        value={flagFilter}
                        onChange={(event) =>
                            setFlagFilter(
                                event.target.value
                            )
                        }
                    >
                        {flags.map(
                            (flag) => (
                                <option
                                    key={flag}
                                    value={flag}
                                >
                                    {flag ===
                                    "ALL"
                                        ? "All Flags"
                                        : flag}
                                </option>
                            )
                        )}
                    </select>
                </div>

            </div>


            {loading && (
                <p className="audit-message">
                    Loading audit logs...
                </p>
            )}


            {error && (
                <p className="audit-error">
                    {error}
                </p>
            )}


            {!loading &&
                !error &&
                filteredLogs.length === 0 && (
                    <p className="audit-message">
                        No audit logs found.
                    </p>
                )}


            {!loading &&
                !error &&
                filteredLogs.length > 0 && (
                    <div className="audit-table-wrapper">

                        <table className="audit-table">

                            <thead>

                                <tr>

                                    <th>
                                        Timestamp
                                    </th>

                                    <th>
                                        Actor
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                    <th>
                                        Flag
                                    </th>

                                    <th>
                                        Environment
                                    </th>

                                    <th>
                                        Table
                                    </th>

                                    <th>
                                        Record ID
                                    </th>

                                    <th>
                                        Changes
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredLogs.map(
                                    (log) => (
                                        <tr
                                            key={
                                                log.id
                                            }
                                        >

                                            <td>
                                                {formatDate(
                                                    log.timestamp
                                                )}
                                            </td>


                                            <td>
                                                {
                                                    log.actor
                                                }
                                            </td>


                                            <td>

                                                <span
                                                    className={`audit-action audit-action-${log.action.toLowerCase()}`}
                                                >
                                                    {
                                                        log.action
                                                    }
                                                </span>

                                            </td>


                                            <td>
                                                {
                                                    log.flag_key ||
                                                    "Unknown"
                                                }
                                            </td>


                                            <td>
                                                {
                                                    log.environment ||
                                                    "Unknown"
                                                }
                                            </td>


                                            <td>
                                                {
                                                    log.table_name
                                                }
                                            </td>


                                            <td>
                                                {
                                                    log.record_id
                                                }
                                            </td>


                                            <td>

                                                <details>

                                                    <summary>
                                                        View changes
                                                    </summary>


                                                    <div className="audit-change-section">

                                                        <strong>
                                                            Previous Data
                                                        </strong>

                                                        <pre>
                                                            {formatJson(
                                                                log.previous_data
                                                            ) ||
                                                                "None"}
                                                        </pre>

                                                    </div>


                                                    <div className="audit-change-section">

                                                        <strong>
                                                            New Data
                                                        </strong>

                                                        <pre>
                                                            {formatJson(
                                                                log.new_data
                                                            ) ||
                                                                "None"}
                                                        </pre>

                                                    </div>

                                                </details>

                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

        </section>
    );
}


export default AuditLogs;