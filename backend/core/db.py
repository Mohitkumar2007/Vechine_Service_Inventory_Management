from django.db import connection
import re


def adapt_sql(sql):
    if connection.vendor == 'mysql':
        return re.sub(r':([A-Za-z_][A-Za-z0-9_]*)', r'%(\1)s', sql)
    return sql


def run_cursor(cursor, sql, params=None):
    cursor.execute(adapt_sql(sql), params or {})


def fetch_all(sql, params=None):
    with connection.cursor() as cursor:
        run_cursor(cursor, sql, params)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]


def execute(sql, params=None):
    with connection.cursor() as cursor:
        run_cursor(cursor, sql, params)
