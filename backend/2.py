# Assuming 6-digit pincode and average size of merchant string as 50 characters
pincode_size = 6  # Size of pincode in bytes
merchant_size = 50  # Size of merchant string in bytes
overhead_per_row = 100  # Assumed overhead per row (including metadata)

# Average number of merchants per pincode
average_merchants_per_pincode = 10000

# Calculate size per pincode and per merchant
size_per_pincode = pincode_size + overhead_per_row
size_per_merchant = merchant_size + overhead_per_row
size_per_pincode_average = average_merchants_per_pincode * size_per_merchant

# Total size for all pincodes
total_size = size_per_pincode_average * 30000  # Assuming 30,000 pincodes

# Applying compression ratio (assuming 2x compression)
compression_ratio = 2
estimated_size_with_compression = total_size / compression_ratio
estimated_size_with_compression_in_gb = estimated_size_with_compression / (1024*1024*1024)

print("Estimated Size of ScyllaDB Table with Compression (in bytes):", estimated_size_with_compression_in_gb)
