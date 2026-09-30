import { Redirect } from "expo-router";
// The old self-redirect (<Redirect href="/(tabs)" />) looped forever and
// crashed the app with a blank screen. Send the Discover tab to Profile,
// so the app opens on the account screen.
export default function Index() {
  return <Redirect href="/(tabs)/profile" />;
}
