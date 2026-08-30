import { useEffect, useMemo, useState } from "react";
import {
  createEnvironment,
  createFlag,
  createTargetingRule,
  deleteEnvironment,
  deleteFlag,
  deleteTargetingRule,
  getAuditLogs,
  getEnvironments,
  getEvaluationAnalytics,
  getFlags,
  getTargetingRules,
  healthCheck,
  updateEnvironment,
  updateFlag,
  updateTargetingRule,
} from "./services/api";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

const nav = {
  manage: [
    ["overview", "⌂", "Overview"],
    ["flags", "⚑", "Flags"],
    ["environments", "▣", "Environments"],
    ["targeting", "⌘", "Targeting"],
  ],
  monitor: [
    ["analytics", "▥", "Analytics"],
    ["audit", "▤", "Audit Log"],
  ],
  resources: [
    ["docs", "▤", "Docs"],
    ["settings", "⚙", "Settings"],
  ],
};

const pageMeta = {
  overview: [
    "Overview",
    "Control feature releases, environments and rollout activity.",
  ],
  flags: [
    "Feature Flags",
    "Create, update and safely release features across environments.",
  ],
  environments: [
    "Environments",
    "Manage development, staging and production boundaries.",
  ],
  targeting: [
    "Targeting",
    "Configure user, group and percentage targeting rules.",
  ],
  analytics: [
    "Analytics",
    "View feature flag evaluation activity and usage.",
  ],
  audit: [
    "Audit Log",
    "Review changes made to flags and targeting rules.",
  ],
  docs: [
    "Documentation",
    "Project guides, API reference and implementation resources.",
  ],
  settings: [
    "Settings",
    "Configure dashboard preferences and inspect backend connectivity.",
  ],
};

function App() {
  const [authenticated, setAuthenticated] = useState(
    localStorage.getItem("flagctrl-auth") === "true"
  );
  const [authPage, setAuthPage] = useState("landing");
  const [page, setPage] = useState("overview");
  const [mobile, setMobile] = useState(false);

  const [dark, setDark] = useState(
    localStorage.getItem("flagctrl-theme") !== "light"
  );

  const [envs, setEnvs] = useState([]);
  const [flags, setFlags] = useState([]);
  const [rules, setRules] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [audit, setAudit] = useState([]);

  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";

    localStorage.setItem(
      "flagctrl-theme",
      dark ? "dark" : "light"
    );
  }, [dark]);

  useEffect(() => {
    if (!authenticated) return;

    refreshAll();
    const timer = window.setInterval(refreshAll, 30000);

    return () => window.clearInterval(timer);
  }, [authenticated]);

  const notify = (message, type = "success") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  async function refreshAll() {
    setLoading(true);

    try {
      const [
        environmentsResult,
        flagsResult,
        rulesResult,
        analyticsResult,
        auditResult,
      ] = await Promise.allSettled([
        getEnvironments(),
        getFlags(),
        getTargetingRules(),
        getEvaluationAnalytics(),
        getAuditLogs(),
      ]);

      if (environmentsResult.status === "fulfilled") {
        setEnvs(environmentsResult.value || []);
      }

      if (flagsResult.status === "fulfilled") {
        setFlags(flagsResult.value || []);
      }

      if (rulesResult.status === "fulfilled") {
        setRules(rulesResult.value || []);
      }

      if (analyticsResult.status === "fulfilled") {
        setAnalytics(analyticsResult.value || []);
      }

      if (auditResult.status === "fulfilled") {
        setAudit(auditResult.value || []);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!authenticated) {
    if (authPage === "login") {
      return (
        <LoginPage
          onLogin={() => {
            localStorage.setItem("flagctrl-auth", "true");
            setAuthenticated(true);
          }}
          onBack={() => setAuthPage("landing")}
        />
      );
    }

    return (
      <LandingPage
        onLogin={() => setAuthPage("login")}
      />
    );
  }

  const navigate = (id) => {
    setPage(id);
    setMobile(false);
  };

  const meta = pageMeta[page];

  const context = {
    envs,
    flags,
    rules,
    analytics,
    audit,
    setEnvs,
    setFlags,
    setRules,
    setAnalytics,
    setAudit,
    modal,
    setModal,
    notify,
    refreshAll,
    loading,
  };

  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        navigate={navigate}
        mobile={mobile}
        setMobile={setMobile}
        dark={dark}
        onLogout={() => {
          localStorage.removeItem("flagctrl-auth");
          setAuthenticated(false);
          setAuthPage("landing");
        }}
      />

      <section className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMobile(true)}
          >
            ☰
          </button>

          <div className="crumb">
            <span>FlagCtrl</span>
            <b>/</b>
            {meta[0]}
          </div>

          <div className="top-actions">
            <span className="status-dot" />
            <span className="live-text">Local workspace</span>

            <button
              className="icon-btn"
              onClick={refreshAll}
              title="Refresh dashboard data"
            >
              ↻
            </button>

            <button
              className="icon-btn"
              onClick={() => setDark((value) => !value)}
              title="Toggle theme"
            >
              {dark ? "☀" : "☾"}
            </button>
          </div>
        </header>

        <main className="page-content">
          <div className="page-hero">
            <div>
              <div className="eyebrow">
                FLAG CONTROL CENTER
              </div>

              <h1>{meta[0]}</h1>

              <p>{meta[1]}</p>
            </div>

            {page === "flags" && (
              <button
                className="primary"
                onClick={() =>
                  setModal({
                    type: "flag",
                  })
                }
              >
                ＋ New flag
              </button>
            )}

            {page === "environments" && (
              <button
                className="primary"
                onClick={() =>
                  setModal({
                    type: "environment",
                  })
                }
              >
                ＋ New environment
              </button>
            )}
          </div>

          {page === "overview" && (
            <Overview
              {...context}
              navigate={navigate}
            />
          )}

          {page === "flags" && (
            <Flags {...context} />
          )}

          {page === "environments" && (
            <Environments {...context} />
          )}

          {page === "targeting" && (
            <Targeting {...context} />
          )}

          {page === "analytics" && (
            <Analytics {...context} />
          )}

          {page === "audit" && (
            <Audit {...context} />
          )}

          {page === "docs" && <Docs />}

          {page === "settings" && (
            <Settings
              dark={dark}
              setDark={setDark}
            />
          )}
        </main>
      </section>

      {toast && (
        <div className={`toast ${toast.type}`}>
          <span>
            {toast.type === "success"
              ? "✓"
              : toast.type === "error"
              ? "!"
              : "i"}
          </span>

          <span>{toast.message}</span>
        </div>
      )}

      {modal && (
        <Modal
          modal={modal}
          close={() => setModal(null)}
          {...context}
        />
      )}
    </div>
  );
}


/* =========================================================
   LANDING + LOGIN
========================================================= */

function LandingPage({ onLogin }) {
  return (
    <div className="landing-page">
      <div className="landing-glow landing-glow-one" />
      <div className="landing-glow landing-glow-two" />

      <header className="landing-nav">
        <div className="brand landing-brand">
          <div className="brand-mark">⚑</div>
          <div>Flag<span>Ctrl</span></div>
        </div>
        <button className="ghost" onClick={onLogin}>Sign in</button>
      </header>

      <main className="landing-content">
        <div className="landing-copy">
          <div className="eyebrow">FEATURE FLAG CONTROL CENTER</div>
          <h1>Release features with confidence.</h1>
          <p>
            Manage feature flags, environments, targeting rules and rollout
            activity from one clear dashboard built for technical and
            non-technical teams.
          </p>

          <div className="landing-actions">
            <button className="primary landing-cta" onClick={onLogin}>
              Get started →
            </button>
            <span className="landing-note">FastAPI · PostgreSQL · Redis · React</span>
          </div>
        </div>

        <div className="landing-preview">
          <div className="preview-top">
            <span><i /> Local workspace</span>
            <span>FlagCtrl</span>
          </div>
          <div className="preview-heading">
            <div>
              <small>FLAG CONTROL CENTER</small>
              <h2>Overview</h2>
              <p>Control feature releases and rollout activity.</p>
            </div>
          </div>
          <div className="preview-stats">
            {[
              ["Total Flags", "11"],
              ["Active Flags", "8"],
              ["Environments", "3"],
              ["Evaluations", "80"],
            ].map(([label, value]) => (
              <div key={label} className="preview-stat">
                <small>{label}</small>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <div className="preview-chart">
            <div className="preview-chart-head">
              <strong>Evaluation activity</strong>
              <span>Last 24 hours</span>
            </div>
            <div className="preview-bars">
              {[22, 34, 18, 46, 30, 68, 52, 82, 48, 72, 58, 92].map((height, i) => (
                <span key={i} style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <div className="landing-features">
        <div><strong>✓</strong><span>Safe releases</span></div>
        <div><strong>✓</strong><span>Targeted rollouts</span></div>
        <div><strong>✓</strong><span>Audit everything</span></div>
        <div><strong>✓</strong><span>Understand the data</span></div>
      </div>
    </div>
  );
}

function LoginPage({ onLogin, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password to continue.");
      return;
    }
    setError("");
    onLogin();
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button className="auth-back" onClick={onBack}>← Back</button>

        <div className="auth-brand">
          <div className="brand-mark">⚑</div>
          <div>Flag<span>Ctrl</span></div>
        </div>

        <div className="eyebrow">WELCOME BACK</div>
        <h1>Sign in to FlagCtrl</h1>
        <p className="auth-subtitle">
          Access your feature release workspace.
        </p>

        <form onSubmit={submit}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          {error && <div className="auth-error">{error}</div>}

          <button className="primary full auth-submit" type="submit">
            Sign in
          </button>
        </form>

        <small className="auth-demo-note">
          Local frontend login — connect this form to your authentication API when it is available.
        </small>
      </div>
    </div>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({
  page,
  navigate,
  mobile,
  setMobile,
  onLogout,
}) {
  const group = (title, items) => (
    <div className="nav-group">
      <div className="nav-title">
        {title}
      </div>

      {items.map(([id, icon, label]) => (
        <button
          key={id}
          className={`nav-item ${
            page === id ? "active" : ""
          }`}
          onClick={() => navigate(id)}
        >
          <span>{icon}</span>
          {label}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div
        className={`overlay ${
          mobile ? "show" : ""
        }`}
        onClick={() => setMobile(false)}
      />

      <aside
        className={`sidebar ${
          mobile ? "open" : ""
        }`}
      >
        <div className="brand">
          <div className="brand-mark">
            ⚑
          </div>

          <div>
            Flag<span>Ctrl</span>
          </div>

          <button
            className="close-mobile"
            onClick={() => setMobile(false)}
          >
            ×
          </button>
        </div>

        {group("MANAGE", nav.manage)}

        {group("MONITOR", nav.monitor)}

        {group("RESOURCES", nav.resources)}

        <div className="sidebar-spacer" />

        <div className="help-card">
          <div className="help-icon">?</div>

          <div>
            <strong>Need Help?</strong>

            <p>
              Open the docs for API and setup guidance.
            </p>
          </div>
        </div>

        <button
          className="signout"
          onClick={onLogout}
        >
          ↪ <span>Sign out</span>
        </button>

        <div className="sidebar-version">
          FlagCtrl <span>v1.0</span>
        </div>
      </aside>
    </>
  );
}

/* =========================================================
   OVERVIEW
========================================================= */

function Overview({
  envs,
  flags,
  rules,
  analytics,
  audit,
  navigate,
}) {
  const enabled = flags.filter(
    (flag) => Boolean(flag.enabled)
  ).length;

  const disabled =
    flags.length - enabled;

  const totalEvaluations =
    analytics.reduce(
      (total, item) =>
        total +
        Number(
          item.evaluation_count || 0
        ),
      0
    );

  const recent = [...audit].slice(0, 5);

  const flagsByEnvironment = envs.map(
    (environment) => ({
      name: environment.name,
      flags: flags.filter(
        (flag) =>
          flag.environment_id ===
          environment.id
      ).length,
    })
  );

  const flagStatusData = [
    {
      name: "Enabled",
      value: enabled,
    },
    {
      name: "Disabled",
      value: disabled,
    },
  ];

  const targetingByType = {};

  rules.forEach((rule) => {
    const type =
      rule.attribute ||
      rule.operator ||
      "Other";

    targetingByType[type] =
      (targetingByType[type] || 0) + 1;
  });

  const targetingData = Object.entries(
    targetingByType
  ).map(([name, count]) => ({
    name,
    count,
  }));

  const evaluationData = analytics.map(
    (item) => ({
      time: formatChartDate(
        item.evaluation_hour
      ),
      fullTime: item.evaluation_hour,
      count: Number(
        item.evaluation_count || 0
      ),
    })
  );

  return (
    <>
      {/* STATS */}

      <div className="stats-grid">
        <Stat
          label="Total Flags"
          value={flags.length}
          icon="⚑"
        />

        <Stat
          label="Active Flags"
          value={enabled}
          icon="✓"
          tone="green"
        />

        <Stat
          label="Environments"
          value={envs.length}
          icon="▣"
        />

        <Stat
          label="Evaluations"
          value={totalEvaluations.toLocaleString()}
          icon="▥"
        />
      </div>

      {/* RELEASE HEALTH + ENVIRONMENTS */}

      <div className="two-col">
        <section className="panel">
          <PanelTitle
            title="Release health"
            action="View analytics"
            onClick={() =>
              navigate("analytics")
            }
          />

          <div className="health-list">
            <Health
              label="Enabled flags"
              value={
                flags.length
                  ? Math.round(
                      (enabled /
                        flags.length) *
                        100
                    )
                  : 0
              }
            />

            <Health
              label="Disabled flags"
              value={
                flags.length
                  ? Math.round(
                      (disabled /
                        flags.length) *
                        100
                    )
                  : 0
              }
            />

            <Health
              label="Targeting rules"
              value={rules.length}
              raw
            />
          </div>
        </section>

        <section className="panel">
          <PanelTitle
            title="Environments"
            action="Manage"
            onClick={() =>
              navigate("environments")
            }
          />

          {envs.length ? (
            envs.map((environment) => (
              <div
                className="env-row"
                key={environment.id}
              >
                <span className="env-dot" />

                <div>
                  <strong>
                    {environment.name}
                  </strong>

                  <small>
                    {
                      flags.filter(
                        (flag) =>
                          flag.environment_id ===
                          environment.id
                      ).length
                    }{" "}
                    flags
                  </small>
                </div>

                <span className="row-arrow">
                  ›
                </span>
              </div>
            ))
          ) : (
            <Empty text="No environments found." />
          )}
        </section>
      </div>

      {/* OVERVIEW GRAPHS */}

      <div className="graph-grid">
        {/* FLAGS BY ENVIRONMENT */}

        <section className="panel graph-card">
          <PanelTitle
            title="Flags by environment"
            action="View flags"
            onClick={() => navigate("flags")}
          />

          <div className="overview-chart">
            <ResponsiveContainer
              width="100%"
              height={280}
            >
              <BarChart
                data={flagsByEnvironment}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  tick={{
                    fill: "var(--muted)",
                    fontSize: 11,
                  }}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{
                    fill: "var(--muted)",
                    fontSize: 11,
                  }}
                />

                <Tooltip
                  cursor={{
                    fill: "var(--surface2)",
                  }}
                  contentStyle={{
                    background:
                      "var(--surface)",
                    border:
                      "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--text)",
                  }}
                />

                <Bar
                  dataKey="flags"
                  name="Flags"
                  fill="var(--accent)"
                  radius={[
                    5,
                    5,
                    0,
                    0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ENABLED VS DISABLED */}

        <section className="panel graph-card">
          <PanelTitle
            title="Enabled vs Disabled"
            action="View flags"
            onClick={() => navigate("flags")}
          />

          <div className="overview-chart donut-chart">
            <ResponsiveContainer
              width="100%"
              height={280}
            >
              <PieChart>
                <Pie
                  data={flagStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                >
                  <Cell fill="var(--green)" />
                  <Cell fill="var(--red)" />
                </Pie>

                <Tooltip
                  contentStyle={{
                    background:
                      "var(--surface)",
                    border:
                      "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--text)",
                  }}
                />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* TARGETING RULES BY TYPE */}

        <section className="panel graph-card">
          <PanelTitle
            title="Targeting rules by type"
            action="Manage targeting"
            onClick={() =>
              navigate("targeting")
            }
          />

          <div className="overview-chart">
            <ResponsiveContainer
              width="100%"
              height={280}
            >
              <BarChart
                data={targetingData}
                layout="vertical"
                margin={{
                  top: 10,
                  right: 20,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                />

                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{
                    fill: "var(--muted)",
                    fontSize: 11,
                  }}
                />

                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  tick={{
                    fill: "var(--muted)",
                    fontSize: 10,
                  }}
                />

                <Tooltip
                  cursor={{
                    fill: "var(--surface2)",
                  }}
                  contentStyle={{
                    background:
                      "var(--surface)",
                    border:
                      "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--text)",
                  }}
                />

                <Bar
                  dataKey="count"
                  name="Rules"
                  fill="var(--accent2)"
                  radius={[
                    0,
                    5,
                    5,
                    0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* EVALUATION ACTIVITY */}

        <section className="panel graph-card">
          <PanelTitle
            title="Evaluation activity"
            action="View analytics"
            onClick={() =>
              navigate("analytics")
            }
          />

          <div className="overview-chart">
            <ResponsiveContainer
              width="100%"
              height={280}
            >
              <BarChart
                data={evaluationData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="time"
                  tick={{
                    fill: "var(--muted)",
                    fontSize: 10,
                  }}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{
                    fill: "var(--muted)",
                    fontSize: 10,
                  }}
                />

                <Tooltip
                  cursor={{
                    fill: "var(--surface2)",
                  }}
                  content={
                    <EvaluationTooltip />
                  }
                />

                <Bar
                  dataKey="count"
                  name="Evaluation count"
                  fill="var(--accent)"
                  radius={[
                    5,
                    5,
                    0,
                    0,
                  ]}
                  activeBar={{
                    fill: "var(--accent2)",
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* RECENT ACTIVITY */}

      <section className="panel">
        <PanelTitle
          title="Recent activity"
          action="View audit log"
          onClick={() =>
            navigate("audit")
          }
        />

        {recent.length ? (
          <div className="activity-list">
            {recent.map((item, index) => (
              <div
                className="activity"
                key={
                  item.id ?? index
                }
              >
                <div className="activity-icon">
                  {item.action === "CREATE"
                    ? "+"
                    : item.action ===
                      "DELETE"
                    ? "−"
                    : "↻"}
                </div>

                <div>
                  <strong>
                    {item.action} ·{" "}
                    {item.flag_key ||
                      item.table_name}
                  </strong>

                  <small>
                    {item.actor ||
                      "system"}{" "}
                    ·{" "}
                    {formatDate(
                      item.timestamp
                    )}
                  </small>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty text="No audit activity yet." />
        )}
      </section>
    </>
  );
}

/* =========================================================
   FLAGS
========================================================= */

function Flags({
  flags,
  envs,
  setFlags,
  setModal,
  notify,
}) {
  const [search, setSearch] =
    useState("");

  const [env, setEnv] =
    useState("all");

  const visible = flags.filter(
    (flag) =>
      `${flag.flag_name} ${
        flag.flag_key
      } ${
        flag.owner_team || ""
      }`
        .toLowerCase()
        .includes(
          search.toLowerCase()
        ) &&
      (env === "all" ||
        String(
          flag.environment_id
        ) === env)
  );

  async function toggle(flag) {
    try {
      /*
       * IMPORTANT:
       * rollout_percentage has been removed.
       *
       * The backend FlagUpdate schema only
       * accepts the fields below.
       */

      const payload = {
        flag_name: flag.flag_name,
        description:
          flag.description,
        flag_type: flag.flag_type,
        default_value:
          flag.default_value,
        enabled: !flag.enabled,
        owner_team:
          flag.owner_team,
      };

      const result =
        await updateFlag(
          flag.id,
          payload
        );

      const updated =
        result?.data || result;

      setFlags((current) =>
        current.map((item) =>
          item.id === flag.id
            ? {
                ...item,
                ...updated,
                enabled:
                  updated.enabled,
              }
            : item
        )
      );

      notify(
        `${flag.flag_name} ${
          updated.enabled
            ? "enabled"
            : "disabled"
        }.`
      );
    } catch (error) {
      console.error(
        "Toggle flag error:",
        error
      );

      notify(
        apiError(error),
        "error"
      );
    }
  }

  async function remove(flag) {
    if (
      !window.confirm(
        `Delete ${flag.flag_name}?`
      )
    ) {
      return;
    }

    try {
      await deleteFlag(flag.id);

      setFlags((current) =>
        current.filter(
          (item) =>
            item.id !== flag.id
        )
      );

      notify("Flag deleted.");
    } catch (error) {
      console.error(
        "Delete flag error:",
        error
      );

      notify(
        apiError(error),
        "error"
      );
    }
  }

  return (
    <section className="panel table-panel">
      <div className="toolbar">
        <div className="search">
          ⌕

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search flags..."
          />
        </div>

        <select
          value={env}
          onChange={(event) =>
            setEnv(
              event.target.value
            )
          }
        >
          <option value="all">
            All environments
          </option>

          {envs.map(
            (environment) => (
              <option
                key={environment.id}
                value={
                  environment.id
                }
              >
                {environment.name}
              </option>
            )
          )}
        </select>

        <button
          className="ghost"
          onClick={() =>
            setModal({
              type: "flag",
            })
          }
        >
          ＋ Create
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Flag</th>
              <th>Environment</th>
              <th>Type</th>
              <th>Default</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {visible.map((flag) => (
              <tr key={flag.id}>
                <td>
                  <strong>
                    {flag.flag_name}
                  </strong>

                  <small>
                    {flag.flag_key}
                  </small>
                </td>

                <td>
                  {envName(
                    flag.environment_id,
                    envs
                  )}
                </td>

                <td>
                  <span className="tag">
                    {flag.flag_type}
                  </span>
                </td>

                <td>
                  <code>
                    {String(
                      flag.default_value
                    )}
                  </code>
                </td>

                <td>
                  {flag.owner_team ||
                    "—"}
                </td>

                <td>
                  <button
                    className={`switch ${
                      flag.enabled
                        ? "on"
                        : ""
                    }`}
                    onClick={() =>
                      toggle(flag)
                    }
                  >
                    <span />

                    {flag.enabled
                      ? "Enabled"
                      : "Disabled"}
                  </button>
                </td>

                <td>
                  <div className="row-actions">
                    <button
                      onClick={() =>
                        setModal({
                          type: "flag",
                          flag,
                        })
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="danger-text"
                      onClick={() =>
                        remove(flag)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!visible.length && (
          <Empty
            text={
              search ||
              env !== "all"
                ? "No feature flags match your filters."
                : "No feature flags found."
            }
          />
        )}
      </div>
    </section>
  );
}

/* =========================================================
   ENVIRONMENTS
========================================================= */

function Environments({
  envs,
  flags,
  setEnvs,
  setModal,
  notify,
}) {
  async function remove(
    environment
  ) {
    if (
      !window.confirm(
        `Delete ${environment.name}?`
      )
    ) {
      return;
    }

    try {
      await deleteEnvironment(
        environment.id
      );

      setEnvs((current) =>
        current.filter(
          (item) =>
            item.id !==
            environment.id
        )
      );

      notify("Environment deleted.");
    } catch (error) {
      notify(
        apiError(error),
        "error"
      );
    }
  }

  return (
    <div className="env-grid">
      {envs.map((environment) => (
        <section
          className="env-card"
          key={environment.id}
        >
          <div className="env-card-top">
            <span className="large-env-icon">
              ▣
            </span>

            <span className="status-pill">
              Active
            </span>
          </div>

          <h3>
            {environment.name}
          </h3>

          <p>
            {environment.description ||
              "Deployment environment"}
          </p>

          <div className="env-metric">
            <span>
              Feature flags
            </span>

            <strong>
              {
                flags.filter(
                  (flag) =>
                    flag.environment_id ===
                    environment.id
                ).length
              }
            </strong>
          </div>

          <div className="card-actions">
            <button
              className="ghost"
              onClick={() =>
                setModal({
                  type: "environment",
                  environment,
                })
              }
            >
              Edit
            </button>

            <button
              className="danger-outline"
              onClick={() =>
                remove(environment)
              }
            >
              Delete
            </button>
          </div>
        </section>
      ))}

      {!envs.length && (
        <section className="panel empty-large">
          <h3>
            No environments yet
          </h3>

          <p>
            Create development,
            staging or production
            to start managing
            releases.
          </p>

          <button
            className="primary"
            onClick={() =>
              setModal({
                type: "environment",
              })
            }
          >
            Create environment
          </button>
        </section>
      )}
    </div>
  );
}

/* =========================================================
   TARGETING
========================================================= */

function Targeting({
  flags,
  envs,
  rules,
  setRules,
  setModal,
  notify,
}) {
  const ruleRows = rules.map(
    (rule) => ({
      ...rule,
      flag: flags.find(
        (flag) =>
          flag.id === rule.flag_id
      ),
    })
  );

  async function remove(rule) {
    if (
      !window.confirm(
        "Delete this targeting rule?"
      )
    ) {
      return;
    }

    try {
      await deleteTargetingRule(
        rule.id
      );

      setRules((current) =>
        current.filter(
          (item) =>
            item.id !== rule.id
        )
      );

      notify(
        "Targeting rule deleted."
      );
    } catch (error) {
      notify(
        apiError(error),
        "error"
      );
    }
  }

  return (
    <>
      <section className="panel target-summary">
        <div>
          <span className="eyebrow">
            ROLLOUT CONTROL
          </span>

          <h2>
            Rules are evaluated in
            priority order
          </h2>

          <p>
            Use user attributes,
            groups, or deterministic
            percentage rollout rules
            to control exposure.
          </p>
        </div>

        <button
          className="primary"
          onClick={() =>
            setModal({
              type: "rule",
            })
          }
        >
          ＋ Add rule
        </button>
      </section>

      <section className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Priority</th>
                <th>Flag</th>
                <th>Attribute</th>
                <th>Operator</th>
                <th>Target</th>
                <th>Rollout</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {ruleRows.map(
                (rule) => (
                  <tr key={rule.id}>
                    <td>
                      <span className="priority">
                        {
                          rule.rule_priority
                        }
                      </span>
                    </td>

                    <td>
                      <strong>
                        {rule.flag
                          ?.flag_name ||
                          `Flag #${rule.flag_id}`}
                      </strong>

                      <small>
                        {envName(
                          rule.flag
                            ?.environment_id,
                          envs
                        )}
                      </small>
                    </td>

                    <td>
                      {rule.attribute}
                    </td>

                    <td>
                      <span className="tag">
                        {rule.operator}
                      </span>
                    </td>

                    <td>
                      <code>
                        {
                          rule.target_value
                        }
                      </code>
                    </td>

                    <td>
                      {rule.percentage ==
                      null
                        ? "—"
                        : `${rule.percentage}%`}
                    </td>

                    <td>
                      <span
                        className={`status ${
                          rule.enabled
                            ? "enabled"
                            : "disabled"
                        }`}
                      >
                        {rule.enabled
                          ? "Enabled"
                          : "Disabled"}
                      </span>
                    </td>

                    <td>
                      <div className="row-actions">
                        <button
                          onClick={() =>
                            setModal({
                              type: "rule",
                              rule,
                            })
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="danger-text"
                          onClick={() =>
                            remove(rule)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          {!ruleRows.length && (
            <Empty text="No targeting rules configured." />
          )}
        </div>
      </section>
    </>
  );
}

/* =========================================================
   ANALYTICS
========================================================= */

function Analytics({
  analytics,
  flags,
  envs,
  rules,
  audit,
}) {
  const chart = analytics.map((item) => ({
    time: formatChartDate(item.evaluation_hour),
    fullTime: item.evaluation_hour,
    count: Number(item.evaluation_count || 0),
    flag: item.flag_key || "All flags",
    environment: item.environment_name || "Unknown",
  }));

  const total = chart.reduce((sum, item) => sum + item.count, 0);

  const byFlag = Object.values(
    chart.reduce((acc, item) => {
      acc[item.flag] ??= { name: item.flag, evaluations: 0 };
      acc[item.flag].evaluations += item.count;
      return acc;
    }, {})
  ).sort((a, b) => b.evaluations - a.evaluations);

  const byEnvironment = Object.values(
    chart.reduce((acc, item) => {
      acc[item.environment] ??= { name: item.environment, evaluations: 0 };
      acc[item.environment].evaluations += item.count;
      return acc;
    }, {})
  ).sort((a, b) => b.evaluations - a.evaluations);

  const auditActions = Object.values(
    audit.reduce((acc, item) => {
      const action = item.action || "OTHER";
      acc[action] ??= { name: action, count: 0 };
      acc[action].count += 1;
      return acc;
    }, {})
  );

  const trackedFlags = new Set(
    chart.map((item) => item.flag).filter((value) => value !== "All flags")
  ).size;

  const trackedEnvironments = new Set(
    chart.map((item) => item.environment).filter((value) => value !== "Unknown")
  ).size;

  const enabledFlags = flags.filter((flag) => Boolean(flag.enabled)).length;

  return (
    <>
      <div className="stats-grid">
        <Stat label="Total evaluations" value={total.toLocaleString()} icon="▥" />
        <Stat label="Data points" value={analytics.length} icon="◌" />
        <Stat label="Tracked flags" value={trackedFlags} icon="⚑" />
        <Stat label="Environments" value={trackedEnvironments || envs.length} icon="▣" />
      </div>

      <section className="panel chart-panel">
        <PanelTitle title="Evaluation activity over time" action="Live data" />
        <p className="chart-explanation">
          Shows how many times your feature flags were checked. Higher points mean
          your application evaluated flags more often during that period.
        </p>
        <div className="chart">
          <ResponsiveContainer width="100%" height={380}>
            <AreaChart data={chart} margin={{ top: 20, right: 25, left: 5, bottom: 20 }}>
              <defs>
                <linearGradient id="evaluationFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: "var(--muted)", fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: "var(--muted)", fontSize: 11 }} />
              <Tooltip content={<EvaluationTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                name="Evaluations"
                stroke="var(--accent2)"
                fill="url(#evaluationFill)"
                strokeWidth={2.5}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="graph-grid analytics-grid">
        <section className="panel graph-card">
          <PanelTitle title="Evaluations by feature" action={`${byFlag.length} tracked`} />
          <p className="chart-explanation">
            Which features are being checked most often. This helps you see what
            your application is using most.
          </p>
          <div className="overview-chart">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byFlag} layout="vertical" margin={{ left: 15, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fill: "var(--muted)", fontSize: 10 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fill: "var(--muted)", fontSize: 10 }} />
                <Tooltip content={<SimpleChartTooltip label="Evaluations" />} />
                <Bar dataKey="evaluations" name="Evaluations" fill="var(--accent)" radius={[0, 5, 5, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel graph-card">
          <PanelTitle title="Evaluations by environment" action={`${envs.length} configured`} />
          <p className="chart-explanation">
            Shows where feature checks are happening: development, staging,
            production, or other environments.
          </p>
          <div className="overview-chart donut-chart">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={byEnvironment}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="evaluations"
                  nameKey="name"
                >
                  {byEnvironment.map((_, index) => (
                    <Cell key={index} fill={index % 2 ? "var(--accent2)" : "var(--accent)"} />
                  ))}
                </Pie>
                <Tooltip content={<SimpleChartTooltip label="Evaluations" />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel graph-card">
          <PanelTitle title="Configuration activity" action={`${audit.length} events`} />
          <p className="chart-explanation">
            A simple view of changes made to the workspace. Create, update,
            enable, disable and delete events are counted here.
          </p>
          <div className="overview-chart">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={auditActions}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fill: "var(--muted)", fontSize: 10 }} />
                <Tooltip content={<SimpleChartTooltip label="Changes" />} />
                <Bar dataKey="count" name="Changes" fill="var(--accent2)" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel graph-card">
          <PanelTitle title="Release snapshot" action="Current" />
          <p className="chart-explanation">
            A plain-language snapshot of the current release setup.
          </p>
          <div className="analytics-summary">
            <div><span>Configured flags</span><strong>{flags.length}</strong></div>
            <div><span>Enabled flags</span><strong>{enabledFlags}</strong></div>
            <div><span>Targeting rules</span><strong>{rules.length}</strong></div>
            <div><span>Environments</span><strong>{envs.length}</strong></div>
          </div>
        </section>
      </div>
    </>
  );
}

function SimpleChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="tooltip-title">{payload[0]?.payload?.name || "Data point"}</div>
      <div className="tooltip-row">
        <span>{label}</span>
        <strong>{Number(payload[0].value || 0).toLocaleString()}</strong>
      </div>
      <div className="tooltip-hint">Updated from the latest dashboard data.</div>
    </div>
  );
}

/* =========================================================
   CUSTOM ANALYTICS TOOLTIP
========================================================= */

function EvaluationTooltip({
  active,
  payload,
}) {
  if (
    !active ||
    !payload ||
    !payload.length
  ) {
    return null;
  }

  const data =
    payload[0]?.payload;

  if (!data) {
    return null;
  }

  return (
    <div className="custom-tooltip">
      <div className="tooltip-title">
        Evaluation activity
      </div>

      <div className="tooltip-row">
        <span>Date/time</span>

        <strong>
          {formatDate(
            data.fullTime
          )}
        </strong>
      </div>

      <div className="tooltip-row">
        <span>Evaluation count</span>

        <strong>
          {Number(
            data.count || 0
          ).toLocaleString()}
        </strong>
      </div>
    </div>
  );
}

/* =========================================================
   AUDIT LOG
========================================================= */

function Audit({
  audit,
}) {
  const [action, setAction] =
    useState("all");

  const [query, setQuery] =
    useState("");

  const rows = audit.filter(
    (item) =>
      (action === "all" ||
        item.action === action) &&
      `${item.flag_key || ""} ${
        item.actor || ""
      } ${
        item.table_name || ""
      }`
        .toLowerCase()
        .includes(
          query.toLowerCase()
        )
  );

  return (
    <section className="panel table-panel">
      <div className="toolbar">
        <div className="search">
          ⌕

          <input
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value
              )
            }
            placeholder="Search audit log..."
          />
        </div>

        <select
          value={action}
          onChange={(event) =>
            setAction(
              event.target.value
            )
          }
        >
          <option value="all">
            All actions
          </option>

          {[
            ...new Set(
              audit.map(
                (item) =>
                  item.action
              )
            ),
          ].map((value) => (
            <option
              key={value}
              value={value}
            >
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Action</th>
              <th>Flag</th>
              <th>Actor</th>
              <th>Table</th>
              <th>Record</th>
              <th>Changes</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((item) => (
              <tr key={item.id}>
                <td>
                  {formatDate(
                    item.timestamp
                  )}
                </td>

                <td>
                  <span
                    className={`action ${String(
                      item.action
                    ).toLowerCase()}`}
                  >
                    {item.action}
                  </span>
                </td>

                <td>
                  <strong>
                    {item.flag_key ||
                      "—"}
                  </strong>
                </td>

                <td>
                  {item.actor ||
                    "system"}
                </td>

                <td>
                  {item.table_name ||
                    "—"}
                </td>

                <td>
                  {item.record_id ||
                    "—"}
                </td>

                <td>
                  <AuditChanges
                    previousData={
                      item.previous_data
                    }
                    newData={
                      item.new_data
                    }
                    action={
                      item.action
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!rows.length && (
          <Empty text="No audit events found." />
        )}
      </div>
    </section>
  );
}

/* =========================================================
   AUDIT CHANGED VALUES ONLY
========================================================= */

function AuditChanges({
  previousData,
  newData,
  action,
}) {
  if (
    action === "CREATE" ||
    action === "DELETE"
  ) {
    return (
      <details>
        <summary>
          View
        </summary>

        <div className="diff single">
          <pre>
            {pretty(
              action === "CREATE"
                ? newData
                : previousData
            )}
          </pre>
        </div>
      </details>
    );
  }

  const previous =
    parseAuditData(
      previousData
    );

  const current =
    parseAuditData(newData);

  const changed = getChangedFields(
    previous,
    current
  );

  if (!changed.length) {
    return (
      <span className="no-change">
        No changed values
      </span>
    );
  }

  return (
    <details>
      <summary>
        View {changed.length} change
        {changed.length === 1
          ? ""
          : "s"}
      </summary>

      <div className="change-list">
        {changed.map(
          (change) => (
            <div
              className="change-item"
              key={change.key}
            >
              <div className="change-key">
                {change.key}
              </div>

              <div className="change-values">
                <div className="old-value">
                  <span>
                    Before
                  </span>

                  <code>
                    {displayAuditValue(
                      change.before
                    )}
                  </code>
                </div>

                <div className="change-arrow">
                  →
                </div>

                <div className="new-value">
                  <span>
                    After
                  </span>

                  <code>
                    {displayAuditValue(
                      change.after
                    )}
                  </code>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </details>
  );
}

function parseAuditData(value) {
  if (value == null) {
    return {};
  }

  if (
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed =
        JSON.parse(value);

      if (
        parsed &&
        typeof parsed ===
          "object" &&
        !Array.isArray(parsed)
      ) {
        return parsed;
      }

      return {
        value: parsed,
      };
    } catch {
      return {
        value,
      };
    }
  }

  return {
    value,
  };
}

function getChangedFields(
  previous,
  current
) {
  const keys = new Set([
    ...Object.keys(
      previous || {}
    ),
    ...Object.keys(
      current || {}
    ),
  ]);

  const changed = [];

  keys.forEach((key) => {
    const before =
      previous?.[key];

    const after =
      current?.[key];

    if (
      JSON.stringify(before) !==
      JSON.stringify(after)
    ) {
      changed.push({
        key,
        before,
        after,
      });
    }
  });

  return changed;
}

function displayAuditValue(
  value
) {
  if (value === undefined) {
    return "—";
  }

  if (value === null) {
    return "null";
  }

  if (
    typeof value === "object"
  ) {
    return JSON.stringify(
      value
    );
  }

  return String(value);
}

/* =========================================================
   DOCS
========================================================= */

function Docs() {
  return (
    <div className="docs-grid">
      <DocCard
        icon="⚡"
        title="Getting started"
        text="Run the FastAPI backend, start the React dashboard and verify the local connection."
      />

      <DocCard
        icon="⌘"
        title="API reference"
        text="Open FastAPI Swagger UI to inspect and test flags, environments, targeting and evaluation endpoints."
        button="Open Swagger UI"
        onClick={() =>
          window.open(
            "http://127.0.0.1:8000/docs",
            "_blank"
          )
        }
      />

      <DocCard
        icon="▤"
        title="Architecture"
        text="FastAPI + PostgreSQL + Redis backend with a React administration dashboard and evaluation API."
      />

      <DocCard
        icon="▣"
        title="Database"
        text="Environments, flags, flag versions, targeting rules, memberships, audit logs and evaluation analytics."
      />

      <DocCard
        icon="◌"
        title="Redis"
        text="Evaluation results are cached by environment and flag key, with invalidation on updates."
      />

      <DocCard
        icon="✓"
        title="Release workflow"
        text="Create a flag, assign an environment, add targeting rules, roll out progressively and review the audit trail."
      />
    </div>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

function Settings({
  dark,
  setDark,
}) {
  const [status, setStatus] =
    useState("Checking...");

  useEffect(() => {
    healthCheck()
      .then(() =>
        setStatus("Connected")
      )
      .catch(() =>
        setStatus("Unavailable")
      );
  }, []);

  async function checkConnection() {
    setStatus("Checking...");

    try {
      await healthCheck();

      setStatus("Connected");
    } catch {
      setStatus("Unavailable");
    }
  }

  return (
    <div className="settings-grid">
      <section className="panel setting-card">
        <div className="setting-head">
          <div>
            <h2>Appearance</h2>

            <p>
              Choose how FlagCtrl
              looks on this device.
            </p>
          </div>

          <span className="setting-icon">
            ◐
          </span>
        </div>

        <div className="setting-row">
          <div>
            <strong>
              Dark mode
            </strong>

            <small>
              Use the FlagCtrl dark
              workspace.
            </small>
          </div>

          <button
            className={`switch ${
              dark ? "on" : ""
            }`}
            onClick={() =>
              setDark(!dark)
            }
          >
            <span />

            {dark ? "On" : "Off"}
          </button>
        </div>
      </section>

      <section className="panel setting-card">
        <div className="setting-head">
          <div>
            <h2>
              Backend connection
            </h2>

            <p>
              Current API endpoint
              and health status.
            </p>
          </div>

          <span className="setting-icon">
            ⌁
          </span>
        </div>

        <div className="connection">
          <span
            className={`connection-dot ${
              status === "Connected"
                ? "good"
                : "bad"
            }`}
          />

          <div>
            <strong>
              {status}
            </strong>

            <small>
              http://127.0.0.1:8000
            </small>
          </div>
        </div>

        <button
          className="ghost full"
          onClick={
            checkConnection
          }
        >
          Test connection
        </button>
      </section>

      <section className="panel setting-card">
        <div className="setting-head">
          <div>
            <h2>Workspace</h2>

            <p>
              Local dashboard
              configuration.
            </p>
          </div>
        </div>

        <div className="read-only">
          <span>
            Application
          </span>

          <strong>
            FlagCtrl
          </strong>
        </div>

        <div className="read-only">
          <span>Version</span>

          <strong>
            1.0.0
          </strong>
        </div>

        <div className="read-only">
          <span>API base</span>

          <strong>
            127.0.0.1:8000
          </strong>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   DOCUMENT CARD
========================================================= */

function DocCard({
  icon,
  title,
  text,
  button,
  onClick,
}) {
  return (
    <section className="panel doc-card">
      <div className="doc-icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{text}</p>

      {button && (
        <button
          className="ghost"
          onClick={onClick}
        >
          {button} ↗
        </button>
      )}
    </section>
  );
}

/* =========================================================
   MODAL
========================================================= */

function Modal({
  modal,
  close,
  envs,
  flags,
  setFlags,
  setEnvs,
  setRules,
  rules,
  notify,
}) {
  const [busy, setBusy] =
    useState(false);

  const isFlag =
    modal.type === "flag";

  const isEnv =
    modal.type ===
    "environment";

  const [form, setForm] =
    useState(
      isFlag
        ? {
            environment_id:
              modal.flag
                ?.environment_id ||
              envs[0]?.id ||
              "",

            flag_key:
              modal.flag
                ?.flag_key || "",

            flag_name:
              modal.flag
                ?.flag_name || "",

            description:
              modal.flag
                ?.description ||
              "",

            flag_type:
              modal.flag
                ?.flag_type ||
              "boolean",

            default_value:
              modal.flag
                ?.default_value ||
              "false",

            enabled:
              modal.flag
                ?.enabled ??
              true,

            owner_team:
              modal.flag
                ?.owner_team || "",
          }
        : isEnv
        ? {
            name:
              modal.environment
                ?.name || "",
          }
        : {
            flag_id:
              modal.rule
                ?.flag_id ||
              flags[0]?.id ||
              "",

            rule_priority:
              modal.rule
                ?.rule_priority ||
              1,

            attribute:
              modal.rule
                ?.attribute ||
              "user_id",

            operator:
              modal.rule
                ?.operator ||
              "equals",

            target_value:
              modal.rule
                ?.target_value ||
              "",

            percentage:
              modal.rule
                ?.percentage ??
              "",

            enabled:
              modal.rule
                ?.enabled ??
              true,
          }
    );

  const set = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  async function save(event) {
    event.preventDefault();

    setBusy(true);

    try {
      if (isFlag) {
        /*
         * IMPORTANT:
         *
         * No rollout_percentage here.
         *
         * Percentage rollout belongs to
         * TargetingRuleCreate/Update.
         */

        const payload = {
          environment_id:
            Number(
              form.environment_id
            ),

          flag_key:
            form.flag_key,

          flag_name:
            form.flag_name,

          description:
            form.description,

          flag_type:
            form.flag_type,

          default_value:
            form.default_value,

          enabled:
            Boolean(
              form.enabled
            ),

          owner_team:
            form.owner_team || null,
        };

        const result =
          modal.flag
            ? await updateFlag(
                modal.flag.id,
                {
                  flag_name:
                    payload.flag_name,

                  description:
                    payload.description,

                  flag_type:
                    payload.flag_type,

                  default_value:
                    payload.default_value,

                  enabled:
                    payload.enabled,

                  owner_team:
                    payload.owner_team,
                }
              )
            : await createFlag(
                payload
              );

        const output =
          result?.data ||
          result;

        if (modal.flag) {
          setFlags((current) =>
            current.map(
              (item) =>
                item.id ===
                output.id
                  ? {
                      ...item,
                      ...output,
                    }
                  : item
            )
          );
        } else {
          setFlags((current) => [
            ...current,
            output,
          ]);
        }

        notify(
          modal.flag
            ? "Flag updated."
            : "Flag created."
        );
      } else if (isEnv) {
        const payload = {
          name: form.name,
        };

        const result =
          modal.environment
            ? await updateEnvironment(
                modal.environment.id,
                payload
              )
            : await createEnvironment(
                payload
              );

        const output =
          result?.data ||
          result;

        if (modal.environment) {
          setEnvs((current) =>
            current.map(
              (item) =>
                item.id ===
                output.id
                  ? {
                      ...item,
                      ...output,
                    }
                  : item
            )
          );
        } else {
          setEnvs((current) => [
            ...current,
            output,
          ]);
        }

        notify(
          modal.environment
            ? "Environment updated."
            : "Environment created."
        );
      } else {
        /*
         * Percentage rollout stays here.
         *
         * This matches:
         * TargetingRuleCreate
         * TargetingRuleUpdate
         */

        const payload = {
          flag_id:
            Number(form.flag_id),

          rule_priority:
            Number(
              form.rule_priority
            ),

          attribute:
            form.attribute,

          operator:
            form.operator,

          target_value:
            form.target_value,

          percentage:
            form.percentage === ""
              ? null
              : Number(
                  form.percentage
                ),

          enabled:
            Boolean(
              form.enabled
            ),
        };

        const result =
          modal.rule
            ? await updateTargetingRule(
                modal.rule.id,
                payload
              )
            : await createTargetingRule(
                payload
              );

        const output =
          result?.data ||
          result;

        if (modal.rule) {
          setRules((current) =>
            current.map(
              (item) =>
                item.id ===
                output.id
                  ? {
                      ...item,
                      ...output,
                    }
                  : item
            )
          );
        } else {
          setRules((current) => [
            ...current,
            output,
          ]);
        }

        notify(
          modal.rule
            ? "Rule updated."
            : "Rule created."
        );
      }

      close();
    } catch (error) {
      console.error(
        "Save error:",
        error
      );

      notify(
        apiError(error),
        "error"
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          close();
        }
      }}
    >
      <form
        className="modal"
        onSubmit={save}
      >
        <div className="modal-head">
          <div>
            <span className="eyebrow">
              CONFIGURATION
            </span>

            <h2>
              {isFlag
                ? modal.flag
                  ? "Edit flag"
                  : "Create flag"
                : isEnv
                ? modal.environment
                  ? "Edit environment"
                  : "Create environment"
                : modal.rule
                ? "Edit targeting rule"
                : "Create targeting rule"}
            </h2>
          </div>

          <button
            type="button"
            className="close"
            onClick={close}
          >
            ×
          </button>
        </div>

        {isFlag ? (
          <>
            <Field label="Flag name">
              <input
                required
                value={form.flag_name}
                onChange={(event) =>
                  set(
                    "flag_name",
                    event.target.value
                  )
                }
              />
            </Field>

            <Field label="Flag key">
              <input
                required
                disabled={Boolean(
                  modal.flag
                )}
                value={form.flag_key}
                onChange={(event) =>
                  set(
                    "flag_key",
                    event.target.value
                  )
                }
              />
            </Field>

            <div className="form-grid">
              <Field label="Environment">
                <select
                  required
                  value={
                    form.environment_id
                  }
                  onChange={(event) =>
                    set(
                      "environment_id",
                      event.target.value
                    )
                  }
                >
                  {envs.map(
                    (environment) => (
                      <option
                        key={
                          environment.id
                        }
                        value={
                          environment.id
                        }
                      >
                        {
                          environment.name
                        }
                      </option>
                    )
                  )}
                </select>
              </Field>

              <Field label="Type">
                <select
                  value={
                    form.flag_type
                  }
                  onChange={(event) =>
                    set(
                      "flag_type",
                      event.target.value
                    )
                  }
                >
                  <option value="boolean">
                    boolean
                  </option>

                  <option value="string">
                    string
                  </option>

                  <option value="number">
                    number
                  </option>
                </select>
              </Field>
            </div>

            <div className="form-grid">
              <Field label="Default value">
                <input
                  value={
                    form.default_value
                  }
                  onChange={(event) =>
                    set(
                      "default_value",
                      event.target.value
                    )
                  }
                />
              </Field>

              <Field label="Owner team">
                <input
                  value={
                    form.owner_team
                  }
                  onChange={(event) =>
                    set(
                      "owner_team",
                      event.target.value
                    )
                  }
                  placeholder="Frontend Team"
                />
              </Field>
            </div>

            <Field label="Description">
              <textarea
                value={
                  form.description
                }
                onChange={(event) =>
                  set(
                    "description",
                    event.target.value
                  )
                }
              />
            </Field>

            <Toggle
              value={form.enabled}
              setValue={(value) =>
                set(
                  "enabled",
                  value
                )
              }
              label="Flag enabled"
            />
          </>
        ) : isEnv ? (
          <Field label="Environment name">
            <input
              required
              value={form.name}
              onChange={(event) =>
                set(
                  "name",
                  event.target.value
                )
              }
              placeholder="production"
            />
          </Field>
        ) : (
          <>
            <div className="form-grid">
              <Field label="Flag">
                <select
                  required
                  value={form.flag_id}
                  onChange={(event) =>
                    set(
                      "flag_id",
                      event.target.value
                    )
                  }
                >
                  {flags.map(
                    (flag) => (
                      <option
                        key={flag.id}
                        value={flag.id}
                      >
                        {
                          flag.flag_name
                        }
                      </option>
                    )
                  )}
                </select>
              </Field>

              <Field label="Priority">
                <input
                  type="number"
                  min="1"
                  required
                  value={
                    form.rule_priority
                  }
                  onChange={(event) =>
                    set(
                      "rule_priority",
                      event.target.value
                    )
                  }
                />
              </Field>
            </div>

            <div className="form-grid">
              <Field label="Attribute">
                <input
                  required
                  value={
                    form.attribute
                  }
                  onChange={(event) =>
                    set(
                      "attribute",
                      event.target.value
                    )
                  }
                  placeholder="user_id"
                />
              </Field>

              <Field label="Operator">
                <select
                  value={
                    form.operator
                  }
                  onChange={(event) =>
                    set(
                      "operator",
                      event.target.value
                    )
                  }
                >
                  <option value="equals">
                    equals
                  </option>

                  <option value="not_equals">
                    not_equals
                  </option>

                  <option value="contains">
                    contains
                  </option>

                  <option value="in">
                    in
                  </option>
                </select>
              </Field>
            </div>

            <div className="form-grid">
              <Field label="Target value">
                <input
                  required
                  value={
                    form.target_value
                  }
                  onChange={(event) =>
                    set(
                      "target_value",
                      event.target.value
                    )
                  }
                />
              </Field>

              <Field label="Percentage rollout">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={
                    form.percentage
                  }
                  onChange={(event) =>
                    set(
                      "percentage",
                      event.target.value
                    )
                  }
                  placeholder="Optional"
                />
              </Field>
            </div>

            <Toggle
              value={form.enabled}
              setValue={(value) =>
                set(
                  "enabled",
                  value
                )
              }
              label="Rule enabled"
            />
          </>
        )}

        <div className="modal-actions">
          <button
            type="button"
            className="ghost"
            onClick={close}
          >
            Cancel
          </button>

          <button
            className="primary"
            disabled={busy}
          >
            {busy
              ? "Saving..."
              : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function Field({
  label,
  children,
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  value,
  setValue,
  label,
}) {
  return (
    <div className="toggle-field">
      <button
        type="button"
        className={`switch ${
          value ? "on" : ""
        }`}
        onClick={() =>
          setValue(!value)
        }
      >
        <span />
      </button>

      <div>
        <strong>{label}</strong>

        <small>
          Controls whether this
          configuration is active.
        </small>
      </div>
    </div>
  );
}

function PanelTitle({
  title,
  action,
  onClick,
}) {
  return (
    <div className="panel-title">
      <h2>{title}</h2>

      {action && (
        <button onClick={onClick}>
          {action} →
        </button>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  tone,
}) {
  return (
    <div className="stat">
      <div
        className={`stat-icon ${
          tone || ""
        }`}
      >
        {icon}
      </div>

      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function Health({
  label,
  value,
  raw,
}) {
  return (
    <div className="health">
      <div>
        <span>{label}</span>

        <strong>
          {raw
            ? value
            : `${value}%`}
        </strong>
      </div>

      {!raw && (
        <div className="progress">
          <span
            style={{
              width: `${Math.min(
                value,
                100
              )}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}

function Empty({
  text,
}) {
  return (
    <div className="empty">
      <span>◌</span>
      {text}
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function apiError(error) {
  return (
    error?.response?.data
      ?.detail ||
    error?.message ||
    "Request failed."
  );
}

function envName(
  id,
  envs = []
) {
  return (
    envs.find(
      (environment) =>
        environment.id === id
    )?.name ||
    `Environment #${id}`
  );
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleString();
}

function formatChartDate(
  value
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
    }
  );
}

function pretty(value) {
  if (value == null) {
    return "None";
  }

  try {
    return JSON.stringify(
      typeof value === "string"
        ? JSON.parse(value)
        : value,
      null,
      2
    );
  } catch {
    return String(value);
  }
}

export default App;