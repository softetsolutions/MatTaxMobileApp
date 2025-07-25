import { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from "react-native";
import editIcon from "../assets/edit.png";

export default function SearchableInputModal({
  label,
  value,
  onChange,
  options,
  placeholder,
  editableOptions = [],
  onEditOption,
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    setSearchText("");
    setEditingIndex(null);
    setEditValue("");
  }, [options]);

  const filteredOptions = searchText
    ? options.filter((opt) =>
        opt.toLowerCase().includes(searchText.toLowerCase())
      )
    : options;

  const handleSelect = (selectedValue) => {
    onChange(selectedValue);
    setModalVisible(false);
    setSearchText("");
  };

  const handleCustomValue = () => {
    if (searchText.trim()) {
      onChange(searchText.trim());
      setModalVisible(false);
      setSearchText("");
    }
  };

  const handleEditSave = async (option, index) => {
    if (onEditOption && editValue.trim() && editValue !== option) {
      await onEditOption(option, editValue);
    }
    setEditingIndex(null);
    setEditValue("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.inputButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.inputText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              placeholder={`Search or type new ${label.toLowerCase()}...`}
              autoFocus={true}
            />

            {searchText.trim() && !options.includes(searchText.trim()) && (
              <TouchableOpacity
                style={styles.customOption}
                onPress={handleCustomValue}
              >
                <Text style={styles.customOptionText}>
                  + Add "{searchText.trim()}"
                </Text>
              </TouchableOpacity>
            )}

            <FlatList
              data={filteredOptions}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={({ item, index }) =>
                editingIndex === index ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <TextInput
                      value={editValue}
                      onChangeText={setEditValue}
                      style={[styles.searchInput, { flex: 1, marginBottom: 0 }]}
                    />
                    <TouchableOpacity
                      onPress={async () => await handleEditSave(item, index)}
                      style={{ marginLeft: 8 }}
                    >
                      <Text style={{ color: "#1976d2", fontWeight: "bold" }}>
                        Save
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingIndex(null);
                        setEditValue("");
                      }}
                      style={{ marginLeft: 8 }}
                    >
                      <Text style={{ color: "#d32f2f", fontWeight: "bold" }}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                      style={[styles.option, { flex: 1 }]}
                      onPress={() => handleSelect(item)}
                    >
                      <Text style={styles.optionText}>{item}</Text>
                    </TouchableOpacity>
                    {editableOptions.includes(item) && onEditOption && (
                      <TouchableOpacity
                        onPress={() => {
                          setEditingIndex(index);
                          setEditValue(item);
                        }}
                        style={{ marginLeft: 8 }}
                      >
                        <Image
                          source={editIcon}
                          style={{ width: 20, height: 20 }}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                )
              }
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
            />

            {filteredOptions.length === 0 && !searchText.trim() && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No options available</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    color: "#333",
    marginBottom: 4,
  },
  inputButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  inputText: {
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  placeholderText: {
    color: "#999",
  },
  arrow: {
    fontSize: 12,
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: "#666",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  customOption: {
    padding: 12,
    backgroundColor: "#f0f8ff",
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#1976d2",
    borderStyle: "dashed",
  },
  customOptionText: {
    color: "#1976d2",
    fontWeight: "600",
    fontSize: 15,
  },
  optionsList: {
    maxHeight: 300,
  },
  option: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: {
    fontSize: 15,
    color: "#333",
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
  },
  emptyStateText: {
    color: "#999",
    fontSize: 15,
  },
});
