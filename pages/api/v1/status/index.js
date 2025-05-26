import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const pgQueryVersion = await database.query("SHOW server_version");
  const pgVersion = pgQueryVersion.rows[0].server_version;

  const pgQueryMaxConnections = await database.query("SHOW max_connections;");
  const pgMaxConnections = pgQueryMaxConnections.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const pgQueryCurrentConnections = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });
  const pgCurrentConnections = pgQueryCurrentConnections.rows[0].count;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: pgVersion,
        max_connections: parseInt(pgMaxConnections),
        opened_connetions: pgCurrentConnections,
      },
    },
  });
}

export default status;
