select
	last_name,
	COUNT(emp_no) AS LastNameCount
FROM
	employees
GROUP BY
	last_name
ORDER BY
	LastNameCount DESC; 
