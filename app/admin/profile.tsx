import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";

import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("rirtec.db");

export default function ProfileDashboard() {
  const router = useRouter();

  const [admin, setAdmin] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ FETCH CURRENT ADMIN (simplified: first admin)
  const fetchProfile = () => {
    try {
      const result = db.getFirstSync("SELECT * FROM admin LIMIT 1");
      if (result) {
        setAdmin(result);
        setEmail((result as any).email);
        setPassword((result as any).password);
      }
    } catch (error) {
      console.log("Profile fetch error:", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ✅ UPDATE PROFILE
  const updateProfile = () => {
    if (!admin) return;

    try {
      db.runSync(
        "UPDATE admin SET email=?, password=? WHERE id=?",
        [email, password, (admin as any).id]
      );

      fetchProfile();
      alert("Profile updated!");
    } catch (error) {
      console.log("Profile update error:", error);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={require("../../assets/images/setup-logo.png")}
                style={{ width: 60, height: 40 }}
                resizeMode="contain"
              />
            </View>
          ),
          headerRight: () => (
            <Menu>
              <MenuTrigger>
                <Ionicons name="menu" size={24} style={{ marginRight: 15 }} />
              </MenuTrigger>

              <MenuOptions>
                <MenuOption onSelect={() => router.push("/admin/profile")}>
                  <Text style={{ padding: 10 }}>Profile</Text>
                </MenuOption>

                <MenuOption onSelect={() => router.push("/admin/proposals")}>
                  <Text style={{ padding: 10 }}>Proposals</Text>
                </MenuOption>

                <MenuOption onSelect={() => router.push("/admin/billings")}>
                  <Text style={{ padding: 10 }}>Billings</Text>
                </MenuOption>

                <MenuOption onSelect={() => router.replace("/")}>
                  <Text style={{ padding: 10, color: "red" }}>Logout</Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
          ),
        }}
      />

      <View style={styles.container}>
        {/* ✅ PROFILE HEADER */}
        <View style={styles.profileHeader}>
          {/* <Image
            source={require("../../assets/images/setup-logo.png")}
            style={styles.avatar}
          /> */}
          <Text style={styles.name}>Admin Account</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        {/* ✅ EDIT FORM */}
        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          <TouchableOpacity style={styles.button} onPress={updateProfile}>
            <Text style={styles.buttonText}>Update Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ✅ OPTIONAL STATS */}
        <View style={styles.stats}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>1</Text>
            <Text>Admin</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>Active</Text>
            <Text>Status</Text>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },

  name: {
    fontSize: 20,
    fontWeight: "bold",
  },

  email: {
    color: "gray",
  },

  form: {
    marginBottom: 30,
  },

  label: {
    marginBottom: 5,
    fontWeight: "bold",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 5,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },

  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  statBox: {
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    width: "40%",
  },

  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
});