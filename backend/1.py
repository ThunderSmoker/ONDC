import random
from cassandra.cluster import Cluster

# Connect to ScyllaDB
cluster = Cluster(['127.0.0.1'])
session = cluster.connect('crud_keyspace')  # Assuming your keyspace is 'crud_keyspace'

# Prepare INSERT statement
insert_statement = session.prepare("INSERT INTO merchants (pincode, merchants) VALUES (?, ?)")

# Generate and insert data
for _ in range(30000):
    pincode = str(random.randint(1, 100000))
    num_merchants = random.randint(1, 10)  # Adjust the range of merchants as needed
    merchants = [f"Merchant_{i}" for i in range(1, num_merchants + 1)]
    session.execute(insert_statement, (pincode, merchants))

print("Data inserted successfully")

# Close connection
cluster.shutdown()
