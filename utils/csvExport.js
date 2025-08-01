import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Share, Alert } from 'react-native';

export const exportToCSV = async (data, filename = 'report') => {
  try {
    const lines = [];

    // Header
    lines.push("Filters");
    lines.push("Search,,between,dates");
    lines.push(`${data.startDate || ""} To ${data.endDate || ""}`);
    lines.push("Vendor");
    lines.push("transaction description");
    lines.push("");

    // Total summary
    lines.push(`Total money in,${data.totalIn}`);
    lines.push(`Total money out,${data.totalOut}`);
    lines.push("");

    // Money In by Vendor
    lines.push("Money In");
    lines.push("Aggregation by vendor");
    Object.entries(data.vendorSummary).forEach(([vendor, totals]) => {
      if (totals.moneyIn > 0) {
        lines.push(`${vendor},${totals.moneyIn}`);
      }
    });
    lines.push("");

    // Money Out by Vendor
    lines.push("Money Out");
    lines.push("Aggregation by vendor");
    Object.entries(data.vendorSummary).forEach(([vendor, totals]) => {
      if (totals.moneyOut > 0) {
        lines.push(`${vendor},${totals.moneyOut}`);
      }
    });

    lines.push("");

    // Convert to CSV string
    const csvContent = lines.join("\n");

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fullFilename = `${filename}_${timestamp}.csv`;
    
    // Get the documents directory
    const fileUri = `${FileSystem.documentDirectory}${fullFilename}`;
    
    // Write the CSV file
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (isAvailable) {
      // Share the file
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Report as CSV',
        UTI: 'public.comma-separated-values-text'
      });
    } else {
      // Fallback to text sharing if file sharing is not available
      await Share.share({
        message: csvContent,
        title: "Report Data",
      });
    }

    return { success: true, filename: fullFilename };
  } catch (error) {
    console.error('CSV Export Error:', error);
    Alert.alert("Error", "Failed to export report");
    return { success: false, error: error.message };
  }
}; 