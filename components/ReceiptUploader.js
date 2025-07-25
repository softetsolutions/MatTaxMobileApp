import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function ReceiptUploader({
  receiptImage,
  setReceiptImage,
  onExtractReceiptData,
  extracting,
}) {
  const [error, setError] = useState("");

  const pickImage = async () => {
    setError("");
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== "granted") {
        setError("Permission to access media library is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setReceiptImage(result.assets[0]);
      }
    } catch (e) {
      setError("Failed to pick image");
    }
  };

  const handleRemoveImage = () => {
    setReceiptImage(null);
  };

  return (
    <View style={styles.container}>
      {receiptImage ? (
        <View style={styles.imageSection}>
          <View style={styles.imagePreviewContainerSmall}>
            <Image
              source={{ uri: receiptImage.uri }}
              style={styles.imagePreviewSmall}
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleRemoveImage}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonRowHorizontal}>
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Text style={styles.uploadButtonText}>Change Receipt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.extractButton}
              onPress={onExtractReceiptData}
              disabled={extracting}
            >
              {extracting ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ActivityIndicator color="#fff" />
                  <Text style={[styles.extractButtonText, { marginLeft: 8 }]}>
                    Extracting...
                  </Text>
                </View>
              ) : (
                <Text style={styles.extractButtonText}>Extract Data</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          <Text style={styles.uploadButtonText}>Select Receipt</Text>
        </TouchableOpacity>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    color: "#2c3e50",
    letterSpacing: 0.5,
  },
  uploadButton: {
    backgroundColor: "#3498db",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#ffffff",
    fontWeight: "500",
    fontSize: 14,
    letterSpacing: 0.2,
  },
  imageSection: {
    marginTop: 20,
    alignItems: "center",
  },
  imagePreviewContainer: {
    position: "relative",
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f8f9fa",
    padding: 4,
  },
  imagePreviewContainerSmall: {
    position: "relative",
    marginBottom: 8,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f8f9fa",
    padding: 3,
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  imagePreview: {
    width: 180,
    height: 180,
    borderRadius: 8,
  },
  imagePreviewSmall: {
    width: 130,
    height: 130,
    borderRadius: 10,
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "300",
    lineHeight: 18,
  },
  extractButton: {
    backgroundColor: "#27ae60",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  extractButtonText: {
    color: "#ffffff",
    fontWeight: "500",
    fontSize: 14,
    letterSpacing: 0.2,
  },
  buttonRowHorizontal: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  error: {
    color: "#e74c3c",
    marginTop: 12,
    fontSize: 14,
    textAlign: "center",
    fontWeight: "400",
  },
});
