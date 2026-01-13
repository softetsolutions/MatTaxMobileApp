import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { fetchUserDetails, updateUserDetails, sendDeleteEmail } from "../api/user"; 
import useLoginStore from "../store/store";

const Profile = () => {

    const { token, id: userId } = useLoginStore();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    addressLine1: "",
    city: "",
    postcode: "",
    country: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await fetchUserDetails(token,userId);
      setProfile(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to load profile");
    }
  };

  const handleUpdate = async () => {
    try {
      const updatedData = await updateUserDetails(token,userId,profile);
      setProfile(updatedData);
      Alert.alert("Success", "Profile updated");
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Account", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await sendDeleteEmail(token,profile.email);
            Alert.alert(
              "Deleted",
              "A confirmation email has been sent to your registered email."
            );
          } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to delete account");
          }
        },
      },
    ]);
  };

  const updateField = (key, value) =>
    setProfile({ ...profile, [key]: value });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>My Account</Text>
      <Text style={styles.subHeader}>
        Manage your personal information and account preferences
      </Text>

      {/* Profile Top Section */}
      <View style={styles.blueSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile.firstName?.charAt(0)?.toUpperCase()}
            {profile.lastName?.charAt(0)?.toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>
            {profile.firstName} {profile.lastName}
          </Text>
          <Text style={styles.infoText}>{profile.email}</Text>
          <Text style={styles.infoText}>
            {profile.phone || "No phone number"}
          </Text>
          <Text style={styles.infoText}>
            {profile.addressLine1 || "No address"}
          </Text>
        </View>
        {!isEditing && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editButtonText}> Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Editable / Readonly Info */}
      {!isEditing ? (
        <>
          <Section title="Personal Information">
            <InfoBox label="First Name" value={profile.firstName} />
            <InfoBox label="Last Name" value={profile.lastName} />
          </Section>

          <Section title="Contact Information">
            <InfoBox label="Email Address" value={profile.email} />
            <InfoBox label="Phone Number" value={profile.phone} />
          </Section>

          <Section title="Address Information">
            <InfoBox label="Address" value={profile.addressLine1} />
            <InfoBox label="City" value={profile.city} />
            <InfoBox label="Postcode" value={profile.postcode} />
            <InfoBox label="Country" value={profile.country} />
          </Section>
        </>
      ) : (
        <>
          <EditInput
            label="First Name *"
            value={profile.firstName}
            onChange={(v) => updateField("firstName", v)}
          />
          <EditInput
            label="Last Name *"
            value={profile.lastName}
            onChange={(v) => updateField("lastName", v)}
          />
          <EditInput
            label="Email Address"
            value={profile.email}
            editable={false}
          />
          <Text style={styles.infoTextSmall}>Email cannot be changed</Text>
          <EditInput
            label="Phone Number"
            value={profile.phone}
            onChange={(v) => updateField("phone", v)}
          />
          <EditInput
            label="Address"
            value={profile.addressLine1}
            onChange={(v) => updateField("addressLine1", v)}
          />
          <View style={styles.formRow}>
            <EditInput
              label="City"
              value={profile.city}
              onChange={(v) => updateField("city", v)}
              style={{ width: "48%" }}
            />
            <EditInput
              label="Postcode"
              value={profile.postcode}
              onChange={(v) => updateField("postcode", v)}
              style={{ width: "48%" }}
            />
          </View>
          <EditInput
            label="Country"
            value={profile.country}
            onChange={(v) => updateField("country", v)}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#eee" }]}
              onPress={() => setIsEditing(false)}
            >
              <Text style={[styles.buttonText, { color: "black" }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#0A58FF" }]}
              onPress={handleUpdate}
            >
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Danger Zone */}
      <View style={styles.dangerZone}>
        <Text style={styles.dangerTitle}>Delete Account</Text>
        <Text style={styles.dangerDesc}>
          Once you delete your account, there is no going back. Please be
          certain.
        </Text>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const Section = ({ title, children }) => (
  <>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.infoRow}>{children}</View>
  </>
);

const InfoBox = ({ label, value }) => (
  <View style={styles.infoBox}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || "Not provided"}</Text>
  </View>
);

const EditInput = ({
  label,
  value,
  onChange,
  editable = true,
  placeholder = "",
  style = {},
}) => (
  <View style={[styles.formGroup, style]}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[styles.input, !editable && { backgroundColor: "#eee" }]}
      value={value}
      editable={editable}
      onChangeText={onChange}
      placeholder={placeholder}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#F5F5F5", paddingTop: 40 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  subHeader: { fontSize: 14, color: "gray", marginBottom: 20 },
  blueSection: {
    backgroundColor: "#0A58FF",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "white",
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarText: { fontSize: 24, fontWeight: "bold", color: "#0A58FF" },
  profileInfo: { alignItems: "center", marginBottom: 10 },
  name: { fontSize: 18, color: "white", fontWeight: "bold" },
  infoText: { fontSize: 14, color: "white" },
  infoTextSmall: { fontSize: 12, color: "gray", marginTop: 4 },
  editButton: {
    backgroundColor: "white",
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  editButtonText: { color: "#0A58FF", fontWeight: "bold" },
  sectionTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 8, marginTop: 20 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap" },
  infoBox: {
    backgroundColor: "#F9F9F9",
    padding: 15,
    borderRadius: 10,
    width: "48%",
    marginBottom: 10,
  },
  infoLabel: { fontSize: 13, color: "#0A58FF", marginBottom: 5 },
  infoValue: { fontSize: 15, fontWeight: "600", color: "black" },
  formGroup: { marginBottom: 15 },
  formRow: { flexDirection: "row", justifyContent: "space-between" },
  inputLabel: { fontWeight: "bold", marginBottom: 4 },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 15 },
  button: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "bold" },
  dangerZone: {
    backgroundColor: "#FFE5E5",
    padding: 20,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 40,
  },
  dangerTitle: { fontSize: 16, fontWeight: "bold", color: "red", marginBottom: 8 },
  dangerDesc: { fontSize: 13, color: "gray", marginBottom: 15 },
  deleteButton: {
    backgroundColor: "red",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  deleteButtonText: { color: "white", fontWeight: "bold" },
});

export default Profile;
