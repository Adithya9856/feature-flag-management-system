import { useEffect, useMemo, useState } from "react";

import {
    getEnvironments,
    getFlags,
    updateFlag,
} from "./services/api";

import TargetingPanel from "./components/TargetingPanel";
import EvaluationAnalytics from "./components/EvaluationAnalytics";
import AuditLogs from "./components/AuditLogs";
import CleanupCandidates from "./components/CleanupCandidates";

function App() {
    const [flags, setFlags] = useState([]);
    const [environments, setEnvironments] = useState([]);
    const [selectedEnvironment, setSelectedEnvironment] = useState("");
    const [selectedFlag, setSelectedFlag] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingFlagId, setUpdatingFlagId] = useState(null);


    useEffect(() => {
        loadData();
    }, []);


    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [flagsData, environmentsData] =
                await Promise.all([
                    getFlags(),
                    getEnvironments(),
                ]);

            setFlags(flagsData);
            setEnvironments(environmentsData);

            if (environmentsData.length > 0) {
                setSelectedEnvironment(
                    String(environmentsData[0].id)
                );
            }
        } catch (error) {
            console.error(error);

            setError(
                "Unable to load data from the FastAPI backend."
            );
        } finally {
            setLoading(false);
        }
    };


    const filteredFlags = useMemo(() => {
        if (!selectedEnvironment) {
            return [];
        }

        return flags.filter(
            (flag) =>
                String(flag.environment_id) ===
                String(selectedEnvironment)
        );
    }, [flags, selectedEnvironment]);


    const selectedEnvironmentName =
        environments.find(
            (environment) =>
                String(environment.id) ===
                String(selectedEnvironment)
        )?.name || "";


    const handleToggleFlag = async (flag) => {
        try {
            setUpdatingFlagId(flag.id);
            setError("");

            const updatedFlag = await updateFlag(
                flag.id,
                {
                    flag_name: flag.flag_name,
                    description: flag.description,
                    flag_type: flag.flag_type,
                    default_value: flag.default_value,
                    enabled: !flag.enabled,
                    owner_team: flag.owner_team,
                }
            );

            setFlags((currentFlags) =>
                currentFlags.map((currentFlag) =>
                    currentFlag.id === flag.id
                        ? updatedFlag
                        : currentFlag
                )
            );

            if (
                selectedFlag &&
                selectedFlag.id === flag.id
            ) {
                setSelectedFlag(updatedFlag);
            }
        } catch (error) {
            console.error(error);

            setError(
                "Unable to update the feature flag."
            );
        } finally {
            setUpdatingFlagId(null);
        }
    };


    if (loading) {
        return (
            <div className="app">
                <h1>
                    Feature Flag Management System
                </h1>

                <p>
                    Loading dashboard...
                </p>
            </div>
        );
    }


    return (
        <div className="app">

            <header className="dashboard-header">
                <div>
                    <h1>
                        Feature Flag Management System
                    </h1>

                    <p>
                        Manage feature flags across
                        deployment environments.
                    </p>
                </div>
            </header>


            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}


            <section className="environment-section">

                <label htmlFor="environment">
                    Environment
                </label>

                <select
                    id="environment"
                    value={selectedEnvironment}
                    onChange={(event) => {
                        setSelectedEnvironment(
                            event.target.value
                        );

                        setSelectedFlag(null);
                    }}
                >
                    {environments.map(
                        (environment) => (
                            <option
                                key={environment.id}
                                value={environment.id}
                            >
                                {environment.name}
                            </option>
                        )
                    )}
                </select>

            </section>


            <section className="dashboard-summary">

                <div className="summary-card">
                    <span>
                        Environment
                    </span>

                    <strong>
                        {selectedEnvironmentName}
                    </strong>
                </div>


                <div className="summary-card">
                    <span>
                        Total Flags
                    </span>

                    <strong>
                        {filteredFlags.length}
                    </strong>
                </div>


                <div className="summary-card">
                    <span>
                        Enabled
                    </span>

                    <strong>
                        {
                            filteredFlags.filter(
                                (flag) =>
                                    flag.enabled
                            ).length
                        }
                    </strong>
                </div>


                <div className="summary-card">
                    <span>
                        Disabled
                    </span>

                    <strong>
                        {
                            filteredFlags.filter(
                                (flag) =>
                                    !flag.enabled
                            ).length
                        }
                    </strong>
                </div>

            </section>


            <section className="flags-section">

                <div className="section-header">

                    <div>

                        <h2>
                            Feature Flags
                        </h2>

                        <p>
                            Flags for the{" "}
                            {selectedEnvironmentName}{" "}
                            environment.
                        </p>

                    </div>

                </div>


                {filteredFlags.length === 0 ? (

                    <div className="empty-state">
                        No feature flags found for
                        this environment.
                    </div>

                ) : (

                    <div className="table-container">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Flag Name
                                    </th>

                                    <th>
                                        Flag Key
                                    </th>

                                    <th>
                                        Type
                                    </th>

                                    <th>
                                        Default Value
                                    </th>

                                    <th>
                                        Owner Team
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredFlags.map(
                                    (flag) => (

                                        <tr
                                            key={flag.id}
                                        >

                                            <td>

                                                <strong>
                                                    {
                                                        flag.flag_name
                                                    }
                                                </strong>

                                                {flag.description && (
                                                    <small>
                                                        {
                                                            flag.description
                                                        }
                                                    </small>
                                                )}

                                            </td>


                                            <td>

                                                <code>
                                                    {
                                                        flag.flag_key
                                                    }
                                                </code>

                                            </td>


                                            <td>
                                                {
                                                    flag.flag_type
                                                }
                                            </td>


                                            <td>
                                                {
                                                    flag.default_value
                                                }
                                            </td>


                                            <td>
                                                {
                                                    flag.owner_team ||
                                                    "—"
                                                }
                                            </td>


                                            <td>

                                                <span
                                                    className={
                                                        flag.enabled
                                                            ? "status enabled"
                                                            : "status disabled"
                                                    }
                                                >
                                                    {
                                                        flag.enabled
                                                            ? "Enabled"
                                                            : "Disabled"
                                                    }
                                                </span>

                                            </td>


                                            <td>

                                                <div className="action-buttons">

                                                    <button
                                                        className="manage-button"
                                                        onClick={() =>
                                                            setSelectedFlag(
                                                                flag
                                                            )
                                                        }
                                                    >
                                                        Manage Rules
                                                    </button>


                                                    <button
                                                        className={
                                                            flag.enabled
                                                                ? "toggle-button disable-button"
                                                                : "toggle-button enable-button"
                                                        }
                                                        disabled={
                                                            updatingFlagId ===
                                                            flag.id
                                                        }
                                                        onClick={() =>
                                                            handleToggleFlag(
                                                                flag
                                                            )
                                                        }
                                                    >
                                                        {
                                                            updatingFlagId ===
                                                            flag.id
                                                                ? "Updating..."
                                                                : flag.enabled
                                                                  ? "Disable"
                                                                  : "Enable"
                                                        }
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>


            {selectedFlag && (

                <TargetingPanel
                    flag={selectedFlag}
                    onClose={() =>
                        setSelectedFlag(null)
                    }
                />

            )}
<EvaluationAnalytics />

<AuditLogs />

<CleanupCandidates />
        </div>
    );
}


export default App;