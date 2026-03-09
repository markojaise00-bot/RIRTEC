import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";

export default function AdminDashboard() {
  const router = useRouter();

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
                <MenuOption
                  onSelect={() => router.push("/admin/profile")}
                >
                  <Text style={{ padding: 10 }}>Profile</Text>
                </MenuOption>

                <MenuOption
                  onSelect={() => router.push("/admin/proposals")}
                >
                  <Text style={{ padding: 10 }}>Proposals</Text>
                </MenuOption>

                <MenuOption
                  onSelect={() => router.push("/admin/billings")}
                >
                  <Text style={{ padding: 10 }}>Billings</Text>
                </MenuOption>

                <MenuOption
                  onSelect={() => router.replace("/")}
                >
                  <Text style={{ padding: 10, color: "red" }}>Logout</Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
          ),
        }}
      />
      {/* --- Division --- */}
      <View>
        <Text style={{ fontSize: 24, fontWeight: "bold", margin: 20 }}>
          Welcome, Admin!
        </Text>
        <Text style={{ fontSize: 16, marginHorizontal: 20 }}>
          This is your dashboard where you can manage proposals, view billings,
          and update your profile.
        </Text>
      </View>
    </>
  );
}