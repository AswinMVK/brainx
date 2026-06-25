import pymysql

conn = pymysql.connect(
    host='localhost', port=3306, user='root', password='root',
    database='welfare_system', cursorclass=pymysql.cursors.DictCursor
)
cur = conn.cursor()

cur.execute("""
    SELECT u.id, u.full_name, u.aadhaar_number, u.income, u.is_bpl, u.occupation,
           MAX(rs.fraud_probability) as fraud_probability,
           MAX(rs.anomaly_score) as anomaly_score,
           MAX(rs.risk_level) as risk_level,
           COUNT(bd.id) as cash_count,
           SUM(bd.amount) as cash_total,
           GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') as cash_schemes
    FROM users u
    JOIN risk_scores rs ON rs.user_id = u.id
    JOIN benefit_disbursements bd ON bd.user_id = u.id
    LEFT JOIN schemes s ON s.id = bd.scheme_id
    WHERE rs.risk_level = 'high' AND bd.payment_method = 'Cash'
    GROUP BY u.id, u.full_name, u.aadhaar_number, u.income, u.is_bpl, u.occupation
    ORDER BY fraud_probability DESC
""")
rows = cur.fetchall()

print(f"\n{'='*110}")
print(f"  HIGH-RISK USERS RECEIVING CASH BENEFITS  ({len(rows)} users found)")
print(f"{'='*110}\n")

for i, r in enumerate(rows, 1):
    print(f"  {i:2d}. {r['full_name']}")
    print(f"      User ID: {r['id']}  |  Aadhaar: {r['aadhaar_number']}  |  Occupation: {r['occupation']}")
    print(f"      Income: Rs.{r['income']:,.0f}  |  BPL: {'Yes' if r['is_bpl'] else 'No'}")
    print(f"      Fraud Probability: {r['fraud_probability']:.2f}  |  Anomaly Score: {r['anomaly_score']:.2f}  |  Risk: {r['risk_level'].upper()}")
    print(f"      Cash Disbursements: {r['cash_count']}  |  Total Cash Received: Rs.{r['cash_total']:,.0f}")
    print(f"      Schemes: {r['cash_schemes']}")
    print()

# Summary
cur.execute("""
    SELECT COUNT(DISTINCT u.id) as users, SUM(bd.amount) as total
    FROM users u
    JOIN risk_scores rs ON rs.user_id = u.id
    JOIN benefit_disbursements bd ON bd.user_id = u.id
    WHERE rs.risk_level = 'high' AND bd.payment_method = 'Cash'
""")
s = cur.fetchone()
total = s['total'] or 0
print(f"{'='*110}")
print(f"  SUMMARY: {s['users']} high-risk users received Rs.{total:,.0f} total in CASH benefits")
print(f"{'='*110}\n")

conn.close()
