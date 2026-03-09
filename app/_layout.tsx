import { Stack } from "expo-router";
import { MenuProvider } from "react-native-popup-menu";

export default function RootLayout() {
    return (
    <MenuProvider>
      <RootLayoutNav />
    </MenuProvider>
  );
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );  
}
