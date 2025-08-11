## Agro Platform (Microservices)

- Auth: strong register/login (farmers, buyers, admin) with JWT
- Marketplace: listings, search by category and location, cart/order (to be wired to DB)
- Weather: forecast via Open-Meteo passthrough
- Geo: simple nearby search for dealers/consumers/farmers
- MySQL seeded with existing AgroCraft schema

### Quick start (Docker)

1. docker compose up -d --build
2. Services: auth:4001, marketplace:4002, weather:4003, geo:4004, mysql:3306

### Local dev (Node)

- Install: `npm i`
- Run a service: `npm run -w services/auth dev`

### Environment

- See `services/*/.env.example`

### Next steps

- Wire auth to MySQL tables `farmerregistration` and `buyerregistration`
- Add admin role and RBAC
- Implement marketplace CRUD with DB
- Add API gateway/UI app