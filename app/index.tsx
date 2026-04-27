import { router } from "expo-router";
import * as SQLite from "expo-sqlite";
import React, { useEffect, useState } from "react";

import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function LoginScreen() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const db = SQLite.openDatabaseSync("rirtec.db");

  // Create admin table if not exists
  useEffect(() => {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT,
        password TEXT
      );
    `);

    // Optional: insert default admin
    db.execSync(`
      INSERT INTO admin (email, password)
      SELECT 'admin', '1234'
      WHERE NOT EXISTS (SELECT 1 FROM admin WHERE email='admin');
    `);

  }, []);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      const result = db.getAllSync(
        "SELECT * FROM admin WHERE email=? AND password=?",
        [email, password]
      );

      if (result.length > 0) {
        Alert.alert("Success", "Login Successful!");
        router.push("/admin/admin-dashboard");
      } else {
        Alert.alert("Invalid", "Incorrect email or password");
      }

    } catch (error) {
      console.log("Database error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/setup-logo.png")}
        style={{ width: 300, height: 100, marginBottom: 30, alignSelf: "center" }}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#f4f6f9",
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});