import pandas as pd
import mysql.connector

print("Reading CSV...")
df = pd.read_csv("bangalore.csv", sep=None, engine='python')

print("Total rows:", len(df))

print("Fixing dates...")
df['Arrival_Date'] = pd.to_datetime(
    df['Arrival_Date'],
    format='mixed',
    dayfirst=True,
    errors='coerce'
)

print("Fixing prices...")
df['Min_Price'] = pd.to_numeric(df['Min_Price'], errors='coerce')
df['Max_Price'] = pd.to_numeric(df['Max_Price'], errors='coerce')
df['Modal_Price'] = pd.to_numeric(df['Modal_Price'], errors='coerce')

print("Invalid dates:", df['Arrival_Date'].isna().sum())
print("Invalid modal price:", df['Modal_Price'].isna().sum())

df = df.dropna(subset=['Arrival_Date', 'Modal_Price'])

print("Rows after cleaning:", len(df))

df = df.where(pd.notnull(df), None)

print("Connecting to MySQL...")
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="1234",
    database="app"
)

cursor = conn.cursor()

query = """
INSERT INTO market
(state, district, market, commodity, commodity_code,
 variety, grade, arrival_date, min_price, max_price, modal_price)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""

data = list(df[['State','District','Market','Commodity','Commodity_Code',
                'Variety','Grade','Arrival_Date','Min_Price','Max_Price','Modal_Price']]
            .itertuples(index=False, name=None))

print("Inserting into DB...")

batch_size = 5000
for i in range(0, len(data), batch_size):
    batch = data[i:i+batch_size]
    cursor.executemany(query, batch)
    conn.commit()
    print("Inserted:", i + len(batch))

cursor.close()
conn.close()

print("Done!")