from .base_crud import BaseCRUD

result_crud = BaseCRUD("results")


def get_next_attempt_num(conn, profile_id: int, quiz_id: int) -> int:
	cur = conn.cursor()
	cur.execute(
		"SELECT COALESCE(MAX(attempt_num), 0) + 1 AS next_attempt FROM results WHERE profile_id = %s AND quiz_id = %s;",
		(profile_id, quiz_id),
	)
	next_attempt = cur.fetchone()["next_attempt"]
	cur.close()
	return next_attempt
