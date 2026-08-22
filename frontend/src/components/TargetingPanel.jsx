import { useEffect, useState } from "react";

import {
    getTargetingRules,
    createTargetingRule,
    updateTargetingRule,
    deleteTargetingRule,
} from "../services/api";


function TargetingPanel({ flag, onClose }) {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        rule_priority: 1,
        attribute: "user_id",
        operator: "=",
        target_value: "",
        percentage: 50,
        enabled: true,
    });


    useEffect(() => {
        loadRules();
    }, [flag.id]);


    const loadRules = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getTargetingRules();

            const flagRules = data
                .filter(
                    (rule) => rule.flag_id === flag.id
                )
                .sort(
                    (a, b) =>
                        a.rule_priority -
                        b.rule_priority
                );

            setRules(flagRules);
        } catch (error) {
            console.error(error);

            setError(
                "Unable to load targeting rules."
            );
        } finally {
            setLoading(false);
        }
    };


    const handleChange = (event) => {
        const {
            name,
            value,
            type,
            checked,
        } = event.target;

        setFormData((current) => ({
            ...current,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };


    const handlePercentageChange = (event) => {
        const value = Number(event.target.value);

        setFormData((current) => ({
            ...current,
            percentage: value,
            target_value: String(value),
        }));
    };


    const handleCreate = async (event) => {
        event.preventDefault();

        try {
            setError("");

            if (
                formData.attribute ===
                "percentage"
            ) {
                const percentage = Number(
                    formData.percentage
                );

                if (
                    percentage < 0 ||
                    percentage > 100
                ) {
                    setError(
                        "Percentage must be between 0 and 100."
                    );

                    return;
                }
            }


            const targetValue =
                formData.attribute ===
                "percentage"
                    ? String(formData.percentage)
                    : formData.target_value;


            if (
                formData.attribute !==
                    "percentage" &&
                !targetValue.trim()
            ) {
                setError(
                    "Target value is required."
                );

                return;
            }


            const payload = {
                flag_id: flag.id,

                rule_priority: Number(
                    formData.rule_priority
                ),

                attribute: formData.attribute,

                operator: formData.operator,

                target_value: targetValue,

                percentage:
                    formData.attribute ===
                    "percentage"
                        ? Number(
                              formData.percentage
                          )
                        : null,

                enabled: formData.enabled,
            };


            const createdRule =
                await createTargetingRule(
                    payload
                );


            setRules((current) =>
                [
                    ...current,
                    createdRule,
                ].sort(
                    (a, b) =>
                        a.rule_priority -
                        b.rule_priority
                )
            );


            setFormData({
                rule_priority: 1,
                attribute: "user_id",
                operator: "=",
                target_value: "",
                percentage: 50,
                enabled: true,
            });


            setShowForm(false);

        } catch (error) {
            console.error(error);

            setError(
                error?.response?.data?.detail ||
                "Unable to create targeting rule."
            );
        }
    };


    const handleToggle = async (rule) => {
        try {
            setError("");

            const updatedRule =
                await updateTargetingRule(
                    rule.id,
                    {
                        rule_priority:
                            rule.rule_priority,

                        attribute:
                            rule.attribute,

                        operator:
                            rule.operator,

                        target_value:
                            rule.target_value,

                        percentage:
                            rule.percentage,

                        enabled:
                            !rule.enabled,
                    }
                );


            setRules((current) =>
                current.map(
                    (currentRule) =>
                        currentRule.id ===
                        rule.id
                            ? updatedRule
                            : currentRule
                )
            );

        } catch (error) {
            console.error(error);

            setError(
                "Unable to update targeting rule."
            );
        }
    };


    const handleDelete = async (ruleId) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to delete this targeting rule?"
            );

        if (!confirmed) {
            return;
        }


        try {
            setError("");

            await deleteTargetingRule(
                ruleId
            );

            setRules((current) =>
                current.filter(
                    (rule) =>
                        rule.id !== ruleId
                )
            );

        } catch (error) {
            console.error(error);

            setError(
                "Unable to delete targeting rule."
            );
        }
    };


    return (
        <section className="targeting-panel">

            <div className="targeting-header">

                <div>
                    <h2>
                        Targeting Rules
                    </h2>

                    <p>
                        Configure targeting for{" "}
                        <strong>
                            {flag.flag_name}
                        </strong>{" "}
                        ({flag.flag_key})
                    </p>
                </div>


                <button
                    className="close-button"
                    onClick={onClose}
                >
                    Close
                </button>

            </div>


            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}


            {loading ? (
                <p>
                    Loading targeting rules...
                </p>
            ) : (
                <>
                    {rules.length === 0 ? (
                        <div className="empty-state">
                            No targeting rules
                            configured for this
                            flag.
                        </div>
                    ) : (
                        <div className="rules-list">

                            {rules.map(
                                (rule) => (
                                    <div
                                        className="rule-card"
                                        key={rule.id}
                                    >

                                        <div className="rule-details">

                                            <span>
                                                Priority:{" "}
                                                {
                                                    rule.rule_priority
                                                }
                                            </span>


                                            <span>
                                                Attribute:{" "}
                                                {
                                                    rule.attribute
                                                }
                                            </span>


                                            <span>
                                                Operator:{" "}
                                                {
                                                    rule.operator
                                                }
                                            </span>


                                            {rule.attribute ===
                                            "percentage" ? (
                                                <span>
                                                    Rollout:{" "}
                                                    {
                                                        rule.percentage
                                                    }
                                                    %
                                                </span>
                                            ) : (
                                                <span>
                                                    Target:{" "}
                                                    {
                                                        rule.target_value
                                                    }
                                                </span>
                                            )}


                                            <span
                                                className={
                                                    rule.enabled
                                                        ? "status enabled"
                                                        : "status disabled"
                                                }
                                            >
                                                {rule.enabled
                                                    ? "Enabled"
                                                    : "Disabled"}
                                            </span>

                                        </div>


                                        <div className="rule-actions">

                                            <button
                                                className="toggle-button"
                                                onClick={() =>
                                                    handleToggle(
                                                        rule
                                                    )
                                                }
                                            >
                                                {rule.enabled
                                                    ? "Disable"
                                                    : "Enable"}
                                            </button>


                                            <button
                                                className="delete-button"
                                                onClick={() =>
                                                    handleDelete(
                                                        rule.id
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </div>
                                )
                            )}

                        </div>
                    )}


                    <button
                        className="add-rule-button"
                        onClick={() =>
                            setShowForm(
                                (current) =>
                                    !current
                            )
                        }
                    >
                        {showForm
                            ? "Cancel"
                            : "Add Targeting Rule"}
                    </button>


                    {showForm && (
                        <form
                            className="rule-form"
                            onSubmit={
                                handleCreate
                            }
                        >

                            <h3>
                                Create Targeting Rule
                            </h3>


                            <div className="form-grid">

                                <div>
                                    <label>
                                        Priority
                                    </label>

                                    <input
                                        type="number"
                                        name="rule_priority"
                                        min="1"
                                        value={
                                            formData.rule_priority
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />
                                </div>


                                <div>
                                    <label>
                                        Attribute
                                    </label>

                                    <select
                                        name="attribute"
                                        value={
                                            formData.attribute
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="user_id">
                                            User ID
                                        </option>

                                        <option value="group_name">
                                            Group Name
                                        </option>

                                        <option value="percentage">
                                            Percentage Rollout
                                        </option>

                                    </select>
                                </div>


                                <div>
                                    <label>
                                        Operator
                                    </label>

                                    <select
                                        name="operator"
                                        value={
                                            formData.operator
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="=">
                                            =
                                        </option>

                                        <option value="!=">
                                            !=
                                        </option>

                                    </select>
                                </div>


                                {formData.attribute !==
                                    "percentage" && (
                                    <div>
                                        <label>
                                            Target Value
                                        </label>

                                        <input
                                            type="text"
                                            name="target_value"
                                            value={
                                                formData.target_value
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder={
                                                formData.attribute ===
                                                "user_id"
                                                    ? "101"
                                                    : "internal_team"
                                            }
                                            required
                                        />
                                    </div>
                                )}

                            </div>


                            {formData.attribute ===
                                "percentage" && (
                                <div className="percentage-section">

                                    <div className="percentage-header">

                                        <label>
                                            Rollout Percentage
                                        </label>

                                        <strong>
                                            {
                                                formData.percentage
                                            }
                                            %
                                        </strong>

                                    </div>


                                    <input
                                        className="percentage-slider"
                                        type="range"
                                        name="percentage"
                                        min="0"
                                        max="100"
                                        step="1"
                                        value={
                                            formData.percentage
                                        }
                                        onChange={
                                            handlePercentageChange
                                        }
                                    />


                                    <div className="percentage-labels">

                                        <span>
                                            0%
                                        </span>

                                        <span>
                                            25%
                                        </span>

                                        <span>
                                            50%
                                        </span>

                                        <span>
                                            75%
                                        </span>

                                        <span>
                                            100%
                                        </span>

                                    </div>


                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        name="percentage"
                                        value={
                                            formData.percentage
                                        }
                                        onChange={
                                            handlePercentageChange
                                        }
                                    />

                                </div>
                            )}


                            <label className="checkbox-label">

                                <input
                                    type="checkbox"
                                    name="enabled"
                                    checked={
                                        formData.enabled
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                                Enable rule

                            </label>


                            <button
                                type="submit"
                                className="save-button"
                            >
                                Create Rule
                            </button>

                        </form>
                    )}

                </>
            )}

        </section>
    );
}


export default TargetingPanel;