import { Redirect } from "expo-router";
// The old self-redirect (<Redirect href="/(tabs)" />) looped forever and
// crashed the app with a blank screen. Send the Discover tab to Mix Magic,
// the app's main screen, until a dedicated Discover screen exists.
export default function Index() {
  return <Redirect href="/(tabs)/mix" />;
}
