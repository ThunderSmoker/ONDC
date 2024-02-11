import pandas as pd

# Load the Excel file into a DataFrame
df = pd.read_excel('merchant_matrix.xlsx')

# Assuming the column names are not unique
# Generate unique PIN codes for each column
unique_pincodes = [str(pin) for pin in range(110001, 110001 + len(df.columns))]

# Rename columns with unique PIN codes
df.columns = unique_pincodes

# Save the modified DataFrame back to Excel
df.to_excel('modified_merchant_matrix.xlsx', index=False)

print("Column names changed and saved successfully!")
