import React from "react";
import { ScrollView, type ScrollViewProps } from "react-native";

// Web substitute for react-native-keyboard-controller's KeyboardAwareScrollView.
// The native library crashes the web bundle at render time, and browsers
// already scroll focused inputs into view natively, so a plain ScrollView is
// the correct behavior on web. Keyboard-specific props are accepted and ignored
// so call sites stay unchanged across platforms.
type Props = ScrollViewProps & {
  bottomOffset?: number;
  disableScrollOnKeyboardHide?: boolean;
  enabled?: boolean;
  extraKeyboardSpace?: number;
};

export const KeyboardAwareScrollView = React.forwardRef<
  React.ElementRef<typeof ScrollView>,
  Props
>(function KeyboardAwareScrollView(
  { bottomOffset, disableScrollOnKeyboardHide, enabled, extraKeyboardSpace, ...props },
  ref,
) {
  return (
    <ScrollView ref={ref} {...props} />
  );
});
