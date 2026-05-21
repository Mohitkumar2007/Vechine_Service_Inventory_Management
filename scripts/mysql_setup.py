import argparse
import re
import sys
from pathlib import Path

import pymysql
from pymysql.constants import ER


def split_sql(script: str) -> list[str]:
    statements: list[str] = []
    current: list[str] = []
    in_single = False
    in_double = False
    escape = False

    for char in script:
        current.append(char)
        if escape:
            escape = False
            continue
        if char == "\\":
            escape = True
            continue
        if char == "'" and not in_double:
            in_single = not in_single
            continue
        if char == '"' and not in_single:
            in_double = not in_double
            continue
        if char == ";" and not in_single and not in_double:
            statement = "".join(current).strip().rstrip(";").strip()
            if statement:
                statements.append(statement)
            current = []

    tail = "".join(current).strip()
    if tail:
        statements.append(tail)
    return statements


def normalize_schema(sql: str, database: str) -> str:
    sql = re.sub(
        r"CREATE DATABASE IF NOT EXISTS\s+`?[\w-]+`?",
        f"CREATE DATABASE IF NOT EXISTS `{database}`",
        sql,
        count=1,
        flags=re.IGNORECASE,
    )
    sql = re.sub(
        r"USE\s+`?[\w-]+`?\s*;",
        f"USE `{database}`;",
        sql,
        count=1,
        flags=re.IGNORECASE,
    )
    return sql


def main() -> int:
    parser = argparse.ArgumentParser(description="Test MySQL connection and import the project schema.")
    parser.add_argument("--host", default="localhost")
    parser.add_argument("--port", default="3306")
    parser.add_argument("--user", required=True)
    parser.add_argument("--password", default="")
    parser.add_argument("--database", default="vehicle_service_db")
    parser.add_argument("--schema", default="database/mysql_schema.sql")
    parser.add_argument("--ssl", action="store_true", help="Use SSL for hosted MySQL connections.")
    args = parser.parse_args()

    try:
        port = int(args.port)
    except ValueError:
        print(f"ERROR: Invalid MySQL port: {args.port}", file=sys.stderr)
        return 2

    try:
        connection = pymysql.connect(
            host=args.host,
            port=port,
            user=args.user,
            password=args.password,
            autocommit=True,
            charset="utf8mb4",
            ssl={} if args.ssl else None,
        )
    except Exception as exc:
        print("ERROR: Could not connect to MySQL with the provided credentials.", file=sys.stderr)
        print(f"DETAIL: {exc}", file=sys.stderr)
        return 2

    schema_path = Path(args.schema)
    if not schema_path.exists():
        print(f"ERROR: Schema file not found: {schema_path}", file=sys.stderr)
        return 2

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            sql = normalize_schema(schema_path.read_text(encoding="utf-8"), args.database)
            for statement in split_sql(sql):
                if not statement or statement.startswith("--"):
                    continue
                if statement.upper().startswith("CREATE TRIGGER TRG_SERVICE_PARTS_STOCK_MYSQL"):
                    cursor.execute("DROP TRIGGER IF EXISTS trg_service_parts_stock_mysql")
                cursor.execute(statement)
    except pymysql.MySQLError as exc:
        code = exc.args[0] if exc.args else None
        if code == ER.DBACCESS_DENIED_ERROR:
            print("ERROR: MySQL login worked, but this user cannot access/create the selected database.", file=sys.stderr)
            print(f"DETAIL: {exc}", file=sys.stderr)
            print("", file=sys.stderr)
            print("Fix this on the MySQL server with an admin/root user:", file=sys.stderr)
            print(f"  CREATE DATABASE IF NOT EXISTS `{args.database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;", file=sys.stderr)
            print(f"  GRANT ALL PRIVILEGES ON `{args.database}`.* TO '{args.user}'@'%';", file=sys.stderr)
            print("  FLUSH PRIVILEGES;", file=sys.stderr)
            print("", file=sys.stderr)
            print("Then rerun the setup script with the same database name.", file=sys.stderr)
            return 3
        print("ERROR: MySQL connection worked, but schema setup failed.", file=sys.stderr)
        print(f"DETAIL: {exc}", file=sys.stderr)
        return 3
    finally:
        connection.close()

    print(f"MySQL connection successful. Database '{args.database}' is ready.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
