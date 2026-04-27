import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
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
import { LineChart } from "react-native-chart-kit";

const db = SQLite.openDatabaseSync("rirtec.db");

export default function AdminDashboard() {
  const router = useRouter();

  const [admins, setAdmins] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  // ✅ DASHBOARD STATE
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProposals: 0,
    pending: 0,
    approved: 0,
    overdue: 0,
  });

  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // ✅ FETCH ADMINS
  const fetchAdmins = () => {
    try {
      const result = db.getAllSync("SELECT * FROM admin");
      setAdmins(result);
    } catch (error) {
      console.log("Fetch error:", error);
    }
  };

  // ✅ DASHBOARD DATA
  const fetchDashboardData = () => {
    try {
          const totalUsers =
      (db.getFirstSync("SELECT COUNT(*) as count FROM users") as any)?.count || 0;

    const totalProposals =
      (db.getFirstSync("SELECT COUNT(*) as count FROM proposals") as any)?.count || 0;

    const pending =
      (db.getFirstSync(
        "SELECT COUNT(*) as count FROM proposals WHERE status = 'pending'"
      ) as any)?.count || 0;

    const approved =
      (db.getFirstSync(
        "SELECT COUNT(*) as count FROM proposals WHERE status = 'approved'"
      ) as any)?.count || 0;

    const overdue =
      (db.getFirstSync(
        "SELECT COUNT(*) as count FROM billings WHERE status = 'overdue'"
      ) as any)?.count || 0;

      const activities = db.getAllSync(
        "SELECT * FROM proposals ORDER BY created_at DESC LIMIT 5"
      );

      setStats({
        totalUsers,
        totalProposals,
        pending,
        approved,
        overdue,
      });

      setRecentActivities(activities);
    } catch (error) {
      console.log("Dashboard error:", error);
    }
  };

  useEffect(() => {
    fetchAdmins();
    fetchDashboardData();
  }, []);

  // ✅ INSERT
  const addAdmin = () => {
    if (!email || !password) return;

    try {
      db.runSync("INSERT INTO admin (email, password) VALUES (?, ?)", [
        email,
        password,
      ]);
      fetchAdmins();
      setEmail("");
      setPassword("");
    } catch (error) {
      console.log("Insert error:", error);
    }
  };

  // ✅ UPDATE
  const updateAdmin = () => {
    if (!editingId) return;

    try {
      db.runSync(
        "UPDATE admin SET email = ?, password = ? WHERE id = ?",
        [email, password, editingId]
      );
      fetchAdmins();
      setEditingId(null);
      setEmail("");
      setPassword("");
    } catch (error) {
      console.log("Update error:", error);
    }
  };

  // ✅ DELETE
  const deleteAdmin = (id: number) => {
    try {
      db.runSync("DELETE FROM admin WHERE id = ?", [id]);
      fetchAdmins();
    } catch (error) {
      console.log("Delete error:", error);
    }
  };

  // ✅ EDIT
  const editAdmin = (item: any) => {
    setEmail(item.email);
    setPassword(item.password);
    setEditingId(item.id);
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

      <FlatList
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Welcome, Admin!</Text>

            {/* ✅ OVERVIEW CARDS */}
            <View style={styles.cardContainer}>
              <View style={styles.card}><Text>Total Users</Text><Text>{stats.totalUsers}</Text></View>
              <View style={styles.card}><Text>Total Proposals</Text><Text>{stats.totalProposals}</Text></View>
              <View style={styles.card}><Text>Pending</Text><Text>{stats.pending}</Text></View>
              <View style={styles.card}><Text>Approved</Text><Text>{stats.approved}</Text></View>
              <View style={styles.card}><Text>Overdue</Text><Text>{stats.overdue}</Text></View>
            </View>

            {/* ✅ CHART */}
            <Text style={styles.sectionTitle}>Revenue Trend</Text>
            <LineChart
              data={{
                labels: ["Jan", "Feb", "Mar", "Apr", "May"],
                datasets: [{ data: [1000, 2000, 1500, 3000, 2500] }],
              }}
              width={Dimensions.get("window").width - 40}
              height={220}
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
              }}
              style={{ marginVertical: 10, borderRadius: 10 }}
            />

            {/* ✅ RECENT ACTIVITIES */}
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            {recentActivities.map((item, index) => (
              <View key={index} style={styles.activityItem}>
                <Text>{item.title || "Proposal"}</Text>
                <Text>Status: {item.status}</Text>
              </View>
            ))}

            {/* ✅ QUICK ACTIONS */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickBtn}
                onPress={() => router.push("/admin/proposals")}
              >
                <Text>Review Proposals</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickBtn}
                onPress={() => router.push("/admin/billings")}
              >
                <Text>Generate Billing</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickBtn}>
                <Text>Send Reminders</Text>
              </TouchableOpacity>
            </View>

            {/* ✅ FORM */}
            <View style={{ margin: 20 }}>
              <TextInput
                placeholder="Email"
                value={email} 
                onChangeText={setEmail}
                style={styles.input}
              />

              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
              />

              <TouchableOpacity
                style={styles.button}
                onPress={editingId ? updateAdmin : addAdmin}
              >
                <Text style={{ color: "#fff", textAlign: "center" }}>
                  {editingId ? "Update Admin" : "Add Admin"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* TABLE HEADER */}
            <View style={styles.tableHeader}>
              <Text style={styles.headerCell}>ID</Text>
              <Text style={styles.headerCell}>Email</Text>
              <Text style={styles.headerCell}>Password</Text>
              <Text style={styles.headerCell}>Actions</Text>
            </View>
          </>
        }
        data={admins}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.cell}>{item.id}</Text>
            <Text style={styles.cell}>{item.email}</Text>
            <Text style={styles.cell}>{item.password}</Text>

            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity onPress={() => editAdmin(item)}>
                <Text style={{ color: "blue", marginRight: 10 }}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => deleteAdmin(item.id)}>
                <Text style={{ color: "red" }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "bold", margin: 20 },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },

  button: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 5,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#ddd",
    padding: 10,
    marginHorizontal: 20,
  },

  headerCell: { flex: 1, fontWeight: "bold" },

  row: {
    flexDirection: "row",
    padding: 10,
    marginHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    alignItems: "center",
  },

  cell: { flex: 1 },

  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 20,
  },

  card: {
    width: "48%",
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginTop: 20,
  },

  activityItem: {
    marginHorizontal: 20,
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    margin: 20,
  },

  quickBtn: {
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 8,
  },
});