# FlagCtrl Frontend

React/Vite administration dashboard for the FlagCtrl feature-flag management system.

## Included

- Landing page and frontend login gate
- Overview dashboard with live summary cards and multiple graphs
- Feature Flags CRUD, search, environment filtering, enable/disable
- Environments CRUD
- Targeting rules CRUD
- Analytics with evaluation, feature, environment and configuration charts
- Plain-language chart explanations and hover tooltips
- Audit log search/filter with before/after change display and JSON for created records
- Documentation page with Swagger UI link
- Settings page with theme and backend health check
- Responsive dark/light dashboard
- Automatic data refresh every 30 seconds plus manual refresh

## Backend integration

The frontend uses the existing FastAPI endpoints:

- `/`
- `/flags`
- `/environments`
- `/targeting-rules`
- `/evaluate`
- `/evaluation-analytics`
- `/audit-logs`
- `/cleanup/flags`

The API base URL defaults to `http://127.0.0.1:8000` and can be changed with `VITE_API_URL`.

### Authentication note

The supplied frontend API layer does not currently expose an authentication endpoint. The new login page is therefore a frontend login gate for now; it accepts non-empty credentials and stores a local session flag. Connect the form to the real auth endpoint when the backend provides one.

Audit logs are treated as immutable records because the supplied API only exposes `GET /audit-logs`; no create/update/delete audit endpoints were present in the supplied frontend API service.

## Run

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## Production build

```bash
npm run build
npm run preview
```
