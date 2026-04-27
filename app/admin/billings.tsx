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

export default function BillingDashboard() {
  const router = useRouter();

  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    unpaid: 0,
    overdue: 0,
  });

  const [recentPayments, setRecentPayments] = useState<any[]>([]);

  // ✅ FETCH BILLING DATA
  const fetchBillingData = () => {
    try {
      const total = (db.getFirstSync("SELECT COUNT(*) as count FROM billings") as any)?.count || 0;
      const paid = (db.getFirstSync("SELECT COUNT(*) as count FROM billings WHERE status='paid'") as any)?.count || 0;
      const unpaid = (db.getFirstSync("SELECT COUNT(*) as count FROM billings WHERE status='unpaid'") as any)?.count || 0;
      const overdue = (db.getFirstSync("SELECT COUNT(*) as count FROM billings WHERE status='overdue'") as any)?.count || 0;

      const recent = db.getAllSync(
        "SELECT b.id, u.email as userEmail, b.amount, b.due_date, b.status FROM billings b JOIN users u ON b.user_id = u.id ORDER BY b.due_date DESC LIMIT 5"
      );

      setStats({ total, paid, unpaid, overdue });
      setRecentPayments(recent);
    } catch (error) {
      console.log("Billing fetch error:", error);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

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
            <Text style={styles.title}>Billing Dashboard</Text>

            {/* ✅ Overview Cards */}
            <View style={styles.cardContainer}>
              <View style={styles.card}><Text>Total Bills</Text><Text>{stats.total}</Text></View>
              <View style={styles.card}><Text>Paid</Text><Text>{stats.paid}</Text></View>
              <View style={styles.card}><Text>Unpaid</Text><Text>{stats.unpaid}</Text></View>
              <View style={styles.card}><Text>Overdue</Text><Text>{stats.overdue}</Text></View>
            </View>

            {/* ✅ Revenue Chart */}
            <Text style={styles.sectionTitle}>Revenue Trend</Text>
            <LineChart
              data={{
                labels: ["Jan","Feb","Mar","Apr","May"],
                datasets: [
                  { data: [5000, 7000, 6500, 8000, 7200] }
                ],
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

            {/* ✅ Recent Payments */}
            <Text style={styles.sectionTitle}>Recent Payments</Text>
            {recentPayments.map((item, index) => (
              <View key={index} style={styles.activityItem}>
                <Text>User: {item.userEmail}</Text>
                <Text>Amount: ₱{item.amount}</Text>
                <Text>Due: {item.due_date}</Text>
                <Text>Status: {item.status}</Text>
              </View>
            ))}

            {/* ✅ Quick Actions */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickBtn}
                // onPress={() => router.push("/admin/generate-bill")}
              >
                <Text>Generate Bill</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickBtn}
                // onPress={() => router.push("/admin/send-reminders")}
              >
                <Text>Send Reminders</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        data={[]} // Empty FlatList, we use ListHeaderComponent
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