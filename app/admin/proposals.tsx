import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
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

export default function ProposalDashboard() {
  const router = useRouter();

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const [recentProposals, setRecentProposals] = useState<any[]>([]);

  // ✅ FETCH PROPOSAL DATA
  const fetchProposalData = () => {
    try {
      const total = (db.getFirstSync("SELECT COUNT(*) as count FROM proposals") as any)?.count || 0;
      const pending = (db.getFirstSync("SELECT COUNT(*) as count FROM proposals WHERE status='pending'") as any)?.count || 0;
      const approved = (db.getFirstSync("SELECT COUNT(*) as count FROM proposals WHERE status='approved'") as any)?.count || 0;
      const rejected = (db.getFirstSync("SELECT COUNT(*) as count FROM proposals WHERE status='rejected'") as any)?.count || 0;

      const recent = db.getAllSync(
        "SELECT p.id, u.email as userEmail, p.title, p.created_at, p.status FROM proposals p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC LIMIT 5"
      );

      setStats({ total, pending, approved, rejected });
      setRecentProposals(recent);
    } catch (error) {
      console.log("Proposal fetch error:", error);
    }
  };

  useEffect(() => {
    fetchProposalData();
  }, []);

  // ✅ Approve or Reject Proposal
  const updateProposalStatus = (id: number, status: string) => {
    try {
      db.runSync("UPDATE proposals SET status=? WHERE id=?", [status, id]);
      fetchProposalData();
    } catch (error) {
      console.log("Proposal status update error:", error);
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

      <FlatList
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Proposal Dashboard</Text>

            {/* ✅ Overview Cards */}
            <View style={styles.cardContainer}>
              <View style={styles.card}><Text>Total</Text><Text>{stats.total}</Text></View>
              <View style={styles.card}><Text>Pending</Text><Text>{stats.pending}</Text></View>
              <View style={styles.card}><Text>Approved</Text><Text>{stats.approved}</Text></View>
              <View style={styles.card}><Text>Rejected</Text><Text>{stats.rejected}</Text></View>
            </View>

            {/* ✅ Monthly Submissions Chart */}
            <Text style={styles.sectionTitle}>Monthly Submissions</Text>
            <LineChart
              data={{
                labels: ["Jan","Feb","Mar","Apr","May"],
                datasets: [{ data: [10, 15, 12, 18, 20] }], // Replace with real aggregation later
              }}
              width={Dimensions.get("window").width - 40}
              height={220}
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0,123,255, ${opacity})`,
              }}
              style={{ marginVertical: 10, borderRadius: 10 }}
            />

            {/* ✅ Recent Proposals */}
            <Text style={styles.sectionTitle}>Recent Proposals</Text>
            {recentProposals.map((item, index) => (
              <View key={index} style={styles.activityItem}>
                <Text>User: {item.userEmail}</Text>
                <Text>Title: {item.title}</Text>
                <Text>Submitted: {item.created_at}</Text>
                <Text>Status: {item.status}</Text>

                <View style={{ flexDirection: "row", marginTop: 5 }}>
                  {item.status === "pending" && (
                    <>
                      <TouchableOpacity
                        style={[styles.quickBtn, { backgroundColor: "#4caf50" }]}
                        onPress={() => updateProposalStatus(item.id, "approved")}
                      >
                        <Text style={{ color: "#fff" }}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.quickBtn, { backgroundColor: "#f44336" }]}
                        onPress={() => updateProposalStatus(item.id, "rejected")}
                      >
                        <Text style={{ color: "#fff" }}>Reject</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            ))}
          </>
        }
        data={[]} // Empty FlatList
        renderItem={null}
      />
    </>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "bold", margin: 20 },

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

  quickBtn: {
    padding: 8,
    borderRadius: 5,
    marginRight: 5,
  },
});